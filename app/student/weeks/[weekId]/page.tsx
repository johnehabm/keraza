import { notFound, redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import WeekDetailClient from './WeekDetailClient'

interface Props {
  params: Promise<{ weekId: string }>
  searchParams: Promise<{ already_submitted?: string }>
}

export default async function WeekDetailPage({ params, searchParams }: Props) {
  const { weekId } = await params
  const query = await searchParams
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
    .single()

  const week = weekData as any
  if (!week) notFound()

  const isOpen = new Date(week.opens_at) <= new Date()

  const { data: submissionData } = await supabase
    .from('exam_submissions')
    .select('*')
    .eq('student_id', user.id)
    .eq('week_id', weekId)
    .eq('is_graded', true)

  const { data: examsData } = await supabase
    .from('exams')
    .select('*')
    .eq('week_id', weekId)
    .eq('is_published', true)
    .order('display_order')

  if (isOpen) {
    await supabase.from('weekly_progress').upsert({
      student_id: user.id,
      week_id: weekId,
      pdf_viewed: true,
      pdf_viewed_at: new Date().toISOString(),
    } as any)
  }

  return (
    <WeekDetailClient
      week={week}
      submissions={(submissionData || []) as any[]}
      exams={(examsData || []) as any[]}
      isOpen={isOpen}
      alreadySubmitted={query.already_submitted === 'true'}
    />
  )
}
