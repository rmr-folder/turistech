import Link from 'next/link'
import { supabase } from '../../lib/supabase'
import AccountPanel from '../components/AccountPanel'
import RoteirosClient from './RoteirosClient'

export const revalidate = 0

export default async function RoteirosPage() {
  const { data: roteiros } = await supabase
    .from('roteiros')
    .select(`*, roteiro_atrativos (id, atrativos (id, nome, slug, foto_capa, categoria))`)
    .eq('publico', true)
    .order('created_at', { ascending: false })

  return (
    <main className="min-h-screen bg-white">
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-gray-900 tracking-tight">
            turistech
          </Link>
          <div className="flex items-center gap-3">
            <div id="desktop-nav" style={{display: 'none'}} className="items-center gap-2">
              <Link href="/explorar" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
                Explorar destinos
              </Link>
            </div>
            <AccountPanel />
          </div>
        </div>
      </header>

      <RoteirosClient roteirosPublicos={roteiros || []} />

      <footer className="border-t border-gray-100 py-8 px-6 mt-10">
        <div className="max-w-6xl mx-auto text-center text-sm text-gray-400">
          Turistech — A camada de informação do turismo brasileiro
        </div>
      </footer>
    </main>
  )
}