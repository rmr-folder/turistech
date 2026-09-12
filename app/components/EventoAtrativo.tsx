'use client'

import { useEffect } from 'react'
import { registrarEvento } from '../../lib/eventos'

interface Props {
  atrativoId: string
  atrativoNome: string
}

export default function EventoAtrativo({ atrativoId, atrativoNome }: Props) {
  useEffect(() => {
    registrarEvento('view_atrativo', 'atrativo', atrativoId, { nome: atrativoNome })
  }, [])

  return null
}