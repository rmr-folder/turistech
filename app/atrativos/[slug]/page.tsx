import { supabase } from '../../../lib/supabase'
import { notFound } from 'next/navigation'
import Link from 'next/link'

interface Props {
  params: Promise<{ slug: string }>
}

export default async function AtrativoPage({ params }: Props) {
  const { slug } = await params

  const { data: atrativo } = await supabase
    .from('atrativos')
    .select('*, municipios(nome, estado, slug)')
    .eq('slug', slug)
    .single()

  if (!atrativo) return notFound()

  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center gap-4">
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
            ← turistech
          </Link>
          {atrativo.municipios && (
            <>
              <span className="text-gray-300">/</span>
              <Link
                href={`/municipios/${atrativo.municipios.slug}`}
                className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
              >
                {atrativo.municipios.nome}
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Hero */}
      <div className="relative h-96 bg-gray-100">
        {atrativo.foto_capa && (
          <img
            src={atrativo.foto_capa}
            alt={atrativo.nome}
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
        <div className="absolute bottom-8 left-0 right-0 max-w-6xl mx-auto px-6">
          <span className="text-xs font-medium text-white/70 bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded-full">
            {atrativo.categoria}
          </span>
          <h1 className="text-5xl font-bold text-white mt-2">{atrativo.nome}</h1>
          {atrativo.municipios && (
            <Link
              href={`/municipios/${atrativo.municipios.slug}`}
              className="text-white/70 text-sm mt-1 inline-block hover:text-white transition-colors"
            >
              {atrativo.municipios.nome}, {atrativo.municipios.estado}
            </Link>
          )}
        </div>
      </div>

      {/* Conteúdo */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="max-w-2xl">
          {atrativo.descricao && (
            <p className="text-lg text-gray-600 leading-relaxed">
              {atrativo.descricao}
            </p>
          )}

          {atrativo.endereco && (
            <div className="mt-8 flex items-start gap-2 text-gray-500">
              <span className="text-sm">{atrativo.endereco}</span>
            </div>
          )}
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