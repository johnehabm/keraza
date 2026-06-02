import { createServerSupabaseClient } from '@/lib/supabase/server'
import AdminWeeksClient from './AdminWeeksClient'

// تعديل هنا: خلي الـ params عبارة عن Promise
export default async function AdminWeeksPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  // فك الـ Promise عشان تجيب الـ id
  const { id } = await params

  const supabase = await createServerSupabaseClient()

  // استخدم الـ id اللي جبناه من الـ params
  const { data: weeks } = await supabase
    .from('weeks')
    .select('*, exams(id, title), questions(id)')
    .order('week_number')

  return <AdminWeeksClient weeks={weeks || []} />
}