'use client'

import { useEffect, useState } from 'react'
import { createClient } from '../../lib/supabase-browser'

export default function AuthButton() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
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
  }

  if (loading) return null

  if (user) {
    return (
      <div className="hidden md:flex items-center gap-4">
        <span className="text-sm text-gray-500">{user.user_metadata?.name?.split(' ')[0]}</span>
        <button onClick={handleLogout} className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
          Sair
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={handleLoginGoogle}
      className="hidden md:block text-sm bg-gray-900 text-white px-4 py-2 rounded-full hover:bg-gray-700 transition-colors"
    >
      Entrar
    </button>
  )
}