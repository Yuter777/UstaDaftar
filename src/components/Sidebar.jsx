import { NavLink } from 'react-router-dom'
import {
  CalendarDays,
  FolderKanban,
  CheckSquare,
  Users,
  Wallet,
  BookOpen,
  LogOut,
  User,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const items = [
  { to: '/', label: 'Timeline', icon: CalendarDays, end: true },
  { to: '/obyektlar', label: 'Obyektlar', icon: FolderKanban },
  { to: '/davomat', label: 'Davomat', icon: CheckSquare },
  { to: '/brigadalar', label: 'Brigadalar', icon: Users },
  { to: '/tolovlar', label: "To'lovlar", icon: Wallet },
  { to: '/katalog', label: 'Katalog', icon: BookOpen },
]

export default function Sidebar() {
  const { user, usta, signOut } = useAuth()

  return (
    <aside className="hidden md:flex md:flex-col md:w-64 lg:w-72 shrink-0 h-screen sticky top-0 bg-surface border-r border-line">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 h-16 border-b border-line">
        <div className="w-9 h-9 rounded-xl bg-bg border border-brand flex items-center justify-center shrink-0">
          <div className="flex flex-col gap-1">
            <span className="w-4 h-0.5 rounded bg-keldi" />
            <span className="w-4 h-0.5 rounded bg-yarim" />
            <span className="w-3 h-0.5 rounded bg-kelmadi" />
          </div>
        </div>
        <span className="font-bold text-lg">Usta Daftar</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {items.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 h-11 px-3 rounded-xl text-sm font-medium transition-colors ${
                isActive ? 'bg-brand text-white' : 'text-muted hover:text-ink hover:bg-surface2'
              }`
            }
          >
            <Icon size={20} className="shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Profil + chiqish */}
      <div className="border-t border-line p-3 space-y-1">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-9 h-9 rounded-full bg-surface2 flex items-center justify-center shrink-0">
            <User size={18} className="text-muted" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{usta?.ism || 'Usta'}</p>
            <p className="text-muted text-xs truncate">{user?.phone ? `+${user.phone}` : user?.email}</p>
          </div>
        </div>
        <button
          onClick={signOut}
          className="flex items-center gap-3 w-full h-11 px-3 rounded-xl text-sm font-medium text-muted hover:text-kelmadi hover:bg-surface2 transition-colors"
        >
          <LogOut size={20} className="shrink-0" /> Chiqish
        </button>
      </div>
    </aside>
  )
}
