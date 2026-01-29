# 🚀 React 19 Hooks - Complete Guide (Hindi)

## विषय सूची (Table of Contents)

1. [React 19 में क्या नया है?](#1-react-19-में-क्या-नया-है)
2. [New Hooks Overview](#2-new-hooks-overview)
3. [useOptimistic Hook](#3-useoptimistic-hook)
4. [useFormStatus Hook](#4-useformstatus-hook)
5. [useActionState Hook](#5-useactionstate-hook)
6. [use Hook](#6-use-hook)
7. [Practical Examples](#7-practical-examples)
8. [Migration Guide](#8-migration-guide)

---

## 1. React 19 में क्या नया है?

### 🎯 Major Features

React 19 में कई powerful features aaye hain:

- ✅ **New Hooks** - useOptimistic, useFormStatus, useActionState, use
- ✅ **Server Actions** - Direct server functions in components
- ✅ **Improved Suspense** - Better data fetching
- ✅ **Actions** - Async transitions built-in
- ✅ **Form Actions** - Native form handling
- ✅ **Document Metadata** - Built-in SEO support

---

## 2. New Hooks Overview

### 📋 Complete List

| Hook | Purpose | Use Case |
|------|---------|----------|
| `useOptimistic` | Optimistic UI updates | Instant feedback before server response |
| `useFormStatus` | Form submission status | Loading states, disable buttons |
| `useActionState` | Server action state | Form validation, error handling |
| `use` | Read promises/context | Async data fetching |
| `useTransition` (improved) | Non-blocking updates | Better performance |

---

## 3. useOptimistic Hook

### 🎯 Purpose
Optimistic UI updates provide karta hai - user ko instant feedback milta hai bina server response wait kiye.

### 📝 Syntax

```javascript
const [optimisticState, addOptimistic] = useOptimistic(
  actualState,
  updateFn
)
```

### 🔧 Parameters

- **actualState**: Current actual state
- **updateFn**: Function jo optimistic update define karta hai

### 💡 Example: Todo List

```javascript
'use client'

import { useOptimistic, useState } from 'react'

export default function TodoList() {
  const [todos, setTodos] = useState([
    { id: 1, text: 'Learn React 19', completed: false }
  ])

  // useOptimistic hook
  const [optimisticTodos, addOptimisticTodo] = useOptimistic(
    todos,
    (state, newTodo) => [...state, { ...newTodo, pending: true }]
  )

  async function addTodo(formData) {
    const text = formData.get('todo')
    const newTodo = {
      id: Date.now(),
      text,
      completed: false
    }

    // Optimistic update - instant UI change
    addOptimisticTodo(newTodo)

    try {
      // Server call
      const response = await fetch('/api/todos', {
        method: 'POST',
        body: JSON.stringify(newTodo)
      })
      
      const savedTodo = await response.json()
      
      // Actual state update
      setTodos(prev => [...prev, savedTodo])
    } catch (error) {
      // Rollback on error (automatic)
      console.error('Failed to add todo')
    }
  }

  return (
    <div>
      <form action={addTodo}>
        <input name="todo" placeholder="Add todo..." />
        <button type="submit">Add</button>
      </form>

      <ul>
        {optimisticTodos.map(todo => (
          <li
            key={todo.id}
            className={todo.pending ? 'opacity-50' : ''}
          >
            {todo.text}
            {todo.pending && ' (Saving...)'}
          </li>
        ))}
      </ul>
    </div>
  )
}
```

### ✅ Benefits

1. **Instant Feedback** - User ko turant response milta hai
2. **Better UX** - No waiting for server
3. **Automatic Rollback** - Error par automatically revert
4. **Simple API** - Easy to use

### ⚠️ When to Use

- ✅ Like/Unlike buttons
- ✅ Adding items to cart
- ✅ Sending messages
- ✅ Toggling settings
- ❌ Critical operations (payments, deletions)

---

## 4. useFormStatus Hook

### 🎯 Purpose
Form submission ki status track karta hai - pending, data, method, action.

### 📝 Syntax

```javascript
const { pending, data, method, action } = useFormStatus()
```

### 🔧 Return Values

- **pending**: Boolean - form submit ho raha hai ya nahi
- **data**: FormData - form ka data
- **method**: String - HTTP method (POST, GET, etc.)
- **action**: String - form action URL

### 💡 Example: Submit Button

```javascript
'use client'

import { useFormStatus } from 'react-dom'

function SubmitButton() {
  const { pending, data } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending}
      className={`
        px-6 py-2 rounded-lg
        ${pending ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}
        text-white transition-colors
      `}
    >
      {pending ? (
        <>
          <Spinner />
          Submitting...
        </>
      ) : (
        'Submit Form'
      )}
    </button>
  )
}

// Parent form
export default function MyForm() {
  async function handleSubmit(formData) {
    // Server action
    await saveData(formData)
  }

  return (
    <form action={handleSubmit}>
      <input name="email" type="email" />
      <SubmitButton />
    </form>
  )
}
```

### ✅ Benefits

1. **No Manual State** - Automatic loading state
2. **Form Context** - Access to form data
3. **Reusable** - Same button component everywhere
4. **Type Safe** - TypeScript support

### ⚠️ Important Notes

- ⚠️ **Must be inside form** - Parent mein `<form>` hona chahiye
- ⚠️ **Separate component** - SubmitButton alag component hona chahiye
- ⚠️ **Client component** - 'use client' directive required

---

## 5. useActionState Hook

### 🎯 Purpose
Server actions ki state manage karta hai - success, error, data.

### 📝 Syntax

```javascript
const [state, formAction, isPending] = useActionState(
  serverAction,
  initialState
)
```

### 🔧 Parameters

- **serverAction**: Server function jo execute hoga
- **initialState**: Initial state value

### 🔧 Return Values

- **state**: Current state (success, error, data)
- **formAction**: Form action function
- **isPending**: Boolean - action pending hai ya nahi

### 💡 Example: Login Form

```javascript
'use client'

import { useActionState } from 'react-dom'

// Server action
async function loginAction(prevState, formData) {
  const email = formData.get('email')
  const password = formData.get('password')

  try {
    // Validation
    if (!email || !password) {
      return {
        success: false,
        error: 'Email and password required'
      }
    }

    // API call
    const response = await fetch('/api/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    })

    if (!response.ok) {
      return {
        success: false,
        error: 'Invalid credentials'
      }
    }

    const user = await response.json()

    return {
      success: true,
      user,
      error: null
    }
  } catch (error) {
    return {
      success: false,
      error: 'Something went wrong'
    }
  }
}

export default function LoginForm() {
  const [state, formAction, isPending] = useActionState(
    loginAction,
    { success: null, error: null, user: null }
  )

  return (
    <div>
      {/* Error Message */}
      {state.error && (
        <div className="bg-red-50 text-red-600 p-4 rounded">
          {state.error}
        </div>
      )}

      {/* Success Message */}
      {state.success && (
        <div className="bg-green-50 text-green-600 p-4 rounded">
          Welcome, {state.user.name}!
        </div>
      )}

      {/* Form */}
      <form action={formAction}>
        <input
          name="email"
          type="email"
          placeholder="Email"
          required
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          required
        />
        <button type="submit" disabled={isPending}>
          {isPending ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  )
}
```

### ✅ Benefits

1. **Automatic State Management** - No useState needed
2. **Error Handling** - Built-in error states
3. **Progressive Enhancement** - Works without JS
4. **Type Safe** - Full TypeScript support

---

## 6. use Hook

### 🎯 Purpose
Promises aur Context ko directly read kar sakta hai.

### 📝 Syntax

```javascript
const data = use(promise)
const value = use(Context)
```

### 💡 Example: Data Fetching

```javascript
'use client'

import { use, Suspense } from 'react'

// Data fetching function
function fetchUser(userId) {
  return fetch(`/api/users/${userId}`).then(res => res.json())
}

// Component using 'use' hook
function UserProfile({ userPromise }) {
  // 'use' hook promise ko read karta hai
  const user = use(userPromise)

  return (
    <div>
      <h2>{user.name}</h2>
      <p>{user.email}</p>
    </div>
  )
}

// Parent component
export default function UserPage({ userId }) {
  // Promise create karo
  const userPromise = fetchUser(userId)

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <UserProfile userPromise={userPromise} />
    </Suspense>
  )
}
```

### 💡 Example: Context Reading

```javascript
import { use, createContext } from 'react'

const ThemeContext = createContext('light')

function ThemedButton() {
  // 'use' hook se context read karo
  const theme = use(ThemeContext)

  return (
    <button className={theme === 'dark' ? 'bg-black' : 'bg-white'}>
      Click me
    </button>
  )
}
```

### ✅ Benefits

1. **Simpler Syntax** - No useEffect needed
2. **Conditional Usage** - Can use in conditions
3. **Loops Support** - Can use in loops
4. **Better Performance** - Optimized rendering

---

## 7. Practical Examples

### 🛒 Shopping Cart with Optimistic Updates

```javascript
'use client'

import { useOptimistic, useState } from 'react'

export default function ShoppingCart() {
  const [cart, setCart] = useState([])
  const [optimisticCart, addOptimisticItem] = useOptimistic(
    cart,
    (state, newItem) => [...state, { ...newItem, adding: true }]
  )

  async function addToCart(product) {
    // Optimistic update
    addOptimisticItem(product)

    try {
      // API call
      await fetch('/api/cart', {
        method: 'POST',
        body: JSON.stringify(product)
      })

      // Update actual state
      setCart(prev => [...prev, product])
    } catch (error) {
      // Automatic rollback
      alert('Failed to add to cart')
    }
  }

  return (
    <div>
      {optimisticCart.map(item => (
        <div key={item.id} className={item.adding ? 'opacity-50' : ''}>
          {item.name} - ${item.price}
          {item.adding && ' (Adding...)'}
        </div>
      ))}
    </div>
  )
}
```

### 📝 Comment Form with Status

```javascript
'use client'

import { useFormStatus, useActionState } from 'react-dom'

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button disabled={pending}>
      {pending ? 'Posting...' : 'Post Comment'}
    </button>
  )
}

async function postComment(prevState, formData) {
  const comment = formData.get('comment')
  
  await fetch('/api/comments', {
    method: 'POST',
    body: JSON.stringify({ comment })
  })

  return { success: true, message: 'Comment posted!' }
}

export default function CommentForm() {
  const [state, formAction] = useActionState(postComment, {})

  return (
    <form action={formAction}>
      {state.message && <p>{state.message}</p>}
      <textarea name="comment" />
      <SubmitButton />
    </form>
  )
}
```

---

## 8. Migration Guide

### From React 18 to React 19

#### ❌ Old Way (React 18)

```javascript
function MyForm() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const formData = new FormData(e.target)
      await submitForm(formData)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && <div>{error}</div>}
      <input name="email" />
      <button disabled={loading}>
        {loading ? 'Submitting...' : 'Submit'}
      </button>
    </form>
  )
}
```

#### ✅ New Way (React 19)

```javascript
'use client'

import { useFormStatus, useActionState } from 'react-dom'

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button disabled={pending}>
      {pending ? 'Submitting...' : 'Submit'}
    </button>
  )
}

async function submitAction(prevState, formData) {
  try {
    await submitForm(formData)
    return { success: true, error: null }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

export default function MyForm() {
  const [state, formAction] = useActionState(submitAction, {})

  return (
    <form action={formAction}>
      {state.error && <div>{state.error}</div>}
      <input name="email" />
      <SubmitButton />
    </form>
  )
}
```

### 📊 Comparison

| Feature | React 18 | React 19 |
|---------|----------|----------|
| Loading State | Manual useState | Automatic useFormStatus |
| Error Handling | Try-catch + useState | Built-in useActionState |
| Form Actions | onSubmit handler | action prop |
| Code Lines | ~20 lines | ~10 lines |
| Complexity | High | Low |

---

## 🎓 Best Practices

### ✅ Do's

1. **Use useOptimistic for instant feedback**
   ```javascript
   // ✅ Good
   addOptimisticItem(newItem)
   ```

2. **Separate SubmitButton component**
   ```javascript
   // ✅ Good
   function SubmitButton() {
     const { pending } = useFormStatus()
     return <button disabled={pending}>Submit</button>
   }
   ```

3. **Handle errors in server actions**
   ```javascript
   // ✅ Good
   async function action(prevState, formData) {
     try {
       // ...
       return { success: true }
     } catch (error) {
       return { success: false, error: error.message }
     }
   }
   ```

### ❌ Don'ts

1. **Don't use useFormStatus outside form**
   ```javascript
   // ❌ Bad
   function MyComponent() {
     const { pending } = useFormStatus() // Error!
   }
   ```

2. **Don't forget 'use client' directive**
   ```javascript
   // ❌ Bad - Missing 'use client'
   import { useOptimistic } from 'react'
   ```

3. **Don't use for critical operations**
   ```javascript
   // ❌ Bad - Payment shouldn't be optimistic
   addOptimisticPayment(payment)
   ```

---

## 🚀 Resources

- [React 19 Official Docs](https://react.dev)
- [Next.js 15 with React 19](https://nextjs.org)
- [React Conf 2024](https://conf.react.dev)

---

**Happy Coding with React 19! 🎉**
