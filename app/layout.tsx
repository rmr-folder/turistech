import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import BottomNav from './components/BottomNav'
import { GoogleAnalytics } from '@next/third-parties/google'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Turistech',
  description: 'Descubra os melhores destinos do Brasil',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased pb-16 md:pb-0`}>
        {children}
        <BottomNav />
        <GoogleAnalytics gaId="G-MRZZ47V17N" />
      </body>
    </html>
  )
}