import Link from 'next/link'
import { supabase } from '../../lib/supabase'

export const revalidate = 0

export default async function RoteirosPage() {
  const { data: roteiros } = await supabase
    .from('roteiros')
    .select('*')
    .eq('publico', true)
    .order('created_at', { ascending: false })

  return (
    <main className="min-h-screen bg-white">
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-gray-900 tracking-tight">
            turistech
          </Link>
          <Link href="/explorar" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
            Explorar destinos
          </Link>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Roteiros</h1>
        <p className="text-gray-500 mb-10">Roteiros curados para inspirar sua próxima viagem</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {roteiros?.map((roteiro) => (
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

        {roteiros?.length === 0 && (
          <p className="text-gray-400 text-center py-20">Nenhum roteiro disponível ainda.</p>
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