'use client'

import { useState } from 'react'
import { Key, Search } from 'lucide-react'

export default function StudentsClient({ initialStudents }: { initialStudents: any[] }) {
    const [searchQuery, setSearchQuery] = useState('')

    // فلترة الطلاب بناءً على مربع البحث (بالاسم أو التليفون)
    const filteredStudents = initialStudents.filter(student =>
        student.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.phone?.includes(searchQuery)
    )

    async function handleResetPassword(studentId: string, studentName: string) {
        const newPassword = prompt(`أدخل كلمة المرور الجديدة للطالب (${studentName}):\n(يجب أن تكون 6 أحرف أو أرقام على الأقل)`)

        if (!newPassword) return

        if (newPassword.length < 6) {
            alert('كلمة المرور قصيرة جداً!')
            return
        }

        try {
            const response = await fetch(`/api/admin/students/${studentId}/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ newPassword }),
            })

            if (response.ok) {
                alert('تم تغيير كلمة المرور بنجاح! وتقدر تبلغ الطالب بيها.')
            } else {
                const data = await response.json()
                alert('خطأ: ' + data.error)
            }
        } catch (error) {
            alert('تعذر الاتصال بالخادم')
        }
    }

    return (
        <main dir="rtl" style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f0c29 0%, #1a1040 45%, #0d1b3e 100%)', color: '#e2e8f0', fontFamily: "'Cairo', 'Segoe UI', sans-serif", padding: '28px 20px' }}>
            <section style={{ maxWidth: 1120, margin: '0 auto' }}>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22, flexWrap: 'wrap', gap: 14 }}>
                    <h1 style={{ margin: 0, fontSize: 30 }}>إدارة الطلاب ({initialStudents.length})</h1>

                    {/* مربع البحث */}
                    <div style={{ position: 'relative', width: '100%', maxWidth: 320 }}>
                        <Search size={18} style={{ position: 'absolute', right: 14, top: 12, color: 'rgba(255,255,255,0.5)' }} />
                        <input
                            type="text"
                            placeholder="ابحث بالاسم أو رقم التليفون..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{ width: '100%', padding: '10px 40px 10px 14px', borderRadius: 14, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: 'white', outline: 'none', fontFamily: 'inherit' }}
                        />
                    </div>
                </div>

                <div style={{ overflow: 'auto', borderRadius: 18, border: '1px solid rgba(255,255,255,0.1)' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', background: 'rgba(255,255,255,0.05)' }}>
                        <thead>
                            <tr style={{ background: 'rgba(255,255,255,0.06)' }}>
                                {['الاسم', 'الهاتف', 'الصف', 'الكنيسة', 'XP', 'المستوى', 'الحالة', 'إجراءات'].map(head => (
                                    <th key={head} style={{ padding: 14, textAlign: 'right', whiteSpace: 'nowrap' }}>{head}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filteredStudents.map(student => (
                                <tr key={student.id} style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                                    <td style={{ padding: 14 }}>{student.full_name}</td>
                                    <td style={{ padding: 14, direction: 'ltr', textAlign: 'right' }}>{student.phone}</td>
                                    <td style={{ padding: 14 }}>{student.grade}</td>
                                    <td style={{ padding: 14 }}>{student.church_name}</td>
                                    <td style={{ padding: 14, color: '#a78bfa', fontWeight: 800 }}>{student.total_xp}</td>
                                    <td style={{ padding: 14 }}>{student.current_level}</td>
                                    <td style={{ padding: 14, color: student.is_active ? '#10b981' : '#f59e0b' }}>{student.is_active ? 'نشط' : 'موقوف'}</td>

                                    {/* زرار تغيير الباسورد الجديد */}
                                    <td style={{ padding: 14 }}>
                                        <button
                                            onClick={() => handleResetPassword(student.id, student.full_name)}
                                            style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5', padding: '6px 12px', borderRadius: 8, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', display: 'inline-flex', alignItems: 'center', gap: 6 }}
                                        >
                                            <Key size={14} /> باسورد
                                        </button>
                                    </td>
                                </tr>
                            ))}

                            {filteredStudents.length === 0 && (
                                <tr>
                                    <td colSpan={8} style={{ padding: 30, textAlign: 'center', color: 'rgba(255,255,255,0.5)' }}>
                                        لا يوجد طلاب مطابقين للبحث.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </section>
        </main>
    )
}