'use client'

import { useEffect, useState } from 'react'
import { createClient } from '../../lib/supabase-browser'

interface Props {
  roteiroId: string
}

export default function SalvarRoteiroButton({ roteiroId }: Props) {
  const [user, setUser] = useState<any>(null)
  const [salvo, setSalvo] = useState(false)
  const [carregando, setCarregando] = useState(true)
  const [processando, setProcessando] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      if (user) {
        const { data } = await supabase
          .from('roteiros_salvos')
          .select('id')
          .eq('user_id', user.id)
          .eq('roteiro_id', roteiroId)
          .maybeSingle()
        setSalvo(!!data)
      }
      setCarregando(false)
    }
    init()
  }, [roteiroId])

  const handleToggle = async () => {
    if (!user) {
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/auth/callback` }
      })
      return
    }
    setProcessando(true)
    if (salvo) {
      await supabase.from('roteiros_salvos').delete().eq('user_id', user.id).eq('roteiro_id', roteiroId)
      setSalvo(false)
    } else {
      await supabase.from('roteiros_salvos').insert({ user_id: user.id, roteiro_id: roteiroId })
      setSalvo(true)
    }
    setProcessando(false)
  }

  if (carregando) return null

  return (
    <button
      onClick={handleToggle}
      disabled={processando}
      className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
        salvo ? 'bg-white text-gray-900' : 'bg-white/20 backdrop-blur-sm text-white hover:bg-white/30'
      }`}
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={salvo ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" className="w-4 h-4">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
      </svg>
      {salvo ? 'Salvo' : 'Salvar'}
    </button>
  )
}