import { STATUSLAR } from '../lib/format'

export default function StatusBadge({ status }) {
  const s = STATUSLAR[status] || STATUSLAR.zamer
  return (
    <span
      className="chip"
      style={{ backgroundColor: `${s.rang}22`, color: s.rang }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: s.rang }} />
      {s.nom}
    </span>
  )
}
