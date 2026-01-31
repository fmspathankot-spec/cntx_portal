import Link from 'next/link'
import { Settings, Briefcase, Mail, Users, Activity, Database, TrendingUp } from 'lucide-react'
import DashboardCard from '../components/DashboardCard'
import StatsCard from '../components/StatsCard'

// Dashboard cards data
const dashboardCards = [
  {
    id: 1,
    icon: Settings,
    title: 'Configuration',
    description: 'Stay up-to-date with the latest trends and news in the telecommunications industry.',
    buttonText: 'Open Form',
    href: '/configuration',
    bgColor: 'bg-green-50',
    hoverColor: 'hover:bg-green-100',
    titleColor: 'text-green-600',
    iconColor: 'text-green-600'
  },
  {
    id: 2,
    icon: Briefcase,
    title: 'Our Services',
    description: 'Discover the range of services we offer, tailored to your business needs.',
    buttonText: 'Explore Services',
    href: '/services',
    bgColor: 'bg-blue-50',
    hoverColor: 'hover:bg-blue-100',
    titleColor: 'text-blue-600',
    iconColor: 'text-blue-600'
  },
  {
    id: 3,
    icon: Mail,
    title: 'Contact Us',
    description: 'Have any questions? Reach out to us for more information or support.',
    buttonText: 'Get in Touch',
    href: '/contact',
    bgColor: 'bg-purple-50',
    hoverColor: 'hover:bg-purple-100',
    titleColor: 'text-purple-600',
    iconColor: 'text-purple-600'
  }
]

// Stats data
const statsData = [
  {
    id: 1,
    title: 'Total Users',
    value: '1,234',
    icon: Users,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    trend: '+12%'
  },
  {
    id: 2,
    title: 'Active Sessions',
    value: '56',
    icon: Activity,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    trend: '+8%'
  },
  {
    id: 3,
    title: 'Configurations',
    value: '89',
    icon: Database,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    trend: '+23%'
  },
  {
    id: 4,
    title: 'Growth Rate',
    value: '34%',
    icon: TrendingUp,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    trend: '+5%'
  }
]

export default function DashboardPage() {
  return (
    <main className="flex-1 p-4 md:p-8 bg-gray-50 min-h-screen">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
          Dashboard
        </h1>
        <p className="text-gray-600 text-lg">
          Welcome back! Here&apos;s what&apos;s happening today.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
        {statsData.map((stat) => (
          <StatsCard
            key={stat.id}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            color={stat.color}
            bgColor={stat.bgColor}
            trend={stat.trend}
          />
        ))}
      </div>

      {/* Quick Actions Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">
          Quick Actions
        </h2>
        <p className="text-gray-600">
          Access your most used features quickly
        </p>
      </div>

      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {dashboardCards.map((card) => (
          <DashboardCard
            key={card.id}
            icon={card.icon}
            title={card.title}
            description={card.description}
            buttonText={card.buttonText}
            href={card.href}
            bgColor={card.bgColor}
            hoverColor={card.hoverColor}
            titleColor={card.titleColor}
            iconColor={card.iconColor}
          />
        ))}
      </div>

      {/* Recent Activity Section */}
      <div className="mt-8 bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Recent Activity
        </h2>
        <div className="space-y-4">
          <ActivityItem
            title="Configuration Updated"
            time="2 hours ago"
            type="success"
          />
          <ActivityItem
            title="New User Registered"
            time="5 hours ago"
            type="info"
          />
          <ActivityItem
            title="Service Request Completed"
            time="1 day ago"
            type="success"
          />
        </div>
      </div>
    </main>
  )
}

function ActivityItem({ title, time, type }) {
  const colors = {
    success: 'bg-green-100 text-green-600',
    info: 'bg-blue-100 text-blue-600',
    warning: 'bg-yellow-100 text-yellow-600'
  }

  return (
    <div className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors">
      <div className={`w-2 h-2 rounded-full ${colors[type]}`} />
      <div className="flex-1">
        <p className="font-medium text-gray-800">{title}</p>
        <p className="text-sm text-gray-500">{time}</p>
      </div>
    </div>
  )
}
