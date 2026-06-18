import { NavLink } from 'react-router-dom'
import { CalendarDays, FolderKanban, CheckSquare, Users, MoreHorizontal } from 'lucide-react'

const items = [
  { to: '/', label: 'Timeline', icon: CalendarDays, end: true },
  { to: '/obyektlar', label: 'Obyektlar', icon: FolderKanban },
  { to: '/davomat', label: 'Davomat', icon: CheckSquare },
  { to: '/brigadalar', label: 'Brigadalar', icon: Users },
  { to: '/yana', label: 'Yana', icon: MoreHorizontal },
]

export default function BottomNav() {
  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-surface/95 backdrop-blur border-t border-line pb-[env(safe-area-inset-bottom)]">
      <div className="max-w-2xl mx-auto grid grid-cols-5">
        {items.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-1 h-16 text-[11px] font-medium transition-colors ${
                isActive ? 'text-brand' : 'text-muted hover:text-ink'
              }`
            }
          >
            <Icon size={22} />
            {label}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
