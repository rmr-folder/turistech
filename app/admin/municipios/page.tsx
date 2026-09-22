'use client'

import { useEffect, useState, Suspense } from 'react'
import { createClient } from '../../../lib/supabase-browser'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { isAdmin } from '../../../lib/admin'
import { registrarLogAdmin } from '../../../lib/adminLog'

function AdminMunicipiosContent() {
  const [municipios, setMunicipios] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [uploadando, setUploadando] = useState(false)
  const [editando, setEditando] = useState<any>(null)
  const [adminEmail, setAdminEmail] = useState('')
  const [form, setForm] = useState({
    nome: '', estado: '', slug: '', descricao: '', foto_capa: ''
  })
  const supabase = createClient()
  const searchParams = useSearchParams()

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || !(await isAdmin(user.email))) {
        window.location.href = '/'
        return
      }
      setAdminEmail(user.email)
      await carregarMunicipios()
    }
    init()
  }, [])

  useEffect(() => {
    const editId = searchParams.get('edit')
    if (editId && municipios.length > 0) {
      const item = municipios.find((m) => m.id === editId)
      if (item) handleEditar(item)
    }
  }, [municipios, searchParams])

  const carregarMunicipios = async () => {
    const { data } = await supabase.from('municipios').select('*').order('nome')
    setMunicipios(data || [])
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

  const handleNome = (nome: string) => {
    if (!editando) setForm({ ...form, nome, slug: gerarSlug(nome) })
    else setEditando({ ...editando, nome })
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, modo: 'novo' | 'edicao') => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadando(true)
    const ext = file.name.split('.').pop()
    const nome = modo === 'novo' ? form.nome : editando?.nome
    const fileName = `municipio-${gerarSlug(nome || 'sem-nome')}-${Date.now()}.${ext}`
    const { error } = await supabase.storage.from('imagens').upload(fileName, file)
    if (!error) {
      const { data } = supabase.storage.from('imagens').getPublicUrl(fileName)
      if (modo === 'novo') setForm({ ...form, foto_capa: data.publicUrl })
      else setEditando({ ...editando, foto_capa: data.publicUrl })
    }
    setUploadando(false)
  }

  const handleSalvar = async () => {
    if (!form.nome || !form.estado || !form.slug) return
    setSalvando(true)
    const { data, error } = await supabase.from('municipios').insert({
      nome: form.nome, estado: form.estado, slug: form.slug,
      descricao: form.descricao, foto_capa: form.foto_capa,
    }).select().single()
    if (!error) {
      await registrarLogAdmin(adminEmail, 'criar', 'municipios', data.id, { nome: form.nome })
      setForm({ nome: '', estado: '', slug: '', descricao: '', foto_capa: '' })
      await carregarMunicipios()
    }
    setSalvando(false)
  }

  const handleEditar = (municipio: any) => {
    setEditando({ ...municipio })
  }

  const handleSalvarEdicao = async () => {
    if (!editando) return
    setSalvando(true)
    const { error } = await supabase
      .from('municipios')
      .update({
        nome: editando.nome,
        estado: editando.estado,
        slug: editando.slug,
        descricao: editando.descricao,
        foto_capa: editando.foto_capa,
      })
      .eq('id', editando.id)
    if (!error) {
      await registrarLogAdmin(adminEmail, 'editar', 'municipios', editando.id, { nome: editando.nome })
      setEditando(null)
      await carregarMunicipios()
    }
    setSalvando(false)
  }

  const handleDeletar = async (id: string) => {
    if (!confirm('Deletar este municipio?')) return
    const municipio = municipios.find(m => m.id === id)
    await supabase.from('municipios').delete().eq('id', id)
    await registrarLogAdmin(adminEmail, 'deletar', 'municipios', id, { nome: municipio?.nome })
    setMunicipios(municipios.filter(m => m.id !== id))
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><p className="text-gray-400">Carregando...</p></div>

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="text-sm text-gray-400 hover:text-gray-900">Admin</Link>
            <span className="text-gray-200">/</span>
            <h1 className="text-lg font-bold text-gray-900">Municipios</h1>
          </div>
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-900">Ver site</Link>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-10 space-y-10">

        {/* Modal de edição */}
        {editando && (
          <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={() => setEditando(null)} />
            <div className="relative bg-white rounded-t-3xl md:rounded-3xl w-full md:max-w-2xl p-6 z-10 max-h-[90vh] overflow-y-auto">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Editar municipio</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
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
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">Estado</label>
                    <input
                      type="text"
                      value={editando.estado}
                      onChange={(e) => setEditando({ ...editando, estado: e.target.value.toUpperCase() })}
                      maxLength={2}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900"
                    />
                  </div>
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

        {/* Formulario novo municipio */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">+ Novo municipio</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">Nome</label>
                <input
                  type="text"
                  value={form.nome}
                  onChange={(e) => handleNome(e.target.value)}
                  placeholder="Ex: Arraial do Cabo"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">Estado</label>
                <input
                  type="text"
                  value={form.estado}
                  onChange={(e) => setForm({ ...form, estado: e.target.value.toUpperCase() })}
                  placeholder="Ex: RJ"
                  maxLength={2}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">Slug</label>
              <input
                type="text"
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">Descricao</label>
              <textarea
                value={form.descricao}
                onChange={(e) => setForm({ ...form, descricao: e.target.value })}
                placeholder="Descreva o municipio..."
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
                  placeholder="URL da imagem ou faca upload"
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
              disabled={salvando || !form.nome || !form.estado}
              className="w-full py-3 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              {salvando ? 'Salvando...' : 'Salvar municipio'}
            </button>
          </div>
        </div>

        {/* Lista de municipios */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-50">
            <h2 className="text-lg font-semibold text-gray-900">Municipios cadastrados ({municipios.length})</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {municipios.map((m) => (
              <div key={m.id} className="flex items-center gap-4 px-6 py-4">
                <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                  {m.foto_capa ? (
                    <img src={m.foto_capa} alt={m.nome} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gray-100" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900">{m.nome}</p>
                  <p className="text-xs text-gray-400">{m.estado} · {m.slug}</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleEditar(m)}
                    className="text-xs text-gray-400 hover:text-gray-900 transition-colors"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDeletar(m.id)}
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

export default function AdminMunicipios() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><p className="text-gray-400">Carregando...</p></div>}>
      <AdminMunicipiosContent />
    </Suspense>
  )
}