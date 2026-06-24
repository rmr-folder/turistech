import { supabase } from '../../../lib/supabase'
import { notFound } from 'next/navigation'
import Link from 'next/link'

interface Props {
  params: Promise<{ slug: string }>
}

export default async function MunicipioPage({ params }: Props) {
  const { slug } = await params

  const { data: municipio } = await supabase
    .from('municipios')
    .select('*, atrativos(id, nome, slug, categoria, foto_capa)')
    .eq('slug', slug)
    .single()

  if (!municipio) return notFound()

  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center gap-4">
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
            ← turistech
          </Link>
        </div>
      </header>

      {/* Hero */}
      <div className="relative h-96 bg-gray-100">
        {municipio.foto_capa && (
          <img
            src={municipio.foto_capa}
            alt={municipio.nome}
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
        <div className="absolute bottom-8 left-0 right-0 max-w-6xl mx-auto px-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-medium text-white/70 bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded-full">
              {municipio.estado}
            </span>
          </div>
          <h1 className="text-5xl font-bold text-white">{municipio.nome}</h1>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        {municipio.descricao && (
          <p className="text-lg text-gray-600 max-w-2xl mb-12 leading-relaxed">
            {municipio.descricao}
          </p>
        )}

        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Atrativos</h2>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {municipio.atrativos?.map((atrativo: any) => (
            <Link
              key={atrativo.id}
              href={`/atrativos/${atrativo.slug}`}
              className="group"
            >
              <div className="relative h-44 rounded-2xl overflow-hidden bg-gray-100 mb-3">
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
              <p className="text-sm font-semibold text-gray-900">{atrativo.nome}</p>
              <p className="text-xs text-gray-400 mt-0.5">{atrativo.categoria}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8 px-6 mt-10">
        <div className="max-w-6xl mx-auto text-center text-sm text-gray-400">
          Turistech — A camada de informação do turismo brasileiro
        </div>
      </footer>
    </main>
  )
}