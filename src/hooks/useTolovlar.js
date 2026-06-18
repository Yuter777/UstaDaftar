import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const SELECT = '*, ishchi:ishchilar(id, ism, brigada_id)'

export function useTolovlar() {
  const [tolovlar, setTolovlar] = useState([])
  const [loading, setLoading] = useState(true)

  const yukla = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('tolovlar')
      .select(SELECT)
      .order('sana', { ascending: false })
    setTolovlar(data || [])
    setLoading(false)
  }, [])

  useEffect(() => {
    yukla()
  }, [yukla])

  const qoshish = async (payload) => {
    const { data, error } = await supabase.from('tolovlar').insert(payload).select(SELECT).single()
    if (error) throw error
    setTolovlar((t) => [data, ...t])
    return data
  }

  const ochirish = async (id) => {
    const { error } = await supabase.from('tolovlar').delete().eq('id', id)
    if (error) throw error
    setTolovlar((t) => t.filter((x) => x.id !== id))
  }

  return { tolovlar, loading, yukla, qoshish, ochirish }
}
