'use client'

import { useState } from 'react'
import OptimisticForm from '../components/OptimisticForm'
import FormWithStatus from '../components/FormWithStatus'
import { Sparkles, Zap, Rocket } from 'lucide-react'

export default function React19DemoPage() {
  const [activeDemo, setActiveDemo] = useState('optimistic')

  const demos = [
    {
      id: 'optimistic',
      title: 'useOptimistic Hook',
      description: 'Optimistic UI updates - instant feedback without waiting for server',
      icon: Zap,
      component: OptimisticForm
    },
    {
      id: 'formstatus',
      title: 'useFormStatus & useActionState',
      description: 'Automatic form state management with server actions',
      icon: Rocket,
      component: FormWithStatus
    }
  ]

  const ActiveComponent = demos.find(d => d.id === activeDemo)?.component

  return (
    <main className="flex-1 p-4 md:p-8 bg-gradient-to-br from-purple-50 to-blue-50 min-h-screen">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Sparkles className="w-8 h-8 text-purple-600" />
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800">
            React 19 Hooks Demo
          </h1>
        </div>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Latest React 19 hooks in action - useOptimistic, useFormStatus, useActionState aur bahut kuch!
        </p>
      </div>

      {/* Demo Selector */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {demos.map((demo) => {
            const Icon = demo.icon
            const isActive = activeDemo === demo.id
            
            return (
              <button
                key={demo.id}
                onClick={() => setActiveDemo(demo.id)}
                className={`p-6 rounded-lg text-left transition-all duration-300 ${
                  isActive
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-xl scale-105'
                    : 'bg-white text-gray-800 hover:shadow-lg hover:scale-102'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg ${
                    isActive ? 'bg-white/20' : 'bg-purple-100'
                  }`}>
                    <Icon className={`w-6 h-6 ${
                      isActive ? 'text-white' : 'text-purple-600'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-2">
                      {demo.title}
                    </h3>
                    <p className={`text-sm ${
                      isActive ? 'text-white/90' : 'text-gray-600'
                    }`}>
                      {demo.description}
                    </p>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Active Demo Component */}
      <div className="max-w-4xl mx-auto">
        {ActiveComponent && <ActiveComponent />}
      </div>

      {/* Features Info */}
      <div className="max-w-4xl mx-auto mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <FeatureCard
          title="useOptimistic"
          description="Instant UI updates before server response"
          features={[
            'Optimistic updates',
            'Better UX',
            'Automatic rollback on error'
          ]}
        />
        <FeatureCard
          title="useFormStatus"
          description="Track form submission status automatically"
          features={[
            'Pending state',
            'Form data access',
            'No manual state needed'
          ]}
        />
        <FeatureCard
          title="useActionState"
          description="Manage server action state easily"
          features={[
            'Server actions',
            'Error handling',
            'Progressive enhancement'
          ]}
        />
      </div>

      {/* Code Example */}
      <div className="max-w-4xl mx-auto mt-8 bg-gray-900 text-gray-100 p-6 rounded-lg">
        <h3 className="text-xl font-semibold mb-4 text-white">
          Quick Code Example:
        </h3>
        <pre className="text-sm overflow-x-auto">
{`// useOptimistic Hook
const [optimisticState, addOptimistic] = useOptimistic(
  state,
  (currentState, optimisticValue) => {
    // Return new optimistic state
    return [...currentState, optimisticValue]
  }
)

// useFormStatus Hook
function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button disabled={pending}>
      {pending ? 'Submitting...' : 'Submit'}
    </button>
  )
}

// useActionState Hook
const [state, formAction] = useActionState(
  serverAction,
  initialState
)`}
        </pre>
      </div>
    </main>
  )
}

function FeatureCard({ title, description, features }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow">
      <h3 className="text-lg font-semibold text-gray-800 mb-2">
        {title}
      </h3>
      <p className="text-sm text-gray-600 mb-4">
        {description}
      </p>
      <ul className="space-y-2">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center gap-2 text-sm text-gray-700">
            <div className="w-1.5 h-1.5 rounded-full bg-purple-600" />
            {feature}
          </li>
        ))}
      </ul>
    </div>
  )
}
