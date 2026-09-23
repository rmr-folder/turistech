'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '../../../lib/supabase-browser'
import { isAdmin } from '../../../lib/admin'

interface Props {
  roteiro: any
  itensIniciais: any[]
  criador: { nome: string; avatar_url: string; username?: string } | null
  abrirEdicao?: boolean
}

export default function RoteiroDetailClient({ roteiro, itensIniciais, criador, abrirEdicao }: Props) {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [ehAdmin, setEhAdmin] = useState(false)
  const [canEdit, setCanEdit] = useState(false)
  const [estaEditando, setEstaEditando] = useState(false)
  const [itens, setItens] = useState<any[]>(itensIniciais)
  const [diasExibidos, setDiasExibidos] = useState<number[]>(
    [...new Set(itensIniciais.map((i) => i.dia))].sort((a, b) => a - b)
  )
  const [atrativosDisponiveis, setAtrativosDisponiveis] = useState<any[]>([])
  const [adicionandoEmDia, setAdicionandoEmDia] = useState<number | null>(null)
  const [atrativoSelecionado, setAtrativoSelecionado] = useState('')
  const [buscaAtrativo, setBuscaAtrativo] = useState('')
  const [dropdownAberto, setDropdownAberto] = useState(false)
  const [processando, setProcessando] = useState(false)
  const [updatedAt, setUpdatedAt] = useState(roteiro.updated_at)
  const [descricaoAtual, setDescricaoAtual] = useState(roteiro.descricao || '')
  const [fotoAtual, setFotoAtual] = useState(roteiro.foto_capa || '')
  const [uploadandoFoto, setUploadandoFoto] = useState(false)
  const [salvandoInfo, setSalvandoInfo] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      const admin = await isAdmin(user?.email)
      setEhAdmin(admin)
      const podeEditar = !!user && (user.id === roteiro.user_id || admin)
      setCanEdit(podeEditar)
      if (abrirEdicao && podeEditar) {
        await handleEntrarModoEdicao()
      }
    }
    init()
  }, [])

  const carregarAtrativosDisponiveis = async () => {
    if (atrativosDisponiveis.length > 0) return
    const { data } = await supabase
      .from('atrativos')
      .select('id, nome, municipios(nome)')
      .order('nome')
    setAtrativosDisponiveis(data || [])
  }

  const handleEntrarModoEdicao = async () => {
    setEstaEditando(true)
    await carregarAtrativosDisponiveis()
  }

  const marcarAtualizado = () => setUpdatedAt(new Date().toISOString())

  const handleUploadFoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadandoFoto(true)
    const ext = file.name.split('.').pop()
    const fileName = `roteiro-${roteiro.slug}-${Date.now()}.${ext}`
    const { error } = await supabase.storage.from('imagens').upload(fileName, file)
    if (!error) {
      const { data } = supabase.storage.from('imagens').getPublicUrl(fileName)
      setFotoAtual(data.publicUrl)
    }
    setUploadandoFoto(false)
  }

  const handleSalvarInfo = async () => {
    setSalvandoInfo(true)
    const { error } = await supabase
      .from('roteiros')
      .update({ descricao: descricaoAtual || null, foto_capa: fotoAtual || null })
      .eq('id', roteiro.id)
    if (!error) {
      marcarAtualizado()
      router.refresh()
    }
    setSalvandoInfo(false)
  }

  const handleAdicionarDia = () => {
    const proximoDia = diasExibidos.length > 0 ? Math.max(...diasExibidos) + 1 : 1
    setDiasExibidos([...diasExibidos, proximoDia])
  }

  const handleExcluirDia = async (dia: number) => {
    if (!confirm(`Excluir o Dia ${dia}? Os atrativos dele serão removidos do roteiro.`)) return
    setProcessando(true)

    await supabase.from('roteiro_atrativos').delete().eq('roteiro_id', roteiro.id).eq('dia', dia)

    const itensRestantesAcima = itens.filter((i) => i.dia > dia)
    for (const item of itensRestantesAcima) {
      await supabase.from('roteiro_atrativos').update({ dia: item.dia - 1 }).eq('id', item.id)
    }

    setItens(
      itens
        .filter((i) => i.dia !== dia)
        .map((i) => (i.dia > dia ? { ...i, dia: i.dia - 1 } : i))
    )
    setDiasExibidos(diasExibidos.filter((d) => d !== dia).map((d) => (d > dia ? d - 1 : d)))
    marcarAtualizado()
    setProcessando(false)
  }

  const handleMoverDia = async (dia: number, direcao: 'cima' | 'baixo') => {
    const diaAlvo = direcao === 'cima' ? dia - 1 : dia + 1
    if (!diasExibidos.includes(diaAlvo)) return
    setProcessando(true)

    const itensDia = itens.filter((i) => i.dia === dia)
    const itensAlvo = itens.filter((i) => i.dia === diaAlvo)

    for (const item of itensDia) {
      await supabase.from('roteiro_atrativos').update({ dia: diaAlvo }).eq('id', item.id)
    }
    for (const item of itensAlvo) {
      await supabase.from('roteiro_atrativos').update({ dia: dia }).eq('id', item.id)
    }

    setItens(
      itens.map((i) => {
        if (i.dia === dia) return { ...i, dia: diaAlvo }
        if (i.dia === diaAlvo) return { ...i, dia: dia }
        return i
      })
    )
    marcarAtualizado()
    setProcessando(false)
  }

  const handleAdicionarAtrativo = async (dia: number) => {
    if (!atrativoSelecionado) return
    setProcessando(true)
    const ordem = itens.filter((i) => i.dia === dia).length + 1

    const { data, error } = await supabase
      .from('roteiro_atrativos')
      .insert({ roteiro_id: roteiro.id, atrativo_id: atrativoSelecionado, dia, ordem })
      .select('*, atrativos(id, nome, slug, descricao, categoria, foto_capa, municipios(nome, estado, slug))')
      .single()

    if (!error && data) {
      setItens([...itens, data])
      marcarAtualizado()
    }
    setAtrativoSelecionado('')
    setBuscaAtrativo('')
    setAdicionandoEmDia(null)
    setProcessando(false)
  }

  const handleRemoverAtrativo = async (itemId: string) => {
    await supabase.from('roteiro_atrativos').delete().eq('id', itemId)
    setItens(itens.filter((i) => i.id !== itemId))
    marcarAtualizado()
  }

  const normalizar = (texto: string) =>
    texto.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')

  const atrativosFiltrados = buscaAtrativo
    ? atrativosDisponiveis.filter((a) =>
        normalizar(`${a.nome} ${a.municipios?.nome || ''}`).includes(normalizar(buscaAtrativo))
      )
    : atrativosDisponiveis

  const handleSelecionarAtrativo = (atrativo: any) => {
    setAtrativoSelecionado(atrativo.id)
    setBuscaAtrativo(`${atrativo.nome} — ${atrativo.municipios?.nome || ''}`)
    setDropdownAberto(false)
  }

  const formatarData = (data: string) =>
    new Date(data).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })

  const mostrarAtualizacao =
    updatedAt && new Date(updatedAt).getTime() - new Date(roteiro.created_at).getTime() > 60000

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      {/* Cabeçalho: criador, datas, editar */}
      <div className="flex items-start justify-between mb-8 pb-8 border-b border-gray-100">
        {criador?.username ? (
          <Link href={`/perfil/${criador.username}`} className="flex items-center gap-3 group">
            {criador.avatar_url ? (
              <img src={criador.avatar_url} alt={criador.nome} className="w-10 h-10 rounded-full" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-sm font-semibold">
                {criador.nome?.[0]?.toUpperCase() || '?'}
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-gray-900 group-hover:underline underline-offset-2">{criador.nome}</p>
              <p className="text-xs text-gray-400">
                Criado em {formatarData(roteiro.created_at)}
                {mostrarAtualizacao && ` · Atualizado em ${formatarData(updatedAt)}`}
              </p>
            </div>
          </Link>
        ) : (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-sm font-semibold">
              🗺️
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Turistech</p>
              <p className="text-xs text-gray-400">
                Criado em {formatarData(roteiro.created_at)}
                {mostrarAtualizacao && ` · Atualizado em ${formatarData(updatedAt)}`}
              </p>
            </div>
          </div>
        )}

        {canEdit && (
          <button
            onClick={() => (estaEditando ? setEstaEditando(false) : handleEntrarModoEdicao())}
            className={`text-sm font-medium px-4 py-2 rounded-full transition-colors flex-shrink-0 ${
              estaEditando ? 'bg-gray-900 text-white' : 'border border-gray-200 text-gray-600 hover:border-gray-400'
            }`}
          >
            {estaEditando ? 'Concluir edição' : '✏️ Editar'}
          </button>
        )}
      </div>

      {estaEditando ? (
        <div className="mb-12 bg-gray-50 rounded-2xl p-5 space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">Descrição</label>
            <textarea
              value={descricaoAtual}
              onChange={(e) => setDescricaoAtual(e.target.value)}
              rows={3}
              placeholder="Descreva o roteiro..."
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">Foto de capa</label>
            <div className="flex gap-3 items-center">
              <label className="flex-shrink-0 cursor-pointer bg-white hover:bg-gray-100 border border-gray-200 px-4 py-2.5 rounded-xl text-sm text-gray-600 font-medium">
                {uploadandoFoto ? 'Enviando...' : '📷 Trocar foto'}
                <input type="file" accept="image/*" onChange={handleUploadFoto} className="hidden" />
              </label>
              {fotoAtual && (
                <img src={fotoAtual} alt="Preview" className="h-14 w-20 object-cover rounded-lg" />
              )}
            </div>
          </div>
          <button
            onClick={handleSalvarInfo}
            disabled={salvandoInfo}
            className="text-sm bg-gray-900 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            {salvandoInfo ? 'Salvando...' : 'Salvar informações'}
          </button>
        </div>
      ) : (
        descricaoAtual && (
          <p className="text-lg text-gray-600 leading-relaxed mb-12">{descricaoAtual}</p>
        )
      )}

      {/* Dias */}
      {diasExibidos.map((dia) => (
        <div key={dia} className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-gray-900 text-white text-sm flex items-center justify-center">
                {dia}
              </span>
              Dia {dia}
            </h2>
            {estaEditando && (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleMoverDia(dia, 'cima')}
                  disabled={dia === Math.min(...diasExibidos) || processando}
                  className="p-2 text-gray-400 hover:text-gray-900 disabled:opacity-20 transition-colors"
                  title="Mover para cima"
                >
                  ↑
                </button>
                <button
                  onClick={() => handleMoverDia(dia, 'baixo')}
                  disabled={dia === Math.max(...diasExibidos) || processando}
                  className="p-2 text-gray-400 hover:text-gray-900 disabled:opacity-20 transition-colors"
                  title="Mover para baixo"
                >
                  ↓
                </button>
                <button
                  onClick={() => handleExcluirDia(dia)}
                  disabled={processando}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                  title="Excluir dia"
                >
                  🗑️
                </button>
              </div>
            )}
          </div>

          <div className="space-y-4">
            {itens
              .filter((i) => i.dia === dia)
              .map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 p-4 rounded-2xl border border-gray-100 hover:border-gray-300 transition-colors group"
                >
                  <Link href={`/atrativos/${item.atrativos?.slug}`} className="flex gap-4 flex-1 min-w-0">
                    <div className="w-24 h-24 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                      {item.atrativos?.foto_capa ? (
                        <img
                          src={item.atrativos.foto_capa}
                          alt={item.atrativos.nome}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-400 mb-1">{item.atrativos?.categoria}</p>
                      <p className="font-semibold text-gray-900">{item.atrativos?.nome}</p>
                      <p className="text-sm text-gray-400 mt-0.5">
                        {item.atrativos?.municipios?.nome}, {item.atrativos?.municipios?.estado}
                      </p>
                    </div>
                  </Link>
                  {estaEditando && (
                    <button
                      onClick={() => handleRemoverAtrativo(item.id)}
                      className="text-gray-300 hover:text-red-400 transition-colors flex-shrink-0 self-start"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}

            {itens.filter((i) => i.dia === dia).length === 0 && (
              <p className="text-sm text-gray-400">Nenhum atrativo neste dia ainda.</p>
            )}
          </div>

          {estaEditando && (
            <div className="mt-4">
              {adicionandoEmDia === dia ? (
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={buscaAtrativo}
                      onChange={(e) => {
                        setBuscaAtrativo(e.target.value)
                        setAtrativoSelecionado('')
                        setDropdownAberto(true)
                      }}
                      onFocus={() => setDropdownAberto(true)}
                      placeholder="Buscar atrativo..."
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900"
                    />
                    {dropdownAberto && (
                      <div className="absolute z-10 top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-56 overflow-y-auto">
                        {atrativosFiltrados.length === 0 ? (
                          <p className="text-sm text-gray-400 px-4 py-3">Nenhum atrativo encontrado.</p>
                        ) : (
                          atrativosFiltrados.slice(0, 50).map((a) => (
                            <button
                              key={a.id}
                              onClick={() => handleSelecionarAtrativo(a)}
                              className="w-full text-left px-4 py-2.5 text-sm text-gray-900 hover:bg-gray-50 transition-colors"
                            >
                              {a.nome} <span className="text-gray-400">— {a.municipios?.nome}</span>
                            </button>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => handleAdicionarAtrativo(dia)}
                    disabled={!atrativoSelecionado || processando}
                    className="px-4 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-gray-700 transition-colors disabled:opacity-50 flex-shrink-0"
                  >
                    Adicionar
                  </button>
                  <button
                    onClick={() => { setAdicionandoEmDia(null); setAtrativoSelecionado(''); setBuscaAtrativo('') }}
                    className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 flex-shrink-0"
                  >
                    Cancelar
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setAdicionandoEmDia(dia)}
                  className="text-sm text-gray-500 hover:text-gray-900 border border-dashed border-gray-200 hover:border-gray-400 rounded-xl px-4 py-2.5 w-full transition-colors"
                >
                  + Adicionar atrativo
                </button>
              )}
            </div>
          )}
        </div>
      ))}

      {estaEditando && (
        <button
          onClick={handleAdicionarDia}
          className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-5 py-3 rounded-xl font-medium transition-colors"
        >
          + Adicionar dia
        </button>
      )}
    </div>
  )
}