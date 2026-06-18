import { ChevronLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function PageHeader({ title, subtitle, back, right }) {
  const navigate = useNavigate()
  return (
    <header className="sticky top-0 z-30 bg-bg/95 backdrop-blur border-b border-line">
      <div className="flex items-center gap-3 px-4 h-16">
        {back && (
          <button
            onClick={() => navigate(back === true ? -1 : back)}
            className="p-2 -ml-2 rounded-lg text-muted hover:text-ink hover:bg-surface2"
            aria-label="Orqaga"
          >
            <ChevronLeft size={22} />
          </button>
        )}
        <div className="min-w-0 flex-1">
          <h1 className="font-bold text-lg leading-tight truncate">{title}</h1>
          {subtitle && <p className="text-muted text-xs truncate">{subtitle}</p>}
        </div>
        {right}
      </div>
    </header>
  )
}
