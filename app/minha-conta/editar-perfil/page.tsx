'use client'

import { useEffect, useState } from 'react'
import { createClient } from '../../../lib/supabase-browser'
import Link from 'next/link'

export default function EditarPerfil() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState(false)
  const [perfil, setPerfil] = useState({ username: '', bio: '', instagram: '', tiktok: '', twitter: '' })
  const supabase = createClient()

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        window.location.href = '/'
        return
      }
      setUser(user)
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (data) {
        setPerfil({
          username: data.username || '',
          bio: data.bio || '',
          instagram: data.instagram || '',
          tiktok: data.tiktok || '',
          twitter: data.twitter || '',
        })
      }
      setLoading(false)
    }
    init()
  }, [])

  const gerarSlugUsername = (texto: string) => {
    return texto
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9-]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }

  const handleSalvar = async () => {
    setErro('')
    setSucesso(false)
    const usernameFormatado = gerarSlugUsername(perfil.username)
    if (!usernameFormatado) {
      setErro('O nome de usuário não pode ficar vazio.')
      return
    }
    setSalvando(true)

    const { error } = await supabase
      .from('profiles')
      .update({
        username: usernameFormatado,
        bio: perfil.bio || null,
        instagram: perfil.instagram || null,
        tiktok: perfil.tiktok || null,
        twitter: perfil.twitter || null,
      })
      .eq('id', user.id)

    if (error) {
      if (error.code === '23505') {
        setErro('Esse nome de usuário já está em uso. Tenta outro.')
      } else {
        setErro('Não foi possível salvar. Tenta de novo.')
      }
    } else {
      setPerfil({ ...perfil, username: usernameFormatado })
      setSucesso(true)
      setTimeout(() => setSucesso(false), 2500)
    }
    setSalvando(false)
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><p className="text-gray-400">Carregando...</p></div>

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="max-w-xl mx-auto flex items-center gap-3">
          <Link href={`/perfil/${perfil.username}`} className="text-sm text-gray-400 hover:text-gray-900">← Meu perfil</Link>
        </div>
      </header>

      <div className="max-w-xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Editar perfil</h1>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 space-y-5">
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">Nome de usuário</label>
            <div className="flex items-center border border-gray-200 rounded-xl px-4 py-3 focus-within:ring-2 focus-within:ring-gray-900">
              <span className="text-gray-400 text-sm mr-1">@</span>
              <input
                type="text"
                value={perfil.username}
                onChange={(e) => setPerfil({ ...perfil, username: e.target.value })}
                className="flex-1 text-sm text-gray-900 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">Bio</label>
            <textarea
              value={perfil.bio}
              onChange={(e) => setPerfil({ ...perfil, bio: e.target.value })}
              placeholder="Conte um pouco sobre você..."
              rows={3}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">Instagram (link completo)</label>
            <input
              type="text"
              value={perfil.instagram}
              onChange={(e) => setPerfil({ ...perfil, instagram: e.target.value })}
              placeholder="https://instagram.com/seu_usuario"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">TikTok (link completo)</label>
            <input
              type="text"
              value={perfil.tiktok}
              onChange={(e) => setPerfil({ ...perfil, tiktok: e.target.value })}
              placeholder="https://tiktok.com/@seu_usuario"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">X / Twitter (link completo)</label>
            <input
              type="text"
              value={perfil.twitter}
              onChange={(e) => setPerfil({ ...perfil, twitter: e.target.value })}
              placeholder="https://x.com/seu_usuario"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>

          {erro && <p className="text-xs text-red-500">{erro}</p>}
          {sucesso && <p className="text-xs text-green-600">Perfil atualizado ✓</p>}

          <button
            onClick={handleSalvar}
            disabled={salvando}
            className="w-full py-3 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            {salvando ? 'Salvando...' : 'Salvar alterações'}
          </button>
        </div>
      </div>
    </main>
  )
}