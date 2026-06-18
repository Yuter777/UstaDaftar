import { Loader2 } from 'lucide-react'

export default function Spinner({ className = '' }) {
  return <Loader2 className={`animate-spin text-brand ${className}`} size={28} />
}

export function Skeleton({ className = '' }) {
  return <div className={`animate-pulse bg-surface2 rounded-xl ${className}`} />
}

export function EmptyState({ icon: Icon, title, hint, action }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6">
      {Icon && (
        <div className="w-16 h-16 rounded-2xl bg-surface2 flex items-center justify-center mb-4">
          <Icon size={28} className="text-muted" />
        </div>
      )}
      <p className="text-ink font-medium">{title}</p>
      {hint && <p className="text-muted text-sm mt-1 max-w-xs">{hint}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
