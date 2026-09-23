export function getFotoRoteiro(roteiro: { id: string; foto_capa?: string | null; roteiro_atrativos?: any[] }) {
  if (roteiro.foto_capa) return roteiro.foto_capa

  const fotos = (roteiro.roteiro_atrativos || [])
    .map((item: any) => item.atrativos?.foto_capa)
    .filter(Boolean)

  if (fotos.length === 0) return null

  // Escolha determinística: mesmo roteiro sempre puxa a mesma foto, sem "piscar" ao recarregar
  let hash = 0
  for (let i = 0; i < roteiro.id.length; i++) {
    hash = (hash * 31 + roteiro.id.charCodeAt(i)) % fotos.length
  }
  return fotos[hash]
}