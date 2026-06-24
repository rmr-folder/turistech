import Link from 'next/link'
import { supabase } from '../lib/supabase'

export const revalidate = 0

export default async function Home() {
  const { data: municipios } = await supabase
    .from('municipios')
    .select(`*, atrativos(id, nome, slug, categoria, foto_capa)`)

  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-gray-900 tracking-tight">
            turistech
          </Link>
          <p className="text-sm text-gray-400 hidden md:block">
            Descubra o Brasil
          </p>
        </div>
      </header>

      {/* Hero */}
      <div className="max-w-6xl mx-auto px-6 pt-16 pb-12">
        <h1 className="text-5xl font-bold text-gray-900 leading-tight max-w-2xl">
          Os melhores destinos do Brasil em um só lugar
        </h1>
        <p className="mt-4 text-xl text-gray-500 max-w-xl">
          Descubra atrativos, trilhas, paisagens e experiências únicas por todo o país.
        </p>
      </div>

      {/* Municípios */}
      <div className="max-w-6xl mx-auto px-6 pb-20">
        {municipios?.map((municipio) => (
          <div key={municipio.id} className="mb-14">
            {/* Cabeçalho do município */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-baseline gap-2">
                <Link
                  href={`/municipios/${municipio.slug}`}
                  className="text-2xl font-semibold text-gray-900 hover:underline underline-offset-4"
                >
                  {municipio.nome}
                </Link>
                <span className="text-sm font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                  {municipio.estado}
                </span>
              </div>
              <Link
                href={`/municipios/${municipio.slug}`}
                className="text-sm text-gray-500 hover:text-gray-900 transition-colors hidden md:block"
              >
                Ver todos →
              </Link>
            </div>

            {/* Cards de atrativos */}
            <div className="flex gap-5 overflow-x-auto pb-3 -mx-1 px-1">
              {municipio.atrativos?.map((atrativo: any) => (
                <Link
                  key={atrativo.id}
                  href={`/atrativos/${atrativo.slug}`}
                  className="flex-shrink-0 w-56 group"
                >
                  <div className="relative h-40 rounded-2xl overflow-hidden bg-gray-100 mb-3">
                    {atrativo.foto_capa ? (
                      <img
                        src={atrativo.foto_capa}
                        alt={atrativo.nome}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200" />
                    )}
                  </div>
                  <p className="text-sm font-semibold text-gray-900 leading-tight">
                    {atrativo.nome}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">{atrativo.categoria}</p>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8 px-6">
        <div className="max-w-6xl mx-auto text-center text-sm text-gray-400">
          Turistech — A camada de informação do turismo brasileiro
        </div>
      </footer>
    </main>
  )
}