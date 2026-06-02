'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { AlertTriangle, ArrowRight, CheckCircle, FileText, Lock, Play } from 'lucide-react'

type Week = {
  id: string
  title: string
  description?: string | null
  week_number: number
  opens_at: string
  pdf_url?: string | null
  xp_reward_full: number
}

type Exam = {
  id: string
  title: string
  description?: string | null
  passing_score: number
  xp_reward_full: number
}

export default function WeekDetailClient({
  week,
  submissions,
  exams,
  isOpen,
  alreadySubmitted,
}: {
  week: Week
  submissions: { exam_id?: string | null; score: number | null; xp_earned: number }[]
  exams: Exam[]
  isOpen: boolean
  alreadySubmitted: boolean
}) {
  return (
    <main
      dir="rtl"
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f0c29 0%, #1a1040 45%, #0d1b3e 100%)',
        color: '#e2e8f0',
        fontFamily: "'Cairo', 'Segoe UI', sans-serif",
        padding: '28px 20px',
      }}
    >
      <section style={{ maxWidth: 1050, margin: '0 auto' }}>
        <Link href="/student/weeks" style={{ color: '#93c5fd', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          <ArrowRight size={16} /> رجوع للأسابيع
        </Link>

        <motion.header
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            marginTop: 22,
            padding: 28,
            borderRadius: 24,
            background: 'linear-gradient(135deg, rgba(139,92,246,0.22), rgba(6,182,212,0.16))',
            border: '1px solid rgba(255,255,255,0.12)',
          }}
        >
          <p style={{ margin: '0 0 8px', color: '#38bdf8', fontWeight: 800, fontSize: 13 }}>
            الأسبوع {week.week_number}
          </p>
          <h1 style={{ margin: 0, fontSize: 30, fontWeight: 800 }}>{week.title}</h1>
          <p style={{ margin: '10px 0 0', color: 'rgba(226,232,240,0.68)' }}>
            {week.description || 'اقرأ ملف الدراسة بهدوء، وبعدها ابدأ الامتحان عندما تكون مستعدا.'}
          </p>
        </motion.header>

        {alreadySubmitted && (
          <div style={{ marginTop: 16, padding: 14, borderRadius: 14, background: 'rgba(245,158,11,0.14)', border: '1px solid rgba(245,158,11,0.28)', display: 'flex', gap: 10 }}>
            <AlertTriangle color="#f59e0b" />
            <span>لقد أرسلت امتحان هذا الأسبوع بالفعل.</span>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20, marginTop: 22 }}>
          <section style={{ minHeight: 620, borderRadius: 20, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)' }}>
            {week.pdf_url ? (
              <iframe src={week.pdf_url} title={week.title} style={{ width: '100%', height: 620, border: 0, background: '#fff' }} />
            ) : (
              <div style={{ height: 620, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'rgba(226,232,240,0.62)' }}>
                <FileText size={52} />
                <p>لم يتم رفع ملف PDF لهذا الأسبوع بعد.</p>
              </div>
            )}
          </section>

          <aside style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ padding: 22, borderRadius: 20, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <h2 style={{ margin: '0 0 12px', fontSize: 18 }}>حالة الأسبوع</h2>
              {submissions.length > 0 ? (
                <div style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: 9, fontWeight: 800 }}>
                  <CheckCircle /> تم حل {submissions.length} امتحان
                </div>
              ) : isOpen ? (
                <p style={{ margin: 0, color: 'rgba(226,232,240,0.68)' }}>الأسبوع مفتوح ويمكنك دخول الامتحان.</p>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 9, color: '#94a3b8' }}>
                  <Lock /> يفتح في {new Date(week.opens_at).toLocaleDateString('ar-EG')}
                </div>
              )}
            </div>

            <div style={{ padding: 22, borderRadius: 20, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <h2 style={{ margin: '0 0 14px', fontSize: 18 }}>امتحانات الأسبوع</h2>
              <div style={{ display: 'grid', gap: 10 }}>
                {exams.map(exam => {
                  const done = submissions.some(submission => submission.exam_id === exam.id)
                  return (
                    <Link
                      key={exam.id}
                      href={`/student/weeks/${week.id}/exams/${exam.id}`}
                      style={{
                        pointerEvents: isOpen && !done ? 'auto' : 'none',
                        opacity: isOpen && !done ? 1 : 0.55,
                        textDecoration: 'none',
                        color: '#fff',
                        borderRadius: 14,
                        padding: '13px 14px',
                        background: done ? 'rgba(16,185,129,0.16)' : 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
                        border: done ? '1px solid rgba(16,185,129,0.32)' : 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 10,
                        fontWeight: 800,
                      }}
                    >
                      <span>{exam.title}</span>
                      {done ? <CheckCircle size={17} /> : <Play size={17} fill="#fff" />}
                    </Link>
                  )
                })}
                {exams.length === 0 && (
                  <p style={{ margin: 0, color: 'rgba(226,232,240,0.62)' }}>لم يتم إضافة امتحانات لهذا الأسبوع بعد.</p>
                )}
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  )
}
