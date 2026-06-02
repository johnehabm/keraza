import { createServerSupabaseClient } from '@/lib/supabase/server'
import EditWeekClient from './EditWeekClient'

export default async function EditWeekPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  // فك الـ Promise عشان تجيب الـ id
  const { id } = await params

  const supabase = await createServerSupabaseClient()

  // جلب بيانات الأسبوع المحدد فقط باستخدام الـ id
  const { data: week } = await supabase
    .from('weeks')
    .select('*, exams(id, title, xp_reward_full, xp_reward_partial, passing_score, description), questions(*)')
    .eq('id', id)
    .single() // استخدمنا single عشان يجيب أسبوع واحد بس مش قائمة

  // تمرير البيانات بالأسماء اللي الـ Component طالبها بالظبط
  return <EditWeekClient initialData={week} weekId={id} />
}