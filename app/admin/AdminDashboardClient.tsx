'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { BarChart3, BookOpen, ClipboardCheck, LogOut, Plus, Settings, Users } from 'lucide-react'

type Stats = {
  totalStudents: number
  activeStudents: number
  totalWeeks: number
  totalSubmissions: number
  avgScore: number
}

export default function AdminDashboardClient({
  stats,
  weeks,
  students,
  recentSubmissions,
}: {
  stats: Stats
  weeks: any[]
  students: any[]
  recentSubmissions: any[]
}) {
  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    window.location.href = '/auth/login'
  }

  async function handleResetPassword(studentId: string, studentName: string) {
    const newPassword = prompt(`أدخل كلمة المرور الجديدة للطالب (${studentName}):\n(يجب أن تكون 6 أحرف أو أرقام على الأقل)`)

    if (!newPassword) return

    if (newPassword.length < 6) {
      alert('كلمة المرور قصيرة جداً!')
      return
    }

    try {
      const response = await fetch(`/api/admin/students/${studentId}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword }),
      })

      if (response.ok) {
        alert('تم تغيير كلمة المرور بنجاح! تقدر تبعتها للطالب دلوقتي.')
      } else {
        const data = await response.json()
        alert('خطأ: ' + data.error)
      }
    } catch (error) {
      alert('تعذر الاتصال بالخادم')
    }
  }

  const cards = [
    { label: 'الطلاب', value: stats.totalStudents, icon: Users, color: '#8b5cf6' },
    { label: 'النشطون', value: stats.activeStudents, icon: BarChart3, color: '#06b6d4' },
    { label: 'الأسابيع', value: stats.totalWeeks, icon: BookOpen, color: '#10b981' },
    { label: 'متوسط النتيجة', value: `${stats.avgScore}%`, icon: ClipboardCheck, color: '#f59e0b' },
  ]

  const topStudents = [...students].sort((a, b) => b.total_xp - a.total_xp).slice(0, 8)
  const latestWeeks = [...weeks].slice(-3).reverse()

  return (
    <main dir="rtl" style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #111827 0%, #312e81 48%, #083344 100%)', color: '#e2e8f0', padding: '28px 20px 48px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, opacity: 0.16, backgroundImage: 'linear-gradient(rgba(255,255,255,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.12) 1px, transparent 1px)', backgroundSize: '42px 42px', pointerEvents: 'none' }} />
      <section style={{ maxWidth: 1180, margin: '0 auto', position: 'relative' }}>
        <motion.header initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap', marginBottom: 24 }}>
          <div>
            <p style={{ margin: '0 0 8px', color: '#7dd3fc', fontWeight: 900, fontSize: 13 }}>لوحة التحكم</p>
            <h1 style={{ margin: 0, fontSize: 32, fontWeight: 900 }}>إدارة مهرجان الكرازة</h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <Link href="/admin/weeks/new" style={{ color: '#fff', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.14)', padding: '12px 16px', borderRadius: 14, textDecoration: 'none', fontWeight: 800, display: 'inline-flex', gap: 8 }}>
              <Plus size={18} /> إضافة أسبوع
            </Link>
            <Link href="/admin/students" style={{ color: '#fff', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '12px 16px', borderRadius: 14, textDecoration: 'none', fontWeight: 800, display: 'inline-flex', gap: 8 }}>
              <Users size={18} /> إدارة الطلاب
            </Link>
            <Link href="/admin/weeks" style={{ color: '#fff', background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)', padding: '12px 16px', borderRadius: 14, textDecoration: 'none', fontWeight: 800, display: 'inline-flex', gap: 8 }}>
              <Settings size={18} /> إدارة الأسابيع
            </Link>
            <button onClick={handleLogout} style={{ color: '#fca5a5', background: 'rgba(239,68,68,0.14)', border: '1px solid rgba(239,68,68,0.22)', padding: '12px 14px', borderRadius: 14, fontWeight: 800, display: 'inline-flex', gap: 8, cursor: 'pointer' }}>
              <LogOut size={18} /> خروج
            </button>
          </div>
        </motion.header>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 14 }}>
          {cards.map((card, index) => (
            <motion.div key={card.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} whileHover={{ y: -3 }} style={{ padding: 20, borderRadius: 18, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', backdropFilter: 'blur(14px)' }}>
              <card.icon color={card.color} />
              <strong style={{ display: 'block', marginTop: 12, fontSize: 30 }}>{card.value}</strong>
              <span style={{ color: 'rgba(226,232,240,0.68)', fontSize: 13 }}>{card.label}</span>
            </motion.div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: 18, marginTop: 22 }}>
          <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }} style={{ padding: 22, borderRadius: 20, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', backdropFilter: 'blur(14px)' }}>
            <h2 style={{ margin: '0 0 14px', fontSize: 18 }}>آخر التسليمات</h2>
            <div style={{ display: 'grid', gap: 10 }}>
              {recentSubmissions.slice(0, 8).map((submission, index) => (
                <motion.div key={submission.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.22 + index * 0.035 }} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <span>{submission.profiles?.full_name || 'طالب'}</span>
                  <strong style={{ color: (submission.score || 0) >= 60 ? '#10b981' : '#f59e0b' }}>{submission.score}%</strong>
                </motion.div>
              ))}
              {recentSubmissions.length === 0 && <p style={{ margin: 0, color: 'rgba(226,232,240,0.62)', fontSize: 13 }}>لا توجد تسليمات حتى الآن.</p>}
            </div>
          </motion.section>

          <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.24 }} style={{ padding: 22, borderRadius: 20, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', backdropFilter: 'blur(14px)' }}>
            <h2 style={{ margin: '0 0 14px', fontSize: 18 }}>أفضل الطلاب</h2>
            <div style={{ display: 'grid', gap: 10 }}>
              {topStudents.map((student, index) => (
                <div key={student.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <span>{index + 1}. {student.full_name}</span>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <strong style={{ color: '#a78bfa' }}>{student.total_xp} XP</strong>
                    <button
                      onClick={() => handleResetPassword(student.id, student.full_name)}
                      style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5', padding: '4px 8px', borderRadius: 8, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}
                    >
                      تغيير الباسورد
                    </button>
                  </div>

                </div>
              ))}
              {topStudents.length === 0 && <p style={{ margin: 0, color: 'rgba(226,232,240,0.62)', fontSize: 13 }}>لا يوجد طلاب مسجلون بعد.</p>}
            </div>
          </motion.section>
        </div>

        <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} style={{ marginTop: 18, padding: 22, borderRadius: 20, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', backdropFilter: 'blur(14px)' }}>
          <h2 style={{ margin: '0 0 14px', fontSize: 18 }}>أحدث الأسابيع</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 12 }}>
            {latestWeeks.map(week => (
              <Link key={week.id} href="/admin/weeks" style={{ padding: 16, borderRadius: 16, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#e2e8f0', textDecoration: 'none' }}>
                <strong style={{ display: 'block', marginBottom: 6 }}>{week.title}</strong>
                <span style={{ color: 'rgba(226,232,240,0.62)', fontSize: 12 }}>الأسبوع {week.week_number} · {week.is_published ? 'منشور' : 'مسودة'}</span>
              </Link>
            ))}
            {latestWeeks.length === 0 && <p style={{ margin: 0, color: 'rgba(226,232,240,0.62)', fontSize: 13 }}>ابدأ بإضافة أول أسبوع من لوحة إدارة الأسابيع.</p>}
          </div>
        </motion.section>
      </section>
      <style>{`@media (max-width: 900px) { main section > div { grid-template-columns: 1fr !important; } }`}</style>
    </main>
  )
}