import Link from 'next/link'
import { ArrowRight, Zap, Shield, Globe, Network, Database, BarChart3 } from 'lucide-react'

export default function Home() {
  return (
    <main className="flex-1">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-purple-800 text-white py-24 px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            <h1 className="text-6xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-100">
              CNTX Portal
            </h1>
            <p className="text-2xl md:text-3xl mb-4 text-blue-100 font-light">
              Network Management & Monitoring System
            </p>
            <p className="text-lg md:text-xl mb-10 text-blue-200 max-w-3xl mx-auto">
              Complete solution for OTN routes, network monitoring, and data management
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/otn-route-details">
                <button className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-50 transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl hover:scale-105 transform">
                  View OTN Routes
                  <ArrowRight className="w-5 h-5" />
                </button>
              </Link>
              <Link href="/dashboard">
                <button className="bg-blue-500 bg-opacity-30 backdrop-blur-sm border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-opacity-40 transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl hover:scale-105 transform">
                  Dashboard
                  <BarChart3 className="w-5 h-5" />
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Access Cards */}
      <section className="py-16 px-8 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12 text-gray-800">
            Quick Access
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <QuickAccessCard
              href="/otn-route-details"
              icon={<Network className="w-10 h-10 text-blue-600" />}
              title="OTN Routes"
              description="View and manage OTN route details"
              color="blue"
            />
            <QuickAccessCard
              href="/dashboard"
              icon={<BarChart3 className="w-10 h-10 text-green-600" />}
              title="Dashboard"
              description="Analytics and monitoring"
              color="green"
            />
            <QuickAccessCard
              href="/network-monitoring"
              icon={<Database className="w-10 h-10 text-purple-600" />}
              title="Network Monitor"
              description="Real-time network status"
              color="purple"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12 text-gray-800">
            Why Choose CNTX Portal?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Zap className="w-12 h-12 text-yellow-500" />}
              title="Lightning Fast"
              description="Optimized performance with caching and pagination for instant data access"
            />
            <FeatureCard
              icon={<Shield className="w-12 h-12 text-green-500" />}
              title="Secure & Reliable"
              description="Enterprise-grade security with automatic error recovery and retry mechanisms"
            />
            <FeatureCard
              icon={<Globe className="w-12 h-12 text-blue-500" />}
              title="Real-time Updates"
              description="Auto-refresh and live data synchronization across all modules"
            />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-700 py-16 px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center text-white">
            <StatCard number="398+" label="OTN Routes" />
            <StatCard number="99.9%" label="Uptime" />
            <StatCard number="24/7" label="Monitoring" />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gray-50 py-20 px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-800">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Access powerful network management tools and real-time monitoring
          </p>
          <Link href="/otn-route-details">
            <button className="bg-blue-600 text-white px-10 py-4 rounded-lg font-semibold text-lg hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 transform">
              Explore OTN Routes
            </button>
          </Link>
        </div>
      </section>
    </main>
  )
}

function FeatureCard({ icon, title, description }) {
  return (
    <div className="bg-white p-8 rounded-xl hover:shadow-xl transition-all duration-300 border-2 border-gray-100 hover:border-blue-200 group">
      <div className="mb-4 transform group-hover:scale-110 transition-transform duration-300">{icon}</div>
      <h3 className="text-2xl font-semibold mb-3 text-gray-800">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </div>
  )
}

function QuickAccessCard({ href, icon, title, description, color }) {
  const colorClasses = {
    blue: 'hover:border-blue-500 hover:shadow-blue-100',
    green: 'hover:border-green-500 hover:shadow-green-100',
    purple: 'hover:border-purple-500 hover:shadow-purple-100',
  }

  return (
    <Link href={href}>
      <div className={`bg-white p-6 rounded-xl border-2 border-gray-200 hover:shadow-xl transition-all duration-300 cursor-pointer group ${colorClasses[color]}`}>
        <div className="flex items-start gap-4">
          <div className="transform group-hover:scale-110 transition-transform duration-300">
            {icon}
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2 text-gray-800 group-hover:text-blue-600 transition-colors">
              {title}
            </h3>
            <p className="text-gray-600 text-sm">{description}</p>
          </div>
        </div>
        <div className="mt-4 flex items-center text-blue-600 font-medium text-sm group-hover:translate-x-2 transition-transform duration-300">
          Open <ArrowRight className="w-4 h-4 ml-1" />
        </div>
      </div>
    </Link>
  )
}

function StatCard({ number, label }) {
  return (
    <div className="transform hover:scale-105 transition-transform duration-300">
      <div className="text-5xl font-bold mb-2">{number}</div>
      <div className="text-xl text-blue-100">{label}</div>
    </div>
  )
}
