import './globals.css'
import { Inter } from 'next/font/google'
import Script from 'next/script'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'The Podcast Summary',
  description: 'Transform your podcast into an interactive experience',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <Script
          src="https://spaces-us-1.nyc3.digitaloceanspaces.com/RMieIJj0M7RIDmr7/AUcWfqBs-CO-IgP2qUT7n/pixel.js"
          strategy="afterInteractive"
          defer
          async
        />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  )
}
