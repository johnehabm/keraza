import { createServerSupabaseClient } from '@/lib/supabase/server'
import AdminWeeksClient from './AdminWeeksClient'

export default async function AdminWeeksPage() {
  const supabase = await createServerSupabaseClient()
  const { data: weeks } = await supabase
    .from('weeks')
    .select('*, exams(id, title), questions(id)')
    .order('week_number')

  return <AdminWeeksClient weeks={weeks || []} />
}