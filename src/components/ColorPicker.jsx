import { Check } from 'lucide-react'
import { RANGLAR } from '../lib/format'

export default function ColorPicker({ value, onChange }) {
  return (
    <div className="flex flex-wrap gap-3">
      {RANGLAR.map((c) => (
        <button
          key={c}
          type="button"
          onClick={() => onChange(c)}
          className="w-10 h-10 rounded-full flex items-center justify-center transition-transform active:scale-90"
          style={{ backgroundColor: c, outline: value === c ? `2px solid ${c}` : 'none', outlineOffset: 2 }}
          aria-label={c}
        >
          {value === c && <Check size={18} className="text-white" />}
        </button>
      ))}
    </div>
  )
}
