import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export function useBrigadalar() {
  const { ustaId } = useAuth()
  const [brigadalar, setBrigadalar] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const yukla = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('brigadalar')
      .select('*, ishchilar(count)')
      .order('created_at', { ascending: true })
    if (error) setError(error.message)
    else setBrigadalar(data || [])
    setLoading(false)
  }, [])

  useEffect(() => {
    yukla()
  }, [yukla])

  const qoshish = async (payload) => {
    const { data, error } = await supabase
      .from('brigadalar')
      .insert({ ...payload, usta_id: ustaId })
      .select('*, ishchilar(count)')
      .single()
    if (error) throw error
    setBrigadalar((b) => [...b, data])
    return data
  }

  const yangilash = async (id, payload) => {
    const { data, error } = await supabase
      .from('brigadalar')
      .update(payload)
      .eq('id', id)
      .select('*, ishchilar(count)')
      .single()
    if (error) throw error
    setBrigadalar((b) => b.map((x) => (x.id === id ? data : x)))
    return data
  }

  const ochirish = async (id) => {
    const { error } = await supabase.from('brigadalar').delete().eq('id', id)
    if (error) throw error
    setBrigadalar((b) => b.filter((x) => x.id !== id))
  }

  return { brigadalar, loading, error, yukla, qoshish, yangilash, ochirish }
}

export function useIshchilar(brigadaId) {
  const [ishchilar, setIshchilar] = useState([])
  const [loading, setLoading] = useState(true)

  const yukla = useCallback(async () => {
    if (!brigadaId) {
      setIshchilar([])
      setLoading(false)
      return
    }
    setLoading(true)
    const { data } = await supabase
      .from('ishchilar')
      .select('*')
      .eq('brigada_id', brigadaId)
      .order('created_at', { ascending: true })
    setIshchilar(data || [])
    setLoading(false)
  }, [brigadaId])

  useEffect(() => {
    yukla()
  }, [yukla])

  const qoshish = async (payload) => {
    const { data, error } = await supabase
      .from('ishchilar')
      .insert({ ...payload, brigada_id: brigadaId })
      .select()
      .single()
    if (error) throw error
    setIshchilar((i) => [...i, data])
    return data
  }

  const ochirish = async (id) => {
    const { error } = await supabase.from('ishchilar').delete().eq('id', id)
    if (error) throw error
    setIshchilar((i) => i.filter((x) => x.id !== id))
  }

  return { ishchilar, loading, yukla, qoshish, ochirish }
}
