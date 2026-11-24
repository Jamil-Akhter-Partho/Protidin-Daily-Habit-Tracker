import { useState } from 'react'
import {
  Cloud,
  CheckCircle2,
  LogOut,
  Mail,
  Sparkles,
  X,
  Loader2,
  AlertCircle,
  Lock,
  LogIn,
  UserPlus,
} from 'lucide-react'
import { type User } from '@supabase/supabase-js'
import {
  signInWithGoogle,
  signInWithEmailOtp,
  signInWithPassword,
  signUpWithPassword,
  signOutCloud,
  isSupabaseConfigured,
} from '../lib/supabase'

interface AuthModalProps {
  user: User | null
  syncStatus: 'idle' | 'syncing' | 'synced' | 'error'
  lastSyncedAt: Date | null
  isOpen: boolean
  onClose: () => void
}

export function AuthModal({ user, syncStatus, lastSyncedAt, isOpen, onClose }: AuthModalProps) {
  const [tab, setTab] = useState<'signin' | 'signup' | 'magic'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  if (!isOpen) return null

  const handlePasswordAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !password) return

    setLoading(true)
    setMessage(null)

    if (tab === 'signin') {
      const { error } = await signInWithPassword(email.trim(), password)
      setLoading(false)
      if (error) {
        setMessage({
          type: 'error',
          text: error.message === 'Invalid login credentials'
            ? 'Incorrect email or password. If you don\'t have an account, click "Sign Up" above.'
            : error.message,
        })
      } else {
        setMessage({ type: 'success', text: '✅ Logged in successfully! Syncing your habits...' })
        setTimeout(() => onClose(), 800)
      }
    } else {
      // signup
      if (password.length < 6) {
        setMessage({ type: 'error', text: 'Password must be at least 6 characters.' })
        setLoading(false)
        return
      }
      const { data, error } = await signUpWithPassword(email.trim(), password)
      setLoading(false)
      if (error) {
        setMessage({ type: 'error', text: error.message })
      } else if (data?.session) {
        setMessage({ type: 'success', text: '🎉 Account created! Syncing your habits...' })
        setTimeout(() => onClose(), 800)
      } else {
        setMessage({
          type: 'success',
          text: 'Account created! If email confirmation is enabled, check your inbox to confirm.',
        })
      }
    }
  }

  const handleGoogleLogin = async () => {
    setLoading(true)
    setMessage(null)
    const { error } = await signInWithGoogle()
    if (error) {
      setMessage({ type: 'error', text: error.message || 'Failed to initiate Google login' })
      setLoading(false)
    }
  }

  const handleEmailMagicLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return

    setLoading(true)
    setMessage(null)
    const { error } = await signInWithEmailOtp(email.trim())
    setLoading(false)

    if (error) {
      setMessage({ type: 'error', text: error.message || 'Failed to send login link' })
    } else {
      setMessage({
        type: 'success',
        text: '✨ Magic login link sent to your email! Open the email on your phone or laptop to log in.',
      })
      setEmail('')
    }
  }

  const handleLogout = async () => {
    setLoading(true)
    await signOutCloud()
    setLoading(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-md overflow-hidden rounded-3xl border border-line bg-surface p-6 shadow-2xl transition-all"
        style={{ background: 'var(--surface)' }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="icon-btn !absolute right-4 top-4 !size-8 text-ink-3 hover:text-ink"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="grid size-11 place-items-center rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-black shadow-sm">
            <Cloud size={24} className="stroke-[2.5]" />
          </div>
          <div>
            <h2 className="font-display text-xl font-extrabold text-ink leading-tight">
              Cloud Sync
            </h2>
            <p className="text-xs text-ink-3 font-semibold">
              Automatic real-time sync across devices
            </p>
          </div>
        </div>

        {/* Status indicator message if any */}
        {message && (
          <div
            className={`mb-4 flex items-start gap-2.5 rounded-2xl p-3 text-xs font-semibold leading-relaxed ${
              message.type === 'success'
                ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                : 'bg-danger/10 text-danger border border-danger/20'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
            ) : (
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
            )}
            <div>{message.text}</div>
          </div>
        )}

        {/* ========================================================= */}
        {/* CASE A: USER IS LOGGED IN */}
        {/* ========================================================= */}
        {user ? (
          <div className="space-y-4">
            <div className="rounded-2xl border border-line/70 bg-surface-2 p-4 space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-ink-3">Signed in as:</span>
                <span className="inline-flex items-center gap-1.5 font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full text-[10.5px]">
                  <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Active
                </span>
              </div>

              <div className="flex items-center gap-3 pt-1">
                <div className="grid size-9 place-items-center rounded-full bg-accent text-on-accent font-black text-sm uppercase">
                  {user.email ? user.email[0] : 'U'}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-sm text-ink truncate">
                    {user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'}
                  </div>
                  <div className="text-xs text-ink-3 truncate">{user.email}</div>
                </div>
              </div>

              <div className="pt-2 border-t border-line/50 flex items-center justify-between text-[11px] text-ink-3">
                <span>Sync status:</span>
                <span className="font-bold text-ink flex items-center gap-1">
                  {syncStatus === 'syncing' ? (
                    <>
                      <Loader2 size={12} className="animate-spin text-amber-500" />
                      <span>Syncing...</span>
                    </>
                  ) : syncStatus === 'error' ? (
                    <span className="text-danger font-bold">Sync Error</span>
                  ) : (
                    <>
                      <CheckCircle2 size={12} className="text-emerald-500" />
                      <span>Synced {lastSyncedAt ? 'just now' : ''}</span>
                    </>
                  )}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-600 dark:text-emerald-400 leading-relaxed font-semibold">
              ⚡ <strong>Real-time sync active!</strong> Habits ticked on your phone will automatically update on your desktop in real time.
            </div>

            <button
              onClick={handleLogout}
              disabled={loading}
              className="btn btn-danger w-full justify-center !h-10 text-xs font-bold"
            >
              <LogOut size={15} /> <span>Sign out</span>
            </button>
          </div>
        ) : (
          /* ========================================================= */
          /* CASE B: USER IS NOT LOGGED IN */
          /* ========================================================= */
          <div className="space-y-4">
            {/* Mode Tabs */}
            <div className="flex items-center rounded-2xl bg-surface-2 p-1 border border-line text-xs font-bold">
              <button
                type="button"
                onClick={() => {
                  setTab('signin')
                  setMessage(null)
                }}
                className={`flex-1 py-1.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                  tab === 'signin'
                    ? 'bg-surface text-ink shadow-xs'
                    : 'text-ink-3 hover:text-ink'
                }`}
              >
                <LogIn size={13} />
                <span>Sign In</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setTab('signup')
                  setMessage(null)
                }}
                className={`flex-1 py-1.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                  tab === 'signup'
                    ? 'bg-surface text-ink shadow-xs'
                    : 'text-ink-3 hover:text-ink'
                }`}
              >
                <UserPlus size={13} />
                <span>Sign Up</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setTab('magic')
                  setMessage(null)
                }}
                className={`flex-1 py-1.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                  tab === 'magic'
                    ? 'bg-surface text-ink shadow-xs'
                    : 'text-ink-3 hover:text-ink'
                }`}
              >
                <Mail size={13} />
                <span>Magic Link</span>
              </button>
            </div>

            {/* TAB 1 & 2: Email + Password (Instant, No Rate Limits) */}
            {(tab === 'signin' || tab === 'signup') && (
              <form onSubmit={handlePasswordAuth} className="space-y-2.5">
                <div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@gmail.com"
                    required
                    className="w-full h-10.5 rounded-2xl border border-line bg-surface-2 px-3.5 text-xs font-semibold text-ink placeholder:text-ink-3/60 focus:outline-hidden focus:border-accent"
                  />
                </div>

                <div className="relative">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={tab === 'signup' ? 'Create password (min 6 chars)' : 'Password'}
                    required
                    minLength={tab === 'signup' ? 6 : 1}
                    className="w-full h-10.5 rounded-2xl border border-line bg-surface-2 px-3.5 text-xs font-semibold text-ink placeholder:text-ink-3/60 focus:outline-hidden focus:border-accent"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || !email.trim() || !password || !isSupabaseConfigured}
                  className="btn btn-primary w-full justify-center !h-10 text-xs font-extrabold cursor-pointer"
                >
                  {loading ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>{tab === 'signin' ? 'Signing in...' : 'Creating account...'}</span>
                    </>
                  ) : tab === 'signin' ? (
                    <>
                      <Lock size={14} /> <span>Sign In & Sync</span>
                    </>
                  ) : (
                    <>
                      <UserPlus size={14} /> <span>Create Account & Sync</span>
                    </>
                  )}
                </button>
              </form>
            )}

            {/* TAB 3: Magic Link Form */}
            {tab === 'magic' && (
              <form onSubmit={handleEmailMagicLogin} className="space-y-2.5">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@gmail.com"
                  required
                  className="w-full h-10.5 rounded-2xl border border-line bg-surface-2 px-3.5 text-xs font-semibold text-ink placeholder:text-ink-3/60 focus:outline-hidden focus:border-accent"
                />

                <button
                  type="submit"
                  disabled={loading || !email.trim() || !isSupabaseConfigured}
                  className="btn btn-primary w-full justify-center !h-10 text-xs font-extrabold cursor-pointer"
                >
                  {loading ? (
                    <>
                      <Loader2 size={14} className="animate-spin" /> <span>Sending link...</span>
                    </>
                  ) : (
                    <>
                      <Mail size={14} /> <span>Send Magic Login Link</span>
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Divider */}
            <div className="relative flex items-center justify-center py-1">
              <div className="w-full border-t border-line"></div>
              <span className="absolute bg-surface px-3 text-[11px] font-bold text-ink-3 uppercase tracking-wider">
                or
              </span>
            </div>

            {/* Google Login Option */}
            <button
              onClick={handleGoogleLogin}
              disabled={loading || !isSupabaseConfigured}
              className="w-full h-10.5 rounded-2xl border border-line bg-surface hover:bg-surface-2 flex items-center justify-center gap-3 text-xs font-extrabold text-ink transition-all active:scale-[0.98] shadow-xs cursor-pointer"
            >
              <svg className="size-4.5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.15z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.94H1.27v3.15C3.25 21.31 7.31 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.26c-.25-.72-.38-1.49-.38-2.26s.13-1.54.38-2.26V6.59H1.27C.46 8.2 0 10.05 0 12s.46 3.8 1.27 5.41l4.01-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.25 2.69 1.27 6.59l4.01 3.15c.95-2.84 3.6-4.99 6.72-4.99z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            <div className="pt-1 text-center text-[10.5px] text-ink-3 flex items-center justify-center gap-1.5 font-medium">
              <Sparkles size={12} className="text-amber-500" />
              <span>Real-time instant sync across phone and desktop</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
