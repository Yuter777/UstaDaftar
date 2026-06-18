import { useEffect } from 'react'
import { X } from 'lucide-react'

export default function Modal({ open, onClose, title, children, footer }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose?.()
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-0 sm:p-4"
      onMouseDown={onClose}
    >
      <div
        className="w-full sm:max-w-md bg-surface border border-line rounded-t-2xl sm:rounded-2xl max-h-[90vh] flex flex-col"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-4 border-b border-line">
          <h3 className="font-semibold text-lg">{title}</h3>
          <button
            onClick={onClose}
            className="p-2 -mr-2 rounded-lg text-muted hover:text-ink hover:bg-surface2"
            aria-label="Yopish"
          >
            <X size={20} />
          </button>
        </div>
        <div className="px-4 py-4 overflow-y-auto">{children}</div>
        {footer && <div className="px-4 py-4 border-t border-line">{footer}</div>}
      </div>
    </div>
  )
}
