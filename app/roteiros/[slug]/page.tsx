import Link from 'next/link'
import { supabase } from '../../../lib/supabase'
import { notFound } from 'next/navigation'

interface Props {
  params: Promise<{ slug: string }>
}

export default async function RoteiroPage({ params }: Props) {
  const { slug } = await params

  const { data: roteiro } = await supabase
    .from('roteiros')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!roteiro) return notFound()

  const { data: itens } = await supabase
    .from('roteiro_atrativos')
    .select('*, atrativos(id, nome, slug, descricao, categoria, foto_capa, municipios(nome, estado, slug))')
    .eq('roteiro_id', roteiro.id)
    .order('dia')
    .order('ordem')

  const dias = [...new Set(itens?.map((i) => i.dia))].sort()

  return (
    <main className="min-h-screen bg-white">
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center gap-4">
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
            ← turistech
          </Link>
          <span className="text-gray-300">/</span>
          <Link href="/roteiros" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
            Roteiros
          </Link>
        </div>
      </header>

      {/* Hero */}
      <div className="relative h-80 bg-gray-100">
        {roteiro.foto_capa ? (
          <img
            src={roteiro.foto_capa}
            alt={roteiro.titulo}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
        <div className="absolute bottom-8 left-0 right-0 max-w-6xl mx-auto px-6">
          {roteiro.duracao_dias && (
            <span className="text-xs font-medium text-white/70 bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded-full">
              {roteiro.duracao_dias} {roteiro.duracao_dias === 1 ? 'dia' : 'dias'}
            </span>
          )}
          <h1 className="text-4xl font-bold text-white mt-2">{roteiro.titulo}</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12">
        {roteiro.descricao && (
          <p className="text-lg text-gray-600 leading-relaxed mb-12">{roteiro.descricao}</p>
        )}

        {/* Itinerário por dia */}
        {dias.map((dia) => (
          <div key={dia} className="mb-12">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-gray-900 text-white text-sm flex items-center justify-center">
                {dia}
              </span>
              Dia {dia}
            </h2>

            <div className="space-y-4">
              {itens
                ?.filter((i) => i.dia === dia)
                .map((item) => (
                  <Link
                    key={item.id}
                    href={`/atrativos/${item.atrativos?.slug}`}
                    className="flex gap-4 p-4 rounded-2xl border border-gray-100 hover:border-gray-300 transition-colors group"
                  >
                    <div className="w-24 h-24 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                      {item.atrativos?.foto_capa ? (
                        <img
                          src={item.atrativos.foto_capa}
                          alt={item.atrativos.nome}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-400 mb-1">{item.atrativos?.categoria}</p>
                      <p className="font-semibold text-gray-900">{item.atrativos?.nome}</p>
                      <p className="text-sm text-gray-400 mt-0.5">
                        {item.atrativos?.municipios?.nome}, {item.atrativos?.municipios?.estado}
                      </p>
                      {item.observacao && (
                        <p className="text-sm text-gray-500 mt-2 italic">"{item.observacao}"</p>
                      )}
                    </div>
                  </Link>
                ))}
            </div>
          </div>
        ))}
      </div>

      <footer className="border-t border-gray-100 py-8 px-6 mt-10">
        <div className="max-w-6xl mx-auto text-center text-sm text-gray-400">
          Turistech — A camada de informação do turismo brasileiro
        </div>
      </footer>
    </main>
  )
}