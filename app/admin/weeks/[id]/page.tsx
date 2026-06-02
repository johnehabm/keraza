import { createServerSupabaseClient } from '@/lib/supabase/server'
import EditWeekClient from './EditWeekClient'
import { notFound } from 'next/navigation'

export default async function EditWeekPage({ params }: { params: { id: string } }) {
    const supabase = await createServerSupabaseClient()

    // جلب بيانات الأسبوع مع الامتحانات والأسئلة الخاصة به
    const { data: week } = await supabase
        .from('weeks')
        .select(`
      *,
      exams (
        *,
        questions (*)
      )
    `)
        .eq('id', params.id)
        .single()

    // لو الـ ID غلط أو الأسبوع ممسوح، رجع صفحة 404
    if (!week) {
        notFound()
    }

    return <EditWeekClient initialData={week} weekId={params.id} />
}