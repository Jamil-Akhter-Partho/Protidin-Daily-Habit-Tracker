import { createClient, type User } from '@supabase/supabase-js'
import type { State } from './store'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey)

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null

export interface CloudSyncStatus {
  isConfigured: boolean
  user: User | null
  syncing: boolean
  lastSyncedAt: Date | null
  error: string | null
}

/**
 * Fetch habits data from Supabase cloud for the authenticated user
 */
export async function fetchRemoteState(userId: string): Promise<State | null> {
  if (!supabase) return null
  try {
    const { data, error } = await supabase
      .from('user_habits')
      .select('state, updated_at')
      .eq('user_id', userId)
      .maybeSingle()

    if (error) {
      console.warn('Error fetching remote habit state:', error.message)
      return null
    }

    if (data?.state) {
      return data.state as State
    }
    return null
  } catch (err) {
    console.warn('Network error fetching remote state:', err)
    return null
  }
}

/**
 * Save habits data to Supabase cloud (Upsert)
 */
export async function saveRemoteState(userId: string, state: State): Promise<boolean> {
  if (!supabase) return false
  try {
    const { error } = await supabase.from('user_habits').upsert(
      {
        user_id: userId,
        state,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    )

    if (error) {
      console.warn('Error saving remote habit state:', error.message)
      return false
    }
    return true
  } catch (err) {
    console.warn('Network error saving remote state:', err)
    return false
  }
}

/**
 * Sign in using Google OAuth
 */
export async function signInWithGoogle() {
  if (!supabase) return { error: new Error('Supabase not configured') }
  return supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin,
    },
  })
}

/**
 * Sign in using Email + Password (instant, zero email rate limits)
 */
export async function signInWithPassword(email: string, password: string) {
  if (!supabase) return { data: { user: null, session: null }, error: new Error('Supabase not configured') }
  return supabase.auth.signInWithPassword({ email, password })
}

/**
 * Sign up using Email + Password
 */
export async function signUpWithPassword(email: string, password: string) {
  if (!supabase) return { data: { user: null, session: null }, error: new Error('Supabase not configured') }
  return supabase.auth.signUp({ email, password })
}

/**
 * Sign in using Magic Link / OTP via Email (Requires 0 setup)
 */
export async function signInWithEmailOtp(email: string) {
  if (!supabase) return { error: new Error('Supabase not configured') }
  return supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: window.location.origin,
    },
  })
}

/**
 * Sign out
 */
export async function signOutCloud() {
  if (!supabase) return { error: null }
  return supabase.auth.signOut()
}
