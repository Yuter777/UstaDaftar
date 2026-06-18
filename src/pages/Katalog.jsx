import { useMemo, useState } from 'react'
import { Plus, Trash2, BookOpen } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import Modal from '../components/Modal'
import { EmptyState, Skeleton } from '../components/Spinner'
import { useKatalog } from '../hooks/useKatalog'
import { useToast } from '../components/Toast'
import { pul } from '../lib/format'

const TABLAR = [
  { turi: 'ish', nom: 'Ishlar' },
  { turi: 'material', nom: 'Materiallar' },
  { turi: 'xarajat', nom: 'Xarajatlar' },
]

export default function Katalog() {
  const { katalog, loading, qoshish, ochirish } = useKatalog()
  const toast = useToast()
  const [tab, setTab] = useState('ish')
  const [modal, setModal] = useState(false)

  const royxat = useMemo(() => katalog.filter((k) => k.turi === tab), [katalog, tab])

  return (
    <div>
      <PageHeader
        title="Katalog"
        subtitle="Qayta ishlatiladigan pozitsiyalar"
        back="/yana"
        right={
          <button onClick={() => setModal(true)} className="btn h-10 px-3">
            <Plus size={18} />
          </button>
        }
      />

      <div className="p-4 space-y-3">
        <div className="flex gap-2">
          {TABLAR.map((t) => (
            <button
              key={t.turi}
              onClick={() => setTab(t.turi)}
              className={`chip flex-1 justify-center border ${tab === t.turi ? 'bg-brand text-white border-transparent' : 'border-line text-muted'}`}
            >
              {t.nom}
            </button>
          ))}
        </div>

        {loading ? (
          [1, 2, 3].map((i) => <Skeleton key={i} className="h-14" />)
        ) : royxat.length === 0 ? (
          <EmptyState icon={BookOpen} title="Bu bo‘limda pozitsiya yo‘q" hint="+ tugmasi bilan qo‘shing — keyin smetada qayta-qayta tanlaysiz." />
        ) : (
          <div className="card p-0 divide-y divide-line overflow-hidden">
            {royxat.map((k) => (
              <div key={k.id} className="flex items-center gap-3 px-4 py-3">
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{k.nom}</p>
                  <p className="text-muted text-xs">{k.birlik || '—'}</p>
                </div>
                <span className="font-semibold tabular-nums text-sm">{pul(k.narx)}</span>
                <button
                  onClick={async () => {
                    try {
                      await ochirish(k.id)
                      toast.success('O‘chirildi')
                    } catch {
                      toast.error('O‘chirilmadi')
                    }
                  }}
                  className="p-1.5 text-muted hover:text-kelmadi"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {modal && (
        <KatalogModal
          turi={tab}
          onClose={() => setModal(false)}
          onSave={async (payload) => {
            try {
              await qoshish(payload)
              toast.success('Qo‘shildi')
              setModal(false)
            } catch {
              toast.error('Saqlanmadi')
            }
          }}
        />
      )}
    </div>
  )
}

function KatalogModal({ turi, onClose, onSave }) {
  const [nom, setNom] = useState('')
  const [birlik, setBirlik] = useState('')
  const [narx, setNarx] = useState('')
  const [t, setT] = useState(turi)

  const submit = () => {
    if (!nom.trim()) return
    onSave({ turi: t, nom: nom.trim(), birlik: birlik.trim() || null, narx: Number(narx) || 0 })
  }

  return (
    <Modal
      open
      onClose={onClose}
      title="Yangi pozitsiya"
      footer={
        <button onClick={submit} disabled={!nom.trim()} className="btn w-full">
          Qo‘shish
        </button>
      }
    >
      <div className="space-y-3">
        <select className="input" value={t} onChange={(e) => setT(e.target.value)}>
          {TABLAR.map((x) => (
            <option key={x.turi} value={x.turi}>
              {x.nom}
            </option>
          ))}
        </select>
        <input className="input" placeholder="Nomi" value={nom} onChange={(e) => setNom(e.target.value)} autoFocus />
        <div className="flex gap-2">
          <input className="input" placeholder="Birlik (m², dona)" value={birlik} onChange={(e) => setBirlik(e.target.value)} />
          <input className="input tabular-nums" inputMode="numeric" placeholder="Narx" value={narx} onChange={(e) => setNarx(e.target.value.replace(/\D/g, ''))} />
        </div>
      </div>
    </Modal>
  )
}
