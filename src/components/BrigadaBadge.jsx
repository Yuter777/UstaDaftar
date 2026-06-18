/** Rangli brigada belgisi */
export default function BrigadaBadge({ brigada, size = 'md' }) {
  if (!brigada) return <span className="text-muted text-sm">— brigadasiz</span>
  const dot = size === 'sm' ? 'w-2.5 h-2.5' : 'w-3 h-3'
  return (
    <span className="inline-flex items-center gap-2">
      <span className={`${dot} rounded-full shrink-0`} style={{ backgroundColor: brigada.rang }} />
      <span className={size === 'sm' ? 'text-sm' : ''}>{brigada.nom}</span>
    </span>
  )
}
