'use client'

import { useEffect } from 'react'
import { registrarEvento } from '../../lib/eventos'

interface Props {
  municipioId: string
  municipioNome: string
}

export default function EventoMunicipio({ municipioId, municipioNome }: Props) {
  useEffect(() => {
    registrarEvento('view_municipio', 'municipio', municipioId, { nome: municipioNome })
  }, [])

  return null
}