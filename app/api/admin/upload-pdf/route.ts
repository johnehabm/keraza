import { NextRequest, NextResponse } from 'next/server'
import {
  createServerSupabaseClient,
  createServiceRoleClient,
} from '@/lib/supabase/server'
import { assertAdmin } from '@/lib/auth/admin'

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

  const formData = await request.formData()
  const file = formData.get('file') as File | null
  const weekId = formData.get('weekId') as string | null

  if (!file || !weekId) {
    return NextResponse.json({ error: 'بيانات ناقصة' }, { status: 400 })
  }

  if (file.type !== 'application/pdf') {
    return NextResponse.json(
      { error: 'يجب أن يكون الملف PDF فقط' },
      { status: 400 }
    )
  }

  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json(
      { error: 'حجم الملف يجب أن يكون أقل من 10 ميجابايت' },
      { status: 400 }
    )
  }

  const fileName = `weeks/${weekId}/${Date.now()}-${file.name}`
  const { error: uploadError } = await serviceClient.storage
    .from('pdfs')
    .upload(fileName, await file.arrayBuffer(), {
      contentType: 'application/pdf',
      upsert: true,
    })

  if (uploadError) {
    return NextResponse.json(
      { error: 'خطأ في رفع الملف' },
      { status: 500 }
    )
  }

  const { data: urlData } = serviceClient.storage.from('pdfs').getPublicUrl(fileName)

  await serviceClient
    .from('weeks')
    .update({ pdf_url: urlData.publicUrl, pdf_filename: file.name })
    .eq('id', weekId)

  return NextResponse.json({ success: true, url: urlData.publicUrl })
}
