import { supabase } from '../../../lib/supabase'
import { notFound } from 'next/navigation'

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
    <main className="min-h-screen bg-gray-50">
      <div className="relative h-72 bg-gray-300">
        {atrativo.foto_capa && (
          <img
            src={atrativo.foto_capa}
            alt={atrativo.nome}
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute bottom-6 left-6 text-white">
          <p className="text-sm opacity-80">{atrativo.categoria}</p>
          <h1 className="text-3xl font-bold">{atrativo.nome}</h1>
          <p className="text-sm opacity-80 mt-1">
            <a href={`/municipios/${atrativo.municipios?.slug}`} className="hover:underline">
            {atrativo.municipios?.nome}, {atrativo.municipios?.estado}
          </a>
          </p>
        </div>
      </div>
      <div className="max-w-3xl mx-auto px-6 py-10">
        <p className="text-gray-700 text-lg leading-relaxed">{atrativo.descricao}</p>
        <a href="/" className="inline-block mt-10 text-green-700 font-medium hover:underline">
          Voltar para a home
        </a>
      </div>
    </main>
  )
}