import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createServiceRoleClient } from '@/lib/supabase/server'

const registerSchema = z.object({
  fullName: z.string().min(3, 'الاسم يجب أن يكون 3 أحرف على الأقل'),
  phone: z.string().regex(/^01[0-9]{9}$/, 'رقم الهاتف غير صحيح'),
  grade: z.string().min(1, 'اختر الصف الدراسي'),
  churchName: z.string().min(2, 'أدخل اسم الكنيسة'),
  password: z.string().min(8, 'كلمة المرور يجب أن تكون 8 أحرف على الأقل'),
})

export async function POST(request: NextRequest) {
  try {
    const data = registerSchema.parse(await request.json())
    const supabase = createServiceRoleClient()

    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('phone', data.phone)
      .maybeSingle()

    if (existingProfile) {
      return NextResponse.json(
        { error: 'رقم الهاتف مسجل بالفعل' },
        { status: 400 }
      )
    }

    const email = `${data.phone}@keraza.internal`
    const { data: authData, error: authError } =
      await supabase.auth.admin.createUser({
        email,
        password: data.password,
        email_confirm: true,
        user_metadata: {
          full_name: data.fullName,
          phone: data.phone,
          grade: data.grade,
          church_name: data.churchName,
        },
      })

    if (authError || !authData.user) {
      return NextResponse.json(
        { error: authError?.message || 'تعذر إنشاء المستخدم' },
        { status: 400 }
      )
    }

    const { error: profileError } = await supabase.from('profiles').insert({
      id: authData.user.id,
      full_name: data.fullName,
      phone: data.phone,
      grade: data.grade,
      class_name: data.grade,
      church_name: data.churchName,
      role: data.phone === process.env.ADMIN_PHONE ? 'admin' : 'student',
    })

    if (profileError) {
      await supabase.auth.admin.deleteUser(authData.user.id)
      return NextResponse.json(
        {
          error: `تم إنشاء الحساب لكن تعذر حفظ بيانات الطالب: ${profileError.message}`,
        },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, userId: authData.user.id })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }

    const message = error instanceof Error ? error.message : 'unknown error'
    return NextResponse.json(
      { error: `حدث خطأ أثناء الاتصال بـ Supabase: ${message}` },
      { status: 500 }
    )
  }
}
