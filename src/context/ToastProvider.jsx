import { useCallback, useMemo, useRef, useState } from 'react'
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react'
import { cn } from '../utils/cn'
import { ToastContext } from './toastContext'

const ICONS = { success: CheckCircle2, error: AlertCircle, info: Info }
const TONES = { success: 'text-brand', error: 'text-danger', info: 'text-info' }

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const counter = useRef(0)

  const dismiss = useCallback((id) => setToasts((list) => list.filter((toast) => toast.id !== id)), [])

  const show = useCallback(
    (message, tone = 'success') => {
      counter.current += 1
      const id = counter.current
      setToasts((list) => [...list.slice(-2), { id, message, tone }])
      window.setTimeout(() => dismiss(id), 3800)
    },
    [dismiss],
  )

  const value = useMemo(() => ({ show }), [show])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-20 z-50 flex flex-col items-center gap-2 px-4 lg:bottom-6" role="status" aria-live="polite">
        {toasts.map((toast) => {
          const Icon = ICONS[toast.tone]
          return (
            <div key={toast.id} className="pointer-events-auto flex max-w-md animate-toast items-center gap-3 rounded-xl border border-line bg-surface py-3 pr-2 pl-4 shadow-pop">
              <Icon aria-hidden="true" className={cn('size-5 shrink-0', TONES[toast.tone])} />
              <p className="text-sm font-medium">{toast.message}</p>
              <button type="button" aria-label="Dismiss notification" onClick={() => dismiss(toast.id)} className="rounded-lg p-1.5 text-muted hover:bg-surface-2">
                <X aria-hidden="true" className="size-4" />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}
