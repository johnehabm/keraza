import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import {
  createServerSupabaseClient,
  createServiceRoleClient,
} from '@/lib/supabase/server'
import { assertAdmin } from '@/lib/auth/admin'

const questionSchema = z.object({
  id: z.string().uuid().optional(),
  question_text: z.string().min(3),
  question_type: z.enum(['multiple_choice', 'true_false']),
  options: z.array(z.string()).default([]),
  correct_answer: z.string().min(1),
  explanation: z.string().optional().nullable(),
  points: z.number().int().min(1).default(1),
  display_order: z.number().int().default(0),
})

const weekSchema = z.object({
  title: z.string().min(3),
  description: z.string().optional().nullable(),
  week_number: z.number().int().min(1),
  opens_at: z.string().datetime(),
  closes_at: z.string().datetime().optional().nullable(),
  xp_reward_full: z.number().int().min(1).default(100),
  xp_reward_partial: z.number().int().min(0).default(50),
  passing_score: z.number().int().min(1).max(100).default(60),
  is_published: z.boolean().default(false),
  show_answers_after_close: z.boolean().default(true),
  pdf_url: z.string().optional().nullable(),      // 👈 السطر ده جديد
  pdf_filename: z.string().optional().nullable(), // 👈 والسطر ده جديد
  questions: z.array(questionSchema).default([]),
  exams: z
    .array(
      z.object({
        title: z.string().min(2),
        description: z.string().optional().nullable(),
        time_limit_minutes: z.number().int().min(1).optional().nullable(),
        opens_at: z.string().datetime().optional().nullable(),
        closes_at: z.string().datetime().optional().nullable(),
        xp_reward_full: z.number().int().min(1).default(100),
        xp_reward_partial: z.number().int().min(0).default(50),
        passing_score: z.number().int().min(1).max(100).default(60),
        is_published: z.boolean().default(true),
        display_order: z.number().int().default(0),
        questions: z.array(questionSchema).default([]),
      })
    )
    .default([]),
})

function errorResponse(message: string, status: number, details?: string) {
  return NextResponse.json(
    {
      error: message,
      details: process.env.NODE_ENV === 'development' ? details : undefined,
    },
    { status }
  )
}

export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const serviceClient = createServiceRoleClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  if (!(await assertAdmin(user.id))) {
    return NextResponse.json({ error: 'ليس لديك صلاحية' }, { status: 403 })
  }

  const parsed = weekSchema.safeParse(await request.json())
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0].message },
      { status: 400 }
    )
  }

  const { questions, exams, ...weekData } = parsed.data
  const { data: week, error: weekError } = await serviceClient
    .from('weeks')
    .insert({
      title: weekData.title,
      description: weekData.description || null,
      week_number: weekData.week_number,
      opens_at: weekData.opens_at,
      closes_at: weekData.closes_at || null,
      pdf_url: weekData.pdf_url || null,          // 👈 السطر ده جديد
      pdf_filename: weekData.pdf_filename || null, // 👈 والسطر ده جديد
      xp_reward_full: weekData.xp_reward_full,
      xp_reward_partial: weekData.xp_reward_partial,
      passing_score: weekData.passing_score,
      is_published: weekData.is_published,
      show_answers_after_close: weekData.show_answers_after_close,
      created_by: user.id,
    })
    .select()
    .single()

  if (weekError || !week) {
    console.error('Create week failed', weekError)
    return errorResponse('تعذر حفظ الأسبوع', 500, weekError?.message)
  }

  const examsToCreate = exams.length
    ? exams
    : questions.length
      ? [
        {
          title: 'امتحان الأسبوع',
          description: null,
          time_limit_minutes: null,
          opens_at: null,
          closes_at: null,
          xp_reward_full: week.xp_reward_full,
          xp_reward_partial: week.xp_reward_partial,
          passing_score: week.passing_score,
          is_published: true,
          display_order: 0,
          questions,
        },
      ]
      : []

  for (const examDraft of examsToCreate) {
    const { questions: examQuestions, ...examData } = examDraft
    const { data: exam, error: examError } = await serviceClient
      .from('exams')
      .insert({
        week_id: week.id,
        title: examData.title,
        description: examData.description || null,
        time_limit_minutes: examData.time_limit_minutes || null,
        opens_at: examData.opens_at || week.opens_at,
        closes_at: examData.closes_at || week.closes_at,
        xp_reward_full: examData.xp_reward_full,
        xp_reward_partial: examData.xp_reward_partial,
        passing_score: examData.passing_score,
        is_published: examData.is_published,
        display_order: examData.display_order,
      })
      .select()
      .single()

    if (examError || !exam) {
      console.error('Create exam failed', examError)
      await serviceClient.from('weeks').delete().eq('id', week.id)
      return errorResponse(
        'تم إلغاء الحفظ لأن أحد الامتحانات لم يتم حفظه',
        500,
        examError?.message
      )
    }

    if (!examQuestions.length) continue

    const { error: questionsError } = await serviceClient.from('questions').insert(
      examQuestions.map(question => ({
        question_text: question.question_text,
        question_type: question.question_type,
        options: question.options,
        correct_answer: question.correct_answer,
        explanation: question.explanation || null,
        points: question.points,
        display_order: question.display_order,
        week_id: week.id,
        exam_id: exam.id,
      }))
    )

    if (questionsError) {
      console.error('Create questions failed', questionsError)
      await serviceClient.from('weeks').delete().eq('id', week.id)
      return errorResponse(
        'تم إلغاء الحفظ لأن أسئلة أحد الامتحانات لم يتم حفظها',
        500,
        questionsError.message
      )
    }
  }

  return NextResponse.json({ success: true, week })
}