// React 19 useOptimistic hook - Optimistic UI updates ke liye
// User ko instant feedback deta hai, actual API response se pehle

'use client'

import { useOptimistic, useState, useTransition } from 'react'
import { Send, Check, X } from 'lucide-react'

export default function OptimisticForm() {
  const [messages, setMessages] = useState([
    { id: 1, text: 'Hello!', status: 'sent' },
    { id: 2, text: 'How are you?', status: 'sent' }
  ])
  
  const [isPending, startTransition] = useTransition()
  
  // useOptimistic hook - optimistic state manage karta hai
  const [optimisticMessages, addOptimisticMessage] = useOptimistic(
    messages,
    (state, newMessage) => [
      ...state,
      { ...newMessage, status: 'sending' }
    ]
  )

  async function sendMessage(formData) {
    const text = formData.get('message')
    
    // Optimistic update - instantly UI update hota hai
    const newMessage = {
      id: Date.now(),
      text,
      status: 'sending'
    }
    
    startTransition(async () => {
      addOptimisticMessage(newMessage)
      
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        // Actual state update after API success
        setMessages(prev => [...prev, { ...newMessage, status: 'sent' }])
      } catch (error) {
        // Error handling
        setMessages(prev => [...prev, { ...newMessage, status: 'failed' }])
      }
    })
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        Optimistic UI Demo (React 19)
      </h2>
      
      {/* Messages List */}
      <div className="space-y-3 mb-6 max-h-96 overflow-y-auto">
        {optimisticMessages.map((message) => (
          <div
            key={message.id}
            className={`p-4 rounded-lg flex items-center justify-between ${
              message.status === 'sending'
                ? 'bg-blue-50 border border-blue-200'
                : message.status === 'sent'
                ? 'bg-green-50 border border-green-200'
                : 'bg-red-50 border border-red-200'
            }`}
          >
            <span className="text-gray-800">{message.text}</span>
            
            {/* Status Icon */}
            {message.status === 'sending' && (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600" />
            )}
            {message.status === 'sent' && (
              <Check className="w-5 h-5 text-green-600" />
            )}
            {message.status === 'failed' && (
              <X className="w-5 h-5 text-red-600" />
            )}
          </div>
        ))}
      </div>

      {/* Form */}
      <form
        action={sendMessage}
        className="flex gap-2"
      >
        <input
          type="text"
          name="message"
          placeholder="Type your message..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
        />
        <button
          type="submit"
          disabled={isPending}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <Send className="w-4 h-4" />
          Send
        </button>
      </form>

      {/* Info */}
      <p className="mt-4 text-sm text-gray-600">
        💡 <strong>useOptimistic Hook:</strong> Message instantly show hota hai (optimistic update), 
        phir 2 seconds baad actual API response aata hai.
      </p>
    </div>
  )
}
