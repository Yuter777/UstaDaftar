import { createContext, useCallback, useContext, useState } from 'react'
import { CheckCircle2, XCircle, Info } from 'lucide-react'

const ToastContext = createContext(null)

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast ToastProvider ichida ishlatilishi kerak')
  return ctx
}

let idSeq = 0

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const remove = useCallback((id) => {
    setToasts((t) => t.filter((x) => x.id !== id))
  }, [])

  const push = useCallback(
    (xabar, turi = 'success') => {
      const id = ++idSeq
      setToasts((t) => [...t, { id, xabar, turi }])
      setTimeout(() => remove(id), 3000)
    },
    [remove]
  )

  const toast = {
    success: (m) => push(m, 'success'),
    error: (m) => push(m, 'error'),
    info: (m) => push(m, 'info'),
  }

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 w-[90%] max-w-sm pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl border border-line bg-surface2 shadow-lg text-sm text-ink animate-[fadeIn_0.15s_ease]"
          >
            {t.turi === 'success' && <CheckCircle2 size={18} className="text-keldi shrink-0" />}
            {t.turi === 'error' && <XCircle size={18} className="text-kelmadi shrink-0" />}
            {t.turi === 'info' && <Info size={18} className="text-brand shrink-0" />}
            <span>{t.xabar}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
