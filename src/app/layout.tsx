import type { Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import './globals.css'

export const metadata: Metadata = {
  title: 'Bill Manager - Sri Balaji Enterprises',
  description: 'Professional tax invoice management system',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: '#d97706',
        },
        elements: {
          formButtonPrimary: 'bg-amber-600 hover:bg-amber-700',
          footerActionLink: 'text-amber-600 hover:text-amber-700',
        }
      }}
    >
      <html lang="en">
        <body className="bg-amber-50">
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}