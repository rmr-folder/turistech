'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '../../lib/supabase-browser'

export default function MeusRoteiros() {
  const [user, setUser] = useState<any>(null)
  const [roteiros, setRoteiros] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [deletando, setDeletando] = useState('')
  const [copiado, setCopiado] = useState('')
  const supabase = createClient()

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        window.location.href = '/'
        return
      }
      setUser(user)
      await carregarRoteiros(user.id)
    }
    init()
  }, [])

  const carregarRoteiros = async (userId: string) => {
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

    setRoteiros(data || [])
    setLoading(false)
  }

  const handleDeletar = async (roteiroId: string) => {
    if (!confirm('Tem certeza que deseja deletar este roteiro?')) return
    setDeletando(roteiroId)
    await supabase.from('roteiros').delete().eq('id', roteiroId)
    setRoteiros(roteiros.filter((r) => r.id !== roteiroId))
    setDeletando('')
  }

  const handleRemoverAtrativo = async (roteiroAtrativoId: string, roteiroId: string) => {
    await supabase.from('roteiro_atrativos').delete().eq('id', roteiroAtrativoId)
    setRoteiros(roteiros.map((r) => {
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
    await supabase
      .from('roteiros')
      .update({ publico: novoValor })
      .eq('id', roteiro.id)
    setRoteiros(roteiros.map((r) =>
      r.id === roteiro.id ? { ...r, publico: novoValor } : r
    ))
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400">Carregando...</p>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-white">
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-gray-900 tracking-tight">
            turistech
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/roteiros" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
              Roteiros
            </Link>
            <Link href="/explorar" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
              Explorar
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-gray-900">Meus Roteiros</h1>
          <p className="text-gray-500 mt-2">
            Olá, {user?.user_metadata?.name?.split(' ')[0]}! Aqui estão seus roteiros personalizados.
          </p>
        </div>

        {roteiros.length === 0 ? (
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
            {roteiros.map((roteiro) => (
              <div key={roteiro.id} className="border border-gray-100 rounded-2xl p-6 hover:border-gray-200 transition-colors">
                
                {/* Header do roteiro */}
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

                {/* Atrativos do roteiro */}
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

                {/* Rodapé do card */}
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
      </div>

      <footer className="border-t border-gray-100 py-8 px-6 mt-10">
        <div className="max-w-6xl mx-auto text-center text-sm text-gray-400">
          Turistech — A camada de informação do turismo brasileiro
        </div>
      </footer>
    </main>
  )
}