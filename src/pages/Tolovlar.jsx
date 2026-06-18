import { useMemo, useState } from 'react'
import { format } from 'date-fns'
import { Plus, Download, Trash2, Wallet } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import Modal from '../components/Modal'
import { EmptyState, Skeleton } from '../components/Spinner'
import { useTolovlar } from '../hooks/useTolovlar'
import { useBrigadalar, useIshchilar } from '../hooks/useBrigadalar'
import { useToast } from '../components/Toast'
import { pul, son, sana } from '../lib/format'
import { exportToExcel } from '../lib/excel'

export default function Tolovlar() {
  const { tolovlar, loading, qoshish, ochirish } = useTolovlar()
  const { brigadalar } = useBrigadalar()
  const toast = useToast()
  const [modal, setModal] = useState(false)
  const [brigadaFiltr, setBrigadaFiltr] = useState('')

  const royxat = useMemo(() => {
    if (!brigadaFiltr) return tolovlar
    return tolovlar.filter((t) => t.ishchi?.brigada_id === brigadaFiltr)
  }, [tolovlar, brigadaFiltr])

  const jami = useMemo(() => royxat.reduce((s, t) => s + Number(t.summa || 0), 0), [royxat])

  const eksport = () => {
    const rows = royxat.map((t) => ({
      Sana: sana(t.sana),
      Ishchi: t.ishchi?.ism || '',
      Summa: Number(t.summa || 0),
      Turi: t.turi,
      Izoh: t.izoh || '',
    }))
    exportToExcel(rows, 'Tolovlar', 'tolovlar')
  }

  return (
    <div>
      <PageHeader
        title="To‘lovlar"
        subtitle="Ishchilarga avans / oylik"
        right={
          <div className="flex gap-1">
            <button onClick={eksport} disabled={!royxat.length} className="p-2 rounded-lg text-muted hover:text-ink hover:bg-surface2 disabled:opacity-40">
              <Download size={20} />
            </button>
            <button onClick={() => setModal(true)} className="btn h-10 px-3">
              <Plus size={18} />
            </button>
          </div>
        }
      />

      <div className="p-4 space-y-3">
        <select className="input h-10 w-auto min-w-[160px]" value={brigadaFiltr} onChange={(e) => setBrigadaFiltr(e.target.value)}>
          <option value="">Barcha brigadalar</option>
          {brigadalar.map((b) => (
            <option key={b.id} value={b.id}>
              {b.nom}
            </option>
          ))}
        </select>

        {loading ? (
          [1, 2, 3].map((i) => <Skeleton key={i} className="h-16" />)
        ) : royxat.length === 0 ? (
          <EmptyState icon={Wallet} title="Hali to‘lov yo‘q" hint="+ tugmasini bosib ishchiga to‘lov qo‘shing." />
        ) : (
          <>
            <div className="card p-0 divide-y divide-line overflow-hidden">
              {royxat.map((t) => (
                <div key={t.id} className="flex items-center gap-3 px-4 py-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{t.ishchi?.ism || 'Ishchi'}</p>
                    <p className="text-muted text-xs">
                      {sana(t.sana)} · {t.turi === 'oylik' ? 'Oylik' : 'Avans'}
                      {t.izoh ? ` · ${t.izoh}` : ''}
                    </p>
                  </div>
                  <span className="font-semibold tabular-nums">{pul(t.summa)}</span>
                  <button
                    onClick={async () => {
                      try {
                        await ochirish(t.id)
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
            <div className="card flex items-center justify-between bg-surface2">
              <span className="font-medium">Jami</span>
              <span className="font-bold tabular-nums">{pul(jami)}</span>
            </div>
          </>
        )}
      </div>

      {modal && (
        <TolovModal
          brigadalar={brigadalar}
          onClose={() => setModal(false)}
          onSave={async (payload) => {
            try {
              await qoshish(payload)
              toast.success('Saqlandi')
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

function TolovModal({ brigadalar, onClose, onSave }) {
  const [brigadaId, setBrigadaId] = useState(brigadalar[0]?.id || '')
  const { ishchilar } = useIshchilar(brigadaId)
  const [ishchiId, setIshchiId] = useState('')
  const [summa, setSumma] = useState('')
  const [turi, setTuri] = useState('avans')
  const [sanaVal, setSanaVal] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [izoh, setIzoh] = useState('')

  const submit = () => {
    if (!ishchiId || !summa) return
    onSave({
      ishchi_id: ishchiId,
      summa: Number(summa) || 0,
      turi,
      sana: sanaVal,
      izoh: izoh.trim() || null,
    })
  }

  return (
    <Modal
      open
      onClose={onClose}
      title="Yangi to‘lov"
      footer={
        <button onClick={submit} disabled={!ishchiId || !summa} className="btn w-full">
          Saqlash
        </button>
      }
    >
      <div className="space-y-3">
        <select
          className="input"
          value={brigadaId}
          onChange={(e) => {
            setBrigadaId(e.target.value)
            setIshchiId('')
          }}
        >
          <option value="">Brigada tanlang</option>
          {brigadalar.map((b) => (
            <option key={b.id} value={b.id}>
              {b.nom}
            </option>
          ))}
        </select>
        <select className="input" value={ishchiId} onChange={(e) => setIshchiId(e.target.value)}>
          <option value="">Ishchi tanlang</option>
          {ishchilar.map((i) => (
            <option key={i.id} value={i.id}>
              {i.ism}
            </option>
          ))}
        </select>
        <input className="input tabular-nums" inputMode="numeric" placeholder="Summa (so‘m)" value={summa} onChange={(e) => setSumma(e.target.value.replace(/\D/g, ''))} />
        <div className="flex gap-2">
          <button onClick={() => setTuri('avans')} className={`flex-1 h-11 rounded-xl border text-sm font-medium ${turi === 'avans' ? 'bg-brand text-white border-transparent' : 'border-line text-muted'}`}>
            Avans
          </button>
          <button onClick={() => setTuri('oylik')} className={`flex-1 h-11 rounded-xl border text-sm font-medium ${turi === 'oylik' ? 'bg-brand text-white border-transparent' : 'border-line text-muted'}`}>
            Oylik
          </button>
        </div>
        <input type="date" className="input" value={sanaVal} onChange={(e) => setSanaVal(e.target.value)} />
        <input className="input" placeholder="Izoh (ixtiyoriy)" value={izoh} onChange={(e) => setIzoh(e.target.value)} />
        {summa && <p className="text-muted text-sm text-center">{son(summa)} so‘m</p>}
      </div>
    </Modal>
  )
}
