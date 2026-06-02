'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { BookOpen, ClipboardList, LogOut, Plus, Upload, Trash2 } from 'lucide-react'

export default function AdminWeeksClient({ weeks }: { weeks: any[] }) {
  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    window.location.href = '/auth/login'
  }

  async function handleDeleteWeek(weekId: string, weekTitle: string) {
    if (!confirm(`هل أنت متأكد من حذف الأسبوع "${weekTitle}"؟ هذا الإجراء لا يمكن التراجع عنه!`)) return

    try {
      const response = await fetch(`/api/admin/weeks/${weekId}`, { method: 'DELETE' })
      if (response.ok) {
        alert('تم حذف الأسبوع بنجاح!')
        window.location.reload()
      } else {
        alert('حدث خطأ أثناء الحذف')
      }
    } catch (error) {
      alert('تعذر الاتصال بالخادم')
    }
  }

  return (
    <main dir="rtl" style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f0c29 0%, #1a1040 45%, #0d1b3e 100%)', color: '#e2e8f0', padding: '28px 20px 46px' }}>
      <section style={{ maxWidth: 1080, margin: '0 auto' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, gap: 16, flexWrap: 'wrap' }}>
          <div>
            <p style={{ margin: '0 0 8px', color: '#38bdf8', fontWeight: 800, fontSize: 13 }}>إدارة المحتوى</p>
            <h1 style={{ margin: 0, fontSize: 30 }}>الأسابيع والامتحانات</h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <Link href="/admin/weeks/new" style={{ color: '#fff', background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)', padding: '12px 16px', borderRadius: 14, textDecoration: 'none', fontWeight: 800, display: 'inline-flex', gap: 8 }}>
              <Plus size={18} /> أسبوع جديد
            </Link>
            <button onClick={handleLogout} style={{ color: '#fca5a5', background: 'rgba(239,68,68,0.14)', border: '1px solid rgba(239,68,68,0.22)', padding: '12px 14px', borderRadius: 14, fontWeight: 800, display: 'inline-flex', gap: 8, cursor: 'pointer' }}>
              <LogOut size={18} /> خروج
            </button>
          </div>
        </header>

        <div style={{ display: 'grid', gap: 14 }}>
          {weeks.map((week, index) => (
            <motion.article
              key={week.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04 }}
              style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 20, borderRadius: 18, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', flexWrap: 'wrap' }}
            >
              <div style={{ width: 52, height: 52, borderRadius: 16, background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <BookOpen />
              </div>
              <div style={{ flex: 1, minWidth: 240 }}>
                <h2 style={{ margin: 0, fontSize: 18 }}>{week.title}</h2>
                <p style={{ margin: '6px 0 0', color: 'rgba(226,232,240,0.62)', fontSize: 13 }}>
                  الأسبوع {week.week_number} · {week.exams?.length || 0} امتحان · {week.is_published ? 'منشور' : 'مسودة'}
                </p>
              </div>

              <Link href={`/admin/weeks/${week.id}`} style={{ color: '#93c5fd', textDecoration: 'none', fontWeight: 800 }}>تعديل</Link>

              <button
                onClick={() => handleDeleteWeek(week.id, week.title)}
                style={{ color: '#f87171', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '6px 10px', borderRadius: 8, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: 13 }}
              >
                <Trash2 size={16} /> حذف
              </button>
            </motion.article>
          ))}
        </div>
      </section>
    </main>
  )
}