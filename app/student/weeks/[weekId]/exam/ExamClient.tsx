'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowRight, CheckCircle, Loader2, Send, ShieldCheck } from 'lucide-react'

type Question = {
  id: string
  question_text: string
  question_type: 'multiple_choice' | 'true_false'
  options: unknown
  points: number
  display_order: number
}

type Week = {
  id: string
  title: string
  week_number: number
  passing_score: number
  xp_reward_full: number
}

type Result = {
  score: number
  correctCount: number
  totalQuestions: number
  xpEarned: number
  isPassing: boolean
  isPerfect: boolean
  message: string
}

function normalizeOptions(question: Question): string[] {
  if (question.question_type === 'true_false') return ['صح', 'خطأ']
  return Array.isArray(question.options) ? question.options.map(String) : []
}

export default function ExamClient({
  week,
  examId,
  questions,
}: {
  week: Week
  examId: string
  questions: Question[]
  existingSubmission: unknown
}) {
  const router = useRouter()
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<Result | null>(null)

  const answeredCount = useMemo(
    () => questions.filter(question => answers[question.id]).length,
    [answers, questions]
  )

  async function submitExam() {
    setError('')

    if (answeredCount !== questions.length) {
      setError('جاوب على كل الأسئلة قبل الإرسال.')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/submit-exam', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weekId: week.id, examId, answers }),
      })

      const data = await response.json()
      if (!response.ok) {
        setError(data.error || 'تعذر إرسال الامتحان.')
        return
      }

      setResult(data)
      router.refresh()
    } catch {
      setError('تعذر الاتصال بالخادم. حاول مرة أخرى.')
    } finally {
      setLoading(false)
    }
  }

  if (result) {
    return (
      <main dir="rtl" style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f0c29 0%, #1a1040 45%, #0d1b3e 100%)', color: '#e2e8f0', fontFamily: "'Cairo', 'Segoe UI', sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
        <motion.section initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} style={{ width: '100%', maxWidth: 520, textAlign: 'center', padding: 34, borderRadius: 26, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }}>
          <CheckCircle size={64} color={result.isPassing ? '#10b981' : '#f59e0b'} style={{ margin: '0 auto 16px' }} />
          <h1 style={{ margin: 0, fontSize: 30 }}>{result.score}%</h1>
          <p style={{ color: 'rgba(226,232,240,0.72)', margin: '10px 0 18px' }}>{result.message}</p>
          <p style={{ color: '#a78bfa', fontWeight: 800 }}>+{result.xpEarned} XP</p>
          <Link href={`/student/weeks/${week.id}`} style={{ marginTop: 20, display: 'inline-flex', padding: '12px 18px', borderRadius: 14, background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)', color: '#fff', textDecoration: 'none', fontWeight: 800 }}>
            العودة للأسبوع
          </Link>
        </motion.section>
      </main>
    )
  }

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
      <section style={{ maxWidth: 920, margin: '0 auto' }}>
        <Link href={`/student/weeks/${week.id}`} style={{ color: '#93c5fd', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          <ArrowRight size={16} /> رجوع للأسبوع
        </Link>

        <header style={{ marginTop: 22, marginBottom: 18 }}>
          <p style={{ margin: '0 0 8px', color: '#38bdf8', fontWeight: 800, fontSize: 13 }}>
            امتحان الأسبوع {week.week_number}
          </p>
          <h1 style={{ margin: 0, fontSize: 30, fontWeight: 800 }}>{week.title}</h1>
          <p style={{ margin: '10px 0 0', display: 'flex', alignItems: 'center', gap: 8, color: 'rgba(226,232,240,0.62)' }}>
            <ShieldCheck size={17} /> الإجابات الصحيحة لا تظهر في المتصفح، والتصحيح يتم على الخادم فقط.
          </p>
        </header>

        <div style={{ display: 'grid', gap: 16 }}>
          {questions.map((question, index) => (
            <motion.article
              key={question.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04 }}
              style={{ padding: 22, borderRadius: 20, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              <h2 style={{ margin: '0 0 14px', fontSize: 17, lineHeight: 1.7 }}>
                {index + 1}. {question.question_text}
              </h2>
              <div style={{ display: 'grid', gap: 10 }}>
                {normalizeOptions(question).map(option => {
                  const selected = answers[question.id] === option
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setAnswers(current => ({ ...current, [question.id]: option }))}
                      style={{
                        textAlign: 'right',
                        padding: '13px 15px',
                        borderRadius: 14,
                        border: selected ? '1px solid rgba(139,92,246,0.75)' : '1px solid rgba(255,255,255,0.1)',
                        background: selected ? 'linear-gradient(135deg, rgba(139,92,246,0.32), rgba(6,182,212,0.22))' : 'rgba(255,255,255,0.04)',
                        color: '#fff',
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                        fontSize: 15,
                      }}
                    >
                      {option}
                    </button>
                  )
                })}
              </div>
            </motion.article>
          ))}
        </div>

        {error && (
          <p style={{ marginTop: 16, padding: 14, borderRadius: 14, background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5' }}>
            {error}
          </p>
        )}

        <footer style={{ position: 'sticky', bottom: 0, marginTop: 20, padding: '16px 0', background: 'linear-gradient(180deg, transparent, #0f0c29 32%)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14 }}>
          <span style={{ color: 'rgba(226,232,240,0.65)', fontSize: 14 }}>
            تمت الإجابة على {answeredCount} من {questions.length}
          </span>
          <button
            type="button"
            onClick={submitExam}
            disabled={loading}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '13px 20px', borderRadius: 14, border: 'none', background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)', color: '#fff', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', fontWeight: 800 }}
          >
            {loading ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : <Send size={18} />}
            إرسال الامتحان
          </button>
        </footer>
      </section>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </main>
  )
}
