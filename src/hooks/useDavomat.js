import { useCallback, useEffect, useState } from 'react'
import { format } from 'date-fns'
import { supabase } from '../lib/supabase'

/**
 * Tanlangan brigada va oy bo'yicha davomat.
 * map: `${ishchi_id}_${'yyyy-MM-dd'}` -> { id, holat }
 */
export function useDavomat(ishchiIdlar, oyBoshi) {
  const [map, setMap] = useState({})
  const [loading, setLoading] = useState(true)

  const oyStart = format(new Date(oyBoshi.getFullYear(), oyBoshi.getMonth(), 1), 'yyyy-MM-dd')
  const oyEnd = format(new Date(oyBoshi.getFullYear(), oyBoshi.getMonth() + 1, 0), 'yyyy-MM-dd')
  const idlarKey = ishchiIdlar.join(',')

  const yukla = useCallback(async () => {
    if (!ishchiIdlar.length) {
      setMap({})
      setLoading(false)
      return
    }
    setLoading(true)
    const { data } = await supabase
      .from('davomat')
      .select('*')
      .in('ishchi_id', ishchiIdlar)
      .gte('sana', oyStart)
      .lte('sana', oyEnd)
    const m = {}
    ;(data || []).forEach((r) => {
      m[`${r.ishchi_id}_${r.sana}`] = { id: r.id, holat: r.holat }
    })
    setMap(m)
    setLoading(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idlarKey, oyStart, oyEnd])

  useEffect(() => {
    yukla()
  }, [yukla])

  /** Bitta katakni belgilash. holat null bo'lsa — o'chiriladi. */
  const belgila = async (ishchiId, sana, holat) => {
    const key = `${ishchiId}_${sana}`
    const mavjud = map[key]

    if (holat === null) {
      // optimistik o'chirish
      setMap((m) => {
        const c = { ...m }
        delete c[key]
        return c
      })
      if (mavjud?.id) await supabase.from('davomat').delete().eq('id', mavjud.id)
      return
    }

    // optimistik yangilash
    setMap((m) => ({ ...m, [key]: { ...(m[key] || {}), holat } }))

    let data, error
    if (mavjud?.id) {
      ;({ data, error } = await supabase
        .from('davomat')
        .update({ holat })
        .eq('id', mavjud.id)
        .select()
        .single())
    } else {
      ;({ data, error } = await supabase
        .from('davomat')
        .insert({ ishchi_id: ishchiId, sana, holat })
        .select()
        .single())
    }
    if (error) throw error
    setMap((m) => ({ ...m, [key]: { id: data.id, holat: data.holat } }))
  }

  return { map, loading, yukla, belgila }
}
