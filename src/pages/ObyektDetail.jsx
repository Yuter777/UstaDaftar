import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Phone, MapPin, Calendar, FileText, Plus, ChevronRight } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import Modal from '../components/Modal'
import BrigadaBadge from '../components/BrigadaBadge'
import Spinner, { Skeleton } from '../components/Spinner'
import { useObyekt } from '../hooks/useObyektlar'
import { useBrigadalar } from '../hooks/useBrigadalar'
import { useToast } from '../components/Toast'
import { pul, sana, STATUSLAR } from '../lib/format'

const OQIM = ['zamer', 'tasdiq', 'ishda', 'tugadi']

export default function ObyektDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { obyekt, loading, yangilash } = useObyekt(id)
  const { brigadalar } = useBrigadalar()
  const toast = useToast()
  const [tolovModal, setTolovModal] = useState(false)
  const [tahrirModal, setTahrirModal] = useState(false)

  if (loading) {
    return (
      <div>
        <PageHeader title="Obyekt" back="/obyektlar" />
        <div className="p-4 space-y-3">
          <Skeleton className="h-32" />
          <Skeleton className="h-24" />
        </div>
      </div>
    )
  }

  if (!obyekt) {
    return (
      <div>
        <PageHeader title="Obyekt" back="/obyektlar" />
        <p className="text-center text-muted py-16">Obyekt topilmadi</p>
      </div>
    )
  }

  const qoldiq = Number(obyekt.smeta_summa || 0) - Number(obyekt.tolangan || 0)

  const statusOzgartir = async (yangi) => {
    try {
      await yangilash({ status: yangi })
      toast.success('Status yangilandi')
    } catch {
      toast.error('Saqlanmadi')
    }
  }

  const tolovQabul = async (summa) => {
    try {
      await yangilash({ tolangan: Number(obyekt.tolangan || 0) + summa })
      toast.success('To‘lov qabul qilindi')
      setTolovModal(false)
    } catch {
      toast.error('Saqlanmadi')
    }
  }

  const mapsUrl = obyekt.manzil
    ? `https://yandex.uz/maps/?text=${encodeURIComponent(obyekt.manzil)}`
    : null

  return (
    <div>
      <PageHeader title={obyekt.mijoz_ism} subtitle={STATUSLAR[obyekt.status]?.nom} back="/obyektlar" />

      <div className="p-4 space-y-4">
        {/* Mijoz */}
        <div className="card space-y-3">
          <div className="flex items-center justify-between">
            <BrigadaBadge brigada={obyekt.brigada} />
            <button onClick={() => setTahrirModal(true)} className="text-sm text-brand">
              Tahrirlash
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <a
              href={obyekt.telefon ? `tel:${obyekt.telefon}` : undefined}
              className={`btn-ghost ${!obyekt.telefon ? 'opacity-50 pointer-events-none' : ''}`}
            >
              <Phone size={18} /> Qo‘ng‘iroq
            </a>
            <a
              href={mapsUrl || undefined}
              target="_blank"
              rel="noreferrer"
              className={`btn-ghost ${!mapsUrl ? 'opacity-50 pointer-events-none' : ''}`}
            >
              <MapPin size={18} /> Xaritada
            </a>
          </div>

          <div className="text-sm text-muted space-y-1.5 pt-1">
            {obyekt.manzil && (
              <p className="flex items-center gap-2">
                <MapPin size={15} /> {obyekt.manzil}
              </p>
            )}
            <p className="flex items-center gap-2">
              <Calendar size={15} /> {sana(obyekt.boshlanish)} — {sana(obyekt.tugash)}
            </p>
          </div>
        </div>

        {/* Status oqimi */}
        <div className="card">
          <p className="text-sm text-muted mb-3">Status</p>
          <div className="flex items-center gap-1.5">
            {OQIM.map((s, idx) => {
              const active = obyekt.status === s
              const passed = OQIM.indexOf(obyekt.status) >= idx
              return (
                <button
                  key={s}
                  onClick={() => statusOzgartir(s)}
                  className="flex-1 h-9 rounded-lg text-xs font-medium transition-colors"
                  style={{
                    backgroundColor: passed ? `${STATUSLAR[s].rang}${active ? '' : '33'}` : '#1F2430',
                    color: active ? '#fff' : passed ? STATUSLAR[s].rang : '#94A3B8',
                  }}
                >
                  {STATUSLAR[s].nom}
                </button>
              )
            })}
          </div>
        </div>

        {/* Moliya */}
        <div className="card">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-muted text-xs">Smeta</p>
              <p className="font-semibold tabular-nums mt-1">{pul(obyekt.smeta_summa)}</p>
            </div>
            <div>
              <p className="text-muted text-xs">To‘langan</p>
              <p className="font-semibold tabular-nums mt-1 text-keldi">{pul(obyekt.tolangan)}</p>
            </div>
            <div>
              <p className="text-muted text-xs">Qoldiq</p>
              <p className={`font-semibold tabular-nums mt-1 ${qoldiq > 0 ? 'text-yarim' : 'text-keldi'}`}>{pul(qoldiq)}</p>
            </div>
          </div>
          <button onClick={() => setTolovModal(true)} className="btn-ghost w-full mt-4">
            <Plus size={18} /> To‘lov qabul qilish
          </button>
        </div>

        {/* Smeta havolasi */}
        <button onClick={() => navigate(`/obyektlar/${id}/smeta`)} className="card w-full flex items-center justify-between hover:border-brand/50">
          <span className="flex items-center gap-3">
            <FileText size={20} className="text-brand" />
            <span className="font-medium">Smetani ochish</span>
          </span>
          <ChevronRight size={20} className="text-muted" />
        </button>
      </div>

      {tolovModal && <TolovModal onClose={() => setTolovModal(false)} onSave={tolovQabul} />}
      {tahrirModal && (
        <TahrirModal
          obyekt={obyekt}
          brigadalar={brigadalar}
          onClose={() => setTahrirModal(false)}
          onSave={async (payload) => {
            try {
              await yangilash(payload)
              toast.success('Saqlandi')
              setTahrirModal(false)
            } catch {
              toast.error('Saqlanmadi')
            }
          }}
        />
      )}
    </div>
  )
}

function TolovModal({ onClose, onSave }) {
  const [summa, setSumma] = useState('')
  return (
    <Modal
      open
      onClose={onClose}
      title="To‘lov qabul qilish"
      footer={
        <button onClick={() => onSave(Number(summa) || 0)} disabled={!summa} className="btn w-full">
          Qabul qilish
        </button>
      }
    >
      <label className="block">
        <span className="text-sm text-muted">Summa (so‘m)</span>
        <input
          className="input mt-1.5 tabular-nums"
          inputMode="numeric"
          autoFocus
          placeholder="0"
          value={summa}
          onChange={(e) => setSumma(e.target.value.replace(/\D/g, ''))}
        />
      </label>
    </Modal>
  )
}

function TahrirModal({ obyekt, brigadalar, onClose, onSave }) {
  const [mijozIsm, setMijozIsm] = useState(obyekt.mijoz_ism || '')
  const [manzil, setManzil] = useState(obyekt.manzil || '')
  const [telefon, setTelefon] = useState(obyekt.telefon || '')
  const [brigadaId, setBrigadaId] = useState(obyekt.brigada_id || '')
  const [boshlanish, setBoshlanish] = useState(obyekt.boshlanish || '')
  const [tugash, setTugash] = useState(obyekt.tugash || '')
  const [saving, setSaving] = useState(false)

  const submit = async () => {
    setSaving(true)
    await onSave({
      mijoz_ism: mijozIsm.trim(),
      manzil: manzil.trim() || null,
      telefon: telefon.trim() || null,
      brigada_id: brigadaId || null,
      boshlanish: boshlanish || null,
      tugash: tugash || null,
    })
    setSaving(false)
  }

  return (
    <Modal
      open
      onClose={onClose}
      title="Obyektni tahrirlash"
      footer={
        <button onClick={submit} disabled={saving} className="btn w-full">
          {saving ? <Spinner className="!w-5 !h-5" /> : 'Saqlash'}
        </button>
      }
    >
      <div className="space-y-3">
        <input className="input" placeholder="Mijoz ismi" value={mijozIsm} onChange={(e) => setMijozIsm(e.target.value)} />
        <input className="input" placeholder="Manzil" value={manzil} onChange={(e) => setManzil(e.target.value)} />
        <input className="input" placeholder="Telefon" value={telefon} onChange={(e) => setTelefon(e.target.value)} />
        <select className="input" value={brigadaId} onChange={(e) => setBrigadaId(e.target.value)}>
          <option value="">— brigada biriktirilmagan</option>
          {brigadalar.map((b) => (
            <option key={b.id} value={b.id}>
              {b.nom}
            </option>
          ))}
        </select>
        <div className="flex gap-2">
          <label className="flex-1">
            <span className="text-xs text-muted">Boshlanish</span>
            <input type="date" className="input mt-1" value={boshlanish || ''} onChange={(e) => setBoshlanish(e.target.value)} />
          </label>
          <label className="flex-1">
            <span className="text-xs text-muted">Tugash</span>
            <input type="date" className="input mt-1" value={tugash || ''} onChange={(e) => setTugash(e.target.value)} />
          </label>
        </div>
      </div>
    </Modal>
  )
}
