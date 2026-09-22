'use client'

import { useEffect, useState } from 'react'
import { createClient } from '../../../lib/supabase-browser'
import Link from 'next/link'
import { isAdmin } from '../../../lib/admin'

export default function AdminRoteiros() {
  const [atrativos, setAtrativos] = useState<any[]>([])
  const [roteiros, setRoteiros] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [uploadando, setUploadando] = useState(false)
  const [form, setForm] = useState({
    titulo: '', slug: '', descricao: '', duracao_dias: '', foto_capa: '', publico: true
  })
  const [atrativosSelecionados, setAtrativosSelecionados] = useState<{ atrativo_id: string, dia: number, ordem: number, observacao: string }[]>([])
  const supabase = createClient()

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || !(await isAdmin(user.email))) {
        window.location.href = '/'
        return
      }
      await Promise.all([carregarAtrativos(), carregarRoteiros()])
    }
    init()
  }, [])

  const carregarAtrativos = async () => {
    const { data } = await supabase
      .from('atrativos')
      .select('id, nome, categoria, municipios(nome)')
      .order('nome')
    setAtrativos(data || [])
  }

  const carregarRoteiros = async () => {
    const { data } = await supabase
      .from('roteiros')
      .select('*, roteiro_atrativos(id, dia, ordem, atrativos(nome))')
      .order('created_at', { ascending: false })
    setRoteiros(data || [])
    setLoading(false)
  }

  const gerarSlug = (titulo: string) => {
    return titulo
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }

  const handleTitulo = (titulo: string) => {
    setForm({ ...form, titulo, slug: gerarSlug(titulo) })
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadando(true)
    const ext = file.name.split('.').pop()
    const fileName = `roteiro-${gerarSlug(form.titulo || 'sem-nome')}-${Date.now()}.${ext}`
    const { error } = await supabase.storage.from('imagens').upload(fileName, file)
    if (!error) {
      const { data } = supabase.storage.from('imagens').getPublicUrl(fileName)
      setForm({ ...form, foto_capa: data.publicUrl })
    }
    setUploadando(false)
  }

  const adicionarAtrativo = () => {
    setAtrativosSelecionados([...atrativosSelecionados, {
      atrativo_id: '', dia: 1, ordem: atrativosSelecionados.length + 1, observacao: ''
    }])
  }

  const removerAtrativo = (index: number) => {
    setAtrativosSelecionados(atrativosSelecionados.filter((_, i) => i !== index))
  }

  const handleSalvar = async () => {
    if (!form.titulo || !form.slug) return
    setSalvando(true)

    const { data: roteiro, error } = await supabase
      .from('roteiros')
      .insert({
        titulo: form.titulo,
        slug: form.slug,
        descricao: form.descricao,
        duracao_dias: form.duracao_dias ? parseInt(form.duracao_dias) : null,
        foto_capa: form.foto_capa,
        publico: form.publico,
      })
      .select()
      .single()

    if (roteiro && !error) {
      const itens = atrativosSelecionados
        .filter(a => a.atrativo_id)
        .map(a => ({ ...a, roteiro_id: roteiro.id }))

      if (itens.length > 0) {
        await supabase.from('roteiro_atrativos').insert(itens)
      }

      setForm({ titulo: '', slug: '', descricao: '', duracao_dias: '', foto_capa: '', publico: true })
      setAtrativosSelecionados([])
      await carregarRoteiros()
    }
    setSalvando(false)
  }

  const handleDeletar = async (id: string) => {
    if (!confirm('Deletar este roteiro?')) return
    await supabase.from('roteiros').delete().eq('id', id)
    setRoteiros(roteiros.filter(r => r.id !== id))
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><p className="text-gray-400">Carregando...</p></div>

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="text-sm text-gray-400 hover:text-gray-900">← Admin</Link>
            <span className="text-gray-200">/</span>
            <h1 className="text-lg font-bold text-gray-900">Roteiros</h1>
          </div>
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-900">Ver site →</Link>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-10 space-y-10">

        {/* Formulário novo roteiro */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">+ Novo roteiro</h2>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">Título</label>
              <input
                type="text"
                value={form.titulo}
                onChange={(e) => handleTitulo(e.target.value)}
                placeholder="Ex: Litoral Norte SP em 5 dias"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
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

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">Duração (dias)</label>
                <input
                  type="number"
                  value={form.duracao_dias}
                  onChange={(e) => setForm({ ...form, duracao_dias: e.target.value })}
                  placeholder="Ex: 3"
                  min={1}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">Visibilidade</label>
                <select
                  value={form.publico ? 'publico' : 'privado'}
                  onChange={(e) => setForm({ ...form, publico: e.target.value === 'publico' })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900"
                >
                  <option value="publico">Público</option>
                  <option value="privado">Privado</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">Descrição</label>
              <textarea
                value={form.descricao}
                onChange={(e) => setForm({ ...form, descricao: e.target.value })}
                placeholder="Descreva o roteiro..."
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
                  placeholder="URL ou faça upload"
                  className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
                <label className="flex-shrink-0 cursor-pointer bg-gray-100 hover:bg-gray-200 px-4 py-3 rounded-xl text-sm text-gray-600 font-medium">
                  {uploadando ? 'Enviando...' : '📷 Upload'}
                  <input type="file" accept="image/*" onChange={handleUpload} className="hidden" />
                </label>
              </div>
              {form.foto_capa && (
                <img src={form.foto_capa} alt="Preview" className="mt-3 h-32 w-full object-cover rounded-xl" />
              )}
            </div>

            {/* Atrativos do roteiro */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Atrativos do roteiro</label>
                <button
                  onClick={adicionarAtrativo}
                  className="text-xs text-gray-600 hover:text-gray-900 border border-gray-200 px-3 py-1 rounded-full transition-colors"
                >
                  + Adicionar
                </button>
              </div>
              <div className="space-y-3">
                {atrativosSelecionados.map((item, index) => (
                  <div key={index} className="flex gap-2 items-start">
                    <select
                      value={item.atrativo_id}
                      onChange={(e) => {
                        const novos = [...atrativosSelecionados]
                        novos[index].atrativo_id = e.target.value
                        setAtrativosSelecionados(novos)
                      }}
                      className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900"
                    >
                      <option value="">Selecionar atrativo...</option>
                      {atrativos.map((a) => (
                        <option key={a.id} value={a.id}>{a.nome} — {a.municipios?.nome}</option>
                      ))}
                    </select>
                    <input
                      type="number"
                      value={item.dia}
                      onChange={(e) => {
                        const novos = [...atrativosSelecionados]
                        novos[index].dia = parseInt(e.target.value)
                        setAtrativosSelecionados(novos)
                      }}
                      placeholder="Dia"
                      min={1}
                      className="w-16 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900"
                    />
                    <button
                      onClick={() => removerAtrativo(index)}
                      className="text-gray-300 hover:text-red-400 px-2 py-2 transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={handleSalvar}
              disabled={salvando || !form.titulo}
              className="w-full py-3 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              {salvando ? 'Salvando...' : 'Salvar roteiro'}
            </button>
          </div>
        </div>

        {/* Lista de roteiros */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-50">
            <h2 className="text-lg font-semibold text-gray-900">Roteiros cadastrados ({roteiros.length})</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {roteiros.map((r) => (
              <div key={r.id} className="flex items-center gap-4 px-6 py-4">
                <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 flex items-center justify-center">
                  {r.foto_capa ? (
                    <img src={r.foto_capa} alt={r.titulo} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xl">🗺️</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900">{r.titulo}</p>
                  <p className="text-xs text-gray-400">
                    {r.duracao_dias ? `${r.duracao_dias} dias · ` : ''}
                    {r.roteiro_atrativos?.length || 0} atrativos · 
                    {r.publico ? ' Público' : ' Privado'}
                  </p>
                </div>
                <button
                  onClick={() => handleDeletar(r.id)}
                  className="text-xs text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
                >
                  Deletar
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}