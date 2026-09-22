import { createClient } from './supabase-browser'

type Acao = 'criar' | 'editar' | 'deletar'
type Tabela = 'atrativos' | 'municipios' | 'roteiros'

export async function registrarLogAdmin(
  adminEmail: string,
  acao: Acao,
  tabela: Tabela,
  registroId: string,
  detalhes?: Record<string, any>
) {
  const supabase = createClient()
  await supabase.from('admin_logs').insert({
    admin_email: adminEmail,
    acao,
    tabela,
    registro_id: registroId,
    detalhes: detalhes || null,
  })
}