import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient, createServiceRoleClient } from '@/lib/supabase/server'
import { assertAdmin } from '@/lib/auth/admin'

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createServerSupabaseClient()
    const serviceClient = createServiceRoleClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    if (!(await assertAdmin(user.id))) return NextResponse.json({ error: 'ليس لديك صلاحية' }, { status: 403 })

    const data = await request.json()
    const weekId = params.id

    const { error: weekError } = await serviceClient
      .from('weeks')
      .update({
        title: data.title,
        description: data.description || null,
        week_number: data.week_number,
        opens_at: data.opens_at,
        closes_at: data.closes_at || null,
        pdf_url: data.pdf_url || null,
        pdf_filename: data.pdf_filename || null,
        is_published: data.is_published,
      })
      .eq('id', weekId)

    if (weekError) throw weekError

    if (data.exams && Array.isArray(data.exams)) {
      for (let i = 0; i < data.exams.length; i++) {
        const exam = data.exams[i]
        let currentExamId = exam.id

        if (currentExamId) {
          await serviceClient.from('exams').update({
            title: exam.title,
            description: exam.description || null,
            xp_reward_full: exam.xp_reward_full,
            xp_reward_partial: exam.xp_reward_partial,
            passing_score: exam.passing_score,
            display_order: i
          }).eq('id', currentExamId)
        } else {
          const { data: newExam, error: examInsertError } = await serviceClient.from('exams').insert({
            week_id: weekId,
            title: exam.title,
            description: exam.description || null,
            xp_reward_full: exam.xp_reward_full,
            xp_reward_partial: exam.xp_reward_partial,
            passing_score: exam.passing_score,
            display_order: i
          }).select().single()
          if (examInsertError) throw examInsertError
          currentExamId = newExam.id
        }

        if (exam.questions && Array.isArray(exam.questions) && currentExamId) {
          for (let j = 0; j < exam.questions.length; j++) {
            const q = exam.questions[j]
            const questionData = {
              week_id: weekId,
              exam_id: currentExamId,
              question_text: q.question_text,
              question_type: q.question_type,
              options: q.options,
              correct_answer: q.correct_answer,
              explanation: q.explanation || null,
              points: q.points,
              display_order: j,
            }

            if (q.id) {
              await serviceClient.from('questions').update(questionData).eq('id', q.id)
            } else {
              await serviceClient.from('questions').insert(questionData)
            }
          }
        }
      }
    }
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Update Error:', error)
    return NextResponse.json({ error: error.message || 'حدث خطأ أثناء التحديث' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createServerSupabaseClient()
    const serviceClient = createServiceRoleClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    if (!(await assertAdmin(user.id))) return NextResponse.json({ error: 'ليس لديك صلاحية' }, { status: 403 })

    const { error } = await serviceClient
      .from('weeks')
      .delete()
      .eq('id', params.id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Delete Error:', error)
    return NextResponse.json({ error: error.message || 'حدث خطأ أثناء الحذف' }, { status: 500 })
  }
}