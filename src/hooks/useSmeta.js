import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export function useSmeta(obyektId) {
  const [qatorlar, setQatorlar] = useState([])
  const [loading, setLoading] = useState(true)

  const yukla = useCallback(async () => {
    if (!obyektId) return
    setLoading(true)
    const { data } = await supabase
      .from('smeta')
      .select('*')
      .eq('obyekt_id', obyektId)
      .order('created_at', { ascending: true })
    setQatorlar(data || [])
    setLoading(false)
  }, [obyektId])

  useEffect(() => {
    yukla()
  }, [yukla])

  const qoshish = async (payload) => {
    const { data, error } = await supabase
      .from('smeta')
      .insert({ ...payload, obyekt_id: obyektId })
      .select()
      .single()
    if (error) throw error
    setQatorlar((q) => [...q, data])
    return data
  }

  const yangilash = async (id, payload) => {
    const { data, error } = await supabase.from('smeta').update(payload).eq('id', id).select().single()
    if (error) throw error
    setQatorlar((q) => q.map((x) => (x.id === id ? data : x)))
    return data
  }

  const ochirish = async (id) => {
    const { error } = await supabase.from('smeta').delete().eq('id', id)
    if (error) throw error
    setQatorlar((q) => q.filter((x) => x.id !== id))
  }

  return { qatorlar, loading, yukla, qoshish, yangilash, ochirish }
}
