import './globals.css'
import { Inter } from 'next/font/google'
import Sidebar from './components/Sidebar'
import MobileSidebar from './components/MobileSidebar'
import Breadcrumb from './components/Breadcrumb'
import QueryProvider from './providers/QueryProvider'
import ToastProvider from './providers/ToastProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'CNTX Network Monitoring Portal',
  description: 'Real-time network monitoring portal for OTN, CPAN, and MAAN networks',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <QueryProvider>
          <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            {/* Desktop Sidebar */}
            <Sidebar />

            {/* Mobile Sidebar */}
            <MobileSidebar />

            {/* Main Content */}
            <div className="flex-1 flex flex-col lg:ml-0">
              {/* Breadcrumb */}
              <Breadcrumb />

              {/* Page Content */}
              <main className="flex-1 p-4 md:p-6 lg:p-8">
                {children}
              </main>

              {/* Footer */}
              <footer className="bg-white border-t border-gray-200 py-4 px-6">
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <p>© 2024 CNTX Portal. All rights reserved.</p>
                  <p>Version 1.0.0</p>
                </div>
              </footer>
            </div>
          </div>

          {/* Toast Notifications */}
          <ToastProvider />
        </QueryProvider>
      </body>
    </html>
  )
}
