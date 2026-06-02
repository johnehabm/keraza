import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'مهرجان الكرازة',
  description: 'منصة دراسة وامتحانات مهرجان الكرازة',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body>
        {children}
        <footer className="app-credit">made by john ehab</footer>
      </body>
    </html>
  )
}