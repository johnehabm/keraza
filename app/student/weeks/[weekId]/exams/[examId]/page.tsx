import { notFound, redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import ExamClient from '../../exam/ExamClient'

interface Props {
  params: Promise<{ weekId: string; examId: string }>
}

export default async function ExamPage({ params }: Props) {
  const { weekId, examId } = await params
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: weekData } = await supabase
    .from('weeks')
    .select('*')
    .eq('id', weekId)
    .eq('is_published', true)
    .lte('opens_at', new Date().toISOString())
    .single()

  const week = weekData as any
  if (!week) notFound()

  const { data: examData } = await supabase
    .from('exams')
    .select('*')
    .eq('id', examId)
    .eq('week_id', weekId)
    .eq('is_published', true)
    .single()

  const exam = examData as any
  if (!exam) notFound()

  const { data: existingSubmissionData } = await supabase
    .from('exam_submissions')
    .select('*')
    .eq('student_id', user.id)
    .eq('exam_id', examId)
    .eq('is_graded', true)
    .maybeSingle()
  const existingSubmission = existingSubmissionData as any

  if (existingSubmission && !existingSubmission.can_retry) {
    redirect(`/student/weeks/${weekId}?already_submitted=true`)
  }

  const { data: questionsData } = await supabase
    .from('questions_safe')
    .select('id, week_id, question_text, question_type, options, points, display_order, explanation')
    .eq('exam_id', examId)
    .order('display_order')
  const questions = (questionsData || []) as any[]

  if (!questions?.length) notFound()

  return (
    <ExamClient
      week={{
        ...week,
        title: exam.title,
        passing_score: exam.passing_score,
        xp_reward_full: exam.xp_reward_full,
      }}
      examId={exam.id}
      questions={questions}
      existingSubmission={existingSubmission}
    />
  )
}
