import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, FolderKanban, MapPin } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import Modal from '../components/Modal'
import StatusBadge from '../components/StatusBadge'
import BrigadaBadge from '../components/BrigadaBadge'
import Spinner, { EmptyState, Skeleton } from '../components/Spinner'
import { useObyektlar } from '../hooks/useObyektlar'
import { useBrigadalar } from '../hooks/useBrigadalar'
import { useToast } from '../components/Toast'
import { pul, STATUSLAR } from '../lib/format'

const FILTRLAR = [
  { key: 'hammasi', nom: 'Hammasi' },
  { key: 'zamer', nom: 'Zamer' },
  { key: 'tasdiq', nom: 'Tasdiq' },
  { key: 'ishda', nom: 'Ishda' },
  { key: 'tugadi', nom: 'Tugadi' },
]

export default function Obyektlar() {
  const navigate = useNavigate()
  const { obyektlar, loading, qoshish } = useObyektlar()
  const toast = useToast()
  const [filtr, setFiltr] = useState('hammasi')
  const [qidiruv, setQidiruv] = useState('')
  const [modal, setModal] = useState(false)

  const royxat = useMemo(() => {
    const q = qidiruv.trim().toLowerCase()
    return obyektlar.filter((o) => {
      if (filtr !== 'hammasi' && o.status !== filtr) return false
      if (!q) return true
      return (
        o.mijoz_ism?.toLowerCase().includes(q) ||
        o.manzil?.toLowerCase().includes(q) ||
        o.brigada?.nom?.toLowerCase().includes(q)
      )
    })
  }, [obyektlar, filtr, qidiruv])

  return (
    <div>
      <PageHeader
        title="Obyektlar"
        subtitle={`${obyektlar.length} ta obyekt`}
        right={
          <button onClick={() => setModal(true)} className="btn h-10 px-3">
            <Plus size={18} />
          </button>
        }
      />

      <div className="p-4 space-y-3">
        {/* Qidiruv */}
        <div className="flex items-center gap-2 h-11 px-3 rounded-xl bg-surface2 border border-line">
          <Search size={18} className="text-muted" />
          <input
            value={qidiruv}
            onChange={(e) => setQidiruv(e.target.value)}
            placeholder="Ism, manzil yoki brigada..."
            className="flex-1 bg-transparent outline-none text-ink placeholder:text-muted text-sm"
          />
        </div>

        {/* Status tablari */}
        <div className="flex gap-2 overflow-x-auto scroll-x pb-1 -mx-1 px-1">
          {FILTRLAR.map((f) => {
            const active = filtr === f.key
            const rang = STATUSLAR[f.key]?.rang
            return (
              <button
                key={f.key}
                onClick={() => setFiltr(f.key)}
                className={`chip shrink-0 border ${active ? 'border-transparent text-white' : 'border-line text-muted'}`}
                style={active ? { backgroundColor: rang || '#3B82F6' } : {}}
              >
                {f.nom}
              </button>
            )
          })}
        </div>

        {/* Ro'yxat */}
        {loading ? (
          [1, 2, 3].map((i) => <Skeleton key={i} className="h-24" />)
        ) : royxat.length === 0 ? (
          <EmptyState
            icon={FolderKanban}
            title={obyektlar.length === 0 ? 'Hali obyekt yo‘q' : 'Mos obyekt topilmadi'}
            hint={obyektlar.length === 0 ? '+ tugmasini bosib birinchi obyektni qo‘shing.' : 'Filtr yoki qidiruvni o‘zgartiring.'}
            action={
              obyektlar.length === 0 && (
                <button onClick={() => setModal(true)} className="btn">
                  <Plus size={18} /> Yangi obyekt
                </button>
              )
            }
          />
        ) : (
          royxat.map((o) => (
            <button
              key={o.id}
              onClick={() => navigate(`/obyektlar/${o.id}`)}
              className="card w-full text-left flex flex-col gap-2 hover:border-brand/50 transition-colors"
              style={{ borderLeft: `3px solid ${o.brigada?.rang || '#2A2F3A'}` }}
            >
              <div className="flex items-start justify-between gap-3">
                <p className="font-semibold truncate">{o.mijoz_ism}</p>
                <StatusBadge status={o.status} />
              </div>
              {o.manzil && (
                <p className="text-muted text-sm flex items-center gap-1.5 truncate">
                  <MapPin size={14} className="shrink-0" /> {o.manzil}
                </p>
              )}
              <div className="flex items-center justify-between gap-3 pt-1">
                <BrigadaBadge brigada={o.brigada} size="sm" />
                <span className="font-semibold tabular-nums">{pul(o.smeta_summa)}</span>
              </div>
            </button>
          ))
        )}
      </div>

      {modal && (
        <ObyektModal
          onClose={() => setModal(false)}
          onSave={async (payload) => {
            try {
              const yangi = await qoshish(payload)
              toast.success('Obyekt qo‘shildi')
              setModal(false)
              navigate(`/obyektlar/${yangi.id}`)
            } catch {
              toast.error('Saqlanmadi, qayta urinib ko‘ring')
            }
          }}
        />
      )}
    </div>
  )
}

function ObyektModal({ onClose, onSave }) {
  const { brigadalar } = useBrigadalar()
  const [mijozIsm, setMijozIsm] = useState('')
  const [manzil, setManzil] = useState('')
  const [telefon, setTelefon] = useState('')
  const [brigadaId, setBrigadaId] = useState('')
  const [saving, setSaving] = useState(false)

  const submit = async () => {
    if (!mijozIsm.trim()) return
    setSaving(true)
    await onSave({
      mijoz_ism: mijozIsm.trim(),
      manzil: manzil.trim() || null,
      telefon: telefon.trim() || null,
      brigada_id: brigadaId || null,
      status: 'zamer',
    })
    setSaving(false)
  }

  return (
    <Modal
      open
      onClose={onClose}
      title="Yangi obyekt"
      footer={
        <button onClick={submit} disabled={saving || !mijozIsm.trim()} className="btn w-full">
          {saving ? <Spinner className="!w-5 !h-5" /> : 'Qo‘shish'}
        </button>
      }
    >
      <div className="space-y-4">
        <label className="block">
          <span className="text-sm text-muted">Mijoz ismi *</span>
          <input className="input mt-1.5" placeholder="Ism familiya" value={mijozIsm} onChange={(e) => setMijozIsm(e.target.value)} autoFocus />
        </label>
        <label className="block">
          <span className="text-sm text-muted">Manzil</span>
          <input className="input mt-1.5" placeholder="Ko‘cha, uy" value={manzil} onChange={(e) => setManzil(e.target.value)} />
        </label>
        <label className="block">
          <span className="text-sm text-muted">Telefon</span>
          <input className="input mt-1.5" placeholder="+998 ..." value={telefon} onChange={(e) => setTelefon(e.target.value)} />
        </label>
        <label className="block">
          <span className="text-sm text-muted">Brigada</span>
          <select className="input mt-1.5" value={brigadaId} onChange={(e) => setBrigadaId(e.target.value)}>
            <option value="">— biriktirilmagan</option>
            {brigadalar.map((b) => (
              <option key={b.id} value={b.id}>
                {b.nom}
              </option>
            ))}
          </select>
        </label>
        <p className="text-muted text-xs">Qolgan ma’lumotlarni keyin obyekt kartochkasida to‘ldirasiz.</p>
      </div>
    </Modal>
  )
}
