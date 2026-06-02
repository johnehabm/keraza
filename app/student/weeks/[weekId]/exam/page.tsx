import { notFound, redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'

interface Props {
  params: Promise<{ weekId: string }>
}

export default async function ExamPage({ params }: Props) {
  const { weekId } = await params
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: week } = await supabase
    .from('weeks')
    .select('*')
    .eq('id', weekId)
    .eq('is_published', true)
    .lte('opens_at', new Date().toISOString())
    .single()

  if (!week) notFound()

  const { data: firstExamData } = await supabase
    .from('exams')
    .select('id')
    .eq('week_id', weekId)
    .eq('is_published', true)
    .order('display_order')
    .limit(1)
    .maybeSingle()
  const firstExam = firstExamData as { id: string } | null

  if (!firstExam) notFound()
  redirect(`/student/weeks/${weekId}/exams/${firstExam.id}`)
}
