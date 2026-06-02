'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  CheckCircle,
  ClipboardList,
  FileText,
  Lock,
  Play,
  Star,
} from 'lucide-react'

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

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.4, ease: 'easeOut' },
  }),
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
  const totalXpEarned = submissions.reduce((sum, s) => sum + (s.xp_earned ?? 0), 0)

  return (
    <>
      {/* ─── Global styles injected inline so no extra CSS file is needed ─── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap');

        *, *::before, *::after { box-sizing: border-box; }

        .wdc-root {
          min-height: 100vh;
          background: linear-gradient(150deg, #0d0922 0%, #13113a 50%, #091b35 100%);
          color: #e2e8f0;
          font-family: 'Cairo', 'Segoe UI', sans-serif;
          padding: 24px 16px 48px;
          direction: rtl;
        }

        /* ── Layout grid ── */
        .wdc-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 18px;
          margin-top: 20px;
        }
        @media (min-width: 900px) {
          .wdc-grid {
            grid-template-columns: 1fr 330px;
            align-items: start;
          }
        }

        /* ── Glass card base ── */
        .wdc-card {
          border-radius: 20px;
          background: rgba(255,255,255,0.045);
          border: 1px solid rgba(255,255,255,0.1);
          backdrop-filter: blur(8px);
          overflow: hidden;
        }

        /* ── PDF section ── */
        .wdc-pdf-wrapper {
          width: 100%;
          aspect-ratio: 3/4;
          min-height: 340px;
          max-height: 680px;
          background: #fff;
        }
        @media (min-width: 600px) {
          .wdc-pdf-wrapper {
            aspect-ratio: unset;
            height: 600px;
          }
        }

        .wdc-pdf-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
          height: 300px;
          color: rgba(226,232,240,0.5);
          font-size: 15px;
          text-align: center;
          padding: 24px;
        }

        /* ── Sidebar ── */
        .wdc-aside {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .wdc-sidebar-card {
          padding: 20px;
          border-radius: 20px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
        }

        .wdc-sidebar-title {
          display: flex;
          align-items: center;
          gap: 9px;
          font-size: 16px;
          font-weight: 800;
          margin: 0 0 14px;
          color: #e2e8f0;
        }

        /* ── Exam button states ── */
        .wdc-exam-link {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          border-radius: 14px;
          padding: 13px 15px;
          font-family: 'Cairo', sans-serif;
          font-weight: 800;
          font-size: 14px;
          text-decoration: none;
          transition: transform 0.18s, box-shadow 0.18s;
        }
        .wdc-exam-link.available {
          background: linear-gradient(135deg, #7c3aed, #0891b2);
          color: #fff;
          border: none;
          cursor: pointer;
          box-shadow: 0 4px 18px rgba(124,58,237,0.35);
        }
        .wdc-exam-link.available:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 28px rgba(124,58,237,0.5);
        }
        .wdc-exam-link.done {
          background: rgba(16,185,129,0.13);
          color: #6ee7b7;
          border: 1px solid rgba(16,185,129,0.3);
          pointer-events: none;
          opacity: 0.85;
        }
        .wdc-exam-link.locked {
          background: rgba(255,255,255,0.06);
          color: rgba(226,232,240,0.45);
          border: 1px solid rgba(255,255,255,0.08);
          pointer-events: none;
          opacity: 0.65;
        }

        /* ── XP badge ── */
        .wdc-xp-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          background: linear-gradient(135deg, rgba(234,179,8,0.2), rgba(234,179,8,0.08));
          border: 1px solid rgba(234,179,8,0.28);
          border-radius: 999px;
          padding: 4px 12px;
          font-size: 12px;
          font-weight: 800;
          color: #fbbf24;
        }

        /* ── Status chip ── */
        .wdc-status-chip {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-weight: 700;
          font-size: 14px;
          padding: 6px 12px;
          border-radius: 999px;
        }
        .wdc-status-chip.open  { background: rgba(16,185,129,0.15); color: #34d399; border: 1px solid rgba(16,185,129,0.25); }
        .wdc-status-chip.done  { background: rgba(99,102,241,0.15); color: #a5b4fc; border: 1px solid rgba(99,102,241,0.25); }
        .wdc-status-chip.locked{ background: rgba(148,163,184,0.12); color: #94a3b8; border: 1px solid rgba(148,163,184,0.2); }

        /* ── Alert banner ── */
        .wdc-alert {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          margin-top: 14px;
          padding: 13px 16px;
          border-radius: 14px;
          background: rgba(245,158,11,0.1);
          border: 1px solid rgba(245,158,11,0.25);
          font-size: 14px;
          color: #fcd34d;
          font-weight: 600;
        }

        /* ── Section label ── */
        .wdc-section-label {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          background: rgba(255,255,255,0.04);
          border-bottom: 1px solid rgba(255,255,255,0.07);
          font-size: 13px;
          font-weight: 700;
          color: rgba(226,232,240,0.7);
        }
      `}</style>

      <main className="wdc-root">
        <section style={{ maxWidth: 1080, margin: '0 auto' }}>

          {/* ── Back link ── */}
          <Link
            href="/student/weeks"
            style={{ color: '#7dd3fc', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 14, fontWeight: 700 }}
          >
            <ArrowRight size={15} /> رجوع للأسابيع
          </Link>

          {/* ── Hero header ── */}
          <motion.header
            variants={fadeUp} custom={0} initial="hidden" animate="show"
            style={{
              marginTop: 18,
              padding: '24px 26px',
              borderRadius: 24,
              background: 'linear-gradient(135deg, rgba(124,58,237,0.25) 0%, rgba(8,145,178,0.18) 100%)',
              border: '1px solid rgba(255,255,255,0.13)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* decorative blob */}
            <div style={{ position: 'absolute', top: -30, left: -30, width: 140, height: 140, borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,58,237,0.25) 0%, transparent 70%)', pointerEvents: 'none' }} />

            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
              <div>
                <p style={{ margin: '0 0 6px', color: '#38bdf8', fontWeight: 800, fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 }}>
                  الأسبوع {week.week_number}
                </p>
                <h1 style={{ margin: 0, fontSize: 'clamp(20px, 4vw, 28px)', fontWeight: 900, lineHeight: 1.3 }}>
                  {week.title}
                </h1>
                <p style={{ margin: '8px 0 0', color: 'rgba(226,232,240,0.65)', fontSize: 14, maxWidth: 520 }}>
                  {week.description || 'اقرأ ملف الدراسة بهدوء، وبعدها ابدأ الامتحان عندما تكون مستعدًا.'}
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                <span className="wdc-xp-badge">
                  <Star size={12} fill="#fbbf24" /> {week.xp_reward_full} XP
                </span>
                {totalXpEarned > 0 && (
                  <span style={{ fontSize: 12, color: '#6ee7b7', fontWeight: 700 }}>
                    ✓ كسبت {totalXpEarned} XP
                  </span>
                )}
              </div>
            </div>
          </motion.header>

          {/* ── Already-submitted notice ── */}
          {alreadySubmitted && (
            <motion.div variants={fadeUp} custom={1} initial="hidden" animate="show" className="wdc-alert">
              <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: 1 }} />
              <span>لقد أرسلت امتحان هذا الأسبوع بالفعل — يمكنك مراجعة المادة في أي وقت.</span>
            </motion.div>
          )}

          {/* ── Main grid ── */}
          <div className="wdc-grid">

            {/* ── LEFT: PDF lesson — always visible ── */}
            <motion.div variants={fadeUp} custom={2} initial="hidden" animate="show" className="wdc-card">
              <div className="wdc-section-label">
                <BookOpen size={15} />
                مادة الدراسة — متاحة دائمًا
              </div>

              {week.pdf_url ? (
                <iframe
                  src={week.pdf_url}
                  title={week.title}
                  className="wdc-pdf-wrapper"
                  style={{ border: 0, display: 'block' }}
                />
              ) : (
                <div className="wdc-pdf-empty">
                  <FileText size={48} strokeWidth={1.2} />
                  <p style={{ margin: 0 }}>لم يتم رفع ملف PDF لهذا الأسبوع بعد.<br />تحقق لاحقًا!</p>
                </div>
              )}
            </motion.div>

            {/* ── RIGHT: Sidebar ── */}
            <motion.aside variants={fadeUp} custom={3} initial="hidden" animate="show" className="wdc-aside">

              {/* Status card */}
              <div className="wdc-sidebar-card">
                <h2 className="wdc-sidebar-title">
                  <ClipboardList size={17} /> حالة الأسبوع
                </h2>

                {submissions.length > 0 ? (
                  <span className="wdc-status-chip done">
                    <CheckCircle size={15} /> أنجزت {submissions.length} امتحان
                  </span>
                ) : isOpen ? (
                  <span className="wdc-status-chip open">
                    <Play size={13} fill="currentColor" /> مفتوح — جاهز للامتحان
                  </span>
                ) : (
                  <span className="wdc-status-chip locked">
                    <Lock size={13} /> يفتح {new Date(week.opens_at).toLocaleDateString('ar-EG')}
                  </span>
                )}
              </div>

              {/* Exams card */}
              <div className="wdc-sidebar-card">
                <h2 className="wdc-sidebar-title">
                  <ClipboardList size={17} /> امتحانات الأسبوع
                </h2>

                <div style={{ display: 'grid', gap: 10 }}>
                  {exams.length === 0 && (
                    <p style={{ margin: 0, color: 'rgba(226,232,240,0.5)', fontSize: 14 }}>
                      لم تُضف امتحانات بعد.
                    </p>
                  )}

                  {exams.map((exam, idx) => {
                    const done = submissions.some(s => s.exam_id === exam.id)

                    // Exam is done → show completed badge (no navigation, PDF still open)
                    if (done) {
                      return (
                        <div key={exam.id} className="wdc-exam-link done">
                          <span>{exam.title}</span>
                          <CheckCircle size={16} />
                        </div>
                      )
                    }

                    // Week not open yet → locked
                    if (!isOpen) {
                      return (
                        <div key={exam.id} className="wdc-exam-link locked">
                          <span>{exam.title}</span>
                          <Lock size={15} />
                        </div>
                      )
                    }

                    // Available → navigable button
                    return (
                      <motion.div
                        key={exam.id}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.35 + idx * 0.07 }}
                      >
                        <Link
                          href={`/student/weeks/${week.id}/exams/${exam.id}`}
                          className="wdc-exam-link available"
                          style={{ display: 'flex' }}
                        >
                          <span>{exam.title}</span>
                          <Play size={16} fill="#fff" />
                        </Link>
                      </motion.div>
                    )
                  })}
                </div>
              </div>

              {/* XP info card */}
              <div className="wdc-sidebar-card" style={{ background: 'rgba(234,179,8,0.06)', borderColor: 'rgba(234,179,8,0.18)' }}>
                <h2 className="wdc-sidebar-title" style={{ color: '#fbbf24' }}>
                  <Star size={16} fill="#fbbf24" /> مكافأة الأسبوع
                </h2>
                <p style={{ margin: 0, fontSize: 13, color: 'rgba(226,232,240,0.65)' }}>
                  أكمل الامتحان واحصل على
                  {' '}
                  <strong style={{ color: '#fcd34d' }}>{week.xp_reward_full} XP</strong>
                  {' '}كاملة!
                </p>
              </div>

            </motion.aside>
          </div>
        </section>
      </main>
    </>
  )
}
