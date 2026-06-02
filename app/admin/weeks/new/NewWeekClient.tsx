'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowRight, Loader2, Plus, Save, Trash2 } from 'lucide-react'

type QuestionDraft = {
  question_text: string
  question_type: 'multiple_choice' | 'true_false'
  optionsText: string
  correct_answer: string
  explanation: string
  points: number
}

type ExamDraft = {
  title: string
  description: string
  xp_reward_full: number
  xp_reward_partial: number
  passing_score: number
  questions: QuestionDraft[]
}

const emptyQuestion = (): QuestionDraft => ({
  question_text: '',
  question_type: 'multiple_choice',
  optionsText: '',
  correct_answer: '',
  explanation: '',
  points: 1,
})

const emptyExam = (index: number): ExamDraft => ({
  title: `امتحان ${index}`,
  description: '',
  xp_reward_full: 100,
  xp_reward_partial: 50,
  passing_score: 60,
  questions: [emptyQuestion()],
})

const inputStyle: React.CSSProperties = {
  width: '100%',
  borderRadius: 14,
  border: '1px solid rgba(255,255,255,0.12)',
  background: 'rgba(255,255,255,0.07)',
  color: '#fff',
  padding: '12px 14px',
  fontFamily: 'inherit',
  outline: 'none',
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: 'grid', gap: 8 }}>
      <span style={{ color: 'rgba(226,232,240,0.72)', fontSize: 13, fontWeight: 700 }}>{label}</span>
      {children}
    </label>
  )
}

export default function NewWeekClient() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [week, setWeek] = useState({
    title: '',
    description: '',
    week_number: 1,
    opens_at: '',
    closes_at: '',
    pdf_url: '',       // 👈 جديد
    pdf_filename: '',  // 👈 جديد
    xp_reward_full: 100,
    xp_reward_partial: 50,
    passing_score: 60,
    is_published: false,
  })
  const [exams, setExams] = useState<ExamDraft[]>([emptyExam(1)])

  function updateExam(index: number, patch: Partial<ExamDraft>) {
    setExams(current => current.map((exam, i) => (i === index ? { ...exam, ...patch } : exam)))
  }

  function updateQuestion(examIndex: number, questionIndex: number, patch: Partial<QuestionDraft>) {
    setExams(current =>
      current.map((exam, i) =>
        i === examIndex
          ? {
            ...exam,
            questions: exam.questions.map((question, qIndex) =>
              qIndex === questionIndex ? { ...question, ...patch } : question
            ),
          }
          : exam
      )
    )
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/admin/weeks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...week,
          opens_at: new Date(week.opens_at).toISOString(),
          closes_at: week.closes_at ? new Date(week.closes_at).toISOString() : null,
          exams: exams.map((exam, examIndex) => ({
            title: exam.title,
            description: exam.description || null,
            xp_reward_full: Number(exam.xp_reward_full),
            xp_reward_partial: Number(exam.xp_reward_partial),
            passing_score: Number(exam.passing_score),
            is_published: true,
            display_order: examIndex,
            questions: exam.questions
              .filter(question => question.question_text.trim())
              .map((question, questionIndex) => ({
                question_text: question.question_text,
                question_type: question.question_type,
                options:
                  question.question_type === 'true_false'
                    ? ['صح', 'خطأ']
                    : question.optionsText.split('\n').map(option => option.trim()).filter(Boolean),
                correct_answer: question.correct_answer,
                explanation: question.explanation || null,
                points: Number(question.points) || 1,
                display_order: questionIndex,
              })),
          })),
        }),
      })

      const data = await response.json()
      if (!response.ok) {
        setError(data.error || 'تعذر حفظ الأسبوع')
        return
      }

      router.push('/admin/weeks')
      router.refresh()
    } catch {
      setError('تعذر الاتصال بالخادم')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main dir="rtl" style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f0c29 0%, #1a1040 45%, #0d1b3e 100%)', color: '#e2e8f0', fontFamily: "'Cairo', 'Segoe UI', sans-serif", padding: '28px 20px' }}>
      <section style={{ maxWidth: 980, margin: '0 auto' }}>
        <Link href="/admin/weeks" style={{ color: '#93c5fd', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          <ArrowRight size={16} /> رجوع للأسابيع
        </Link>

        <header style={{ margin: '22px 0' }}>
          <p style={{ margin: '0 0 8px', color: '#38bdf8', fontWeight: 800, fontSize: 13 }}>إنشاء محتوى جديد</p>
          <h1 style={{ margin: 0, fontSize: 30, fontWeight: 800 }}>أسبوع جديد بعدة امتحانات</h1>
        </header>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 18 }}>
          <section style={{ padding: 22, borderRadius: 20, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 180px', gap: 14 }}>
              <Field label="عنوان الأسبوع">
                <input required value={week.title} onChange={e => setWeek({ ...week, title: e.target.value })} style={inputStyle} />
              </Field>
              <Field label="رقم الأسبوع">
                <input required type="number" min={1} value={week.week_number} onChange={e => setWeek({ ...week, week_number: Number(e.target.value) })} style={inputStyle} />
              </Field>
            </div>

            <div style={{ marginTop: 14 }}>
              <Field label="الوصف">
                <textarea value={week.description} onChange={e => setWeek({ ...week, description: e.target.value })} rows={3} style={inputStyle} />
              </Field>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 14 }}>
              <Field label="يفتح في">
                <input required type="datetime-local" value={week.opens_at} onChange={e => setWeek({ ...week, opens_at: e.target.value })} style={inputStyle} />
              </Field>
              <Field label="يغلق في اختياري">
                <input type="datetime-local" value={week.closes_at} onChange={e => setWeek({ ...week, closes_at: e.target.value })} style={inputStyle} />
              </Field>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 14 }}>
              <Field label="رابط ملف الـ PDF (اختياري)">
                <input type="url" value={week.pdf_url} onChange={e => setWeek({ ...week, pdf_url: e.target.value })} placeholder="رابط الملف من جوجل درايف مثلاً" style={{ ...inputStyle, direction: 'ltr' }} />
              </Field>
              <Field label="اسم الملف (اختياري)">
                <input type="text" value={week.pdf_filename} onChange={e => setWeek({ ...week, pdf_filename: e.target.value })} placeholder="مثال: درس_الأسبوع_الأول.pdf" style={inputStyle} />
              </Field>
            </div>
            <label style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 10, color: 'rgba(226,232,240,0.76)' }}>
              <input type="checkbox" checked={week.is_published} onChange={e => setWeek({ ...week, is_published: e.target.checked })} />
              نشر الأسبوع للطلاب
            </label>
          </section>

          <section style={{ display: 'grid', gap: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, fontSize: 20 }}>امتحانات الأسبوع</h2>
              <button type="button" onClick={() => setExams(current => [...current, emptyExam(current.length + 1)])} style={{ color: '#fff', background: 'rgba(139,92,246,0.24)', border: '1px solid rgba(139,92,246,0.35)', padding: '10px 14px', borderRadius: 14, fontFamily: 'inherit', fontWeight: 800, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <Plus size={17} /> امتحان جديد
              </button>
            </div>

            {exams.map((exam, examIndex) => (
              <article key={examIndex} style={{ padding: 20, borderRadius: 20, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <strong>امتحان {examIndex + 1}</strong>
                  {exams.length > 1 && (
                    <button type="button" onClick={() => setExams(current => current.filter((_, i) => i !== examIndex))} style={{ color: '#fca5a5', background: 'transparent', border: 0, cursor: 'pointer' }}>
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 140px 140px 140px', gap: 12 }}>
                  <Field label="اسم الامتحان">
                    <input required value={exam.title} onChange={e => updateExam(examIndex, { title: e.target.value })} style={inputStyle} />
                  </Field>
                  <Field label="XP كامل">
                    <input type="number" min={1} value={exam.xp_reward_full} onChange={e => updateExam(examIndex, { xp_reward_full: Number(e.target.value) })} style={inputStyle} />
                  </Field>
                  <Field label="XP للنجاح">
                    <input type="number" min={0} value={exam.xp_reward_partial} onChange={e => updateExam(examIndex, { xp_reward_partial: Number(e.target.value) })} style={inputStyle} />
                  </Field>
                  <Field label="درجة النجاح">
                    <input type="number" min={1} max={100} value={exam.passing_score} onChange={e => updateExam(examIndex, { passing_score: Number(e.target.value) })} style={inputStyle} />
                  </Field>
                </div>

                <div style={{ marginTop: 14 }}>
                  <Field label="وصف الامتحان اختياري">
                    <textarea value={exam.description} onChange={e => updateExam(examIndex, { description: e.target.value })} rows={2} style={inputStyle} />
                  </Field>
                </div>

                <div style={{ marginTop: 18, display: 'grid', gap: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ margin: 0, fontSize: 16 }}>أسئلة هذا الامتحان</h3>
                    <button type="button" onClick={() => updateExam(examIndex, { questions: [...exam.questions, emptyQuestion()] })} style={{ color: '#fff', background: 'rgba(6,182,212,0.18)', border: '1px solid rgba(6,182,212,0.28)', padding: '8px 12px', borderRadius: 12, fontFamily: 'inherit', fontWeight: 800, cursor: 'pointer' }}>
                      + سؤال
                    </button>
                  </div>

                  {exam.questions.map((question, questionIndex) => (
                    <div key={questionIndex} style={{ padding: 16, borderRadius: 16, background: 'rgba(0,0,0,0.16)', border: '1px solid rgba(255,255,255,0.08)' }}>
                      <Field label={`نص السؤال ${questionIndex + 1}`}>
                        <textarea required value={question.question_text} onChange={e => updateQuestion(examIndex, questionIndex, { question_text: e.target.value })} rows={2} style={inputStyle} />
                      </Field>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 110px', gap: 12, marginTop: 12 }}>
                        <Field label="النوع">
                          <select value={question.question_type} onChange={e => updateQuestion(examIndex, questionIndex, { question_type: e.target.value as QuestionDraft['question_type'] })} style={inputStyle}>
                            <option value="multiple_choice" style={{ background: '#1a1040' }}>اختيار من متعدد</option>
                            <option value="true_false" style={{ background: '#1a1040' }}>صح أو خطأ</option>
                          </select>
                        </Field>
                        <Field label="الإجابة الصحيحة">
                          <input required value={question.correct_answer} onChange={e => updateQuestion(examIndex, questionIndex, { correct_answer: e.target.value })} style={inputStyle} />
                        </Field>
                        <Field label="النقاط">
                          <input type="number" min={1} value={question.points} onChange={e => updateQuestion(examIndex, questionIndex, { points: Number(e.target.value) })} style={inputStyle} />
                        </Field>
                      </div>
                      {question.question_type === 'multiple_choice' && (
                        <div style={{ marginTop: 12 }}>
                          <Field label="الاختيارات - كل اختيار في سطر">
                            <textarea required value={question.optionsText} onChange={e => updateQuestion(examIndex, questionIndex, { optionsText: e.target.value })} rows={3} style={inputStyle} />
                          </Field>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </section>

          {error && <p style={{ padding: 14, borderRadius: 14, background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5' }}>{error}</p>}

          <button type="submit" disabled={loading} style={{ justifySelf: 'start', color: '#fff', background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)', border: 0, padding: '13px 20px', borderRadius: 14, fontFamily: 'inherit', fontWeight: 800, cursor: loading ? 'not-allowed' : 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            {loading ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={18} />}
            حفظ الأسبوع
          </button>
        </form>
      </section>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } } option { color: white; }`}</style>
    </main>
  )
}
