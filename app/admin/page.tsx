import { createServerSupabaseClient } from '@/lib/supabase/server'
import AdminDashboardClient from './AdminDashboardClient'

export default async function AdminDashboardPage() {
  const supabase = await createServerSupabaseClient()

  const [studentsResult, weeksResult, submissionsResult] = await Promise.all([
    supabase
      .from('profiles')
      .select('id, full_name, phone, grade, church_name, total_xp, current_level, created_at, is_active')
      .eq('role', 'student')
      .order('created_at', { ascending: false }),
    supabase.from('weeks').select('*').order('week_number'),
    supabase
      .from('exam_submissions')
      .select('*, profiles(full_name, church_name), weeks(title, week_number)')
      .eq('is_graded', true)
      .order('submitted_at', { ascending: false })
      .limit(30),
  ])

  const students = (studentsResult.data || []) as any[]
  const weeks = (weeksResult.data || []) as any[]
  const submissions = (submissionsResult.data || []) as any[]
  const avgScore = submissions.length
    ? Math.round(
        submissions.reduce((total, submission) => total + (submission.score || 0), 0) /
          submissions.length
      )
    : 0

  return (
    <AdminDashboardClient
      stats={{
        totalStudents: students.length,
        activeStudents: students.filter(student => student.is_active).length,
        totalWeeks: weeks.length,
        totalSubmissions: submissions.length,
        avgScore,
      }}
      weeks={weeks}
      students={students}
      recentSubmissions={submissions}
    />
  )
}
