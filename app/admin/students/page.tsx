import { createServerSupabaseClient } from '@/lib/supabase/server'
import StudentsClient from './StudentsClient'

export default async function AdminStudentsPage() {
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase
    .from('profiles')
    .select('id, full_name, phone, grade, church_name, total_xp, current_level, is_active')
    .eq('role', 'student')
    .order('total_xp', { ascending: false })
  const students = (data || []) as any[]

  return <StudentsClient initialStudents={students} />
}