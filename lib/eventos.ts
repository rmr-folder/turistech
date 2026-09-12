import { createClient } from './supabase-browser'

export async function registrarEvento(
  tipo: string,
  entidade?: string,
  entidade_id?: string,
  metadata?: Record<string, any>
) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    await supabase.from('eventos').insert({
      user_id: user?.id || null,
      tipo,
      entidade,
      entidade_id,
      metadata,
    })
  } catch (e) {
    // Silencioso — não interrompe a experiência do usuário
  }
}