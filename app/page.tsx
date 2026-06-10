import Link from 'next/link'
import { supabase } from '../lib/supabase'

export default async function Home() {
  const { data: municipios } = await supabase
    .from('municipios')
    .select(`
      *,
      atrativos (
        id,
        nome,
        slug,
        categoria,
        foto_capa
      )
    `)

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <h1 className="text-2xl font-bold text-green-700">Turistech</h1>
        <p className="text-gray-500 text-sm">Descubra os melhores destinos do Brasil</p>
      </header>

      {/* Conteúdo */}
      <div className="max-w-6xl mx-auto px-6 py-10">
        {municipios?.map((municipio) => (
          <div key={municipio.id} className="mb-12">
            {/* Nome do município */}
            <div className="flex items-baseline gap-3 mb-4">
              <Link href={`/municipios/${municipio.slug}`} className="text-xl font-semibold text-gray-800 hover:text-green-700 transition-colors">
                {municipio.nome}
              </Link>
              <span className="text-sm text-gray-400">{municipio.estado}</span>
            </div>

            {/* Atrativos */}
            <div className="flex gap-4 overflow-x-auto pb-2">
              {municipio.atrativos?.map((atrativo: any) => (
                <Link
                  key={atrativo.id}
                  href={`/atrativos/${atrativo.slug}`}
                  className="flex-shrink-0 w-48 rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="h-32 bg-gray-200">
                    {atrativo.foto_capa && (
                      <img
                        src={atrativo.foto_capa}
                        alt={atrativo.nome}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-medium text-gray-800 leading-tight">{atrativo.nome}</p>
                    <p className="text-xs text-gray-400 mt-1">{atrativo.categoria}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}