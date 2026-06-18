import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export function useKatalog() {
  const { ustaId } = useAuth()
  const [katalog, setKatalog] = useState([])
  const [loading, setLoading] = useState(true)

  const yukla = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('katalog')
      .select('*')
      .order('created_at', { ascending: false })
    setKatalog(data || [])
    setLoading(false)
  }, [])

  useEffect(() => {
    yukla()
  }, [yukla])

  const qoshish = async (payload) => {
    const { data, error } = await supabase
      .from('katalog')
      .insert({ ...payload, usta_id: ustaId })
      .select()
      .single()
    if (error) throw error
    setKatalog((k) => [data, ...k])
    return data
  }

  const ochirish = async (id) => {
    const { error } = await supabase.from('katalog').delete().eq('id', id)
    if (error) throw error
    setKatalog((k) => k.filter((x) => x.id !== id))
  }

  return { katalog, loading, yukla, qoshish, ochirish }
}
