'use client'

import { createContext, useCallback, useContext, useRef, useState } from 'react'

type ToastOptions = {
  actionLabel?: string
  onAction?: () => void
  durationMs?: number
}

type ToastItem = {
  id: number
  message: string
  actionLabel?: string
  onAction?: () => void
}

type ToastContextValue = {
  showToast: (message: string, options?: ToastOptions) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

const DEFAULT_DURATION_MS = 5000

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within a ToastProvider')
  return ctx
}

let nextToastId = 0

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const timers = useRef(new Map<number, ReturnType<typeof setTimeout>>())

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
    const timer = timers.current.get(id)
    if (timer) {
      clearTimeout(timer)
      timers.current.delete(id)
    }
  }, [])

  const showToast = useCallback(
    (message: string, options?: ToastOptions) => {
      const id = ++nextToastId
      setToasts((prev) => [
        ...prev,
        { id, message, actionLabel: options?.actionLabel, onAction: options?.onAction },
      ])
      const timer = setTimeout(() => dismiss(id), options?.durationMs ?? DEFAULT_DURATION_MS)
      timers.current.set(id, timer)
    },
    [dismiss]
  )

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-[116px] z-50 flex flex-col items-center gap-2 px-4">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="pointer-events-auto flex items-center gap-3 rounded-md bg-gray-900 px-4 py-2.5 text-sm text-white shadow-lg"
          >
            <span>{toast.message}</span>
            {toast.actionLabel && (
              <button
                type="button"
                onClick={() => {
                  toast.onAction?.()
                  dismiss(toast.id)
                }}
                className="font-medium text-sky-300 hover:text-sky-200 hover:underline"
              >
                {toast.actionLabel}
              </button>
            )}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
