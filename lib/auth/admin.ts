import { createServiceRoleClient } from '@/lib/supabase/server'

export async function assertAdmin(userId: string) {
  const serviceClient = createServiceRoleClient()
  const { data: profile } = await serviceClient
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single()

  return profile?.role === 'admin'
}
