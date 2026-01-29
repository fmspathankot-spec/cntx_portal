import Link from 'next/link'
import { ArrowRight, Zap, Shield, Globe } from 'lucide-react'

export default function Home() {
  return (
    <main className="flex-1">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 to-purple-700 text-white py-20 px-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Welcome to CNTX Portal
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-blue-100">
            Modern context transfer portal for seamless data management
          </p>
          <Link href="/dashboard">
            <button className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-50 transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl">
              Get Started
              <ArrowRight className="w-5 h-5" />
            </button>
          </Link>
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
              description="Experience blazing fast performance with optimized data transfer"
            />
            <FeatureCard
              icon={<Shield className="w-12 h-12 text-green-500" />}
              title="Secure & Reliable"
              description="Enterprise-grade security to keep your data safe"
            />
            <FeatureCard
              icon={<Globe className="w-12 h-12 text-blue-500" />}
              title="Global Access"
              description="Access your data from anywhere, anytime"
            />
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
            Join thousands of users who trust CNTX Portal for their data management needs
          </p>
          <Link href="/dashboard">
            <button className="bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl">
              Go to Dashboard
            </button>
          </Link>
        </div>
      </section>
    </main>
  )
}

function FeatureCard({ icon, title, description }) {
  return (
    <div className="bg-gray-50 p-8 rounded-xl hover:shadow-lg transition-all duration-300 border border-gray-100">
      <div className="mb-4">{icon}</div>
      <h3 className="text-2xl font-semibold mb-3 text-gray-800">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  )
}
