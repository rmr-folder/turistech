'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '../../lib/supabase-browser'
import { isAdmin } from '../../lib/admin'

export default function AccountPanel() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [aberto, setAberto] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }
    getUser()

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => authListener.subscription.unsubscribe()
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
    setAberto(false)
  }

  if (loading) return null

  if (!user) {
    return (
      <button
        onClick={handleLoginGoogle}
        className="text-sm bg-gray-900 text-white px-4 py-2 rounded-full hover:bg-gray-700 transition-colors flex-shrink-0"
      >
        Entrar
      </button>
    )
  }

  const iniciais = user.user_metadata?.name
    ?.split(' ')
    .slice(0, 2)
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()

  return (
    <>
      <button
        onClick={() => setAberto(true)}
        className="w-9 h-9 rounded-full overflow-hidden bg-gray-900 flex items-center justify-center flex-shrink-0"
      >
        {user.user_metadata?.avatar_url ? (
          <img
            src={user.user_metadata.avatar_url}
            alt={user.user_metadata?.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-white text-xs font-semibold">{iniciais}</span>
        )}
      </button>

      {aberto && (
        <div className="fixed inset-0 z-[60]">
          <div className="absolute inset-0 bg-black/40" onClick={() => setAberto(false)} />
          <div className="absolute top-0 right-0 h-full w-full max-w-sm bg-white shadow-xl p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-lg font-semibold text-gray-900">Conta</h2>
              <button
                onClick={() => setAberto(false)}
                className="text-gray-400 hover:text-gray-900 text-xl leading-none"
              >
                ✕
              </button>
            </div>

            <div className="flex items-center gap-4 mb-8">
              {user.user_metadata?.avatar_url && (
                <img
                  src={user.user_metadata.avatar_url}
                  alt={user.user_metadata?.name}
                  className="w-14 h-14 rounded-full"
                />
              )}
              <div>
                <p className="font-semibold text-gray-900">{user.user_metadata?.name}</p>
                <p className="text-sm text-gray-400">{user.email}</p>
              </div>
            </div>

            <div className="space-y-3">
              {isAdmin(user.email) && (
                <Link
                  href="/admin"
                  className="flex items-center justify-between bg-gray-900 text-white rounded-2xl p-4"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">⚙️</span>
                    <span className="font-medium text-sm">Painel Admin</span>
                  </div>
                  <span className="text-gray-400">→</span>
                </Link>
              )}

              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-between bg-white rounded-2xl p-4 border border-gray-100 hover:border-red-200 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">👋</span>
                  <span className="font-medium text-sm text-gray-900">Sair</span>
                </div>
                <span className="text-gray-400">→</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}