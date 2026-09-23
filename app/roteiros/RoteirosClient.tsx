'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '../../lib/supabase-browser'
import { getFotoRoteiro } from '../../lib/roteiroFoto'

interface Props {
  roteirosPublicos: any[]
}

export default function RoteirosClient({ roteirosPublicos }: Props) {
  const [aba, setAba] = useState<'descobrir' | 'meus' | 'salvos' | 'seguindo'>('descobrir')
  const [user, setUser] = useState<any>(null)
  const [checandoUser, setCheckandoUser] = useState(true)
  const [meusRoteiros, setMeusRoteiros] = useState<any[]>([])
  const [carregandoMeus, setCarregandoMeus] = useState(false)
  const [jaCarregouMeus, setJaCarregouMeus] = useState(false)
  const [roteirosSalvos, setRoteirosSalvos] = useState<any[]>([])
  const [carregandoSalvos, setCarregandoSalvos] = useState(false)
  const [jaCarregouSalvos, setJaCarregouSalvos] = useState(false)
  const [roteirosSeguindo, setRoteirosSeguindo] = useState<any[]>([])
  const [carregandoSeguindo, setCarregandoSeguindo] = useState(false)
  const [jaCarregouSeguindo, setJaCarregouSeguindo] = useState(false)
  const [deletando, setDeletando] = useState('')
    const [copiado, setCopiado] = useState('')
  const [criandoNovo, setCriandoNovo] = useState(false)
  const [salvandoNovo, setSalvandoNovo] = useState(false)
  const [novoRoteiro, setNovoRoteiro] = useState({ titulo: '', descricao: '', foto_capa: '', publico: false })
  const [uploadandoNovo, setUploadandoNovo] = useState(false)
  const supabase = createClient()

  const gerarSlug = (nome: string) => {
    return nome
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }

  const handleUploadNovoRoteiro = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadandoNovo(true)
    const ext = file.name.split('.').pop()
    const fileName = `roteiro-${gerarSlug(novoRoteiro.titulo || 'sem-nome')}-${Date.now()}.${ext}`
    const { error } = await supabase.storage.from('imagens').upload(fileName, file)
    if (!error) {
      const { data } = supabase.storage.from('imagens').getPublicUrl(fileName)
      setNovoRoteiro({ ...novoRoteiro, foto_capa: data.publicUrl })
    }
    setUploadandoNovo(false)
  }

  const handleCriarRoteiro = async () => {
    if (!novoRoteiro.titulo || !user) return
    setSalvandoNovo(true)
    const slugBase = gerarSlug(novoRoteiro.titulo)
    const { data, error } = await supabase
      .from('roteiros')
      .insert({
        titulo: novoRoteiro.titulo,
        slug: `${slugBase}-${Date.now().toString().slice(-5)}`,
        descricao: novoRoteiro.descricao || null,
        foto_capa: novoRoteiro.foto_capa || null,
        publico: novoRoteiro.publico,
        user_id: user.id,
      })
      .select()
      .single()

    if (!error && data) {
      setMeusRoteiros([{ ...data, roteiro_atrativos: [] }, ...meusRoteiros])
      setNovoRoteiro({ titulo: '', descricao: '', foto_capa: '', publico: false })
      setCriandoNovo(false)
    }
    setSalvandoNovo(false)
  }

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setCheckandoUser(false)
    }
    getUser()
  }, [])

  useEffect(() => {
    if (aba === 'meus' && user && !jaCarregouMeus) {
      carregarMeusRoteiros(user.id)
    }
    if (aba === 'salvos' && user && !jaCarregouSalvos) {
      carregarSalvos(user.id)
    }
    if (aba === 'seguindo' && user && !jaCarregouSeguindo) {
      carregarSeguindo(user.id)
    }
  }, [aba, user])

  const carregarMeusRoteiros = async (userId: string) => {
    setCarregandoMeus(true)
    const { data } = await supabase
      .from('roteiros')
      .select(`
        *,
        roteiro_atrativos (
          id,
          atrativos (
            id,
            nome,
            slug,
            foto_capa,
            categoria
          )
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    setMeusRoteiros(data || [])
    setCarregandoMeus(false)
    setJaCarregouMeus(true)
  }

  const carregarSalvos = async (userId: string) => {
    setCarregandoSalvos(true)
    const { data } = await supabase
      .from('roteiros_salvos')
      .select('id, roteiros(*, roteiro_atrativos(id, atrativos(id, nome, slug, foto_capa, categoria)))')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    setRoteirosSalvos(
      (data || [])
        .filter((item: any) => item.roteiros)
        .map((item: any) => ({ ...item.roteiros, salvoId: item.id }))
    )
    setCarregandoSalvos(false)
    setJaCarregouSalvos(true)
  }

  const carregarSeguindo = async (userId: string) => {
    setCarregandoSeguindo(true)
    const { data: seguindoIds } = await supabase
      .from('seguidores')
      .select('following_id')
      .eq('follower_id', userId)

    const ids = (seguindoIds || []).map((s) => s.following_id)

    if (ids.length === 0) {
      setRoteirosSeguindo([])
      setCarregandoSeguindo(false)
      setJaCarregouSeguindo(true)
      return
    }

    const { data } = await supabase
      .from('roteiros')
      .select(`*, roteiro_atrativos (id, atrativos (id, nome, slug, foto_capa, categoria)), profiles!roteiros_user_id_fkey (nome, username, avatar_url)`)
      .in('user_id', ids)
      .eq('publico', true)
      .order('created_at', { ascending: false })

    setRoteirosSeguindo(data || [])
    setCarregandoSeguindo(false)
    setJaCarregouSeguindo(true)
  }

  const handleRemoverSalvo = async (salvoId: string) => {
    await supabase.from('roteiros_salvos').delete().eq('id', salvoId)
    setRoteirosSalvos(roteirosSalvos.filter((r) => r.salvoId !== salvoId))
  }

  const handleLoginGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` }
    })
  }

  const handleDeletar = async (roteiroId: string) => {
    if (!confirm('Tem certeza que deseja deletar este roteiro?')) return
    setDeletando(roteiroId)
    await supabase.from('roteiros').delete().eq('id', roteiroId)
    setMeusRoteiros(meusRoteiros.filter((r) => r.id !== roteiroId))
    setDeletando('')
  }

  const handleRemoverAtrativo = async (roteiroAtrativoId: string, roteiroId: string) => {
    await supabase.from('roteiro_atrativos').delete().eq('id', roteiroAtrativoId)
    setMeusRoteiros(meusRoteiros.map((r) => {
      if (r.id !== roteiroId) return r
      return {
        ...r,
        roteiro_atrativos: r.roteiro_atrativos.filter((a: any) => a.id !== roteiroAtrativoId)
      }
    }))
  }

  const handleCompartilhar = async (roteiro: any) => {
    const url = `${window.location.origin}/roteiros/${roteiro.slug}`
    await navigator.clipboard.writeText(url)
    setCopiado(roteiro.id)
    setTimeout(() => setCopiado(''), 2000)
  }

  const handleTogglePublico = async (roteiro: any) => {
    const novoValor = !roteiro.publico
    await supabase.from('roteiros').update({ publico: novoValor }).eq('id', roteiro.id)
    setMeusRoteiros(meusRoteiros.map((r) =>
      r.id === roteiro.id ? { ...r, publico: novoValor } : r
    ))
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <div className="flex items-center gap-2 mb-10">
        <button
          onClick={() => setAba('descobrir')}
          className={`text-sm font-medium px-4 py-2 rounded-full transition-colors ${
            aba === 'descobrir' ? 'bg-gray-900 text-white' : 'text-gray-500 hover:bg-gray-100'
          }`}
        >
          Descobrir
        </button>
        <button
          onClick={() => setAba('meus')}
          className={`text-sm font-medium px-4 py-2 rounded-full transition-colors ${
            aba === 'meus' ? 'bg-gray-900 text-white' : 'text-gray-500 hover:bg-gray-100'
          }`}
        >
          Meus roteiros
        </button>
        <button
          onClick={() => setAba('salvos')}
          className={`text-sm font-medium px-4 py-2 rounded-full transition-colors ${
            aba === 'salvos' ? 'bg-gray-900 text-white' : 'text-gray-500 hover:bg-gray-100'
          }`}
        >
          Salvos
        </button>
        <button
          onClick={() => setAba('seguindo')}
          className={`text-sm font-medium px-4 py-2 rounded-full transition-colors ${
            aba === 'seguindo' ? 'bg-gray-900 text-white' : 'text-gray-500 hover:bg-gray-100'
          }`}
        >
          Seguindo
        </button>
      </div>

      {aba === 'descobrir' && (
        <>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Roteiros</h1>
          <p className="text-gray-500 mb-10">Roteiros curados para inspirar sua próxima viagem</p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {roteirosPublicos?.map((roteiro) => {
              const foto = getFotoRoteiro(roteiro)
              return (
              <Link key={roteiro.id} href={`/roteiros/${roteiro.slug}`} className="group">
                <div className="relative h-52 rounded-2xl overflow-hidden bg-gray-100 mb-4">
                  {foto ? (
                    <img
                      src={foto}
                      alt={roteiro.titulo}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                      <span className="text-4xl">🗺️</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  {roteiro.duracao_dias && (
                    <span className="absolute bottom-3 left-3 text-xs font-medium text-white bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded-full">
                      {roteiro.duracao_dias} {roteiro.duracao_dias === 1 ? 'dia' : 'dias'}
                    </span>
                  )}
                </div>
                <p className="font-semibold text-gray-900">{roteiro.titulo}</p>
                {roteiro.descricao && (
                  <p className="text-sm text-gray-400 mt-1 line-clamp-2">{roteiro.descricao}</p>
                )}
              </Link>
              )
            })}
          </div>

          {roteirosPublicos?.length === 0 && (
            <p className="text-gray-400 text-center py-20">Nenhum roteiro disponível ainda.</p>
          )}
        </>
      )}

      {aba === 'meus' && (
        <>
          {checandoUser ? (
            <p className="text-gray-400 text-center py-20">Carregando...</p>
          ) : !user ? (
            <div className="text-center py-20">
              <p className="text-gray-500 mb-6">Entre para ver e gerenciar seus roteiros.</p>
              <button
                onClick={handleLoginGoogle}
                className="text-sm bg-gray-900 text-white px-6 py-3 rounded-full hover:bg-gray-700 transition-colors"
              >
                Entrar com Google
              </button>
            </div>
          ) : (
            <>
                            <div className="flex items-center justify-between mb-2">
                <h1 className="text-4xl font-bold text-gray-900">Meus Roteiros</h1>
                <button
                  onClick={() => setCriandoNovo(true)}
                  className="text-sm bg-gray-900 text-white px-4 py-2 rounded-full hover:bg-gray-700 transition-colors flex-shrink-0"
                >
                  + Novo roteiro
                </button>
              </div>
              <p className="text-gray-500 mb-10">
                Olá, {user.user_metadata?.name?.split(' ')[0]}! Aqui estão seus roteiros personalizados.
              </p>

              {criandoNovo && (
                <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center">
                  <div className="absolute inset-0 bg-black/40" onClick={() => setCriandoNovo(false)} />
                  <div className="relative bg-white rounded-t-3xl md:rounded-3xl w-full md:max-w-md p-6 z-10">
                    <h2 className="text-lg font-semibold text-gray-900 mb-6">Novo roteiro</h2>
                    <div className="space-y-4">
                      <div>
                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">Nome do roteiro</label>
                        <input
                          type="text"
                          value={novoRoteiro.titulo}
                          onChange={(e) => setNovoRoteiro({ ...novoRoteiro, titulo: e.target.value })}
                          placeholder="Ex: Fim de semana em Ilhabela"
                          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">Descrição</label>
                        <textarea
                          value={novoRoteiro.descricao}
                          onChange={(e) => setNovoRoteiro({ ...novoRoteiro, descricao: e.target.value })}
                          placeholder="Descreva o roteiro..."
                          rows={3}
                          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">Foto de capa</label>
                        <label className="flex items-center justify-center gap-2 cursor-pointer bg-gray-100 hover:bg-gray-200 px-4 py-3 rounded-xl text-sm text-gray-600 font-medium">
                          {uploadandoNovo ? 'Enviando...' : (novoRoteiro.foto_capa ? 'Trocar foto' : '📷 Upload de foto (opcional)')}
                          <input type="file" accept="image/*" onChange={handleUploadNovoRoteiro} className="hidden" />
                        </label>
                        {novoRoteiro.foto_capa && (
                          <img src={novoRoteiro.foto_capa} alt="Preview" className="mt-3 h-32 w-full object-cover rounded-xl" />
                        )}
                        {!novoRoteiro.foto_capa && (
                          <p className="text-xs text-gray-400 mt-2">Se não enviar, usaremos automaticamente a foto de um dos atrativos do roteiro.</p>
                        )}
                      </div>
                      <label className="flex items-center gap-2 text-sm text-gray-600">
                        <input
                          type="checkbox"
                          checked={novoRoteiro.publico}
                          onChange={(e) => setNovoRoteiro({ ...novoRoteiro, publico: e.target.checked })}
                        />
                        Tornar público (outras pessoas podem ver)
                      </label>
                      <div className="flex gap-3 pt-2">
                        <button
                          onClick={handleCriarRoteiro}
                          disabled={salvandoNovo || !novoRoteiro.titulo}
                          className="flex-1 py-3 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-gray-700 transition-colors disabled:opacity-50"
                        >
                          {salvandoNovo ? 'Criando...' : 'Criar roteiro'}
                        </button>
                        <button
                          onClick={() => setCriandoNovo(false)}
                          className="px-6 py-3 border border-gray-200 rounded-xl text-sm text-gray-600 hover:border-gray-400 transition-colors"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {carregandoMeus ? (
                <p className="text-gray-400 text-center py-20">Carregando...</p>
              ) : meusRoteiros.length === 0 ? (
                <div className="text-center py-20">
                  <p className="text-gray-400 mb-4">Você ainda não criou nenhum roteiro.</p>
                  <Link
                    href="/explorar"
                    className="text-sm bg-gray-900 text-white px-6 py-3 rounded-full hover:bg-gray-700 transition-colors"
                  >
                    Explorar destinos
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {meusRoteiros.map((roteiro) => {
                    const fotoMeuRoteiro = getFotoRoteiro(roteiro)
                    return (
                    <div key={roteiro.id} className="border border-gray-100 rounded-2xl p-6 hover:border-gray-200 transition-colors">
                      <div className="flex items-start justify-between mb-4">
                        <Link
                          href={`/roteiros/${roteiro.slug}`}
                          className="font-semibold text-gray-900 text-lg leading-tight hover:underline underline-offset-2"
                        >
                          {roteiro.titulo}
                        </Link>
                        <button
                          onClick={() => handleTogglePublico(roteiro)}
                          className={`text-xs px-2 py-0.5 rounded-full ml-2 flex-shrink-0 transition-colors ${
                            roteiro.publico
                              ? 'bg-green-100 text-green-700 hover:bg-green-200'
                              : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                          }`}
                        >
                          {roteiro.publico ? 'Público' : 'Privado'}
                        </button>
                      </div>

                      <div className="space-y-2 mb-6">
                        {roteiro.roteiro_atrativos?.length === 0 && (
                          <p className="text-sm text-gray-400">Nenhum atrativo ainda.</p>
                        )}
                        {roteiro.roteiro_atrativos?.map((item: any) => (
                          <div key={item.id} className="flex items-center gap-3 group">
                            <Link
                              href={`/atrativos/${item.atrativos?.slug}`}
                              className="flex items-center gap-3 flex-1 min-w-0"
                            >
                              <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                                {item.atrativos?.foto_capa ? (
                                  <img
                                    src={item.atrativos.foto_capa}
                                    alt={item.atrativos.nome}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200" />
                                )}
                              </div>
                              <p className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors truncate">
                                {item.atrativos?.nome}
                              </p>
                            </Link>
                            <button
                              onClick={() => handleRemoverAtrativo(item.id, roteiro.id)}
                              className="text-gray-300 hover:text-red-400 transition-colors flex-shrink-0 opacity-0 group-hover:opacity-100"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                        <p className="text-xs text-gray-400">
                          {roteiro.roteiro_atrativos?.length} atrativo{roteiro.roteiro_atrativos?.length !== 1 ? 's' : ''}
                        </p>
                        <div className="flex items-center gap-3">
                          <Link
                            href={`/roteiros/${roteiro.slug}?editar=true`}
                            className="text-xs text-gray-400 hover:text-gray-900 transition-colors"
                          >
                            Editar
                          </Link>
                          <button
                            onClick={() => handleCompartilhar(roteiro)}
                            className="text-xs text-gray-400 hover:text-gray-900 transition-colors"
                          >
                            {copiado === roteiro.id ? 'Link copiado ✓' : 'Compartilhar'}
                          </button>
                          <button
                            onClick={() => handleDeletar(roteiro.id)}
                            disabled={deletando === roteiro.id}
                            className="text-xs text-gray-400 hover:text-red-500 transition-colors"
                          >
                            {deletando === roteiro.id ? 'Deletando...' : 'Deletar'}
                          </button>
                        </div>
                      </div>
                    </div>
                    )
                  })}
                </div>
              )}
            </>
          )}
        </>
      )}

      {aba === 'salvos' && (
        <>
          {checandoUser ? (
            <p className="text-gray-400 text-center py-20">Carregando...</p>
          ) : !user ? (
            <div className="text-center py-20">
              <p className="text-gray-500 mb-6">Entre para ver os roteiros que você salvou.</p>
              <button
                onClick={handleLoginGoogle}
                className="text-sm bg-gray-900 text-white px-6 py-3 rounded-full hover:bg-gray-700 transition-colors"
              >
                Entrar com Google
              </button>
            </div>
          ) : (
            <>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Roteiros salvos</h1>
              <p className="text-gray-500 mb-10">Roteiros de outras pessoas que você guardou pra depois</p>

              {carregandoSalvos ? (
                <p className="text-gray-400 text-center py-20">Carregando...</p>
              ) : roteirosSalvos.length === 0 ? (
                <div className="text-center py-20">
                  <p className="text-gray-400 mb-4">Você ainda não salvou nenhum roteiro.</p>
                  <button
                    onClick={() => setAba('descobrir')}
                    className="text-sm bg-gray-900 text-white px-6 py-3 rounded-full hover:bg-gray-700 transition-colors"
                  >
                    Descobrir roteiros
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {roteirosSalvos.map((roteiro) => {
                    const fotoSalvo = getFotoRoteiro(roteiro)
                    return (
                    <div key={roteiro.salvoId} className="group relative">
                      <button
                        onClick={() => handleRemoverSalvo(roteiro.salvoId)}
                        className="absolute top-3 right-3 z-10 bg-white/90 hover:bg-white text-gray-900 rounded-full p-2 shadow-md transition-colors"
                        title="Remover dos salvos"
                      >
                        ✕
                      </button>
                      <Link href={`/roteiros/${roteiro.slug}`}>
                        <div className="relative h-52 rounded-2xl overflow-hidden bg-gray-100 mb-4">
                          {fotoSalvo ? (
                            <img
                              src={fotoSalvo}
                              alt={roteiro.titulo}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                              <span className="text-4xl">🗺️</span>
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                          {roteiro.duracao_dias && (
                            <span className="absolute bottom-3 left-3 text-xs font-medium text-white bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded-full">
                              {roteiro.duracao_dias} {roteiro.duracao_dias === 1 ? 'dia' : 'dias'}
                            </span>
                          )}
                        </div>
                        <p className="font-semibold text-gray-900">{roteiro.titulo}</p>
                        {roteiro.descricao && (
                          <p className="text-sm text-gray-400 mt-1 line-clamp-2">{roteiro.descricao}</p>
                        )}
                      </Link>
                    </div>
                    )
                  })}
                </div>
              )}
            </>
          )}
        </>
      )}

      {aba === 'seguindo' && (
        <>
          {checandoUser ? (
            <p className="text-gray-400 text-center py-20">Carregando...</p>
          ) : !user ? (
            <div className="text-center py-20">
              <p className="text-gray-500 mb-6">Entre para ver roteiros de quem você segue.</p>
              <button
                onClick={handleLoginGoogle}
                className="text-sm bg-gray-900 text-white px-6 py-3 rounded-full hover:bg-gray-700 transition-colors"
              >
                Entrar com Google
              </button>
            </div>
          ) : (
            <>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Seguindo</h1>
              <p className="text-gray-500 mb-10">Roteiros públicos de quem você segue</p>

              {carregandoSeguindo ? (
                <p className="text-gray-400 text-center py-20">Carregando...</p>
              ) : roteirosSeguindo.length === 0 ? (
                <p className="text-gray-400 text-center py-20">
                  Ninguém que você segue publicou roteiros ainda — ou você ainda não segue ninguém.
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {roteirosSeguindo.map((roteiro) => {
                    const foto = getFotoRoteiro(roteiro)
                    return (
                      <Link key={roteiro.id} href={`/roteiros/${roteiro.slug}`} className="group">
                        <div className="relative h-52 rounded-2xl overflow-hidden bg-gray-100 mb-4">
                          {foto ? (
                            <img src={foto} alt={roteiro.titulo} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                              <span className="text-4xl">🗺️</span>
                            </div>
                          )}
                        </div>
                        <p className="font-semibold text-gray-900">{roteiro.titulo}</p>
                        {roteiro.profiles?.nome && (
                          <p className="text-xs text-gray-400 mt-1">por {roteiro.profiles.nome}</p>
                        )}
                      </Link>
                    )
                  })}
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  )
}