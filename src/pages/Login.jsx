import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { Phone, Mail, KeyRound, Loader2 } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../components/Toast'

export default function Login() {
  const { session, loading: authLoading } = useAuth()
  const toast = useToast()
  const [usul, setUsul] = useState('telefon') // 'telefon' | 'email'
  const [qadam, setQadam] = useState('kirit') // 'kirit' | 'otp'
  const [telefonRaw, setTelefonRaw] = useState('') // +998 dan keyingi raqamlar
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  if (!authLoading && session) return <Navigate to="/" replace />

  const telefon = `+998${telefonRaw}`

  const usulniAlmashtir = (yangi) => {
    setUsul(yangi)
    setQadam('kirit')
    setOtp('')
  }

  const kodYuborish = async (e) => {
    e.preventDefault()
    if (usul === 'telefon' && telefonRaw.length !== 9) {
      toast.error('Telefon raqamni to‘liq kiriting')
      return
    }
    if (usul === 'email' && !/^\S+@\S+\.\S+$/.test(email.trim())) {
      toast.error('To‘g‘ri email kiriting')
      return
    }
    setLoading(true)
    const { error } =
      usul === 'telefon'
        ? await supabase.auth.signInWithOtp({ phone: telefon })
        : await supabase.auth.signInWithOtp({ email: email.trim() })
    setLoading(false)
    if (error) {
      toast.error(error.message || 'Kod yuborilmadi, qayta urinib ko‘ring')
      return
    }
    toast.success('Kod yuborildi')
    setQadam('otp')
  }

  const tasdiqlash = async (e) => {
    e.preventDefault()
    if (otp.length !== 6) {
      toast.error('6 xonali kodni kiriting')
      return
    }
    setLoading(true)
    const { error } =
      usul === 'telefon'
        ? await supabase.auth.verifyOtp({ phone: telefon, token: otp, type: 'sms' })
        : await supabase.auth.verifyOtp({ email: email.trim(), token: otp, type: 'email' })
    setLoading(false)
    if (error) {
      toast.error('Kod noto‘g‘ri. Qayta urinib ko‘ring')
      return
    }
    // muvaffaqiyat — AuthContext sessiyani yangilaydi
  }

  const googleKirish = async () => {
    setGoogleLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    })
    if (error) {
      setGoogleLoading(false)
      toast.error('Google orqali kirib bo‘lmadi')
    }
    // muvaffaqiyatda brauzer Google sahifasiga yo‘naltiriladi
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-surface border border-brand flex items-center justify-center mb-4">
            <div className="flex flex-col gap-1.5">
              <span className="w-7 h-1 rounded bg-keldi" />
              <span className="w-7 h-1 rounded bg-yarim" />
              <span className="w-5 h-1 rounded bg-kelmadi" />
            </div>
          </div>
          <h1 className="text-2xl font-bold">Usta Daftar</h1>
          <p className="text-muted text-sm mt-1">Brigadangizni telefondan boshqaring</p>
        </div>

        {qadam === 'kirit' ? (
          <>
            {/* Usul almashtirgich */}
            <div className="flex gap-2 mb-4 p-1 bg-surface2 rounded-xl">
              <button
                type="button"
                onClick={() => usulniAlmashtir('telefon')}
                className={`flex-1 h-10 rounded-lg text-sm font-medium transition-colors ${
                  usul === 'telefon' ? 'bg-brand text-white' : 'text-muted'
                }`}
              >
                Telefon
              </button>
              <button
                type="button"
                onClick={() => usulniAlmashtir('email')}
                className={`flex-1 h-10 rounded-lg text-sm font-medium transition-colors ${
                  usul === 'email' ? 'bg-brand text-white' : 'text-muted'
                }`}
              >
                Email
              </button>
            </div>

            <form onSubmit={kodYuborish} className="space-y-4">
              {usul === 'telefon' ? (
                <label className="block">
                  <span className="text-sm text-muted">Telefon raqam</span>
                  <div className="mt-1.5 flex items-center gap-2 h-12 px-4 rounded-xl bg-surface2 border border-line focus-within:border-brand transition-colors">
                    <Phone size={18} className="text-muted shrink-0" />
                    <span className="text-ink">+998</span>
                    <input
                      type="tel"
                      inputMode="numeric"
                      autoFocus
                      placeholder="90 123 45 67"
                      value={telefonRaw}
                      onChange={(e) => setTelefonRaw(e.target.value.replace(/\D/g, '').slice(0, 9))}
                      className="flex-1 bg-transparent outline-none text-ink placeholder:text-muted tracking-wide"
                    />
                  </div>
                </label>
              ) : (
                <label className="block">
                  <span className="text-sm text-muted">Email</span>
                  <div className="mt-1.5 flex items-center gap-2 h-12 px-4 rounded-xl bg-surface2 border border-line focus-within:border-brand transition-colors">
                    <Mail size={18} className="text-muted shrink-0" />
                    <input
                      type="email"
                      inputMode="email"
                      autoFocus
                      placeholder="email@misol.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="flex-1 bg-transparent outline-none text-ink placeholder:text-muted"
                    />
                  </div>
                </label>
              )}
              <button type="submit" disabled={loading} className="btn w-full">
                {loading ? <Loader2 size={18} className="animate-spin" /> : 'Kod yuborish'}
              </button>
            </form>

            {/* Ajratgich */}
            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-line" />
              <span className="text-muted text-xs">yoki</span>
              <div className="flex-1 h-px bg-line" />
            </div>

            {/* Google */}
            <button type="button" onClick={googleKirish} disabled={googleLoading} className="btn-ghost w-full">
              {googleLoading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <>
                  <GoogleIcon /> Google orqali kirish
                </>
              )}
            </button>
          </>
        ) : (
          <form onSubmit={tasdiqlash} className="space-y-4">
            <p className="text-sm text-muted text-center">
              <span className="text-ink font-medium">{usul === 'telefon' ? telefon : email}</span> manziliga
              yuborilgan kodni kiriting
            </p>
            <label className="block">
              <div className="mt-1.5 flex items-center gap-2 h-12 px-4 rounded-xl bg-surface2 border border-line focus-within:border-brand transition-colors">
                <KeyRound size={18} className="text-muted shrink-0" />
                <input
                  type="tel"
                  inputMode="numeric"
                  autoFocus
                  placeholder="6 xonali kod"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="flex-1 bg-transparent outline-none text-ink placeholder:text-muted tracking-[0.3em] text-lg"
                />
              </div>
            </label>
            <button type="submit" disabled={loading} className="btn w-full">
              {loading ? <Loader2 size={18} className="animate-spin" /> : 'Tasdiqlash'}
            </button>
            <button
              type="button"
              onClick={() => {
                setQadam('kirit')
                setOtp('')
              }}
              className="w-full text-sm text-muted hover:text-ink"
            >
              {usul === 'telefon' ? 'Raqamni o‘zgartirish' : 'Email’ni o‘zgartirish'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.3-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2c-2 1.5-4.6 2.4-7.2 2.4-5.2 0-9.6-3.3-11.2-7.9l-6.5 5C9.6 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4.1 5.6l6.2 5.2c-.4.4 6.6-4.8 6.6-14.8 0-1.3-.1-2.3-.4-3.5z" />
    </svg>
  )
}
