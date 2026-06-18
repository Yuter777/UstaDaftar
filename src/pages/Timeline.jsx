import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { parseISO, isValid } from 'date-fns'
import { AlertTriangle, CalendarDays } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import MonthPicker from '../components/MonthPicker'
import { EmptyState, Skeleton } from '../components/Spinner'
import { useBrigadalar } from '../hooks/useBrigadalar'
import { useObyektlar } from '../hooks/useObyektlar'
import { HAFTA_KUNLARI } from '../lib/format'

const KATAK = 40 // px har kun

export default function Timeline() {
  const navigate = useNavigate()
  const { brigadalar, loading: bLoading } = useBrigadalar()
  const { obyektlar, loading: oLoading } = useObyektlar()
  const [oy, setOy] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1))

  const kunSoni = new Date(oy.getFullYear(), oy.getMonth() + 1, 0).getDate()
  const kunlar = useMemo(() => Array.from({ length: kunSoni }, (_, i) => i + 1), [kunSoni])

  const bugun = new Date()
  const isToday = (kun) =>
    bugun.getFullYear() === oy.getFullYear() && bugun.getMonth() === oy.getMonth() && bugun.getDate() === kun

  // brigada -> shu oyga tushadigan obyektlar (start/end klamplangan)
  const bloklarByBrigada = useMemo(() => {
    const oyStart = new Date(oy.getFullYear(), oy.getMonth(), 1)
    const oyEnd = new Date(oy.getFullYear(), oy.getMonth() + 1, 0)
    const m = {}
    obyektlar.forEach((o) => {
      if (!o.brigada_id || !o.boshlanish) return
      const b = parseISO(o.boshlanish)
      const e = o.tugash ? parseISO(o.tugash) : b
      if (!isValid(b) || !isValid(e)) return
      if (e < oyStart || b > oyEnd) return
      const startKun = b < oyStart ? 1 : b.getDate()
      const endKun = e > oyEnd ? kunSoni : e.getDate()
      ;(m[o.brigada_id] ||= []).push({ ...o, startKun, endKun })
    })
    return m
  }, [obyektlar, oy, kunSoni])

  // to'qnashuv: bir brigada bloklari sana bo'yicha kesishsa
  const conflictIds = useMemo(() => {
    const set = new Set()
    Object.values(bloklarByBrigada).forEach((bloklar) => {
      for (let i = 0; i < bloklar.length; i++) {
        for (let j = i + 1; j < bloklar.length; j++) {
          const a = bloklar[i]
          const c = bloklar[j]
          if (a.startKun <= c.endKun && c.startKun <= a.endKun) {
            set.add(a.id)
            set.add(c.id)
          }
        }
      }
    })
    return set
  }, [bloklarByBrigada])

  const loading = bLoading || oLoading

  return (
    <div>
      <PageHeader title="Timeline" subtitle="Brigadalar taqvimi" right={<MonthPicker value={oy} onChange={setOy} />} />

      <div className="p-4">
        {loading ? (
          <Skeleton className="h-64" />
        ) : brigadalar.length === 0 ? (
          <EmptyState
            icon={CalendarDays}
            title="Hali brigada yo‘q"
            hint="Timeline brigadalar va obyektlar sanasidan tuziladi. Avval brigada qo‘shing."
            action={
              <button onClick={() => navigate('/brigadalar')} className="btn">
                Brigadalar
              </button>
            }
          />
        ) : (
          <div className="border border-line rounded-2xl overflow-hidden">
            <div className="overflow-x-auto scroll-x">
              <div style={{ minWidth: 120 + kunSoni * KATAK }}>
                {/* Sarlavha qatori — kunlar */}
                <div className="flex border-b border-line bg-surface2">
                  <div className="sticky left-0 z-10 bg-surface2 w-[120px] shrink-0 px-3 h-12 flex items-center text-sm font-medium border-r border-line">
                    Brigada
                  </div>
                  {kunlar.map((kun) => {
                    const d = new Date(oy.getFullYear(), oy.getMonth(), kun)
                    return (
                      <div
                        key={kun}
                        className={`shrink-0 flex flex-col items-center justify-center text-xs tabular-nums ${
                          isToday(kun) ? 'bg-brand/15 text-brand' : 'text-muted'
                        }`}
                        style={{ width: KATAK }}
                      >
                        <span>{kun}</span>
                        <span className="text-[9px] opacity-70">{HAFTA_KUNLARI[(d.getDay() + 6) % 7]}</span>
                      </div>
                    )
                  })}
                </div>

                {/* Brigada qatorlari */}
                {brigadalar.map((b) => {
                  const bloklar = bloklarByBrigada[b.id] || []
                  return (
                    <div key={b.id} className="flex border-b border-line last:border-0 relative">
                      <div className="sticky left-0 z-10 bg-surface w-[120px] shrink-0 px-3 py-3 flex items-center gap-2 border-r border-line">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: b.rang }} />
                        <span className="text-sm truncate">{b.nom}</span>
                      </div>

                      {/* katak fon */}
                      <div className="relative flex" style={{ width: kunSoni * KATAK, minHeight: 56 }}>
                        {kunlar.map((kun) => (
                          <div
                            key={kun}
                            className={`shrink-0 border-r border-line/40 ${isToday(kun) ? 'bg-brand/5' : ''}`}
                            style={{ width: KATAK }}
                          />
                        ))}

                        {/* obyekt bloklari */}
                        {bloklar.map((o, idx) => {
                          const conflict = conflictIds.has(o.id)
                          return (
                            <button
                              key={o.id}
                              onClick={() => navigate(`/obyektlar/${o.id}`)}
                              className="absolute h-8 rounded-lg px-2 flex items-center gap-1 text-xs font-medium text-white truncate"
                              style={{
                                left: (o.startKun - 1) * KATAK + 2,
                                width: (o.endKun - o.startKun + 1) * KATAK - 4,
                                top: 8 + (idx % 2) * 4,
                                backgroundColor: b.rang,
                                outline: conflict ? '2px solid #EF4444' : 'none',
                              }}
                            >
                              {conflict && <AlertTriangle size={12} className="shrink-0" />}
                              <span className="truncate">{o.mijoz_ism}</span>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {conflictIds.size > 0 && (
          <p className="text-kelmadi text-sm mt-3 flex items-center gap-2">
            <AlertTriangle size={16} /> Sana to‘qnashuvi bor — bir brigada bir vaqtda ikki obyektda.
          </p>
        )}
      </div>
    </div>
  )
}
