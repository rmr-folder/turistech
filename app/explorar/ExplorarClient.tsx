'use client'

import { useState } from 'react'
import Link from 'next/link'
import { registrarEvento } from '../../lib/eventos'
import { getFotoRoteiro } from '../../lib/roteiroFoto'

interface Atrativo {
  id: string
  nome: string
  slug: string
  categoria: string
  foto_capa: string
  municipios?: { nome: string; estado: string; slug: string }
}

interface Municipio {
  id: string
  nome: string
  slug: string
  estado: string
  foto_capa: string
  tipos: string[]
  atrativos: Atrativo[]
}

interface Roteiro {
  id: string
  titulo: string
  slug: string
  descricao: string
  duracao_dias: number
  foto_capa: string
  roteiro_atrativos?: any[]
}

interface Pessoa {
  id: string
  nome: string
  username: string
  avatar_url: string
  bio: string
}

interface Props {
  municipios: Municipio[]
  atrativos: Atrativo[]
  roteiros: Roteiro[]
  pessoas: Pessoa[]
  estados: string[]
  categorias: string[]
}

const TIPOS = [
  { label: 'Praia', emoji: '🏖️', cor: 'from-blue-400 to-cyan-300' },
  { label: 'Serra e Frio', emoji: '🏔️', cor: 'from-slate-500 to-slate-400' },
  { label: 'Ecoturismo', emoji: '🌿', cor: 'from-green-500 to-emerald-400' },
  { label: 'Cultura e História', emoji: '🏛️', cor: 'from-amber-500 to-yellow-400' },
  { label: 'Aventura', emoji: '🤿', cor: 'from-orange-500 to-red-400' },
  { label: 'Religioso', emoji: '🙏', cor: 'from-purple-500 to-violet-400' },
]

export default function ExplorarClient({ municipios, atrativos, roteiros, pessoas, estados, categorias }: Props) {
  const [busca, setBusca] = useState('')
  const [tipoSelecionado, setTipoSelecionado] = useState('')

  const buscaAtiva = busca.length > 0 || tipoSelecionado.length > 0

  const municipiosFiltrados = municipios.filter((m) => {
    const bateBusca = !busca || m.nome.toLowerCase().includes(busca.toLowerCase())
    const bateTipo = !tipoSelecionado || m.tipos?.includes(tipoSelecionado)
    return bateBusca && bateTipo
  })

  const agrativosFiltrados = atrativos.filter((a) => {
    const bateBusca = !busca ||
      a.nome.toLowerCase().includes(busca.toLowerCase()) ||
      a.municipios?.nome.toLowerCase().includes(busca.toLowerCase())
    const bateTipo = !tipoSelecionado || municipios
      .find(m => m.slug === a.municipios?.['slug'])
      ?.tipos?.includes(tipoSelecionado)
    return bateBusca && bateTipo
  })

  const roteirosFiltrados = roteiros.filter((r) => {
    const bateBusca = !busca || r.titulo.toLowerCase().includes(busca.toLowerCase())
    return bateBusca
  })

  const pessoasFiltradas = pessoas.filter((p) => {
    if (!busca) return false
    return (
      p.nome?.toLowerCase().includes(busca.toLowerCase()) ||
      p.username?.toLowerCase().includes(busca.toLowerCase())
    )
  })

  return (
    <div>
      {/* Campo de busca */}
      <div className="relative mb-8">
        <input
          type="text"
          placeholder="Buscar destino, atrativo ou roteiro..."
          value={busca}
          onChange={(e) => {
            setBusca(e.target.value)
            setTipoSelecionado('')
            if (e.target.value.length > 2) {
            registrarEvento('busca', 'explorar', undefined, { termo: e.target.value })
            }
          }}
          className="w-full border border-gray-200 rounded-2xl px-5 py-4 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 text-lg"
        />
        {busca && (
          <button
            onClick={() => setBusca('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        )}
      </div>

      {/* Quadrantes de experiência */}
      {!busca && (
        <div className="mb-10">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
            Explorar por experiência
          </p>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {TIPOS.map((t) => (
              <button
                key={t.label}
                onClick={() => setTipoSelecionado(tipoSelecionado === t.label ? '' : t.label)}
                className={`relative rounded-2xl overflow-hidden h-24 flex flex-col items-center justify-center gap-1 transition-all ${
                  tipoSelecionado === t.label
                    ? 'ring-2 ring-gray-900 scale-95'
                    : 'hover:scale-95'
                }`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${t.cor}`} />
                <span className="relative text-2xl">{t.emoji}</span>
                <span className="relative text-xs font-semibold text-white text-center px-1 leading-tight">
                  {t.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Resultados quando busca ou tipo ativo */}
      {buscaAtiva ? (
        <div className="space-y-12">
          {/* Municípios */}
          {municipiosFiltrados.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Municípios</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {municipiosFiltrados.map((municipio) => (
                  <Link key={municipio.id} href={`/municipios/${municipio.slug}`} className="group">
                    <div className="relative h-36 rounded-2xl overflow-hidden bg-gray-100 mb-2">
                      {municipio.foto_capa ? (
                        <img src={municipio.foto_capa} alt={municipio.nome} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200" />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                      <span className="absolute bottom-2 left-2 text-xs font-medium text-white bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded-full">
                        {municipio.estado}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-gray-900">{municipio.nome}</p>
                    <p className="text-xs text-gray-400">{municipio.atrativos?.length} atrativos</p>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Atrativos */}
          {agrativosFiltrados.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Atrativos</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {agrativosFiltrados.map((atrativo) => (
                  <Link key={atrativo.id} href={`/atrativos/${atrativo.slug}`} className="group">
                    <div className="relative h-36 rounded-2xl overflow-hidden bg-gray-100 mb-2">
                      {atrativo.foto_capa ? (
                        <img src={atrativo.foto_capa} alt={atrativo.nome} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200" />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                      <span className="absolute bottom-2 left-2 text-xs font-medium text-white bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded-full">
                        {atrativo.categoria}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-gray-900">{atrativo.nome}</p>
                    <p className="text-xs text-gray-400">{atrativo.municipios?.nome}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Pessoas */}
          {pessoasFiltradas.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Pessoas</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {pessoasFiltradas.map((pessoa) => (
                  <Link key={pessoa.id} href={`/perfil/${pessoa.username}`} className="flex items-center gap-3 p-3 rounded-2xl border border-gray-100 hover:border-gray-300 transition-colors">
                    {pessoa.avatar_url ? (
                      <img src={pessoa.avatar_url} alt={pessoa.nome} className="w-12 h-12 rounded-full flex-shrink-0" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-semibold flex-shrink-0">
                        {pessoa.nome?.[0]?.toUpperCase() || '?'}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{pessoa.nome}</p>
                      <p className="text-xs text-gray-400 truncate">@{pessoa.username}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Roteiros */}
          {roteirosFiltrados.length > 0 && !tipoSelecionado && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Roteiros</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {roteirosFiltrados.map((roteiro) => (
                  <Link key={roteiro.id} href={`/roteiros/${roteiro.slug}`} className="group">
                    <div className="relative h-40 rounded-2xl overflow-hidden bg-gray-100 mb-2">
                      {getFotoRoteiro(roteiro) ? (
                        <img src={getFotoRoteiro(roteiro)!} alt={roteiro.titulo} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                          <span className="text-3xl">🗺️</span>
                        </div>
                      )}
                      {roteiro.duracao_dias && (
                        <span className="absolute bottom-2 left-2 text-xs font-medium text-white bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded-full">
                          {roteiro.duracao_dias} dias
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-semibold text-gray-900">{roteiro.titulo}</p>
                    {roteiro.descricao && (
                      <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{roteiro.descricao}</p>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {municipiosFiltrados.length === 0 && agrativosFiltrados.length === 0 && roteirosFiltrados.length === 0 && pessoasFiltradas.length === 0 && (
            <p className="text-gray-400 text-center py-20">Nenhum resultado encontrado.</p>
          )}
        </div>
      ) : (
        /* Seções padrão quando nada está selecionado */
        <div className="space-y-12">
          {/* Roteiros em destaque */}
          {roteiros.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Roteiros em destaque</h2>
                <Link href="/roteiros" className="text-sm text-gray-400 hover:text-gray-900 transition-colors">
                  Ver todos →
                </Link>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-2 -mx-1 px-1">
                {roteiros.slice(0, 5).map((roteiro) => (
                  <Link key={roteiro.id} href={`/roteiros/${roteiro.slug}`} className="flex-shrink-0 w-56 group">
                    <div className="relative h-36 rounded-2xl overflow-hidden bg-gray-100 mb-2">
                      {getFotoRoteiro(roteiro) ? (
                        <img src={getFotoRoteiro(roteiro)!} alt={roteiro.titulo} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                          <span className="text-3xl">🗺️</span>
                        </div>
                      )}
                      {roteiro.duracao_dias && (
                        <span className="absolute bottom-2 left-2 text-xs font-medium text-white bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded-full">
                          {roteiro.duracao_dias} dias
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-semibold text-gray-900 leading-tight">{roteiro.titulo}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Municípios */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Destinos</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {municipios.slice(0, 8).map((municipio) => (
                <Link key={municipio.id} href={`/municipios/${municipio.slug}`} className="group">
                  <div className="relative h-36 rounded-2xl overflow-hidden bg-gray-100 mb-2">
                    {municipio.foto_capa ? (
                      <img src={municipio.foto_capa} alt={municipio.nome} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    <span className="absolute bottom-2 left-2 text-xs font-medium text-white bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded-full">
                      {municipio.estado}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-gray-900">{municipio.nome}</p>
                  <p className="text-xs text-gray-400">{municipio.atrativos?.length} atrativos</p>
                </Link>
              ))}
            </div>
          </div>

          {/* Atrativos */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Atrativos</h2>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-2 -mx-1 px-1">
              {atrativos.slice(0, 10).map((atrativo) => (
                <Link key={atrativo.id} href={`/atrativos/${atrativo.slug}`} className="flex-shrink-0 w-44 group">
                  <div className="relative h-36 rounded-2xl overflow-hidden bg-gray-100 mb-2">
                    {atrativo.foto_capa ? (
                      <img src={atrativo.foto_capa} alt={atrativo.nome} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    <span className="absolute bottom-2 left-2 text-xs font-medium text-white bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded-full">
                      {atrativo.categoria}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-gray-900 leading-tight">{atrativo.nome}</p>
                  <p className="text-xs text-gray-400">{atrativo.municipios?.nome}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}