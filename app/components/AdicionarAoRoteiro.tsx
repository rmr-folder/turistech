'use client'

import { useEffect, useState } from 'react'
import { createClient } from '../../lib/supabase-browser'

interface Props {
  atrativoId: string
  atrativoNome: string
}

export default function AdicionarAoRoteiro({ atrativoId, atrativoNome }: Props) {
  const [user, setUser] = useState<any>(null)
  const [aberto, setAberto] = useState(false)
  const [roteiros, setRoteiros] = useState<any[]>([])
  const [novoNome, setNovoNome] = useState('')
  const [criandoNovo, setCriandoNovo] = useState(false)
  const [sucesso, setSucesso] = useState('')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()
  }, [])

  const carregarRoteiros = async () => {
    const { data } = await supabase
      .from('roteiros')
      .select('*')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false })
    setRoteiros(data || [])
  }

  const handleAbrir = async () => {
    if (!user) {
      alert('Faça login para adicionar atrativos ao seu roteiro!')
      return
    }
    await carregarRoteiros()
    setAberto(true)
  }

  const handleAdicionarAoRoteiro = async (roteiroId: string) => {
    setLoading(true)
    const { error } = await supabase
      .from('roteiro_atrativos')
      .insert({
        roteiro_id: roteiroId,
        atrativo_id: atrativoId,
        dia: 1,
        ordem: 1
      })

    if (error) {
      alert('Atrativo já está neste roteiro!')
    } else {
      setSucesso('Adicionado com sucesso!')
      setTimeout(() => {
        setSucesso('')
        setAberto(false)
      }, 1500)
    }
    setLoading(false)
  }

  const handleCriarRoteiro = async () => {
    if (!novoNome.trim()) return
    setLoading(true)

    const slug = novoNome
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
      + '-' + Date.now()

    const { data: roteiro, error } = await supabase
      .from('roteiros')
      .insert({
        titulo: novoNome,
        slug,
        user_id: user.id,
        publico: false
      })
      .select()
      .single()

    if (roteiro) {
      await handleAdicionarAoRoteiro(roteiro.id)
    }
    setLoading(false)
  }

  if (!user) {
    return (
      <button
        onClick={handleAbrir}
        className="mt-6 w-full md:w-auto px-6 py-3 rounded-2xl border border-gray-200 text-sm font-medium text-gray-600 hover:border-gray-900 hover:text-gray-900 transition-colors"
      >
        + Adicionar ao roteiro
      </button>
    )
  }

  return (
    <div className="mt-6">
      <button
        onClick={handleAbrir}
        className="px-6 py-3 rounded-2xl bg-gray-900 text-white text-sm font-medium hover:bg-gray-700 transition-colors"
      >
        + Adicionar ao roteiro
      </button>

        {aberto && (
        <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setAberto(false)} />
          <div className="relative bg-white rounded-t-3xl md:rounded-3xl w-full md:max-w-md p-6 z-10">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Adicionar ao roteiro</h3>
            <p className="text-sm text-gray-400 mb-6">{atrativoNome}</p>

            {sucesso ? (
              <p className="text-center text-green-600 font-medium py-4">{sucesso} ✓</p>
            ) : (
              <>
                {/* Roteiros existentes */}
                {roteiros.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                      Meus roteiros
                    </p>
                    <div className="space-y-2">
                      {roteiros.map((roteiro) => (
                        <button
                          key={roteiro.id}
                          onClick={() => handleAdicionarAoRoteiro(roteiro.id)}
                          disabled={loading}
                          className="w-full text-left px-4 py-3 rounded-xl border border-gray-100 hover:border-gray-300 transition-colors text-sm font-medium text-gray-800"
                        >
                          {roteiro.titulo}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Criar novo roteiro */}
                {criandoNovo ? (
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                      Nome do novo roteiro
                    </p>
                    <input
                      type="text"
                      placeholder="Ex: Viagem ao Nordeste"
                      value={novoNome}
                      onChange={(e) => setNovoNome(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 mb-3"
                      autoFocus
                    />
                    <button
                      onClick={handleCriarRoteiro}
                      disabled={loading || !novoNome.trim()}
                      className="w-full py-3 rounded-xl bg-gray-900 text-white text-sm font-medium hover:bg-gray-700 transition-colors disabled:opacity-50"
                    >
                      {loading ? 'Criando...' : 'Criar e adicionar'}
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setCriandoNovo(true)}
                    className="w-full py-3 rounded-xl border border-dashed border-gray-300 text-sm text-gray-500 hover:border-gray-900 hover:text-gray-900 transition-colors"
                  >
                    + Criar novo roteiro
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}