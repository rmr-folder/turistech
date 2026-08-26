'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '../../lib/supabase-browser'

export default function MeusRoteiros() {
  const [user, setUser] = useState<any>(null)
  const [roteiros, setRoteiros] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        window.location.href = '/'
        return
      }
      setUser(user)

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
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      setRoteiros(data || [])
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
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Meus Roteiros</h1>
            <p className="text-gray-500 mt-2">
              Olá, {user?.user_metadata?.name?.split(' ')[0]}! Aqui estão seus roteiros personalizados.
            </p>
          </div>
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
              <div key={roteiro.id} className="border border-gray-100 rounded-2xl p-6 hover:border-gray-300 transition-colors">
                <div className="flex items-start justify-between mb-4">
                  <h2 className="font-semibold text-gray-900 text-lg">{roteiro.titulo}</h2>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${roteiro.publico ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {roteiro.publico ? 'Público' : 'Privado'}
                  </span>
                </div>

                {/* Atrativos do roteiro */}
                <div className="space-y-2 mb-4">
                  {roteiro.roteiro_atrativos?.slice(0, 3).map((item: any) => (
                    <Link
                      key={item.id}
                      href={`/atrativos/${item.atrativos?.slug}`}
                      className="flex items-center gap-3 group"
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
                      <p className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
                        {item.atrativos?.nome}
                      </p>
                    </Link>
                  ))}
                  {roteiro.roteiro_atrativos?.length > 3 && (
                    <p className="text-xs text-gray-400 pl-13">
                      +{roteiro.roteiro_atrativos.length - 3} atrativos
                    </p>
                  )}
                </div>

                <p className="text-xs text-gray-400">
                  {roteiro.roteiro_atrativos?.length} atrativo{roteiro.roteiro_atrativos?.length !== 1 ? 's' : ''}
                </p>
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