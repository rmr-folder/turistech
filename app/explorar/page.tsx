import Link from 'next/link'
import { supabase } from '../../lib/supabase'
import ExplorarClient from './ExplorarClient'

export const revalidate = 0

export default async function ExplorarPage() {
  const { data: municipios } = await supabase
    .from('municipios')
    .select('*, atrativos(id, nome, slug, categoria, foto_capa)')

  const { data: atrativos } = await supabase
    .from('atrativos')
    .select('*, municipios(nome, estado, slug)')

  const estados = [...new Set(municipios?.map((m) => m.estado))].sort() as string[]
  const categorias = [...new Set(atrativos?.map((a) => a.categoria))].sort() as string[]

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
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Explorar</h1>
        <p className="text-gray-500 mb-10">Encontre destinos e atrativos por todo o Brasil</p>

        <ExplorarClient
          municipios={municipios || []}
          atrativos={atrativos || []}
          estados={estados}
          categorias={categorias}
        />
      </div>

      <footer className="border-t border-gray-100 py-8 px-6 mt-10">
        <div className="max-w-6xl mx-auto text-center text-sm text-gray-400">
          Turistech — A camada de informação do turismo brasileiro
        </div>
      </footer>
    </main>
  )
}