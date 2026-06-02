import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import {
  createServerSupabaseClient,
  createServiceRoleClient,
} from '@/lib/supabase/server'
import { assertAdmin } from '@/lib/auth/admin'

const schema = z.object({
  studentId: z.string().uuid(),
  badgeId: z.string().uuid(),
})

export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const serviceClient = createServiceRoleClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  if (!(await assertAdmin(user.id))) {
    return NextResponse.json({ error: 'ليس لديك صلاحية' }, { status: 403 })
  }

  const parsed = schema.safeParse(await request.json())
  if (!parsed.success) {
    return NextResponse.json({ error: 'بيانات غير صحيحة' }, { status: 400 })
  }

  const { error } = await serviceClient.from('student_badges').upsert({
    student_id: parsed.data.studentId,
    badge_id: parsed.data.badgeId,
    granted_by_admin: user.id,
  })

  if (error) {
    return NextResponse.json({ error: 'تعذر منح الشارة' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
