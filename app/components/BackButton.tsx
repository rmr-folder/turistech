'use client'

import { useRouter } from 'next/navigation'

interface Props {
  fallbackHref?: string
  label?: string
}

export default function BackButton({ fallbackHref = '/', label = '← turistech' }: Props) {
  const router = useRouter()

  const handleClick = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back()
    } else {
      router.push(fallbackHref)
    }
  }

  return (
    <button onClick={handleClick} className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
      {label}
    </button>
  )
}