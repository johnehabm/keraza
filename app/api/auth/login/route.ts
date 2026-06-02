import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createServerSupabaseClient } from '@/lib/supabase/server'

const loginSchema = z.object({
  phone: z.string().regex(/^01[0-9]{9}$/, 'رقم الهاتف غير صحيح'),
  password: z.string().min(1, 'أدخل كلمة المرور'),
})

const loginAttempts = new Map<string, { count: number; resetAt: number }>()

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'local'
    const existingAttempts = loginAttempts.get(ip)

    if (
      existingAttempts &&
      existingAttempts.count >= 5 &&
      existingAttempts.resetAt > Date.now()
    ) {
      return NextResponse.json(
        { error: 'محاولات كثيرة جدا. انتظر 15 دقيقة وحاول مرة أخرى' },
        { status: 429 }
      )
    }

    const parsed = loginSchema.safeParse(await request.json())
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      )
    }

    const supabase = await createServerSupabaseClient()
    const { phone, password } = parsed.data

    const { data, error } = await supabase.auth.signInWithPassword({
      email: `${phone}@keraza.internal`,
      password,
    })

    if (error) {
      const current =
        existingAttempts || { count: 0, resetAt: Date.now() + 15 * 60 * 1000 }
      loginAttempts.set(ip, {
        count: current.count + 1,
        resetAt: current.resetAt,
      })

      return NextResponse.json(
        { error: 'رقم الهاتف أو كلمة المرور غير صحيحة' },
        { status: 401 }
      )
    }

    const { data: profileData } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single()
    const profile = profileData as { role?: 'student' | 'admin' } | null

    loginAttempts.delete(ip)
    return NextResponse.json({
      success: true,
      user: data.user,
      role: profile?.role || 'student',
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'unknown error'
    return NextResponse.json(
      { error: `حدث خطأ أثناء الاتصال بـ Supabase: ${message}` },
      { status: 500 }
    )
  }
}
