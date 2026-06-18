import { ChevronLeft, ChevronRight } from 'lucide-react'
import { OYLAR } from '../lib/format'

/**
 * value: Date (oyning birinchi kuni). onChange(Date)
 */
export default function MonthPicker({ value, onChange }) {
  const prev = () => onChange(new Date(value.getFullYear(), value.getMonth() - 1, 1))
  const next = () => onChange(new Date(value.getFullYear(), value.getMonth() + 1, 1))

  return (
    <div className="flex items-center gap-2">
      <button onClick={prev} className="p-2 rounded-lg bg-surface2 border border-line text-muted hover:text-ink" aria-label="Oldingi oy">
        <ChevronLeft size={18} />
      </button>
      <div className="min-w-[140px] text-center font-semibold tabular-nums">
        {OYLAR[value.getMonth()]} {value.getFullYear()}
      </div>
      <button onClick={next} className="p-2 rounded-lg bg-surface2 border border-line text-muted hover:text-ink" aria-label="Keyingi oy">
        <ChevronRight size={18} />
      </button>
    </div>
  )
}
