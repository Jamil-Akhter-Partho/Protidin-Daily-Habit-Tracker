import { useEffect, useState } from 'react'
import { Laptop, Sparkles, X } from 'lucide-react'

export function InstallPopup() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [visible, setVisible] = useState(false)
  const [tip, setTip] = useState(false)

  useEffect(() => {
    // Clear any past dismissed flag during development/testing
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.removeItem('protidin:pwa-dismissed')
      } catch {}

      const isStandalone =
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true
      if (isStandalone) return
    }

    // Show popup quickly on page load
    const timer = setTimeout(() => {
      setVisible(true)
    }, 400)

    const onBeforeInstall = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setVisible(true)
    }

    const onAppInstalled = () => {
      setVisible(false)
      setDeferredPrompt(null)
    }

    window.addEventListener('beforeinstallprompt', onBeforeInstall)
    window.addEventListener('appinstalled', onAppInstalled)

    return () => {
      clearTimeout(timer)
      window.removeEventListener('beforeinstallprompt', onBeforeInstall)
      window.removeEventListener('appinstalled', onAppInstalled)
    }
  }, [])

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === 'accepted') {
        setVisible(false)
        setDeferredPrompt(null)
      }
    } else {
      setTip(true)
      setTimeout(() => setTip(false), 5000)
    }
  }

  const handleDismiss = () => {
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div
      role="dialog"
      aria-label="Install Protidin Application"
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 max-w-[430px] w-[calc(100vw-2.5rem)] rounded-3xl p-5 shadow-2xl transition-all duration-300 animate-in fade-in slide-in-from-bottom-6"
      style={{
        backdropFilter: 'blur(24px) saturate(190%)',
        WebkitBackdropFilter: 'blur(24px) saturate(190%)',
        background: 'color-mix(in srgb, var(--surface) 92%, transparent)',
        border: '1px solid color-mix(in srgb, var(--line) 85%, rgba(255,255,255,0.4))',
        boxShadow: `
          0 20px 40px -10px rgba(0, 0, 0, 0.45),
          0 4px 14px -2px rgba(0, 0, 0, 0.2),
          inset 0 1px 1px 0 rgba(255, 255, 255, 0.35)
        `,
      }}
    >
      <div className="flex items-start gap-3.5">
        {/* App Logo */}
        <div className="relative shrink-0">
          <img
            src="./icons/icon-192.png"
            alt="Protidin App Icon"
            className="size-12 rounded-2xl object-cover shadow-md border border-white/10"
          />
          <span className="absolute -bottom-1 -right-1 flex size-5 items-center justify-center rounded-full bg-emerald-500 text-white shadow-xs">
            <Sparkles size={11} />
          </span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 pr-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <h4 className="font-display text-[15px] font-extrabold tracking-tight text-ink leading-tight">
              Install Protidin
            </h4>
            <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-bold text-accent">
              Desktop PWA
            </span>
          </div>
          <p className="mt-1 text-[12px] leading-relaxed text-ink-3">
            Fast, distraction-free standalone desktop app with full offline support.
          </p>
        </div>

        {/* Close (X) button */}
        <button
          onClick={handleDismiss}
          className="icon-btn !size-7 shrink-0 text-ink-3 hover:text-ink -mt-1 -mr-1"
          aria-label="Dismiss"
          title="Dismiss"
        >
          <X size={15} />
        </button>
      </div>

      {tip && (
        <div className="mt-3 rounded-xl bg-accent/15 border border-accent/30 p-2 text-[11.5px] font-semibold text-accent leading-snug">
          💡 Click the <strong>Install icon (🖥️ or ➕)</strong> in your browser address bar to finish installing.
        </div>
      )}

      {/* Action Buttons */}
      <div className="mt-3.5 flex items-center justify-end gap-2 pt-2 border-t border-line/60">
        <button
          onClick={handleDismiss}
          className="btn !h-8 !px-3 !text-[12px] text-ink-3 hover:text-ink"
        >
          Not Now
        </button>
        <button
          onClick={handleInstall}
          className="btn btn-primary !h-8 !px-3.5 !text-[12.5px] font-bold shadow-md shadow-accent/25 hover:scale-[1.02] active:scale-95 transition-all"
        >
          <Laptop size={14} /> Install Now
        </button>
      </div>
    </div>
  )
}
