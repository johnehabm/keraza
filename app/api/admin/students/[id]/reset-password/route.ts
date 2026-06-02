import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient, createServiceRoleClient } from '@/lib/supabase/server'
import { assertAdmin } from '@/lib/auth/admin'

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    // فك الـ Promise عشان تجيب الـ id
    const { id } = await params;

    try {
        const supabase = await createServerSupabaseClient()
        const serviceClient = createServiceRoleClient()
        const { data: { user } } = await supabase.auth.getUser()

        // 1. التأكد إن اللي بيعمل الطلب ده هو الأدمن
        if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
        if (!(await assertAdmin(user.id))) return NextResponse.json({ error: 'ليس لديك صلاحية' }, { status: 403 })

        const { newPassword } = await request.json()

        // 2. تحديث الباسورد باستخدام صلاحيات الأدمن القصوى
        // هنا تم التعديل: استخدمنا id بدل params.id
        const { data, error } = await serviceClient.auth.admin.updateUserById(
            id,
            { password: newPassword }
        )

        if (error) throw error

        return NextResponse.json({ success: true })
    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'حدث خطأ أثناء التحديث' }, { status: 500 })
    }
}