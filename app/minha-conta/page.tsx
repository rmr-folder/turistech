'use client'

import { useEffect, useState } from 'react'
import { createClient } from '../../lib/supabase-browser'
import Link from 'next/link'

const ADMIN_EMAIL = 'renanriado@gmail.com'

export default function MinhaConta() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }
    init()
  }, [])

  const handleLoginGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` }
    })
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-400">Carregando...</p>
    </div>
  )

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-xl font-bold text-gray-900">Minha conta</h1>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-10">
        {!user ? (
          <div className="bg-white rounded-2xl p-8 border border-gray-100 text-center">
            <p className="text-gray-500 mb-6">Entre para salvar roteiros e personalizar sua experiência.</p>
            <button
              onClick={handleLoginGoogle}
              className="w-full py-3 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-gray-700 transition-colors"
            >
              Entrar com Google
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Perfil */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100">
              <div className="flex items-center gap-4">
                {user.user_metadata?.avatar_url && (
                  <img
                    src={user.user_metadata.avatar_url}
                    alt={user.user_metadata.name}
                    className="w-14 h-14 rounded-full"
                  />
                )}
                <div>
                  <p className="font-semibold text-gray-900">{user.user_metadata?.name}</p>
                  <p className="text-sm text-gray-400">{user.email}</p>
                </div>
              </div>
            </div>

            {/* Admin */}
            {user.email === ADMIN_EMAIL && (
              <Link
                href="/admin"
                className="flex items-center justify-between bg-gray-900 text-white rounded-2xl p-5"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">⚙️</span>
                  <div>
                    <p className="font-semibold">Painel Admin</p>
                    <p className="text-xs text-gray-400">Gerenciar conteudo da plataforma</p>
                  </div>
                </div>
                <span className="text-gray-400">→</span>
              </Link>
            )}

            {/* Meus Roteiros */}
            <Link
              href="/meus-roteiros"
              className="flex items-center justify-between bg-white rounded-2xl p-5 border border-gray-100 hover:border-gray-300 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">🗺️</span>
                <div>
                  <p className="font-semibold text-gray-900">Meus Roteiros</p>
                  <p className="text-xs text-gray-400">Ver e gerenciar seus roteiros</p>
                </div>
              </div>
              <span className="text-gray-400">→</span>
            </Link>

            {/* Sair */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-between bg-white rounded-2xl p-5 border border-gray-100 hover:border-red-200 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">👋</span>
                <p className="font-semibold text-gray-900">Sair</p>
              </div>
              <span className="text-gray-400">→</span>
            </button>
          </div>
        )}
      </div>
    </main>
  )
}