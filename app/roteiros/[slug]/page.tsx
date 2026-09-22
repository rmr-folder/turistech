import Link from 'next/link'
import { supabase } from '../../../lib/supabase'
import { notFound } from 'next/navigation'
import SalvarRoteiroButton from '../../components/SalvarRoteiroButton'
import RoteiroDetailClient from './RoteiroDetailClient'

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

  let criador = null
  if (roteiro.user_id) {
    const { data: perfil } = await supabase
      .from('profiles')
      .select('nome, avatar_url')
      .eq('id', roteiro.user_id)
      .single()
    criador = perfil
  }

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
        <div className="absolute top-4 right-4 z-10">
          <SalvarRoteiroButton roteiroId={roteiro.id} />
        </div>
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

      <RoteiroDetailClient roteiro={roteiro} itensIniciais={itens || []} criador={criador} />

      <footer className="border-t border-gray-100 py-8 px-6 mt-10">
        <div className="max-w-6xl mx-auto text-center text-sm text-gray-400">
          Turistech — A camada de informação do turismo brasileiro
        </div>
      </footer>
    </main>
  )
}