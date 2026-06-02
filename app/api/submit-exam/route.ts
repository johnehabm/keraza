import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import {
  createServerSupabaseClient,
  createServiceRoleClient,
} from '@/lib/supabase/server'
import { calculateXP, checkAndAwardBadges } from '@/lib/gamification/xp'

const submitSchema = z.object({
  weekId: z.string().uuid('معرف الأسبوع غير صحيح'),
  examId: z.string().uuid('معرف الامتحان غير صحيح'),
  answers: z.record(z.string(), z.string().min(1)),
})

const submissionTracker = new Map<string, number>()

export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const serviceClient = createServiceRoleClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  }

  const lastSubmit = submissionTracker.get(user.id)
  if (lastSubmit && Date.now() - lastSubmit < 30_000) {
    return NextResponse.json(
      { error: 'انتظر قليلا قبل الإرسال مرة أخرى' },
      { status: 429 }
    )
  }

  const parsed = submitSchema.safeParse(await request.json())
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0].message },
      { status: 400 }
    )
  }

  submissionTracker.set(user.id, Date.now())

  const { weekId, examId, answers } = parsed.data
  const now = new Date().toISOString()

  const { data: week } = await serviceClient
    .from('weeks')
    .select('*')
    .eq('id', weekId)
    .eq('is_published', true)
    .lte('opens_at', now)
    .single()

  if (!week) {
    return NextResponse.json({ error: 'الأسبوع غير متاح' }, { status: 404 })
  }

  if (week.closes_at && new Date(week.closes_at) < new Date()) {
    return NextResponse.json(
      { error: 'تم إغلاق امتحان هذا الأسبوع' },
      { status: 400 }
    )
  }

  const { data: exam } = await serviceClient
    .from('exams')
    .select('*')
    .eq('id', examId)
    .eq('week_id', weekId)
    .eq('is_published', true)
    .single()

  if (!exam) {
    return NextResponse.json({ error: 'الامتحان غير متاح' }, { status: 404 })
  }

  if (exam.opens_at && new Date(exam.opens_at) > new Date()) {
    return NextResponse.json({ error: 'الامتحان لم يفتح بعد' }, { status: 400 })
  }

  if (exam.closes_at && new Date(exam.closes_at) < new Date()) {
    return NextResponse.json({ error: 'تم إغلاق هذا الامتحان' }, { status: 400 })
  }

  const { data: existing } = await serviceClient
    .from('exam_submissions')
    .select('id, can_retry, is_graded, attempt_number')
    .eq('student_id', user.id)
    .eq('exam_id', examId)
    .eq('is_graded', true)
    .order('attempt_number', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (existing && !existing.can_retry) {
    return NextResponse.json(
      { error: 'لقد أرسلت الامتحان من قبل' },
      { status: 400 }
    )
  }

  const { data: questions } = await serviceClient
    .from('questions')
    .select('id, correct_answer, points')
    .eq('exam_id', examId)

  if (!questions?.length) {
    return NextResponse.json(
      { error: 'لا توجد أسئلة لهذا الأسبوع' },
      { status: 404 }
    )
  }

  const questionIds = new Set(questions.map(question => question.id))
  const submittedQuestionIds = Object.keys(answers)
  const hasUnknownQuestion = submittedQuestionIds.some(id => !questionIds.has(id))

  if (hasUnknownQuestion || submittedQuestionIds.length !== questions.length) {
    return NextResponse.json(
      { error: 'بيانات الإجابات غير مكتملة أو غير صحيحة' },
      { status: 400 }
    )
  }

  let correctCount = 0
  let totalPoints = 0
  let earnedPoints = 0

  for (const question of questions) {
    totalPoints += question.points
    const studentAnswer = answers[question.id]?.trim().toLowerCase()
    const correctAnswer = question.correct_answer.trim().toLowerCase()

    if (studentAnswer === correctAnswer) {
      correctCount++
      earnedPoints += question.points
    }
  }

  const scorePercent = totalPoints
    ? Math.round((earnedPoints / totalPoints) * 100)
    : 0
  const xpEarned = calculateXP(
    scorePercent,
    exam.xp_reward_full,
    exam.xp_reward_partial,
    exam.passing_score
  )

  const attemptNumber = existing ? existing.attempt_number + 1 : 1

  const { error: saveError } = await serviceClient
    .from('exam_submissions')
    .insert({
      student_id: user.id,
      week_id: weekId,
      exam_id: examId,
      answers,
      score: scorePercent,
      total_questions: questions.length,
      correct_count: correctCount,
      xp_earned: xpEarned,
      submitted_at: now,
      is_graded: true,
      can_retry: false,
      attempt_number: attemptNumber,
    })

  if (saveError) {
    return NextResponse.json(
      { error: 'خطأ في حفظ النتيجة' },
      { status: 500 }
    )
  }

  if (existing?.can_retry) {
    await serviceClient
      .from('exam_submissions')
      .update({ can_retry: false })
      .eq('id', existing.id)
  }

  await serviceClient.rpc('increment_xp', {
    p_student_id: user.id,
    p_xp: xpEarned,
    p_week_id: weekId,
  })

  await serviceClient.rpc('update_streak', {
    p_student_id: user.id,
  })

  await serviceClient.from('weekly_progress').upsert({
    student_id: user.id,
    week_id: weekId,
    exam_completed: true,
    exam_completed_at: now,
  })

  const newBadges = await checkAndAwardBadges(user.id, {
    scorePercent,
    weekId,
    serviceClient,
  })

  const isPerfect = scorePercent === 100
  const isPassing = scorePercent >= exam.passing_score

  return NextResponse.json({
    success: true,
    score: scorePercent,
    correctCount,
    totalQuestions: questions.length,
    xpEarned,
    isPerfect,
    isPassing,
    newBadges,
    message: isPerfect
      ? 'مبروك! حصلت على العلامة الكاملة!'
      : isPassing
        ? `أحسنت! حصلت على ${scorePercent}%`
        : `حصلت على ${scorePercent}%. راجع الدرس وحاول مرة أخرى عندما يسمح الخادم بذلك.`,
  })
}
