import { useEffect, useReducer, useRef, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase, fetchRemoteState, saveRemoteState } from './supabase'

export interface Habit {
  id: string
  name: string
  emoji: string
  /** Target days per month. null means every day. */
  goal: number | null
}

export interface State {
  version: 1
  habits: Habit[]
  /** Keys are `${habitId}|${YYYY-MM-DD}` */
  checks: Record<string, true>
}

export type Action =
  | { type: 'toggle'; id: string; date: string }
  | { type: 'add'; habit: Omit<Habit, 'id'> }
  | { type: 'update'; habit: Habit }
  | { type: 'delete'; id: string }
  | { type: 'move'; id: string; dir: -1 | 1 }
  | { type: 'replace'; state: State }

export const ck = (id: string, date: string) => `${id}|${date}`

const STORAGE_KEY = 'protidin:v1'

const newId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2) + Date.now().toString(36)

function seed(): State {
  const starters: Omit<Habit, 'id'>[] = [
    { name: 'Drink 8 glasses of water', emoji: '💧', goal: null },
    { name: 'Exercise 30 minutes', emoji: '🏃', goal: 20 },
    { name: 'Read 20 pages', emoji: '📚', goal: null },
    { name: 'Meditate', emoji: '🧘', goal: 15 },
    { name: 'Sleep before 11 pm', emoji: '😴', goal: 25 },
    { name: 'No sugar', emoji: '🍎', goal: 20 },
  ]
  return { version: 1, habits: starters.map((h) => ({ ...h, id: newId() })), checks: {} }
}

export function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'toggle': {
      const key = ck(action.id, action.date)
      const checks = { ...state.checks }
      if (checks[key]) delete checks[key]
      else checks[key] = true
      return { ...state, checks }
    }
    case 'add':
      return { ...state, habits: [...state.habits, { ...action.habit, id: newId() }] }
    case 'update':
      return {
        ...state,
        habits: state.habits.map((h) => (h.id === action.habit.id ? action.habit : h)),
      }
    case 'delete': {
      const prefix = action.id + '|'
      const checks: Record<string, true> = {}
      for (const k of Object.keys(state.checks)) if (!k.startsWith(prefix)) checks[k] = true
      return { ...state, habits: state.habits.filter((h) => h.id !== action.id), checks }
    }
    case 'move': {
      const i = state.habits.findIndex((h) => h.id === action.id)
      const j = i + action.dir
      if (i < 0 || j < 0 || j >= state.habits.length) return state
      const habits = [...state.habits]
      ;[habits[i], habits[j]] = [habits[j], habits[i]]
      return { ...state, habits }
    }
    case 'replace':
      return action.state
  }
}

/** Validates untrusted data (storage or an imported file). Returns null if unusable. */
export function parseState(input: unknown): State | null {
  if (!input || typeof input !== 'object') return null
  const obj = input as Record<string, unknown>
  if (obj.version !== 1 || !Array.isArray(obj.habits)) return null
  if (!obj.checks || typeof obj.checks !== 'object') return null

  const habits: Habit[] = []
  const ids = new Set<string>()
  for (const raw of obj.habits) {
    if (!raw || typeof raw !== 'object') return null
    const h = raw as Record<string, unknown>
    if (typeof h.id !== 'string' || !h.id || h.id.includes('|') || ids.has(h.id)) return null
    if (typeof h.name !== 'string' || !h.name.trim()) return null
    const goal =
      typeof h.goal === 'number' && Number.isFinite(h.goal)
        ? Math.min(31, Math.max(1, Math.round(h.goal)))
        : null
    ids.add(h.id)
    habits.push({
      id: h.id,
      name: h.name.trim().slice(0, 60),
      emoji: typeof h.emoji === 'string' && h.emoji ? h.emoji : '✅',
      goal,
    })
  }

  const checks: Record<string, true> = {}
  for (const key of Object.keys(obj.checks as object)) {
    const sep = key.lastIndexOf('|')
    if (sep < 0) continue
    if (!ids.has(key.slice(0, sep))) continue
    if (!/^\d{4}-\d{2}-\d{2}$/.test(key.slice(sep + 1))) continue
    checks[key] = true
  }
  return { version: 1, habits, checks }
}

function load(): State {
  let raw: string | null = null
  try {
    raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = parseState(JSON.parse(raw))
      if (parsed) return parsed
    }
  } catch {
    // fall through to the rescue copy below
  }
  // Never silently overwrite data we could not read: keep a rescue copy first.
  if (raw) {
    try {
      localStorage.setItem(STORAGE_KEY + ':unreadable', raw)
    } catch {
      // storage unavailable
    }
  }
  return seed()
}

export function useStore() {
  const [state, dispatch] = useReducer(reducer, undefined, load)
  const [user, setUser] = useState<User | null>(null)
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced' | 'error'>('idle')
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null)
  const isRemoteUpdateRef = useRef(false)
  const saveTimeoutRef = useRef<number | null>(null)
  const stateRef = useRef(state)
  stateRef.current = state

  // 1. Listen to Supabase Auth State
  useEffect(() => {
    if (!supabase) return

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // 2. When User logs in: Fetch remote state and merge / sync
  useEffect(() => {
    if (!user || !supabase) {
      setSyncStatus('idle')
      return
    }

    let isCancelled = false
    setSyncStatus('syncing')

    fetchRemoteState(user.id).then((remote) => {
      if (isCancelled) return
      if (remote) {
        // Smart Merge: Merge remote checks and local checks so no ticks are ever lost
        const local = stateRef.current
        const mergedChecks = { ...local.checks, ...remote.checks }

        const habitMap = new Map<string, Habit>()
        remote.habits.forEach((h) => habitMap.set(h.id, h))
        local.habits.forEach((h) => {
          if (!habitMap.has(h.id)) habitMap.set(h.id, h)
        })
        const mergedHabits = Array.from(habitMap.values())

        const mergedState: State = {
          version: 1,
          habits: mergedHabits.length > 0 ? mergedHabits : remote.habits,
          checks: mergedChecks,
        }

        isRemoteUpdateRef.current = true
        dispatch({ type: 'replace', state: mergedState })

        saveRemoteState(user.id, mergedState).then(() => {
          if (!isCancelled) {
            setSyncStatus('synced')
            setLastSyncedAt(new Date())
          }
        })
      } else {
        // First time cloud sync: Upload current local state to cloud!
        saveRemoteState(user.id, stateRef.current).then((ok) => {
          if (!isCancelled && ok) {
            setSyncStatus('synced')
            setLastSyncedAt(new Date())
          }
        })
      }
    })

    // 3. Realtime Subscription: Listen for changes from other devices (Phone -> Laptop / vice versa)
    const channel = supabase
      .channel(`habits_sync_${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_habits',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.new && typeof payload.new === 'object' && 'state' in payload.new) {
            const newState = parseState((payload.new as { state: unknown }).state)
            if (newState) {
              isRemoteUpdateRef.current = true
              dispatch({ type: 'replace', state: newState })
              setSyncStatus('synced')
              setLastSyncedAt(new Date())
            }
          }
        }
      )
      .subscribe()

    return () => {
      isCancelled = true
      supabase?.removeChannel(channel)
    }
  }, [user?.id])

  // 4. Save to localStorage instantly & debounce save to Supabase if logged in
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      // storage unavailable
    }

    // If this update came from remote websocket, don't echo it back
    if (isRemoteUpdateRef.current) {
      isRemoteUpdateRef.current = false
      return
    }

    // If user is logged in, debounce save to Supabase (500ms)
    if (user && supabase) {
      setSyncStatus('syncing')
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
      saveTimeoutRef.current = window.setTimeout(async () => {
        const ok = await saveRemoteState(user.id, state)
        if (ok) {
          setSyncStatus('synced')
          setLastSyncedAt(new Date())
        } else {
          setSyncStatus('error')
        }
      }, 500)
    }

    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
    }
  }, [state, user?.id])

  return { state, dispatch, user, syncStatus, lastSyncedAt }
}
