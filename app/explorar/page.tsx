import Link from 'next/link'
import { supabase } from '../../lib/supabase'

export const revalidate = 0

export default async function ExplorarPage({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string; categoria?: string }>
}) {
  const { estado, categoria } = await searchParams

  // Busca estados disponíveis
  const { data: municipios } = await supabase
    .from('municipios')
    .select('estado')
  
  const estados = [...new Set(municipios?.map((m) => m.estado))].sort()

  // Busca categorias disponíveis
  const { data: atrativos_cats } = await supabase
    .from('atrativos')
    .select('categoria')

  const categorias = [...new Set(atrativos_cats?.map((a) => a.categoria))].sort()

  // Busca municípios com filtros
  let query = supabase
    .from('municipios')
    .select('*, atrativos(id, nome, slug, categoria, foto_capa)')

  if (estado) query = query.eq('estado', estado)

  const { data: resultados } = await query

  // Filtra por categoria se necessário
  const resultadosFiltrados = resultados?.filter((municipio) => {
    if (!categoria) return true
    return municipio.atrativos?.some((a: any) => a.categoria === categoria)
  })

  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-gray-900 tracking-tight">
            turistech
          </Link>
          <p className="text-sm text-gray-400 hidden md:block">Descubra o Brasil</p>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Explorar</h1>
        <p className="text-gray-500 mb-10">Filtre por estado ou categoria de atrativo</p>

        {/* Filtros */}
        <div className="flex flex-wrap gap-8 mb-12">
          {/* Filtro por estado */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Estado</p>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/explorar"
                className={`px-4 py-1.5 rounded-full text-sm border transition-colors ${
                  !estado
                    ? 'bg-gray-900 text-white border-gray-900'
                    : 'border-gray-200 text-gray-600 hover:border-gray-400'
                }`}
              >
                Todos
              </Link>
              {estados?.map((e) => (
                <Link
                  key={e}
                  href={`/explorar?${categoria ? `categoria=${categoria}&` : ''}estado=${e}`}
                  className={`px-4 py-1.5 rounded-full text-sm border transition-colors ${
                    estado === e
                      ? 'bg-gray-900 text-white border-gray-900'
                      : 'border-gray-200 text-gray-600 hover:border-gray-400'
                  }`}
                >
                  {e}
                </Link>
              ))}
            </div>
          </div>

          {/* Filtro por categoria */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Categoria</p>
            <div className="flex flex-wrap gap-2">
              <Link
                href={`/explorar${estado ? `?estado=${estado}` : ''}`}
                className={`px-4 py-1.5 rounded-full text-sm border transition-colors ${
                  !categoria
                    ? 'bg-gray-900 text-white border-gray-900'
                    : 'border-gray-200 text-gray-600 hover:border-gray-400'
                }`}
              >
                Todas
              </Link>
              {categorias?.map((c) => (
                <Link
                  key={c}
                  href={`/explorar?${estado ? `estado=${estado}&` : ''}categoria=${c}`}
                  className={`px-4 py-1.5 rounded-full text-sm border transition-colors ${
                    categoria === c
                      ? 'bg-gray-900 text-white border-gray-900'
                      : 'border-gray-200 text-gray-600 hover:border-gray-400'
                  }`}
                >
                  {c}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Resultados */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {resultadosFiltrados?.map((municipio) => (
            <Link
              key={municipio.id}
              href={`/municipios/${municipio.slug}`}
              className="group"
            >
              <div className="relative h-52 rounded-2xl overflow-hidden bg-gray-100 mb-4">
                {municipio.foto_capa ? (
                  <img
                    src={municipio.foto_capa}
                    alt={municipio.nome}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                <span className="absolute bottom-3 left-3 text-xs font-medium text-white bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded-full">
                  {municipio.estado}
                </span>
              </div>
              <p className="font-semibold text-gray-900">{municipio.nome}</p>
              <p className="text-sm text-gray-400 mt-0.5">
                {municipio.atrativos?.length} atrativo{municipio.atrativos?.length !== 1 ? 's' : ''}
              </p>
            </Link>
          ))}
        </div>

        {resultadosFiltrados?.length === 0 && (
          <p className="text-gray-400 text-center py-20">
            Nenhum destino encontrado com esses filtros.
          </p>
        )}
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