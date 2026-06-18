import { useMemo, useState } from 'react'
import { format } from 'date-fns'
import { Download, CheckSquare, Users } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import MonthPicker from '../components/MonthPicker'
import AttendanceCell from '../components/AttendanceCell'
import { EmptyState, Skeleton } from '../components/Spinner'
import { useBrigadalar, useIshchilar } from '../hooks/useBrigadalar'
import { useDavomat } from '../hooks/useDavomat'
import { useToast } from '../components/Toast'
import { DAVOMAT_HOLATLARI, HAFTA_KUNLARI } from '../lib/format'
import { exportMatrixToExcel } from '../lib/excel'

export default function Davomat() {
  const { brigadalar, loading: bLoading } = useBrigadalar()
  const [brigadaId, setBrigadaId] = useState('')
  const [oy, setOy] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1))
  const toast = useToast()

  // birinchi brigadani avtomatik tanlash
  const tanlangan = brigadaId || brigadalar[0]?.id || ''
  const brigada = brigadalar.find((b) => b.id === tanlangan)

  const { ishchilar, loading: iLoading } = useIshchilar(tanlangan)
  const ishchiIdlar = useMemo(() => ishchilar.map((i) => i.id), [ishchilar])
  const { map, belgila } = useDavomat(ishchiIdlar, oy)

  const kunlar = useMemo(() => {
    const oxiri = new Date(oy.getFullYear(), oy.getMonth() + 1, 0).getDate()
    return Array.from({ length: oxiri }, (_, i) => i + 1)
  }, [oy])

  const bugun = new Date()
  const isToday = (kun) =>
    bugun.getFullYear() === oy.getFullYear() && bugun.getMonth() === oy.getMonth() && bugun.getDate() === kun

  const sanaStr = (kun) => format(new Date(oy.getFullYear(), oy.getMonth(), kun), 'yyyy-MM-dd')

  const jami = (ishchiId) =>
    kunlar.reduce((s, kun) => {
      const h = map[`${ishchiId}_${sanaStr(kun)}`]?.holat
      return s + (h ? DAVOMAT_HOLATLARI[h].qiymat : 0)
    }, 0)

  const eksport = () => {
    const head = ['Ishchi', ...kunlar.map(String), 'Jami']
    const rows = ishchilar.map((i) => [
      i.ism,
      ...kunlar.map((kun) => {
        const h = map[`${i.id}_${sanaStr(kun)}`]?.holat
        return h ? DAVOMAT_HOLATLARI[h].belgi : ''
      }),
      jami(i.id),
    ])
    exportMatrixToExcel([head, ...rows], 'Davomat', `davomat-${brigada?.nom || ''}-${format(oy, 'yyyy-MM')}`)
  }

  return (
    <div>
      <PageHeader
        title="Davomat"
        subtitle={brigada?.nom}
        right={
          <button onClick={eksport} disabled={!ishchilar.length} className="p-2 rounded-lg text-muted hover:text-ink hover:bg-surface2 disabled:opacity-40" title="Excelga yuklash">
            <Download size={20} />
          </button>
        }
      />

      <div className="p-4 space-y-3">
        {/* Boshqaruv */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <select
            value={tanlangan}
            onChange={(e) => setBrigadaId(e.target.value)}
            className="input h-10 w-auto min-w-[140px]"
          >
            {brigadalar.map((b) => (
              <option key={b.id} value={b.id}>
                {b.nom}
              </option>
            ))}
          </select>
          <MonthPicker value={oy} onChange={setOy} />
        </div>

        {/* Legenda */}
        <div className="flex items-center gap-4 text-xs text-muted">
          <span>✅ keldi</span>
          <span>½ yarim</span>
          <span>❌ kelmadi</span>
          <span className="text-muted/70">katakni bosing</span>
        </div>

        {bLoading || iLoading ? (
          <Skeleton className="h-64" />
        ) : brigadalar.length === 0 ? (
          <EmptyState icon={Users} title="Avval brigada qo‘shing" hint="Davomat brigada ishchilari bo‘yicha yuritiladi." />
        ) : ishchilar.length === 0 ? (
          <EmptyState icon={CheckSquare} title="Brigadada ishchi yo‘q" hint="Brigadalar bo‘limida bu brigadaga a‘zo qo‘shing." />
        ) : (
          <div className="border border-line rounded-2xl overflow-hidden">
            <div className="overflow-x-auto scroll-x">
              <table className="border-collapse">
                <thead>
                  <tr>
                    <th className="sticky left-0 z-20 bg-surface2 border-b border-r border-line px-3 h-11 text-left text-sm font-medium min-w-[110px]">
                      Ishchi
                    </th>
                    {kunlar.map((kun) => {
                      const d = new Date(oy.getFullYear(), oy.getMonth(), kun)
                      const haftaKun = HAFTA_KUNLARI[(d.getDay() + 6) % 7]
                      return (
                        <th
                          key={kun}
                          className={`border-b border-line w-11 h-11 text-xs font-medium tabular-nums ${
                            isToday(kun) ? 'bg-brand/15 text-brand' : 'bg-surface2 text-muted'
                          }`}
                        >
                          <div>{kun}</div>
                          <div className="text-[9px] opacity-70">{haftaKun}</div>
                        </th>
                      )
                    })}
                    <th className="sticky right-0 z-20 bg-surface2 border-b border-l border-line px-3 h-11 text-sm font-medium">
                      Jami
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {ishchilar.map((i) => (
                    <tr key={i.id}>
                      <td className="sticky left-0 z-10 bg-surface border-b border-r border-line px-3 h-12 text-sm font-medium whitespace-nowrap min-w-[110px]">
                        {i.ism}
                      </td>
                      {kunlar.map((kun) => {
                        const s = sanaStr(kun)
                        const holat = map[`${i.id}_${s}`]?.holat ?? null
                        return (
                          <td key={kun} className={`border-b border-line p-0.5 text-center ${isToday(kun) ? 'bg-brand/5' : ''}`}>
                            <AttendanceCell
                              holat={holat}
                              isToday={isToday(kun)}
                              onChange={async (yangi) => {
                                try {
                                  await belgila(i.id, s, yangi)
                                } catch {
                                  toast.error('Saqlanmadi')
                                }
                              }}
                            />
                          </td>
                        )
                      })}
                      <td className="sticky right-0 z-10 bg-surface border-b border-l border-line px-3 h-12 text-center font-semibold tabular-nums">
                        {jami(i.id)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
