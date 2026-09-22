'use client'

import { useEffect, useState } from 'react'
import { createClient } from '../../lib/supabase-browser'
import Link from 'next/link'
import { isAdmin } from '../../lib/admin'

export default function AdminPage() {
  const [user, setUser] = useState<any>(null)
  const [ehAdmin, setEhAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setEhAdmin(await isAdmin(user?.email))
      setLoading(false)
    }
    init()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400">Carregando...</p>
      </div>
    )
  }

  if (!user || !ehAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-900 font-semibold mb-2">Acesso restrito</p>
          <p className="text-gray-400 text-sm mb-6">Email: {user?.email || 'não logado'}</p>
          <Link href="/" className="text-sm bg-gray-900 text-white px-6 py-3 rounded-full">
            Voltar ao início
          </Link>
        </div>
      </div>
    )
  }

  const secoes = [
    { href: '/admin/municipios', label: 'Municípios', emoji: '🏙️', descricao: 'Adicionar e editar municípios' },
    { href: '/admin/atrativos', label: 'Atrativos', emoji: '📍', descricao: 'Adicionar e editar atrativos' },
    { href: '/admin/roteiros', label: 'Roteiros', emoji: '🗺️', descricao: 'Criar e editar roteiros curados' },
  ]

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Turistech Admin</h1>
            <p className="text-xs text-gray-400">{user.email}</p>
          </div>
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
            Ver site →
          </Link>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-10">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">Painel de controle</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {secoes.map((secao) => (
            <Link
              key={secao.href}
              href={secao.href}
              className="bg-white rounded-2xl p-6 border border-gray-100 hover:border-gray-300 transition-colors"
            >
              <span className="text-4xl mb-4 block">{secao.emoji}</span>
              <p className="font-semibold text-gray-900">{secao.label}</p>
              <p className="text-sm text-gray-400 mt-1">{secao.descricao}</p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  )
}