'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '../../lib/supabase-browser'

interface Props {
  perfilId: string
}

export default function SeguirButton({ perfilId }: Props) {
  const [user, setUser] = useState<any>(null)
  const [seguindo, setSeguindo] = useState(false)
  const [carregando, setCarregando] = useState(true)
  const [processando, setProcessando] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      if (user && user.id !== perfilId) {
        const { data } = await supabase
          .from('seguidores')
          .select('id')
          .eq('follower_id', user.id)
          .eq('following_id', perfilId)
          .maybeSingle()
        setSeguindo(!!data)
      }
      setCarregando(false)
    }
    init()
  }, [perfilId])

  const handleToggle = async () => {
    if (!user) {
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/auth/callback` }
      })
      return
    }
    setProcessando(true)
    if (seguindo) {
      await supabase.from('seguidores').delete().eq('follower_id', user.id).eq('following_id', perfilId)
      setSeguindo(false)
    } else {
      await supabase.from('seguidores').insert({ follower_id: user.id, following_id: perfilId })
      setSeguindo(true)
    }
    setProcessando(false)
  }

  if (carregando) return null

  if (user && user.id === perfilId) {
    return (
      <Link
        href="/minha-conta/editar-perfil"
        className="text-sm font-medium px-5 py-2 rounded-full border border-gray-200 text-gray-600 hover:border-gray-400 transition-colors flex-shrink-0"
      >
        Editar perfil
      </Link>
    )
  }

  return (
    <button
      onClick={handleToggle}
      disabled={processando}
      className={`text-sm font-medium px-5 py-2 rounded-full transition-colors flex-shrink-0 ${
        seguindo ? 'border border-gray-200 text-gray-600 hover:border-red-300 hover:text-red-500' : 'bg-gray-900 text-white hover:bg-gray-700'
      }`}
    >
      {seguindo ? 'Seguindo' : 'Seguir'}
    </button>
  )
}