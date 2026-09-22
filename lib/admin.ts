import { createClient } from './supabase-browser'

export async function isAdmin(email?: string | null): Promise<boolean> {
  if (!email) return false
  const supabase = createClient()
  const { data } = await supabase.rpc('is_admin', { user_email: email })
  return !!data
}

export async function isMasterAdmin(email?: string | null): Promise<boolean> {
  if (!email) return false
  const supabase = createClient()
  const { data } = await supabase.rpc('is_master_admin', { user_email: email })
  return !!data
}