'use client'

import { useEffect, useState } from 'react'
import { createClient } from '../../../lib/supabase-browser'
import Link from 'next/link'
import { isMasterAdmin } from '../../../lib/admin'

export default function AdminAdministradores() {
  const [user, setUser] = useState<any>(null)
  const [ehMaster, setEhMaster] = useState(false)
  const [loading, setLoading] = useState(true)
  const [admins, setAdmins] = useState<any[]>([])
  const [novoEmail, setNovoEmail] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')
  const supabase = createClient()

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      const master = await isMasterAdmin(user?.email)
      if (!user || !master) {
        window.location.href = '/admin'
        return
      }
      setUser(user)
      setEhMaster(true)
      await carregarAdmins()
    }
    init()
  }, [])

  const carregarAdmins = async () => {
    const { data } = await supabase.from('admins').select('*').order('created_at')
    setAdmins(data || [])
    setLoading(false)
  }

  const handleAdicionar = async () => {
    if (!novoEmail.trim()) return
    setSalvando(true)
    setErro('')
    const { error } = await supabase.from('admins').insert({ email: novoEmail.trim().toLowerCase() })
    if (error) {
      setErro('Não foi possível adicionar (e-mail já existe ou é inválido).')
    } else {
      setNovoEmail('')
      await carregarAdmins()
    }
    setSalvando(false)
  }

  const handleRemover = async (admin: any) => {
    if (admin.email === user.email) {
      alert('Você não pode remover a si mesmo.')
      return
    }
    if (!confirm(`Remover o acesso admin de ${admin.email}?`)) return
    await supabase.from('admins').delete().eq('id', admin.id)
    setAdmins(admins.filter((a) => a.id !== admin.id))
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><p className="text-gray-400">Carregando...</p></div>
  if (!ehMaster) return null

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <Link href="/admin" className="text-sm text-gray-400 hover:text-gray-900">← Admin</Link>
          <span className="text-gray-200">/</span>
          <h1 className="text-lg font-bold text-gray-900">Administradores</h1>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-10 space-y-8">
        <div className="bg-white rounded-2xl p-6 border border-gray-100">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Adicionar novo admin</h2>
          <div className="flex gap-3">
            <input
              type="email"
              value={novoEmail}
              onChange={(e) => setNovoEmail(e.target.value)}
              placeholder="email@exemplo.com"
              className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
            <button
              onClick={handleAdicionar}
              disabled={salvando || !novoEmail.trim()}
              className="px-5 py-3 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              {salvando ? 'Adicionando...' : 'Adicionar'}
            </button>
          </div>
          {erro && <p className="text-xs text-red-500 mt-2">{erro}</p>}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-50">
            <h2 className="text-sm font-semibold text-gray-900">Admins ativos ({admins.length})</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {admins.map((admin) => (
              <div key={admin.id} className="flex items-center justify-between px-6 py-4">
                <div>
                  <p className="font-medium text-gray-900 text-sm">{admin.email}</p>
                  {admin.is_master && (
                    <span className="text-xs text-white bg-gray-900 px-2 py-0.5 rounded-full mt-1 inline-block">
                      Master
                    </span>
                  )}
                </div>
                {!admin.is_master && (
                  <button
                    onClick={() => handleRemover(admin)}
                    className="text-xs text-gray-400 hover:text-red-500 transition-colors"
                  >
                    Revogar acesso
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}