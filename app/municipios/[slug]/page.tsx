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
    <main className="min-h-screen bg-gray-50">
      <div className="relative h-80 bg-gray-300">
        {municipio.foto_capa && (
          <img
            src={municipio.foto_capa}
            alt={municipio.nome}
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute bottom-6 left-6 text-white">
          <p className="text-sm opacity-80">{municipio.estado}</p>
          <h1 className="text-4xl font-bold">{municipio.nome}</h1>
        </div>
      </div>
      <div className="max-w-5xl mx-auto px-6 py-10">
        <p className="text-gray-600 text-lg mb-10">{municipio.descricao}</p>
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Atrativos</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {municipio.atrativos?.map((atrativo: any) => (
            <Link
              key={atrativo.id}
              href={`/atrativos/${atrativo.slug}`}
              className="rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="h-40 bg-gray-200">
                {atrativo.foto_capa && (
                  <img
                    src={atrativo.foto_capa}
                    alt={atrativo.nome}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <div className="p-4">
                <p className="font-medium text-gray-800">{atrativo.nome}</p>
                <p className="text-sm text-gray-400 mt-1">{atrativo.categoria}</p>
              </div>
            </Link>
          ))}
        </div>
        <a href="/" className="inline-block mt-10 text-green-700 font-medium hover:underline">
          Voltar para a home
        </a>
      </div>
    </main>
  )
}