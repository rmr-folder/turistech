'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '../../lib/supabase-browser'

interface Props {
  roteirosPublicos: any[]
}

export default function RoteirosClient({ roteirosPublicos }: Props) {
  const [aba, setAba] = useState<'descobrir' | 'meus'>('descobrir')
  const [user, setUser] = useState<any>(null)
  const [checandoUser, setCheckandoUser] = useState(true)
  const [meusRoteiros, setMeusRoteiros] = useState<any[]>([])
  const [carregandoMeus, setCarregandoMeus] = useState(false)
  const [jaCarregouMeus, setJaCarregouMeus] = useState(false)
  const [deletando, setDeletando] = useState('')
  const [copiado, setCopiado] = useState('')
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setCheckandoUser(false)
    }
    getUser()
  }, [])

  useEffect(() => {
    if (aba === 'meus' && user && !jaCarregouMeus) {
      carregarMeusRoteiros(user.id)
    }
  }, [aba, user])

  const carregarMeusRoteiros = async (userId: string) => {
    setCarregandoMeus(true)
    const { data } = await supabase
      .from('roteiros')
      .select(`
        *,
        roteiro_atrativos (
          id,
          atrativos (
            id,
            nome,
            slug,
            foto_capa,
            categoria
          )
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    setMeusRoteiros(data || [])
    setCarregandoMeus(false)
    setJaCarregouMeus(true)
  }

  const handleLoginGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` }
    })
  }

  const handleDeletar = async (roteiroId: string) => {
    if (!confirm('Tem certeza que deseja deletar este roteiro?')) return
    setDeletando(roteiroId)
    await supabase.from('roteiros').delete().eq('id', roteiroId)
    setMeusRoteiros(meusRoteiros.filter((r) => r.id !== roteiroId))
    setDeletando('')
  }

  const handleRemoverAtrativo = async (roteiroAtrativoId: string, roteiroId: string) => {
    await supabase.from('roteiro_atrativos').delete().eq('id', roteiroAtrativoId)
    setMeusRoteiros(meusRoteiros.map((r) => {
      if (r.id !== roteiroId) return r
      return {
        ...r,
        roteiro_atrativos: r.roteiro_atrativos.filter((a: any) => a.id !== roteiroAtrativoId)
      }
    }))
  }

  const handleCompartilhar = async (roteiro: any) => {
    const url = `${window.location.origin}/roteiros/${roteiro.slug}`
    await navigator.clipboard.writeText(url)
    setCopiado(roteiro.id)
    setTimeout(() => setCopiado(''), 2000)
  }

  const handleTogglePublico = async (roteiro: any) => {
    const novoValor = !roteiro.publico
    await supabase.from('roteiros').update({ publico: novoValor }).eq('id', roteiro.id)
    setMeusRoteiros(meusRoteiros.map((r) =>
      r.id === roteiro.id ? { ...r, publico: novoValor } : r
    ))
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <div className="flex items-center gap-2 mb-10">
        <button
          onClick={() => setAba('descobrir')}
          className={`text-sm font-medium px-4 py-2 rounded-full transition-colors ${
            aba === 'descobrir' ? 'bg-gray-900 text-white' : 'text-gray-500 hover:bg-gray-100'
          }`}
        >
          Descobrir
        </button>
        <button
          onClick={() => setAba('meus')}
          className={`text-sm font-medium px-4 py-2 rounded-full transition-colors ${
            aba === 'meus' ? 'bg-gray-900 text-white' : 'text-gray-500 hover:bg-gray-100'
          }`}
        >
          Meus roteiros
        </button>
      </div>

      {aba === 'descobrir' && (
        <>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Roteiros</h1>
          <p className="text-gray-500 mb-10">Roteiros curados para inspirar sua próxima viagem</p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {roteirosPublicos?.map((roteiro) => (
              <Link key={roteiro.id} href={`/roteiros/${roteiro.slug}`} className="group">
                <div className="relative h-52 rounded-2xl overflow-hidden bg-gray-100 mb-4">
                  {roteiro.foto_capa ? (
                    <img
                      src={roteiro.foto_capa}
                      alt={roteiro.titulo}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                      <span className="text-4xl">🗺️</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  {roteiro.duracao_dias && (
                    <span className="absolute bottom-3 left-3 text-xs font-medium text-white bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded-full">
                      {roteiro.duracao_dias} {roteiro.duracao_dias === 1 ? 'dia' : 'dias'}
                    </span>
                  )}
                </div>
                <p className="font-semibold text-gray-900">{roteiro.titulo}</p>
                {roteiro.descricao && (
                  <p className="text-sm text-gray-400 mt-1 line-clamp-2">{roteiro.descricao}</p>
                )}
              </Link>
            ))}
          </div>

          {roteirosPublicos?.length === 0 && (
            <p className="text-gray-400 text-center py-20">Nenhum roteiro disponível ainda.</p>
          )}
        </>
      )}

      {aba === 'meus' && (
        <>
          {checandoUser ? (
            <p className="text-gray-400 text-center py-20">Carregando...</p>
          ) : !user ? (
            <div className="text-center py-20">
              <p className="text-gray-500 mb-6">Entre para ver e gerenciar seus roteiros.</p>
              <button
                onClick={handleLoginGoogle}
                className="text-sm bg-gray-900 text-white px-6 py-3 rounded-full hover:bg-gray-700 transition-colors"
              >
                Entrar com Google
              </button>
            </div>
          ) : (
            <>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Meus Roteiros</h1>
              <p className="text-gray-500 mb-10">
                Olá, {user.user_metadata?.name?.split(' ')[0]}! Aqui estão seus roteiros personalizados.
              </p>

              {carregandoMeus ? (
                <p className="text-gray-400 text-center py-20">Carregando...</p>
              ) : meusRoteiros.length === 0 ? (
                <div className="text-center py-20">
                  <p className="text-gray-400 mb-4">Você ainda não criou nenhum roteiro.</p>
                  <Link
                    href="/explorar"
                    className="text-sm bg-gray-900 text-white px-6 py-3 rounded-full hover:bg-gray-700 transition-colors"
                  >
                    Explorar destinos
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {meusRoteiros.map((roteiro) => (
                    <div key={roteiro.id} className="border border-gray-100 rounded-2xl p-6 hover:border-gray-200 transition-colors">
                      <div className="flex items-start justify-between mb-4">
                        <h2 className="font-semibold text-gray-900 text-lg leading-tight">{roteiro.titulo}</h2>
                        <button
                          onClick={() => handleTogglePublico(roteiro)}
                          className={`text-xs px-2 py-0.5 rounded-full ml-2 flex-shrink-0 transition-colors ${
                            roteiro.publico
                              ? 'bg-green-100 text-green-700 hover:bg-green-200'
                              : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                          }`}
                        >
                          {roteiro.publico ? 'Público' : 'Privado'}
                        </button>
                      </div>

                      <div className="space-y-2 mb-6">
                        {roteiro.roteiro_atrativos?.length === 0 && (
                          <p className="text-sm text-gray-400">Nenhum atrativo ainda.</p>
                        )}
                        {roteiro.roteiro_atrativos?.map((item: any) => (
                          <div key={item.id} className="flex items-center gap-3 group">
                            <Link
                              href={`/atrativos/${item.atrativos?.slug}`}
                              className="flex items-center gap-3 flex-1 min-w-0"
                            >
                              <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                                {item.atrativos?.foto_capa ? (
                                  <img
                                    src={item.atrativos.foto_capa}
                                    alt={item.atrativos.nome}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200" />
                                )}
                              </div>
                              <p className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors truncate">
                                {item.atrativos?.nome}
                              </p>
                            </Link>
                            <button
                              onClick={() => handleRemoverAtrativo(item.id, roteiro.id)}
                              className="text-gray-300 hover:text-red-400 transition-colors flex-shrink-0 opacity-0 group-hover:opacity-100"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                        <p className="text-xs text-gray-400">
                          {roteiro.roteiro_atrativos?.length} atrativo{roteiro.roteiro_atrativos?.length !== 1 ? 's' : ''}
                        </p>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleCompartilhar(roteiro)}
                            className="text-xs text-gray-400 hover:text-gray-900 transition-colors"
                          >
                            {copiado === roteiro.id ? 'Link copiado ✓' : 'Compartilhar'}
                          </button>
                          <button
                            onClick={() => handleDeletar(roteiro.id)}
                            disabled={deletando === roteiro.id}
                            className="text-xs text-gray-400 hover:text-red-500 transition-colors"
                          >
                            {deletando === roteiro.id ? 'Deletando...' : 'Deletar'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  )
}