import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Plus, Trash2, Download, Eye, EyeOff } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import Modal from '../components/Modal'
import { Skeleton } from '../components/Spinner'
import { useSmeta } from '../hooks/useSmeta'
import { useObyekt } from '../hooks/useObyektlar'
import { useKatalog } from '../hooks/useKatalog'
import { useToast } from '../components/Toast'
import { pul, son } from '../lib/format'
import { exportToExcel } from '../lib/excel'

const BOLIMLAR = [
  { turi: 'ish', nom: 'Ishlar' },
  { turi: 'material', nom: 'Materiallar' },
]

export default function Smeta() {
  const { id } = useParams()
  const { qatorlar, loading, qoshish, yangilash, ochirish } = useSmeta(id)
  const { obyekt, yangilash: obyektYangilash } = useObyekt(id)
  const toast = useToast()
  const [korish, setKorish] = useState(false) // mijozga ko'rsatish rejimi
  const [modal, setModal] = useState(null) // turi

  const summa = (q) => Number(q.miqdor || 0) * Number(q.narx || 0)
  const jami = useMemo(() => qatorlar.reduce((s, q) => s + summa(q), 0), [qatorlar])

  // jami o'zgarsa obyekt.smeta_summa ni yangilab turamiz
  useEffect(() => {
    if (loading || !obyekt) return
    if (Number(obyekt.smeta_summa || 0) !== jami) {
      obyektYangilash({ smeta_summa: jami }).catch(() => {})
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jami, loading])

  const eksport = () => {
    const rows = qatorlar.map((q) => ({
      "Bo'lim": q.turi === 'ish' ? 'Ish' : q.turi === 'material' ? 'Material' : 'Xarajat',
      Nomi: q.nom,
      Birlik: q.birlik || '',
      Miqdor: Number(q.miqdor || 0),
      Narx: Number(q.narx || 0),
      Summa: summa(q),
    }))
    rows.push({ "Bo'lim": '', Nomi: 'JAMI', Birlik: '', Miqdor: '', Narx: '', Summa: jami })
    exportToExcel(rows, 'Smeta', `smeta-${obyekt?.mijoz_ism || id}`)
  }

  return (
    <div>
      <PageHeader
        title="Smeta"
        subtitle={obyekt?.mijoz_ism}
        back={`/obyektlar/${id}`}
        right={
          <div className="flex gap-1">
            <button onClick={() => setKorish((v) => !v)} className="p-2 rounded-lg text-muted hover:text-ink hover:bg-surface2" title="Mijozga ko‘rsatish">
              {korish ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
            <button onClick={eksport} className="p-2 rounded-lg text-muted hover:text-ink hover:bg-surface2" title="Excelga yuklash">
              <Download size={20} />
            </button>
          </div>
        }
      />

      <div className="p-4 space-y-5">
        {loading ? (
          [1, 2].map((i) => <Skeleton key={i} className="h-32" />)
        ) : (
          BOLIMLAR.map((b) => {
            const list = qatorlar.filter((q) => q.turi === b.turi)
            const oraliq = list.reduce((s, q) => s + summa(q), 0)
            return (
              <div key={b.turi}>
                <div className="flex items-center justify-between mb-2">
                  <h2 className="font-semibold">{b.nom}</h2>
                  <span className="text-muted text-sm tabular-nums">{pul(oraliq)}</span>
                </div>

                <div className="card p-0 overflow-hidden divide-y divide-line">
                  {list.length === 0 ? (
                    <p className="text-muted text-sm text-center py-5">Qator yo‘q</p>
                  ) : (
                    list.map((q) => (
                      <SmetaRow key={q.id} q={q} korish={korish} summa={summa(q)} onChange={(p) => yangilash(q.id, p)} onDelete={() => ochirish(q.id)} />
                    ))
                  )}
                  {!korish && (
                    <button onClick={() => setModal(b.turi)} className="w-full h-11 text-sm text-brand flex items-center justify-center gap-1.5 hover:bg-surface2">
                      <Plus size={16} /> Qator qo‘shish
                    </button>
                  )}
                </div>
              </div>
            )
          })
        )}

        {/* ITOG */}
        <div className="card flex items-center justify-between bg-surface2">
          <span className="font-semibold">JAMI</span>
          <span className="font-bold text-lg tabular-nums">{pul(jami)}</span>
        </div>
      </div>

      {modal && (
        <QatorModal
          turi={modal}
          onClose={() => setModal(null)}
          onSave={async (payload) => {
            try {
              await qoshish(payload)
              toast.success('Qo‘shildi')
              setModal(null)
            } catch {
              toast.error('Saqlanmadi')
            }
          }}
        />
      )}
    </div>
  )
}

function SmetaRow({ q, korish, summa, onChange, onDelete }) {
  const [miqdor, setMiqdor] = useState(String(q.miqdor ?? ''))
  const [narx, setNarx] = useState(String(q.narx ?? ''))

  if (korish) {
    return (
      <div className="flex items-center justify-between px-3 py-3">
        <div className="min-w-0">
          <p className="font-medium truncate">{q.nom}</p>
          <p className="text-muted text-xs">
            {son(q.miqdor)} {q.birlik} × {son(q.narx)}
          </p>
        </div>
        <span className="font-semibold tabular-nums">{pul(summa)}</span>
      </div>
    )
  }

  return (
    <div className="px-3 py-3 space-y-2">
      <div className="flex items-center justify-between gap-2">
        <p className="font-medium truncate flex-1">{q.nom}</p>
        <span className="font-semibold tabular-nums text-sm">{pul(summa)}</span>
        <button onClick={onDelete} className="p-1 text-muted hover:text-kelmadi">
          <Trash2 size={16} />
        </button>
      </div>
      <div className="flex items-center gap-2">
        <input
          className="input h-10 flex-1 tabular-nums"
          inputMode="decimal"
          placeholder="Miqdor"
          value={miqdor}
          onChange={(e) => setMiqdor(e.target.value.replace(/[^\d.]/g, ''))}
          onBlur={() => onChange({ miqdor: Number(miqdor) || 0 })}
        />
        <span className="text-muted text-sm w-10 text-center">{q.birlik || '—'}</span>
        <span className="text-muted">×</span>
        <input
          className="input h-10 flex-1 tabular-nums"
          inputMode="numeric"
          placeholder="Narx"
          value={narx}
          onChange={(e) => setNarx(e.target.value.replace(/\D/g, ''))}
          onBlur={() => onChange({ narx: Number(narx) || 0 })}
        />
      </div>
    </div>
  )
}

function QatorModal({ turi, onClose, onSave }) {
  const { katalog } = useKatalog()
  const [nom, setNom] = useState('')
  const [birlik, setBirlik] = useState('')
  const [miqdor, setMiqdor] = useState('')
  const [narx, setNarx] = useState('')

  const variantlar = katalog.filter((k) => k.turi === turi)

  const tanla = (k) => {
    setNom(k.nom)
    setBirlik(k.birlik || '')
    setNarx(String(k.narx ?? ''))
  }

  const submit = () => {
    if (!nom.trim()) return
    onSave({
      turi,
      nom: nom.trim(),
      birlik: birlik.trim() || null,
      miqdor: Number(miqdor) || 0,
      narx: Number(narx) || 0,
    })
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={turi === 'ish' ? 'Ish qo‘shish' : 'Material qo‘shish'}
      footer={
        <button onClick={submit} disabled={!nom.trim()} className="btn w-full">
          Qo‘shish
        </button>
      }
    >
      <div className="space-y-3">
        {variantlar.length > 0 && (
          <div>
            <p className="text-xs text-muted mb-2">Katalogdan tanlash</p>
            <div className="flex flex-wrap gap-2">
              {variantlar.map((k) => (
                <button key={k.id} onClick={() => tanla(k)} className="chip bg-surface2 border border-line text-muted hover:text-ink">
                  {k.nom}
                </button>
              ))}
            </div>
          </div>
        )}
        <input className="input" placeholder="Nomi" value={nom} onChange={(e) => setNom(e.target.value)} autoFocus />
        <div className="flex gap-2">
          <input className="input" placeholder="Birlik (m², dona)" value={birlik} onChange={(e) => setBirlik(e.target.value)} />
          <input className="input tabular-nums" inputMode="decimal" placeholder="Miqdor" value={miqdor} onChange={(e) => setMiqdor(e.target.value.replace(/[^\d.]/g, ''))} />
        </div>
        <input className="input tabular-nums" inputMode="numeric" placeholder="Birlik narxi" value={narx} onChange={(e) => setNarx(e.target.value.replace(/\D/g, ''))} />
      </div>
    </Modal>
  )
}
