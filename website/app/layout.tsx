// app/layout.tsx
import { ClerkProvider } from '@clerk/nextjs'
import './globals.css'
import type { Metadata } from 'next'
import { Recursive, Gabarito } from 'next/font/google'

const recursive = Recursive({ 
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-recursive'
})

const gabarito = Gabarito({ 
  subsets: ['latin'],
  weight: ['400', '600'],
  variable: '--font-gabarito'
})

export const metadata: Metadata = {
  title: 'Trump Blocker - Clean Up Your Internet Experience',
  description: 'Block unwanted political content across the web with Trump Blocker Chrome extension',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${recursive.variable} ${gabarito.variable} font-sans`}>
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}