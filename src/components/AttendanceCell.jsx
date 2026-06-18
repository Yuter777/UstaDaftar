import { DAVOMAT_HOLATLARI } from '../lib/format'

// Aylanish tartibi: bo'sh -> keldi -> yarim -> kelmadi -> bo'sh
const KEYINGI = {
  null: 'keldi',
  keldi: 'yarim',
  yarim: 'kelmadi',
  kelmadi: null,
}

export default function AttendanceCell({ holat, isToday, onChange }) {
  const meta = holat ? DAVOMAT_HOLATLARI[holat] : null
  return (
    <button
      onClick={() => onChange(KEYINGI[holat ?? 'null'])}
      className={`w-11 h-11 flex items-center justify-center text-lg rounded-lg border transition-colors ${
        isToday ? 'border-brand' : 'border-line'
      }`}
      style={{
        backgroundColor: meta ? `${meta.rang}22` : 'transparent',
      }}
    >
      {meta ? meta.belgi : <span className="text-line">·</span>}
    </button>
  )
}
