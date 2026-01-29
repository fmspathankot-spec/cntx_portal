import './globals.css'
import { Inter } from 'next/font/google'
import Sidebar from './components/Sidebar'
import Breadcrumb from './components/Breadcrumb'
import QueryProvider from './providers/QueryProvider'
import ToastProvider from './providers/ToastProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'CNTX Network Monitoring Portal',
  description: 'Network monitoring portal for OTN, CPAN, and MAAN networks',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <QueryProvider>
          <div className="flex min-h-screen bg-gray-50">
            {/* Sidebar */}
            <Sidebar />

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
              {/* Breadcrumb */}
              <Breadcrumb />

              {/* Page Content */}
              <main className="flex-1 p-6">
                {children}
              </main>
            </div>
          </div>

          {/* Toast Notifications */}
          <ToastProvider />
        </QueryProvider>
      </body>
    </html>
  )
}
