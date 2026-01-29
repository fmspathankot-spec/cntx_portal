// React 19 useFormStatus aur useActionState hooks
// Form submission status aur state management ke liye

'use client'

import { useFormStatus, useActionState } from 'react-dom'
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react'

// Submit Button with useFormStatus
function SubmitButton() {
  // useFormStatus - parent form ki status provide karta hai
  const { pending, data, method, action } = useFormStatus()
  
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium"
    >
      {pending ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin" />
          Submitting...
        </>
      ) : (
        <>
          <CheckCircle className="w-5 h-5" />
          Submit Form
        </>
      )}
    </button>
  )
}

// Server Action (ye normally server component mein hota hai)
async function submitFormAction(prevState, formData) {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  const name = formData.get('name')
  const email = formData.get('email')
  
  // Validation
  if (!name || name.length < 3) {
    return {
      success: false,
      message: 'Name must be at least 3 characters',
      data: null
    }
  }
  
  if (!email || !email.includes('@')) {
    return {
      success: false,
      message: 'Please enter a valid email',
      data: null
    }
  }
  
  // Success
  return {
    success: true,
    message: 'Form submitted successfully!',
    data: { name, email }
  }
}

export default function FormWithStatus() {
  // useActionState - form action ki state manage karta hai
  const [state, formAction] = useActionState(submitFormAction, {
    success: null,
    message: '',
    data: null
  })

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        Form with Status (React 19)
      </h2>

      {/* Status Message */}
      {state.message && (
        <div
          className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
            state.success
              ? 'bg-green-50 border border-green-200 text-green-800'
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}
        >
          {state.success ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          <span>{state.message}</span>
        </div>
      )}

      {/* Form */}
      <form action={formAction} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Name
          </label>
          <input
            type="text"
            name="name"
            placeholder="Enter your name"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email
          </label>
          <input
            type="email"
            name="email"
            placeholder="Enter your email"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Message
          </label>
          <textarea
            name="message"
            rows="4"
            placeholder="Enter your message"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            required
          />
        </div>

        {/* Submit Button with useFormStatus */}
        <SubmitButton />
      </form>

      {/* Success Data Display */}
      {state.success && state.data && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-gray-800 mb-2">Submitted Data:</h3>
          <pre className="text-sm text-gray-600">
            {JSON.stringify(state.data, null, 2)}
          </pre>
        </div>
      )}

      {/* Info */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-semibold text-blue-900 mb-2">React 19 Hooks Used:</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• <strong>useFormStatus:</strong> Form submission status track karta hai</li>
          <li>• <strong>useActionState:</strong> Server action ki state manage karta hai</li>
          <li>• Automatic error handling aur validation</li>
          <li>• No need for manual loading states!</li>
        </ul>
      </div>
    </div>
  )
}
