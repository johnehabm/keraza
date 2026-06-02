'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Loader2, Lock, Phone, ShieldCheck, Sparkles } from 'lucide-react'
import Link from 'next/link'

const inputWrap: React.CSSProperties = {
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '14px 46px 14px 44px',
  background: 'rgba(255,255,255,0.08)',
  border: '1px solid rgba(255,255,255,0.14)',
  borderRadius: 16,
  color: '#fff',
  fontSize: 15,
  outline: 'none',
}

export default function LoginPage() {
  const router = useRouter()
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'حدث خطأ، حاول مرة أخرى')
        return
      }

      router.push(data.role === 'admin' ? '/admin' : '/student/dashboard')
      router.refresh()
    } catch {
      setError('تعذر الاتصال بالخادم، تأكد من الإنترنت')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main dir="rtl" style={{ minHeight: '100vh', overflow: 'hidden', position: 'relative', display: 'grid', placeItems: 'center', padding: '24px', color: '#fff', background: 'linear-gradient(135deg, #111827 0%, #312e81 48%, #083344 100%)' }}>
      <div style={{ position: 'absolute', inset: 0, opacity: 0.22, backgroundImage: 'linear-gradient(rgba(255,255,255,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.12) 1px, transparent 1px)', backgroundSize: '42px 42px' }} />
      <motion.section initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} style={{ width: '100%', maxWidth: 920, position: 'relative', display: 'grid', gridTemplateColumns: '1fr 420px', gap: 22, alignItems: 'stretch' }}>
        <motion.aside initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.12 }} style={{ padding: 32, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.07)', backdropFilter: 'blur(18px)', borderRadius: 24, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: 460 }}>
          <div>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: '#7dd3fc', fontSize: 13, fontWeight: 800 }}><Sparkles size={16} /> منصة مهرجان الكرازة</span>
            <h1 style={{ margin: '18px 0 10px', fontSize: 38, lineHeight: 1.25 }}>ادخل وكمل رحلتك التعليمية</h1>
            <p style={{ margin: 0, color: 'rgba(255,255,255,0.72)', lineHeight: 1.8 }}>تابع الأسابيع، حل الامتحانات، واجمع نقاط الخبرة في تجربة خفيفة وسريعة.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 12 }}>
            {['متابعة التقدم', 'امتحانات منظمة'].map(item => <div key={item} style={{ padding: 14, borderRadius: 16, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)', fontWeight: 700 }}>{item}</div>)}
          </div>
        </motion.aside>

        <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.05 }} style={{ background: 'rgba(2,6,23,0.64)', backdropFilter: 'blur(20px)', borderRadius: 24, border: '1px solid rgba(255,255,255,0.14)', padding: 34, boxShadow: '0 28px 80px rgba(0,0,0,0.35)' }}>
          <div style={{ width: 58, height: 58, borderRadius: 18, background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}><ShieldCheck /></div>
          <h2 style={{ margin: 0, fontSize: 26 }}>تسجيل الدخول</h2>
          <p style={{ margin: '6px 0 24px', color: 'rgba(255,255,255,0.58)', fontSize: 14 }}>استخدم رقم الهاتف وكلمة المرور الخاصة بك.</p>

          <form onSubmit={handleLogin} style={{ display: 'grid', gap: 16 }}>
            <label style={{ display: 'grid', gap: 8, fontWeight: 700, fontSize: 13 }}>
              رقم الهاتف
              <div style={inputWrap}>
                <Phone size={18} style={{ position: 'absolute', right: 15, color: 'rgba(255,255,255,0.48)' }} />
                <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="01xxxxxxxxx" required style={{ ...inputStyle, direction: 'ltr', textAlign: 'right' }} />
              </div>
            </label>

            <label style={{ display: 'grid', gap: 8, fontWeight: 700, fontSize: 13 }}>
              كلمة المرور
              <div style={inputWrap}>
                <Lock size={18} style={{ position: 'absolute', right: 15, color: 'rgba(255,255,255,0.48)' }} />
                <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="كلمة المرور" required style={inputStyle} />
                <button type="button" onClick={() => setShowPass(p => !p)} aria-label="إظهار كلمة المرور" style={{ position: 'absolute', left: 14, border: 0, background: 'transparent', color: 'rgba(255,255,255,0.55)', cursor: 'pointer', display: 'flex' }}>
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </label>

            {error && <motion.p initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} style={{ margin: 0, padding: 12, borderRadius: 14, color: '#fecaca', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.25)', fontSize: 13, textAlign: 'center' }}>{error}</motion.p>}

            <motion.button whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }} type="submit" disabled={loading} style={{ marginTop: 4, width: '100%', padding: 15, border: 0, borderRadius: 16, color: '#fff', background: loading ? 'rgba(139,92,246,0.55)' : 'linear-gradient(135deg, #8b5cf6, #06b6d4)', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 800, fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              {loading ? <><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> جاري الدخول...</> : 'دخول'}
            </motion.button>
          </form>
          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <a
              href="https://wa.me/201155278995?text=أهلاً،%20نسيت%20كلمة%20المرور%20لحسابي%20في%20المنصة.%20الاسم:%20________________"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: '#7dd3fc',
                fontSize: '13px',
                textDecoration: 'none',
                fontWeight: 600,
                display: 'inline-block',
                padding: '8px',
                transition: 'opacity 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.opacity = '0.8'}
              onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
            >
              نسيت كلمة المرور؟ تواصل مع الدعم عبر واتساب
            </a>
          </div>

          <p style={{ textAlign: 'center', margin: '22px 0 0', color: 'rgba(255,255,255,0.52)', fontSize: 13 }}>ليس لديك حساب؟ <Link href="/auth/register" style={{ color: '#7dd3fc', fontWeight: 800, textDecoration: 'none' }}>إنشاء حساب</Link></p>
        </motion.div>
      </motion.section>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } } input::placeholder { color: rgba(255,255,255,0.28); } input:focus { border-color: rgba(125,211,252,0.62) !important; } @media (max-width: 820px) { section { grid-template-columns: 1fr !important; } aside { min-height: auto !important; } }`}</style>
    </main>
  )
}
<div style={{ textAlign: 'center', marginTop: '16px' }}>
  <a
    href="https://wa.me/201155278995?text=أهلاً،%20نسيت%20كلمة%20المرور%20لحسابي%20في%20المنصة."
    target="_blank"
    rel="noopener noreferrer"
    style={{ color: '#38bdf8', fontSize: '14px', textDecoration: 'none', fontWeight: 600 }}
  >
    نسيت كلمة المرور؟ تواصل مع الدعم (WhatsApp)
  </a>
</div>