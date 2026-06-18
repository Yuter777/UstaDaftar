import { useNavigate } from 'react-router-dom'
import { Wallet, BookOpen, LogOut, ChevronRight, User } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import { useAuth } from '../context/AuthContext'

export default function Yana() {
  const navigate = useNavigate()
  const { user, usta, signOut } = useAuth()

  const items = [
    { to: '/tolovlar', label: 'To‘lovlar', icon: Wallet, hint: 'Ishchilarga avans / oylik' },
    { to: '/katalog', label: 'Katalog', icon: BookOpen, hint: 'Ishlar va materiallar' },
  ]

  return (
    <div>
      <PageHeader title="Yana" />
      <div className="p-4 space-y-4">
        {/* Profil */}
        <div className="card flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-surface2 flex items-center justify-center">
            <User size={22} className="text-muted" />
          </div>
          <div className="min-w-0">
            <p className="font-medium truncate">{usta?.ism || 'Usta'}</p>
            <p className="text-muted text-sm truncate">{user?.phone ? `+${user.phone}` : user?.email}</p>
          </div>
        </div>

        <div className="card p-0 divide-y divide-line overflow-hidden">
          {items.map(({ to, label, icon: Icon, hint }) => (
            <button key={to} onClick={() => navigate(to)} className="w-full flex items-center gap-3 px-4 py-4 hover:bg-surface2">
              <Icon size={20} className="text-brand" />
              <div className="flex-1 text-left">
                <p className="font-medium">{label}</p>
                <p className="text-muted text-xs">{hint}</p>
              </div>
              <ChevronRight size={18} className="text-muted" />
            </button>
          ))}
        </div>

        <button onClick={signOut} className="btn-ghost w-full text-kelmadi">
          <LogOut size={18} /> Chiqish
        </button>
      </div>
    </div>
  )
}
