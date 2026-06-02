'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { BookOpen, CheckCircle, Lock, Play, Zap } from 'lucide-react'

type Week = {
  id: string
  title: string
  description?: string | null
  week_number: number
  opens_at: string
  xp_reward_full: number
}

type Submission = {
  week_id: string
  score: number | null
  xp_earned: number
  is_graded: boolean
}

export default function WeeksClient({
  weeks,
  submissions,
}: {
  weeks: Week[]
  progress: unknown[]
  submissions: Submission[]
}) {
  const submitted = new Map(submissions.map(sub => [sub.week_id, sub]))

  return (
    <main
      dir="rtl"
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f0c29 0%, #1a1040 45%, #0d1b3e 100%)',
        color: '#e2e8f0',
        fontFamily: "'Cairo', 'Segoe UI', sans-serif",
        padding: '32px 20px',
      }}
    >
      <section style={{ maxWidth: 980, margin: '0 auto' }}>
        <div style={{ marginBottom: 28 }}>
          <p style={{ margin: '0 0 8px', color: '#38bdf8', fontSize: 13, fontWeight: 700 }}>
            خريطة الدراسة
          </p>
          <h1 style={{ margin: 0, fontSize: 30, fontWeight: 800 }}>الأسابيع المتاحة</h1>
        </div>

        <div style={{ display: 'grid', gap: 16 }}>
          {weeks.map((week, index) => {
            const isOpen = new Date(week.opens_at) <= new Date()
            const submission = submitted.get(week.id)
            const done = Boolean(submission?.is_graded)

            return (
              <motion.article
                key={week.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 18,
                  padding: 22,
                  borderRadius: 20,
                  background: done
                    ? 'linear-gradient(135deg, rgba(16,185,129,0.16), rgba(6,182,212,0.1))'
                    : 'rgba(255,255,255,0.05)',
                  border: done
                    ? '1px solid rgba(16,185,129,0.35)'
                    : isOpen
                      ? '1px solid rgba(139,92,246,0.35)'
                      : '1px solid rgba(255,255,255,0.08)',
                }}
              >
                <div
                  style={{
                    width: 58,
                    height: 58,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    background: done
                      ? 'linear-gradient(135deg, #10b981, #06b6d4)'
                      : isOpen
                        ? 'linear-gradient(135deg, #8b5cf6, #06b6d4)'
                        : 'rgba(255,255,255,0.1)',
                  }}
                >
                  {done ? <CheckCircle /> : isOpen ? <BookOpen /> : <Lock />}
                </div>

                <div style={{ flex: 1 }}>
                  <h2 style={{ margin: '0 0 6px', fontSize: 18 }}>{week.title}</h2>
                  <p style={{ margin: 0, color: 'rgba(226,232,240,0.62)', fontSize: 13 }}>
                    الأسبوع {week.week_number} · {week.description || 'اقرأ المحتوى ثم ابدأ الامتحان'}
                  </p>
                  <p style={{ margin: '10px 0 0', color: '#a78bfa', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Zap size={14} /> حتى {week.xp_reward_full} XP
                  </p>
                </div>

                {done ? (
                  <div style={{ textAlign: 'center', minWidth: 86 }}>
                    <strong style={{ fontSize: 24, color: '#10b981' }}>{submission?.score}%</strong>
                    <p style={{ margin: 0, fontSize: 12, color: 'rgba(226,232,240,0.55)' }}>
                      +{submission?.xp_earned} XP
                    </p>
                  </div>
                ) : (
                  <Link
                    href={`/student/weeks/${week.id}`}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '11px 18px',
                      borderRadius: 14,
                      color: '#fff',
                      textDecoration: 'none',
                      fontWeight: 700,
                      pointerEvents: isOpen ? 'auto' : 'none',
                      opacity: isOpen ? 1 : 0.45,
                      background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
                    }}
                  >
                    ابدأ <Play size={15} fill="#fff" />
                  </Link>
                )}
              </motion.article>
            )
          })}
        </div>
      </section>
    </main>
  )
}
