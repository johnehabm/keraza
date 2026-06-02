import { redirect } from 'next/navigation'
import DashboardClient from './DashboardClient'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const now = new Date().toISOString()

  const [
    profileResult,
    weeksResult,
    submissionsResult,
    badgesResult,
    notificationsResult,
    leaderboardResult,
  ] = (await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase
      .from('weeks')
      .select('*')
      .eq('is_published', true)
      .lte('opens_at', now)
      .order('week_number'),
    supabase
      .from('exam_submissions')
      .select('*, weeks(title, week_number)')
      .eq('student_id', user.id)
      .eq('is_graded', true)
      .order('submitted_at', { ascending: false }),
    supabase
      .from('student_badges')
      .select('*, badges(*)')
      .eq('student_id', user.id)
      .order('earned_at', { ascending: false }),
    supabase
      .from('notifications')
      .select('*')
      .or(`student_id.eq.${user.id},student_id.is.null`)
      .order('created_at', { ascending: false })
      .limit(10),
    supabase
      .from('profiles')
      .select('full_name, church_name, total_xp, current_level')
      .eq('role', 'student')
      .eq('is_active', true)
      .order('total_xp', { ascending: false })
      .limit(10),
  ])) as any[]

  if (!profileResult.data) redirect('/auth/login')

  const leaderboardData = (leaderboardResult.data || []) as any[]
  const leaderboard =
    leaderboardData.map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }))

  return (
    <DashboardClient
      profile={profileResult.data}
      weeks={weeksResult.data || []}
      submissions={submissionsResult.data || []}
      badges={badgesResult.data || []}
      notifications={notificationsResult.data || []}
      leaderboard={leaderboard}
    />
  )
}
