import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

const SELECT = '*, brigada:brigadalar(id, nom, rang, mutaxassislik)'

export function useObyektlar() {
  const { ustaId } = useAuth()
  const [obyektlar, setObyektlar] = useState([])
  const [loading, setLoading] = useState(true)

  const yukla = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('obyektlar')
      .select(SELECT)
      .order('created_at', { ascending: false })
    setObyektlar(data || [])
    setLoading(false)
  }, [])

  useEffect(() => {
    yukla()
  }, [yukla])

  const qoshish = async (payload) => {
    const { data, error } = await supabase
      .from('obyektlar')
      .insert({ ...payload, usta_id: ustaId })
      .select(SELECT)
      .single()
    if (error) throw error
    setObyektlar((o) => [data, ...o])
    return data
  }

  return { obyektlar, loading, yukla, qoshish }
}

export function useObyekt(id) {
  const [obyekt, setObyekt] = useState(null)
  const [loading, setLoading] = useState(true)

  const yukla = useCallback(async () => {
    if (!id) return
    setLoading(true)
    const { data } = await supabase.from('obyektlar').select(SELECT).eq('id', id).maybeSingle()
    setObyekt(data)
    setLoading(false)
  }, [id])

  useEffect(() => {
    yukla()
  }, [yukla])

  const yangilash = async (payload) => {
    const { data, error } = await supabase
      .from('obyektlar')
      .update(payload)
      .eq('id', id)
      .select(SELECT)
      .single()
    if (error) throw error
    setObyekt(data)
    return data
  }

  return { obyekt, loading, yukla, yangilash, setObyekt }
}
