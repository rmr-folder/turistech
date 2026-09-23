import Link from 'next/link'
import { supabase } from '../../../lib/supabase'
import { notFound } from 'next/navigation'
import { getFotoRoteiro } from '../../../lib/roteiroFoto'
import BackButton from '../../components/BackButton'
import SeguirButton from '../../components/SeguirButton'

interface Props {
  params: Promise<{ username: string }>
}

export default async function PerfilPage({ params }: Props) {
  const { username } = await params

  const { data: perfil } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .single()

  if (!perfil) return notFound()

  const { count: totalSeguidores } = await supabase
    .from('seguidores')
    .select('*', { count: 'exact', head: true })
    .eq('following_id', perfil.id)

  const { count: totalSeguindo } = await supabase
    .from('seguidores')
    .select('*', { count: 'exact', head: true })
    .eq('follower_id', perfil.id)

  const { data: roteiros } = await supabase
    .from('roteiros')
    .select(`*, roteiro_atrativos (id, atrativos (id, nome, slug, foto_capa, categoria))`)
    .eq('user_id', perfil.id)
    .eq('publico', true)
    .order('created_at', { ascending: false })

  return (
    <main className="min-h-screen bg-white">
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100 px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          <BackButton />
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-10">
        {/* Cabeçalho do perfil */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            {perfil.avatar_url ? (
              <img src={perfil.avatar_url} alt={perfil.nome} className="w-16 h-16 rounded-full" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-xl font-semibold">
                {perfil.nome?.[0]?.toUpperCase() || '?'}
              </div>
            )}
            <div>
              <h1 className="text-xl font-bold text-gray-900">{perfil.nome}</h1>
              <p className="text-sm text-gray-400">@{perfil.username}</p>
            </div>
          </div>
          <SeguirButton perfilId={perfil.id} />
        </div>

        {/* Contadores */}
        <div className="flex items-center gap-6 mb-6 text-sm">
          <span className="text-gray-600"><strong className="text-gray-900">{totalSeguidores || 0}</strong> Seguidores</span>
          <span className="text-gray-600"><strong className="text-gray-900">{totalSeguindo || 0}</strong> Seguindo</span>
        </div>

        {/* Redes sociais */}
        {(perfil.instagram || perfil.tiktok || perfil.twitter) && (
          <div className="flex items-center gap-3 mb-6">
            {perfil.instagram && (
              <a href={perfil.instagram} target="_blank" rel="noopener noreferrer" className="text-sm text-gray-500 hover:text-gray-900 border border-gray-200 rounded-full px-3 py-1.5 transition-colors">
                Instagram
              </a>
            )}
            {perfil.tiktok && (
              <a href={perfil.tiktok} target="_blank" rel="noopener noreferrer" className="text-sm text-gray-500 hover:text-gray-900 border border-gray-200 rounded-full px-3 py-1.5 transition-colors">
                TikTok
              </a>
            )}
            {perfil.twitter && (
              <a href={perfil.twitter} target="_blank" rel="noopener noreferrer" className="text-sm text-gray-500 hover:text-gray-900 border border-gray-200 rounded-full px-3 py-1.5 transition-colors">
                X
              </a>
            )}
          </div>
        )}

        {/* Bio */}
        {perfil.bio && (
          <p className="text-gray-600 leading-relaxed mb-10">{perfil.bio}</p>
        )}

        {/* Roteiros publicados */}
        <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
          Roteiros publicados ({roteiros?.length || 0})
        </h2>

        {roteiros?.length === 0 ? (
          <p className="text-gray-400 text-sm">Nenhum roteiro público ainda.</p>
        ) : (
          <div className="space-y-4">
            {roteiros?.map((roteiro) => {
              const foto = getFotoRoteiro(roteiro)
              return (
                <Link
                  key={roteiro.id}
                  href={`/roteiros/${roteiro.slug}`}
                  className="flex gap-4 p-4 rounded-2xl border border-gray-100 hover:border-gray-300 transition-colors group"
                >
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                    {foto ? (
                      <img src={foto} alt={roteiro.titulo} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                        <span className="text-2xl">🗺️</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900">{roteiro.titulo}</p>
                    {roteiro.descricao && (
                      <p className="text-sm text-gray-400 mt-0.5 line-clamp-2">{roteiro.descricao}</p>
                    )}
                    {roteiro.duracao_dias > 0 && (
                      <p className="text-xs text-gray-400 mt-1">{roteiro.duracao_dias} {roteiro.duracao_dias === 1 ? 'dia' : 'dias'}</p>
                    )}
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}