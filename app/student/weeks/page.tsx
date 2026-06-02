// app/(student)/weeks/page.tsx
// Server component — lists all available weeks with their status.

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect }                   from 'next/navigation'
import WeeksClient                    from './WeeksClient'

export default async function WeeksPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const [weeksResult, progressResult, submissionsResult] = await Promise.all([
    supabase
      .from('weeks')
      .select('*')
      .eq('is_published', true)
      .order('week_number'),

    supabase
      .from('weekly_progress')
      .select('*')
      .eq('student_id', user.id),

    supabase
      .from('exam_submissions')
      .select('week_id, score, xp_earned, is_graded')
      .eq('student_id', user.id)
      .eq('is_graded', true),
  ])

  return (
    <WeeksClient
      weeks={weeksResult.data        || []}
      progress={progressResult.data  || []}
      submissions={submissionsResult.data || []}
    />
  )
}
