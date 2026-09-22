'use client'

import { useEffect, useState } from 'react'
import { createClient } from '../../../lib/supabase-browser'
import Link from 'next/link'
import { isAdmin, isMasterAdmin } from '../../../lib/admin'

const ACAO_LABEL: Record<string, string> = {
  criar: 'Criou',
  editar: 'Editou',
  deletar: 'Deletou',
}

const ACAO_COR: Record<string, string> = {
  criar: 'bg-green-100 text-green-700',
  editar: 'bg-blue-100 text-blue-700',
  deletar: 'bg-red-100 text-red-700',
}

const TABELA_LABEL: Record<string, string> = {
  atrativos: 'Atrativo',
  municipios: 'Município',
  roteiros: 'Roteiro',
}

export default function AdminLogs() {
  const [loading, setLoading] = useState(true)
  const [logs, setLogs] = useState<any[]>([])
  const supabase = createClient()

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || !(await isAdmin(user.email))) {
        window.location.href = '/'
        return
      }
      await carregarLogs()
    }
    init()
  }, [])

  const carregarLogs = async () => {
    const { data } = await supabase
      .from('admin_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200)
    setLogs(data || [])
    setLoading(false)
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><p className="text-gray-400">Carregando...</p></div>

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <Link href="/admin" className="text-sm text-gray-400 hover:text-gray-900">← Admin</Link>
          <span className="text-gray-200">/</span>
          <h1 className="text-lg font-bold text-gray-900">Registro de edições</h1>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-10">
        {logs.length === 0 ? (
          <p className="text-gray-400 text-center py-20">Nenhuma edição registrada ainda.</p>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="divide-y divide-gray-50">
              {logs.map((log) => (
                <div key={log.id} className="px-6 py-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${ACAO_COR[log.acao]}`}>
                      {ACAO_LABEL[log.acao] || log.acao}
                    </span>
                    <span className="text-xs text-gray-400">{TABELA_LABEL[log.tabela] || log.tabela}</span>
                  </div>
                  <p className="text-sm text-gray-900">
                    {log.detalhes?.nome || log.detalhes?.titulo || log.registro_id}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {log.admin_email} · {new Date(log.created_at).toLocaleString('pt-BR')}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}