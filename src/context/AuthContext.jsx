import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth AuthProvider ichida ishlatilishi kerak')
  return ctx
}

/** auth.users dagi telefonni "ustalar" jadvalidagi yozuv bilan bog'laydi (kerak bo'lsa yaratadi). */
async function ensureUsta(user) {
  if (!user) return null
  const telefon = user.phone ? `+${user.phone.replace(/^\+/, '')}` : user.email || user.id

  const { data: mavjud } = await supabase
    .from('ustalar')
    .select('*')
    .eq('telefon', telefon)
    .maybeSingle()

  if (mavjud) return mavjud

  const { data: yangi } = await supabase
    .from('ustalar')
    .insert({ telefon, ism: '' })
    .select()
    .maybeSingle()

  return yangi
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [usta, setUsta] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    const init = async (s) => {
      if (!active) return
      setSession(s)
      if (s?.user) {
        try {
          const u = await ensureUsta(s.user)
          if (active) setUsta(u)
        } catch {
          /* RLS yoki tarmoq xatosi — ilovani bloklamaymiz */
        }
      } else {
        setUsta(null)
      }
      if (active) setLoading(false)
    }

    supabase.auth.getSession().then(({ data }) => init(data.session))

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, s) => init(s))

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [])

  const signOut = () => supabase.auth.signOut()

  return (
    <AuthContext.Provider
      value={{ session, user: session?.user ?? null, usta, ustaId: usta?.id ?? null, loading, signOut }}
    >
      {children}
    </AuthContext.Provider>
  )
}
