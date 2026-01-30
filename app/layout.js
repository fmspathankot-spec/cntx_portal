import './globals.css'
import { Inter } from 'next/font/google'
import Sidebar from './components/Sidebar'
import QueryProvider from './providers/QueryProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'CNTX Portal - Context Transfer Portal',
  description: 'Modern context transfer portal built with Next.js',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <QueryProvider>
          <div className="flex min-h-screen bg-gray-50">
            <Sidebar />
            <div className="flex-1">
              {children}
            </div>
          </div>
        </QueryProvider>
      </body>
    </html>
  )
}
