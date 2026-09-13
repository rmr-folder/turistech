import Link from 'next/link'
import { supabase } from '../lib/supabase'
import AuthButton from './components/AuthButton'

export const revalidate = 0

export default async function Home() {
  const { data: municipios } = await supabase
    .from('municipios')
    .select(`*, atrativos(id, nome, slug, categoria, foto_capa)`)

  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
<header className="sticky top-0 z-50 bg-white border-b border-gray-100 px-6 py-4">
  <div className="max-w-6xl mx-auto flex items-center justify-between">
    <Link href="/" className="text-xl font-bold text-gray-900 tracking-tight">
      turistech
    </Link>

    {/* Desktop nav */}
    <div className="md:flex items-center gap-2" id="desktop-nav">
      <Link href="/roteiros" className="flex items-center gap-2 px-4 py-2 rounded-full text-sm text-gray-600 hover:bg-gray-100 transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
          <path fillRule="evenodd" d="M8.161 2.58a1.875 1.875 0 011.678 0l4.993 2.498c.106.052.23.052.336 0l3.869-1.935A1.875 1.875 0 0121.75 4.82v12.485c0 .71-.401 1.36-1.037 1.677l-4.875 2.437a1.875 1.875 0 01-1.676 0l-4.994-2.497a.375.375 0 00-.336 0l-3.868 1.935A1.875 1.875 0 012.25 19.18V6.695c0-.71.401-1.36 1.036-1.677l4.875-2.437zM9 6a.75.75 0 01.75.75V15a.75.75 0 01-1.5 0V6.75A.75.75 0 019 6zm6.75 3a.75.75 0 00-1.5 0v8.25a.75.75 0 001.5 0V9z" clipRule="evenodd" />
        </svg>
        Roteiros
      </Link>
      <Link href="/explorar" className="flex items-center gap-2 px-4 py-2 rounded-full text-sm text-gray-600 hover:bg-gray-100 transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
          <path fillRule="evenodd" d="M10.5 3.75a6.75 6.75 0 100 13.5 6.75 6.75 0 000-13.5zM2.25 10.5a8.25 8.25 0 1114.59 5.28l4.69 4.69a.75.75 0 11-1.06 1.06l-4.69-4.69A8.25 8.25 0 012.25 10.5z" clipRule="evenodd" />
        </svg>
        Explorar
      </Link>
      <Link href="/minha-conta" className="flex items-center gap-2 px-4 py-2 rounded-full text-sm text-gray-600 hover:bg-gray-100 transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
          <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
        </svg>
        Conta
      </Link>
    </div>
  </div>
</header>

      {/* Hero */}
      <div className="max-w-6xl mx-auto px-6 pt-16 pb-12">
        <h1 className="text-5xl font-bold text-gray-900 leading-tight max-w-2xl">
          Os melhores destinos do Brasil em um só lugar
        </h1>
        <p className="mt-4 text-xl text-gray-500 max-w-xl">
          Descubra atrativos, trilhas, paisagens e experiências únicas por todo o país.
        </p>
      </div>

      {/* Municípios */}
      <div className="max-w-6xl mx-auto px-6 pb-20">
        {municipios?.map((municipio) => (
          <div key={municipio.id} className="mb-14">
            {/* Cabeçalho do município */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-baseline gap-2">
                <Link
                  href={`/municipios/${municipio.slug}`}
                  className="text-2xl font-semibold text-gray-900 hover:underline underline-offset-4"
                >
                  {municipio.nome}
                </Link>
                <span className="text-sm font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                  {municipio.estado}
                </span>
              </div>
              <Link
                href={`/municipios/${municipio.slug}`}
                className="text-sm text-gray-500 hover:text-gray-900 transition-colors hidden md:block"
              >
                Ver todos →
              </Link>
            </div>

            {/* Cards de atrativos */}
            <div className="flex gap-5 overflow-x-auto pb-3 -mx-1 px-1">
              {municipio.atrativos?.map((atrativo: any) => (
                <Link
                  key={atrativo.id}
                  href={`/atrativos/${atrativo.slug}`}
                  className="flex-shrink-0 w-56 group"
                >
                  <div className="relative h-40 rounded-2xl overflow-hidden bg-gray-100 mb-3">
                    {atrativo.foto_capa ? (
                      <img
                        src={atrativo.foto_capa}
                        alt={atrativo.nome}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200" />
                    )}
                  </div>
                  <p className="text-sm font-semibold text-gray-900 leading-tight">
                    {atrativo.nome}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">{atrativo.categoria}</p>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8 px-6">
        <div className="max-w-6xl mx-auto text-center text-sm text-gray-400">
          Turistech — A camada de informação do turismo brasileiro
        </div>
      </footer>
    </main>
  )
}