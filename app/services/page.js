import { Zap, Shield, Globe, Database, Cloud, Lock } from 'lucide-react'

const services = [
  {
    id: 1,
    icon: Zap,
    title: 'Fast Performance',
    description: 'Lightning-fast data transfer with optimized performance and minimal latency.',
    features: ['Real-time processing', 'Optimized algorithms', 'CDN integration'],
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50'
  },
  {
    id: 2,
    icon: Shield,
    title: 'Enterprise Security',
    description: 'Bank-grade security with end-to-end encryption and compliance standards.',
    features: ['256-bit encryption', 'SOC 2 compliant', 'Regular audits'],
    color: 'text-green-600',
    bgColor: 'bg-green-50'
  },
  {
    id: 3,
    icon: Globe,
    title: 'Global Access',
    description: 'Access your data from anywhere in the world with 99.9% uptime guarantee.',
    features: ['Multi-region support', 'Auto-scaling', '24/7 availability'],
    color: 'text-blue-600',
    bgColor: 'bg-blue-50'
  },
  {
    id: 4,
    icon: Database,
    title: 'Data Management',
    description: 'Comprehensive data management tools with advanced analytics and reporting.',
    features: ['Real-time analytics', 'Custom reports', 'Data visualization'],
    color: 'text-purple-600',
    bgColor: 'bg-purple-50'
  },
  {
    id: 5,
    icon: Cloud,
    title: 'Cloud Integration',
    description: 'Seamless integration with major cloud providers and services.',
    features: ['AWS integration', 'Azure support', 'GCP compatible'],
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50'
  },
  {
    id: 6,
    icon: Lock,
    title: 'Privacy Protection',
    description: 'Your data privacy is our priority with GDPR and CCPA compliance.',
    features: ['GDPR compliant', 'Data anonymization', 'Privacy controls'],
    color: 'text-red-600',
    bgColor: 'bg-red-50'
  }
]

export default function ServicesPage() {
  return (
    <main className="flex-1 p-4 md:p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
          Our Services
        </h1>
        <p className="text-gray-600 text-lg">
          Comprehensive solutions tailored to your business needs
        </p>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service) => (
          <ServiceCard key={service.id} service={service} />
        ))}
      </div>

      {/* CTA Section */}
      <div className="mt-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-8 text-white text-center">
        <h2 className="text-3xl font-bold mb-4">
          Ready to Get Started?
        </h2>
        <p className="text-xl mb-6 text-blue-100">
          Join thousands of satisfied customers using our services
        </p>
        <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors shadow-lg">
          Contact Sales
        </button>
      </div>
    </main>
  )
}

function ServiceCard({ service }) {
  const Icon = service.icon

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 p-6 border border-gray-100">
      {/* Icon */}
      <div className={`${service.bgColor} w-14 h-14 rounded-lg flex items-center justify-center mb-4`}>
        <Icon className={`w-7 h-7 ${service.color}`} />
      </div>

      {/* Title */}
      <h3 className="text-xl font-semibold text-gray-800 mb-3">
        {service.title}
      </h3>

      {/* Description */}
      <p className="text-gray-600 mb-4 leading-relaxed">
        {service.description}
      </p>

      {/* Features */}
      <div className="space-y-2">
        {service.features.map((feature, index) => (
          <div key={index} className="flex items-center gap-2 text-sm text-gray-700">
            <div className={`w-1.5 h-1.5 rounded-full ${service.color.replace('text-', 'bg-')}`} />
            <span>{feature}</span>
          </div>
        ))}
      </div>

      {/* Learn More Button */}
      <button className={`mt-6 w-full ${service.color.replace('text-', 'bg-')} bg-opacity-10 ${service.color} px-4 py-2 rounded-lg font-medium hover:bg-opacity-20 transition-colors`}>
        Learn More
      </button>
    </div>
  )
}
