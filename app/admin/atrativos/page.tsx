'use client'

import { useEffect, useState, Suspense } from 'react'
import { createClient } from '../../../lib/supabase-browser'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

const ADMIN_EMAIL = 'renanriado@gmail.com'
const CATEGORIAS = ['Praia', 'Cachoeira', 'Trilha', 'Mirante', 'Parque', 'Gruta', 'Rio', 'Lago', 'Mergulho', 'Natureza', 'Atrativo Cultural']

function AdminAtrativosContent() {
  const [municipios, setMunicipios] = useState<any[]>([])
  const [atrativos, setAtrativos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [uploadando, setUploadando] = useState(false)
  const [editando, setEditando] = useState<any>(null)
  const [form, setForm] = useState({
    nome: '', slug: '', descricao: '', categoria: '', municipio_id: '', foto_capa: ''
  })
  const supabase = createClient()
  const searchParams = useSearchParams()

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || user.email !== ADMIN_EMAIL) {
        window.location.href = '/'
        return
      }
      await Promise.all([carregarMunicipios(), carregarAtrativos()])
    }
    init()
  }, [])

  useEffect(() => {
    const editId = searchParams.get('edit')
    if (editId && atrativos.length > 0) {
      const item = atrativos.find((a) => a.id === editId)
      if (item) setEditando({ ...item, municipio_id: item.municipio_id })
    }
  }, [atrativos, searchParams])

  const carregarMunicipios = async () => {
    const { data } = await supabase.from('municipios').select('id, nome, estado').order('nome')
    setMunicipios(data || [])
  }

  const carregarAtrativos = async () => {
    const { data } = await supabase
      .from('atrativos')
      .select('*, municipios(nome, estado)')
      .order('nome')
    setAtrativos(data || [])
    setLoading(false)
  }

  const gerarSlug = (nome: string) => {
    return nome
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, modo: 'novo' | 'edicao') => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadando(true)
    const ext = file.name.split('.').pop()
    const nome = modo === 'novo' ? form.nome : editando?.nome
    const fileName = `atrativo-${gerarSlug(nome || 'sem-nome')}-${Date.now()}.${ext}`
    const { error } = await supabase.storage.from('imagens').upload(fileName, file)
    if (!error) {
      const { data } = supabase.storage.from('imagens').getPublicUrl(fileName)
      if (modo === 'novo') setForm({ ...form, foto_capa: data.publicUrl })
      else setEditando({ ...editando, foto_capa: data.publicUrl })
    }
    setUploadando(false)
  }

  const handleSalvar = async () => {
    if (!form.nome || !form.categoria || !form.municipio_id) return
    setSalvando(true)
    const { error } = await supabase.from('atrativos').insert({
      nome: form.nome, slug: form.slug || gerarSlug(form.nome),
      descricao: form.descricao, categoria: form.categoria,
      municipio_id: form.municipio_id, foto_capa: form.foto_capa,
    })
    if (!error) {
      setForm({ nome: '', slug: '', descricao: '', categoria: '', municipio_id: '', foto_capa: '' })
      await carregarAtrativos()
    }
    setSalvando(false)
  }

  const handleSalvarEdicao = async () => {
    if (!editando) return
    setSalvando(true)
    const { error } = await supabase
      .from('atrativos')
      .update({
        nome: editando.nome, slug: editando.slug,
        descricao: editando.descricao, categoria: editando.categoria,
        municipio_id: editando.municipio_id, foto_capa: editando.foto_capa,
      })
      .eq('id', editando.id)
    if (!error) {
      setEditando(null)
      await carregarAtrativos()
    }
    setSalvando(false)
  }

  const handleDeletar = async (id: string) => {
    if (!confirm('Deletar este atrativo?')) return
    await supabase.from('atrativos').delete().eq('id', id)
    setAtrativos(atrativos.filter(a => a.id !== id))
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><p className="text-gray-400">Carregando...</p></div>

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="text-sm text-gray-400 hover:text-gray-900">Admin</Link>
            <span className="text-gray-200">/</span>
            <h1 className="text-lg font-bold text-gray-900">Atrativos</h1>
          </div>
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-900">Ver site</Link>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-10 space-y-10">

        {/* Modal de edicao */}
        {editando && (
          <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={() => setEditando(null)} />
            <div className="relative bg-white rounded-t-3xl md:rounded-3xl w-full md:max-w-2xl p-6 z-10 max-h-[90vh] overflow-y-auto">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Editar atrativo</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">Nome</label>
                  <input
                    type="text"
                    value={editando.nome}
                    onChange={(e) => setEditando({ ...editando, nome: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">Slug</label>
                  <input
                    type="text"
                    value={editando.slug}
                    onChange={(e) => setEditando({ ...editando, slug: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-900"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">Categoria</label>
                    <select
                      value={editando.categoria}
                      onChange={(e) => setEditando({ ...editando, categoria: e.target.value })}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900"
                    >
                      {CATEGORIAS.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">Municipio</label>
                    <select
                      value={editando.municipio_id}
                      onChange={(e) => setEditando({ ...editando, municipio_id: e.target.value })}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900"
                    >
                      {municipios.map((m) => (
                        <option key={m.id} value={m.id}>{m.nome} - {m.estado}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">Descricao</label>
                  <textarea
                    value={editando.descricao || ''}
                    onChange={(e) => setEditando({ ...editando, descricao: e.target.value })}
                    rows={3}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">Foto de capa</label>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={editando.foto_capa || ''}
                      onChange={(e) => setEditando({ ...editando, foto_capa: e.target.value })}
                      placeholder="URL da imagem"
                      className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900"
                    />
                    <label className="flex-shrink-0 cursor-pointer bg-gray-100 hover:bg-gray-200 px-4 py-3 rounded-xl text-sm text-gray-600 font-medium">
                      {uploadando ? 'Enviando...' : 'Upload'}
                      <input type="file" accept="image/*" onChange={(e) => handleUpload(e, 'edicao')} className="hidden" />
                    </label>
                  </div>
                  {editando.foto_capa && (
                    <img src={editando.foto_capa} alt="Preview" className="mt-3 h-32 w-full object-cover rounded-xl" />
                  )}
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleSalvarEdicao}
                    disabled={salvando}
                    className="flex-1 py-3 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-gray-700 transition-colors disabled:opacity-50"
                  >
                    {salvando ? 'Salvando...' : 'Salvar alteracoes'}
                  </button>
                  <button
                    onClick={() => setEditando(null)}
                    className="px-6 py-3 border border-gray-200 rounded-xl text-sm text-gray-600 hover:border-gray-400 transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Formulario novo atrativo */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">+ Novo atrativo</h2>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">Nome</label>
              <input
                type="text"
                value={form.nome}
                onChange={(e) => setForm({ ...form, nome: e.target.value, slug: gerarSlug(e.target.value) })}
                placeholder="Ex: Praia do Espelho"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">Categoria</label>
                <select
                  value={form.categoria}
                  onChange={(e) => setForm({ ...form, categoria: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900"
                >
                  <option value="">Selecionar...</option>
                  {CATEGORIAS.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">Municipio</label>
                <select
                  value={form.municipio_id}
                  onChange={(e) => setForm({ ...form, municipio_id: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900"
                >
                  <option value="">Selecionar...</option>
                  {municipios.map((m) => (
                    <option key={m.id} value={m.id}>{m.nome} - {m.estado}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">Descricao</label>
              <textarea
                value={form.descricao}
                onChange={(e) => setForm({ ...form, descricao: e.target.value })}
                placeholder="Descreva o atrativo..."
                rows={3}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">Foto de capa</label>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={form.foto_capa}
                  onChange={(e) => setForm({ ...form, foto_capa: e.target.value })}
                  placeholder="URL ou faca upload"
                  className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
                <label className="flex-shrink-0 cursor-pointer bg-gray-100 hover:bg-gray-200 px-4 py-3 rounded-xl text-sm text-gray-600 font-medium">
                  {uploadando ? 'Enviando...' : 'Upload'}
                  <input type="file" accept="image/*" onChange={(e) => handleUpload(e, 'novo')} className="hidden" />
                </label>
              </div>
              {form.foto_capa && (
                <img src={form.foto_capa} alt="Preview" className="mt-3 h-32 w-full object-cover rounded-xl" />
              )}
            </div>
            <button
              onClick={handleSalvar}
              disabled={salvando || !form.nome || !form.categoria || !form.municipio_id}
              className="w-full py-3 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              {salvando ? 'Salvando...' : 'Salvar atrativo'}
            </button>
          </div>
        </div>

        {/* Lista de atrativos */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-50">
            <h2 className="text-lg font-semibold text-gray-900">Atrativos cadastrados ({atrativos.length})</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {atrativos.map((a) => (
              <div key={a.id} className="flex items-center gap-4 px-6 py-4">
                <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                  {a.foto_capa ? (
                    <img src={a.foto_capa} alt={a.nome} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gray-100" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900">{a.nome}</p>
                  <p className="text-xs text-gray-400">{a.categoria} · {a.municipios?.nome}, {a.municipios?.estado}</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setEditando({ ...a, municipio_id: a.municipio_id })}
                    className="text-xs text-gray-400 hover:text-gray-900 transition-colors"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDeletar(a.id)}
                    className="text-xs text-gray-400 hover:text-red-500 transition-colors"
                  >
                    Deletar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}

export default function AdminAtrativos() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><p className="text-gray-400">Carregando...</p></div>}>
      <AdminAtrativosContent />
    </Suspense>
  )
}