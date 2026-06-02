'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ChevronDown, Eye, EyeOff, Loader2, Lock, Phone, School, User } from 'lucide-react'
import Link from 'next/link'

const GRADES = [
  'اولي اعدادي شمال الدائري',
  'اولى اعدادي زهراء السلام',
  'تانية اعدادي شمال الدائري',
  'تانية اعدادي زهراء السلام',
  'تالته اعدادي شمال الدائري',
  'تالته اعدادي زهراء السلام',
  'OTHER',
]


const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '13px 44px 13px 42px',
  background: 'rgba(255,255,255,0.08)',
  border: '1px solid rgba(255,255,255,0.14)',
  borderRadius: 16,
  color: '#fff',
  fontSize: 15,
  outline: 'none',
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label style={{ display: 'grid', gap: 8, fontSize: 13, fontWeight: 800 }}>{label}{children}</label>
}

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({ fullName: '', phone: '', grade: '', churchName: 'السيدة العذراء مريم و الانبا شنودة - مدينه السلام', password: '', confirmPassword: '' })
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const completion = useMemo(() => {
    const fields = Object.values(form).filter(Boolean).length
    return Math.round((fields / Object.keys(form).length) * 100)
  }, [form])

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm(f => ({ ...f, [key]: e.target.value }))

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (form.password !== form.confirmPassword) {
      setError('كلمتا المرور غير متطابقتين')
      return
    }
    if (form.password.length < 8) {
      setError('كلمة المرور يجب أن تكون 8 أحرف على الأقل')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName: form.fullName, phone: form.phone, grade: form.grade, churchName: form.churchName, password: form.password }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'حدث خطأ، حاول مرة أخرى')
        return
      }

      const loginRes = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: form.phone, password: form.password }),
      })

      if (loginRes.ok) {
        const loginData = await loginRes.json()
        router.push(loginData.role === 'admin' ? '/admin' : '/student/dashboard')
        router.refresh()
      } else {
        router.push('/auth/login')
      }
    } catch {
      setError('تعذر الاتصال بالخادم، تأكد من الإنترنت')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main dir="rtl" style={{ minHeight: '100vh', overflow: 'hidden', position: 'relative', display: 'grid', placeItems: 'center', padding: '24px', color: '#fff', background: 'linear-gradient(135deg, #0f172a 0%, #3730a3 52%, #155e75 100%)' }}>
      <div style={{ position: 'absolute', inset: 0, opacity: 0.18, backgroundImage: 'radial-gradient(rgba(255,255,255,0.16) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
      <motion.section initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} style={{ width: '100%', maxWidth: 980, position: 'relative', display: 'grid', gridTemplateColumns: '380px 1fr', gap: 22 }}>
        <aside style={{ padding: 30, borderRadius: 24, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', backdropFilter: 'blur(18px)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 28 }}>
          <div>
            <span style={{ color: '#7dd3fc', fontWeight: 900, fontSize: 13 }}>حساب طالب جديد</span>
            <h1 style={{ margin: '14px 0 10px', fontSize: 34, lineHeight: 1.3 }}>ابدأ رحلة مهرجان الكرازة</h1>
            <p style={{ margin: 0, color: 'rgba(255,255,255,0.7)', lineHeight: 1.8 }}>املأ البيانات مرة واحدة، وبعدها تدخل للداشبورد وتتابع كل أسبوع بسهولة.</p>
          </div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 12, color: 'rgba(255,255,255,0.64)' }}><span>اكتمال البيانات</span><strong>{completion}%</strong></div>
            <div style={{ height: 9, borderRadius: 99, background: 'rgba(255,255,255,0.12)', overflow: 'hidden' }}><motion.div animate={{ width: `${completion}%` }} style={{ height: '100%', borderRadius: 99, background: 'linear-gradient(90deg, #8b5cf6, #06b6d4)' }} /></div>
          </div>
        </aside>

        <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.08 }} style={{ padding: 32, borderRadius: 24, background: 'rgba(2,6,23,0.64)', border: '1px solid rgba(255,255,255,0.14)', backdropFilter: 'blur(20px)', boxShadow: '0 28px 80px rgba(0,0,0,0.35)' }}>
          <h2 style={{ margin: 0, fontSize: 26 }}>إنشاء حساب</h2>
          <p style={{ margin: '6px 0 22px', color: 'rgba(255,255,255,0.58)', fontSize: 14 }}>كل الحقول مطلوبة لتجهيز حساب الطالب.</p>

          <form onSubmit={handleRegister} style={{ display: 'grid', gap: 14 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <Field label="الاسم الكامل"><div style={{ position: 'relative' }}><User size={17} style={{ position: 'absolute', right: 14, top: 14, color: 'rgba(255,255,255,0.48)' }} /><input value={form.fullName} onChange={set('fullName')} placeholder="مثال: جون إيهاب" required style={inputStyle} /></div></Field>
              <Field label="رقم الهاتف"><div style={{ position: 'relative' }}><Phone size={17} style={{ position: 'absolute', right: 14, top: 14, color: 'rgba(255,255,255,0.48)' }} /><input type="tel" value={form.phone} onChange={set('phone')} placeholder="01xxxxxxxxx" required pattern="01[0-9]{9}" style={{ ...inputStyle, direction: 'ltr', textAlign: 'right' }} /></div></Field>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <Field label="الصف الدراسي"><div style={{ position: 'relative' }}><ChevronDown size={17} style={{ position: 'absolute', left: 14, top: 14, color: 'rgba(255,255,255,0.48)', pointerEvents: 'none' }} /><select value={form.grade} onChange={set('grade')} required style={{ ...inputStyle, appearance: 'none', cursor: 'pointer' }}><option value="" disabled style={{ background: '#1e1b4b' }}>اختر الصف</option>{GRADES.map(g => <option key={g} value={g} style={{ background: '#1e1b4b' }}>{g}</option>)}</select></div></Field>
              <Field label="اسم الكنيسة"><div style={{ position: 'relative' }}><School size={17} style={{ position: 'absolute', right: 14, top: 14, color: 'rgba(255,255,255,0.48)' }} /><input value={form.churchName} onChange={set('churchName')} placeholder="اسم الكنيسة" required style={inputStyle} /></div></Field>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <Field label="كلمة المرور"><div style={{ position: 'relative' }}><Lock size={17} style={{ position: 'absolute', right: 14, top: 14, color: 'rgba(255,255,255,0.48)' }} /><input type={showPass ? 'text' : 'password'} value={form.password} onChange={set('password')} placeholder="8 أحرف على الأقل" required style={inputStyle} /><button type="button" onClick={() => setShowPass(p => !p)} style={{ position: 'absolute', left: 12, top: 12, border: 0, background: 'transparent', color: 'rgba(255,255,255,0.55)', cursor: 'pointer', display: 'flex' }}>{showPass ? <EyeOff size={18} /> : <Eye size={18} />}</button></div></Field>
              <Field label="تأكيد كلمة المرور"><div style={{ position: 'relative' }}><Lock size={17} style={{ position: 'absolute', right: 14, top: 14, color: 'rgba(255,255,255,0.48)' }} /><input type="password" value={form.confirmPassword} onChange={set('confirmPassword')} placeholder="أعد كتابة كلمة المرور" required style={inputStyle} /></div></Field>
            </div>

            {error && <motion.p initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} style={{ margin: 0, padding: 12, borderRadius: 14, color: '#fecaca', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.25)', fontSize: 13, textAlign: 'center' }}>{error}</motion.p>}

            <motion.button whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }} type="submit" disabled={loading} style={{ marginTop: 4, width: '100%', padding: 15, border: 0, borderRadius: 16, color: '#fff', background: loading ? 'rgba(139,92,246,0.55)' : 'linear-gradient(135deg, #8b5cf6, #06b6d4)', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 900, fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              {loading ? <><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> جاري إنشاء الحساب...</> : 'إنشاء الحساب'}
            </motion.button>
          </form>

          <p style={{ textAlign: 'center', margin: '20px 0 0', color: 'rgba(255,255,255,0.52)', fontSize: 13 }}>لديك حساب بالفعل؟ <Link href="/auth/login" style={{ color: '#7dd3fc', fontWeight: 800, textDecoration: 'none' }}>تسجيل الدخول</Link></p>
        </motion.div>
      </motion.section>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } } input::placeholder { color: rgba(255,255,255,0.28); } input:focus, select:focus { border-color: rgba(125,211,252,0.62) !important; } option { color: white; } @media (max-width: 860px) { section { grid-template-columns: 1fr !important; } form > div { grid-template-columns: 1fr !important; } }`}</style>
    </main>
  )
}