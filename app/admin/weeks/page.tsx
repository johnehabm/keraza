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
async function handleDeleteWeek(weekId: string, weekTitle: string) {
  if (!confirm(`هل أنت متأكد من حذف الأسبوع "${weekTitle}"؟ هذا الإجراء لا يمكن التراجع عنه!`)) {
    return
  }

  try {
    const response = await fetch(`/api/admin/weeks/${weekId}`, {
      method: 'DELETE',
    })

    if (response.ok) {
      alert('تم حذف الأسبوع بنجاح!')
      window.location.reload() // عشان يعمل تحديث للقائمة
    } else {
      alert('حدث خطأ أثناء الحذف')
    }
  } catch (error) {
    alert('تعذر الاتصال بالخادم')
  }
}
<button
  onClick={() => handleDeleteWeek(week.id, week.title)}
  style={{
    background: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.2)',
    color: '#f87171',
    padding: '6px 12px',
    borderRadius: 8,
    cursor: 'pointer'
  }}
>
  حذف
</button>