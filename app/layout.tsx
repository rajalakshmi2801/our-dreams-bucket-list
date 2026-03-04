import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { SessionProvider } from '@/app/context/SessionContext'
import BottomNav from '@/components/BottomNav'

const inter = Inter({ subsets: ['latin'] })

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export const metadata: Metadata = {
  title: 'Our Dreams Together',
  description: 'A private dream bucket list for couples',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SessionProvider>
          <div className="max-w-md mx-auto bg-white min-h-screen shadow-xl relative pb-20">
            <main className="px-4 py-6">
              {children}
            </main>
            <BottomNav />
          </div>
        </SessionProvider>
      </body>
    </html>
  )
}