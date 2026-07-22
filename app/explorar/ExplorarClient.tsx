'use client'

import { useState } from 'react'
import Link from 'next/link'

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
  atrativos: Atrativo[]
}

interface Props {
  municipios: Municipio[]
  atrativos: Atrativo[]
  estados: string[]
  categorias: string[]
}

export default function ExplorarClient({ municipios, atrativos, estados, categorias }: Props) {
  const [busca, setBusca] = useState('')
  const [tipo, setTipo] = useState<'municipios' | 'atrativos'>('municipios')
  const [estado, setEstado] = useState('')
  const [categoria, setCategoria] = useState('')

  const municipiosFiltrados = municipios.filter((m) => {
    const bateBusca = !busca || m.nome.toLowerCase().includes(busca.toLowerCase())
    const bateEstado = !estado || m.estado === estado
    return bateBusca && bateEstado
  })

  const agrativosFiltrados = atrativos.filter((a) => {
    const bateBusca = !busca || a.nome.toLowerCase().includes(busca.toLowerCase())
    const bateCategoria = !categoria || a.categoria === categoria
    const bateEstado = !estado || a.municipios?.estado === estado
    return bateBusca && bateCategoria && bateEstado
  })

  const tipos = [
    { key: 'municipios', label: 'Municípios' },
    { key: 'atrativos', label: 'Atrativos' },
    { key: 'roteiros', label: 'Roteiros', disabled: true },
  ]

  return (
    <div>
      {/* Campo de busca */}
      <div className="relative mb-8">
        <input
          type="text"
          placeholder={tipo === 'municipios' ? 'Buscar município...' : 'Buscar atrativo...'}
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
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

      {/* Filtro de tipo */}
      <div className="mb-8">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">O que você procura?</p>
        <div className="flex gap-2">
          {tipos.map((t) => (
            <button
              key={t.key}
              onClick={() => {
                if (!t.disabled) {
                  setTipo(t.key as 'municipios' | 'atrativos')
                  setBusca('')
                  setEstado('')
                  setCategoria('')
                }
              }}
              disabled={t.disabled}
              className={`px-5 py-2 rounded-full text-sm border transition-colors ${
                t.disabled
                  ? 'border-gray-100 text-gray-300 cursor-not-allowed'
                  : tipo === t.key
                  ? 'bg-gray-900 text-white border-gray-900'
                  : 'border-gray-200 text-gray-600 hover:border-gray-400'
              }`}
            >
              {t.label}
              {t.disabled && <span className="ml-1 text-xs">(em breve)</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Filtros secundários */}
      <div className="flex flex-wrap gap-8 mb-12">
        {/* Filtro por estado */}
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Estado</p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setEstado('')}
              className={`px-4 py-1.5 rounded-full text-sm border transition-colors ${
                !estado ? 'bg-gray-900 text-white border-gray-900' : 'border-gray-200 text-gray-600 hover:border-gray-400'
              }`}
            >
              Todos
            </button>
            {estados.map((e) => (
              <button
                key={e}
                onClick={() => setEstado(estado === e ? '' : e)}
                className={`px-4 py-1.5 rounded-full text-sm border transition-colors ${
                  estado === e ? 'bg-gray-900 text-white border-gray-900' : 'border-gray-200 text-gray-600 hover:border-gray-400'
                }`}
              >
                {e}
              </button>
            ))}
          </div>
        </div>

        {/* Filtro por categoria — só aparece em Atrativos */}
        {tipo === 'atrativos' && (
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Categoria</p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setCategoria('')}
                className={`px-4 py-1.5 rounded-full text-sm border transition-colors ${
                  !categoria ? 'bg-gray-900 text-white border-gray-900' : 'border-gray-200 text-gray-600 hover:border-gray-400'
                }`}
              >
                Todas
              </button>
              {categorias.map((c) => (
                <button
                  key={c}
                  onClick={() => setCategoria(categoria === c ? '' : c)}
                  className={`px-4 py-1.5 rounded-full text-sm border transition-colors ${
                    categoria === c ? 'bg-gray-900 text-white border-gray-900' : 'border-gray-200 text-gray-600 hover:border-gray-400'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Resultados — Municípios */}
      {tipo === 'municipios' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {municipiosFiltrados.map((municipio) => (
            <Link key={municipio.id} href={`/municipios/${municipio.slug}`} className="group">
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
          {municipiosFiltrados.length === 0 && (
            <p className="text-gray-400 col-span-3 text-center py-20">Nenhum município encontrado.</p>
          )}
        </div>
      )}

      {/* Resultados — Atrativos */}
      {tipo === 'atrativos' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {agrativosFiltrados.map((atrativo) => (
            <Link key={atrativo.id} href={`/atrativos/${atrativo.slug}`} className="group">
              <div className="relative h-52 rounded-2xl overflow-hidden bg-gray-100 mb-4">
                {atrativo.foto_capa ? (
                  <img
                    src={atrativo.foto_capa}
                    alt={atrativo.nome}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                <span className="absolute bottom-3 left-3 text-xs font-medium text-white bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded-full">
                  {atrativo.categoria}
                </span>
              </div>
              <p className="font-semibold text-gray-900">{atrativo.nome}</p>
              <p className="text-sm text-gray-400 mt-0.5">
                {atrativo.municipios?.nome}, {atrativo.municipios?.estado}
              </p>
            </Link>
          ))}
          {agrativosFiltrados.length === 0 && (
            <p className="text-gray-400 col-span-3 text-center py-20">Nenhum atrativo encontrado.</p>
          )}
        </div>
      )}
    </div>
  )
}