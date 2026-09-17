'use client'

import { useEffect, useState } from 'react'
import { createClient } from '../../lib/supabase-browser'
import Link from 'next/link'
import { isAdmin } from '../../lib/admin'

interface Props {
  href: string
}

export default function AdminEditButton({ href }: Props) {
  const [ehAdmin, setEhAdmin] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const check = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (isAdmin(user?.email)) setEhAdmin(true)
    }
    check()
  }, [])

  if (!ehAdmin) return null

  return (
    <Link
      href={href}
      title="Editar"
      className="absolute top-4 right-4 z-10 bg-white/90 hover:bg-white text-gray-900 rounded-full p-2.5 shadow-md transition-colors"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
        <path d="m15 5 4 4" />
      </svg>
    </Link>
  )
}