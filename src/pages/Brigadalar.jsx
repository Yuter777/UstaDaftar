import { useState } from 'react'
import { Plus, Users, Trash2, Pencil, UserPlus, X } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import Modal from '../components/Modal'
import ColorPicker from '../components/ColorPicker'
import Spinner, { EmptyState, Skeleton } from '../components/Spinner'
import { useBrigadalar, useIshchilar } from '../hooks/useBrigadalar'
import { useToast } from '../components/Toast'
import { RANGLAR, son } from '../lib/format'

export default function Brigadalar() {
  const { brigadalar, loading, qoshish, yangilash, ochirish } = useBrigadalar()
  const toast = useToast()
  const [modal, setModal] = useState(null) // null | 'yangi' | brigada(tahrir)
  const [azolar, setAzolar] = useState(null) // ochilgan brigada

  return (
    <div>
      <PageHeader
        title="Brigadalar"
        subtitle={`${brigadalar.length} ta brigada`}
        right={
          <button onClick={() => setModal('yangi')} className="btn h-10 px-3" aria-label="Yangi brigada">
            <Plus size={18} />
          </button>
        }
      />

      <div className="p-4 space-y-3">
        {loading ? (
          [1, 2, 3].map((i) => <Skeleton key={i} className="h-20" />)
        ) : brigadalar.length === 0 ? (
          <EmptyState
            icon={Users}
            title="Hali brigada yo‘q"
            hint="Birinchi brigadangizni qo‘shing — keyin obyekt va davomat shu yerga bog‘lanadi."
            action={
              <button onClick={() => setModal('yangi')} className="btn">
                <Plus size={18} /> Yangi brigada
              </button>
            }
          />
        ) : (
          brigadalar.map((b) => (
            <div key={b.id} className="card flex items-center gap-3">
              <button onClick={() => setAzolar(b)} className="flex items-center gap-3 flex-1 min-w-0 text-left">
                <span className="w-10 h-10 rounded-xl shrink-0 flex items-center justify-center" style={{ backgroundColor: `${b.rang}22` }}>
                  <span className="w-4 h-4 rounded-full" style={{ backgroundColor: b.rang }} />
                </span>
                <div className="min-w-0">
                  <p className="font-medium truncate">{b.nom}</p>
                  <p className="text-muted text-sm truncate">
                    {b.mutaxassislik || 'Mutaxassislik yo‘q'} · {son(b.ishchilar?.[0]?.count ?? 0)} a‘zo
                  </p>
                </div>
              </button>
              <button onClick={() => setModal(b)} className="p-2 rounded-lg text-muted hover:text-ink hover:bg-surface2" aria-label="Tahrirlash">
                <Pencil size={18} />
              </button>
              <button
                onClick={async () => {
                  if (!confirm(`"${b.nom}" o‘chirilsinmi?`)) return
                  try {
                    await ochirish(b.id)
                    toast.success('O‘chirildi')
                  } catch {
                    toast.error('O‘chirilmadi')
                  }
                }}
                className="p-2 rounded-lg text-muted hover:text-kelmadi hover:bg-surface2"
                aria-label="O‘chirish"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))
        )}
      </div>

      {modal && (
        <BrigadaModal
          brigada={modal === 'yangi' ? null : modal}
          onClose={() => setModal(null)}
          onSave={async (payload) => {
            try {
              if (modal === 'yangi') await qoshish(payload)
              else await yangilash(modal.id, payload)
              toast.success('Saqlandi')
              setModal(null)
            } catch {
              toast.error('Saqlanmadi, qayta urinib ko‘ring')
            }
          }}
        />
      )}

      {azolar && <AzolarModal brigada={azolar} onClose={() => setAzolar(null)} />}
    </div>
  )
}

function BrigadaModal({ brigada, onClose, onSave }) {
  const [nom, setNom] = useState(brigada?.nom || '')
  const [mutaxassislik, setMutaxassislik] = useState(brigada?.mutaxassislik || '')
  const [rang, setRang] = useState(brigada?.rang || RANGLAR[0])
  const [saving, setSaving] = useState(false)

  const submit = async () => {
    if (!nom.trim()) return
    setSaving(true)
    await onSave({ nom: nom.trim(), mutaxassislik: mutaxassislik.trim() || null, rang })
    setSaving(false)
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={brigada ? 'Brigadani tahrirlash' : 'Yangi brigada'}
      footer={
        <button onClick={submit} disabled={saving || !nom.trim()} className="btn w-full">
          {saving ? <Spinner className="!w-5 !h-5" /> : 'Saqlash'}
        </button>
      }
    >
      <div className="space-y-4">
        <label className="block">
          <span className="text-sm text-muted">Nomi</span>
          <input className="input mt-1.5" placeholder="1-brigada" value={nom} onChange={(e) => setNom(e.target.value)} autoFocus />
        </label>
        <label className="block">
          <span className="text-sm text-muted">Mutaxassislik</span>
          <input className="input mt-1.5" placeholder="Shtukaturka, Plitka" value={mutaxassislik} onChange={(e) => setMutaxassislik(e.target.value)} />
        </label>
        <div>
          <span className="text-sm text-muted">Rang</span>
          <div className="mt-2">
            <ColorPicker value={rang} onChange={setRang} />
          </div>
        </div>
      </div>
    </Modal>
  )
}

function AzolarModal({ brigada, onClose }) {
  const { ishchilar, loading, qoshish, ochirish } = useIshchilar(brigada.id)
  const toast = useToast()
  const [ism, setIsm] = useState('')
  const [telefon, setTelefon] = useState('')
  const [haq, setHaq] = useState('')

  const add = async () => {
    if (!ism.trim()) return
    try {
      await qoshish({ ism: ism.trim(), telefon: telefon.trim() || null, kunlik_haq: Number(haq) || 0 })
      setIsm('')
      setTelefon('')
      setHaq('')
      toast.success('Qo‘shildi')
    } catch {
      toast.error('Qo‘shilmadi')
    }
  }

  return (
    <Modal open onClose={onClose} title={brigada.nom + ' — a‘zolar'}>
      <div className="space-y-4">
        <div className="space-y-2">
          {loading ? (
            <Skeleton className="h-12" />
          ) : ishchilar.length === 0 ? (
            <p className="text-muted text-sm text-center py-4">Hali ishchi yo‘q</p>
          ) : (
            ishchilar.map((i) => (
              <div key={i.id} className="flex items-center gap-3 bg-surface2 rounded-xl px-3 h-12">
                <span className="w-8 h-8 rounded-full bg-surface flex items-center justify-center text-sm font-medium" style={{ color: brigada.rang }}>
                  {i.ism.charAt(0).toUpperCase()}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate text-sm">{i.ism}</p>
                  {i.kunlik_haq > 0 && <p className="text-muted text-xs">{son(i.kunlik_haq)} so‘m/kun</p>}
                </div>
                <button
                  onClick={async () => {
                    try {
                      await ochirish(i.id)
                    } catch {
                      toast.error('O‘chirilmadi')
                    }
                  }}
                  className="p-1.5 rounded-lg text-muted hover:text-kelmadi"
                >
                  <X size={16} />
                </button>
              </div>
            ))
          )}
        </div>

        <div className="border-t border-line pt-4 space-y-2">
          <input className="input" placeholder="Ishchi ismi" value={ism} onChange={(e) => setIsm(e.target.value)} />
          <div className="flex gap-2">
            <input className="input" placeholder="Telefon" value={telefon} onChange={(e) => setTelefon(e.target.value)} />
            <input className="input" inputMode="numeric" placeholder="Kunlik haq" value={haq} onChange={(e) => setHaq(e.target.value.replace(/\D/g, ''))} />
          </div>
          <button onClick={add} disabled={!ism.trim()} className="btn-ghost w-full">
            <UserPlus size={18} /> A‘zo qo‘shish
          </button>
        </div>
      </div>
    </Modal>
  )
}
