# 🚀 CNTX Portal - Context Transfer Portal

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.3-38B2AC?style=for-the-badge&logo=tailwind-css)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

**Modern context transfer portal built with Next.js 15 and React 19**

[Live Demo](#) • [Documentation](./SETUP.md) • [React 19 Guide](./REACT19_HOOKS_GUIDE.md) • [Report Bug](#)

</div>

---

## 🎉 **NEW: React 19 Features!**

This project now uses **React 19** with all the latest hooks:

- ✨ **useOptimistic** - Optimistic UI updates
- ✨ **useFormStatus** - Automatic form state
- ✨ **useActionState** - Server action management
- ✨ **use** - Promise & context reading
- ✨ **Server Actions** - Direct server functions

👉 **[Check out the React 19 Demo Page](/react19-demo)** to see these hooks in action!

---

## 📋 विषय सूची (Table of Contents)

- [परिचय (Introduction)](#-परिचय-introduction)
- [React 19 Features](#-react-19-features)
- [फीचर्स (Features)](#-फीचर्स-features)
- [स्क्रीनशॉट्स (Screenshots)](#-स्क्रीनशॉट्स-screenshots)
- [इंस्टॉलेशन (Installation)](#-इंस्टॉलेशन-installation)
- [प्रोजेक्ट स्ट्रक्चर (Project Structure)](#-प्रोजेक्ट-स्ट्रक्चर-project-structure)
- [टेक्नोलॉजी स्टैक (Tech Stack)](#-टेक्नोलॉजी-स्टैक-tech-stack)
- [उपयोग (Usage)](#-उपयोग-usage)
- [योगदान (Contributing)](#-योगदान-contributing)

---

## 🎯 परिचय (Introduction)

**CNTX Portal** एक modern, responsive web application है जो **Next.js 15** और **React 19** के साथ बनाया गया है। यह portal context transfer और data management के लिए एक comprehensive solution प्रदान करता है।

### मुख्य उद्देश्य (Main Objectives)
- ⚡ Fast और efficient data transfer
- 🔒 Secure और reliable operations
- 🎨 Modern और user-friendly interface
- 📱 Fully responsive design
- ✨ **Latest React 19 hooks implementation**

---

## ✨ React 19 Features

### 🎯 Implemented Hooks

#### 1. **useOptimistic Hook**
Instant UI updates without waiting for server response.

```javascript
const [optimisticState, addOptimistic] = useOptimistic(
  state,
  (currentState, optimisticValue) => {
    return [...currentState, optimisticValue]
  }
)
```

**Use Cases:**
- ✅ Like/Unlike buttons
- ✅ Adding to cart
- ✅ Sending messages
- ✅ Toggling settings

#### 2. **useFormStatus Hook**
Automatic form submission status tracking.

```javascript
function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button disabled={pending}>
      {pending ? 'Submitting...' : 'Submit'}
    </button>
  )
}
```

**Benefits:**
- ✅ No manual loading state
- ✅ Automatic disable on submit
- ✅ Reusable components

#### 3. **useActionState Hook**
Server action state management with built-in error handling.

```javascript
const [state, formAction] = useActionState(
  serverAction,
  initialState
)
```

**Features:**
- ✅ Automatic error handling
- ✅ Success/failure states
- ✅ Progressive enhancement

#### 4. **use Hook**
Read promises and context directly.

```javascript
const data = use(promise)
const value = use(Context)
```

**Advantages:**
- ✅ Simpler syntax
- ✅ Can use in conditions
- ✅ Better performance

### 📚 Learn More
Check out our comprehensive [React 19 Hooks Guide](./REACT19_HOOKS_GUIDE.md) for detailed examples and best practices!

---

## ✨ फीचर्स (Features)

### 🏠 Home Page
- Beautiful hero section with gradient background
- Feature showcase cards
- Call-to-action sections
- Smooth animations and transitions

### 📊 Dashboard
- **4 Stats Cards:**
  - Total Users (1,234)
  - Active Sessions (56)
  - Configurations (89)
  - Growth Rate (34%)
- **3 Quick Action Cards:**
  - Configuration
  - Services
  - Contact
- Recent Activity timeline

### 🎨 **NEW: React 19 Demo Page**
- **Live Examples** of all React 19 hooks
- **Interactive Demos:**
  - Optimistic UI updates
  - Form status tracking
  - Server actions
- **Code Examples** with explanations
- **Best Practices** guide

### ⚙️ Configuration
- Comprehensive settings form
- Real-time validation
- Multiple configuration sections:
  - General Settings
  - Connection Settings
  - Advanced Settings
- Save/Reset functionality
- Success notifications

### 📧 Contact
- Contact form with validation
- Business hours display
- Contact information cards
- Email, Phone, Address details
- Success message on submission

### 🛠️ Services
- 6 service categories:
  - Fast Performance
  - Enterprise Security
  - Global Access
  - Data Management
  - Cloud Integration
  - Privacy Protection
- Feature lists for each service
- Beautiful card layouts

### 🧭 Navigation
- Responsive sidebar
- Mobile-friendly menu
- Active route highlighting
- Smooth transitions
- Support section
- **NEW badge** for React 19 demo

---

## 📸 स्क्रीनशॉट्स (Screenshots)

### Desktop View
```
🖥️ Home → Dashboard → React 19 Demo → Configuration → Services
```

### Mobile View
```
📱 Responsive sidebar → Touch-friendly → Optimized forms
```

---

## 🚀 इंस्टॉलेशन (Installation)

### Prerequisites (आवश्यकताएं)
- Node.js 18+ installed
- npm/yarn/pnpm package manager
- Git

### Quick Start

```bash
# 1. Repository clone करें
git clone https://github.com/fmspathankot-spec/cntx_portal.git

# 2. Project directory में जाएं
cd cntx_portal

# 3. Dependencies install करें
npm install
# या
yarn install
# या
pnpm install

# 4. Environment variables setup करें
cp .env.example .env.local
# अब .env.local को edit करें

# 5. Development server start करें
npm run dev
# या
yarn dev
# या
pnpm dev
```

अब browser में खोलें: **http://localhost:3000** 🎉

विस्तृत setup instructions के लिए [SETUP.md](./SETUP.md) देखें।

---

## 📁 प्रोजेक्ट स्ट्रक्चर (Project Structure)

```
cntx_portal/
├── app/                          # Next.js App Router
│   ├── components/              # Reusable Components
│   │   ├── Sidebar.js          # Navigation sidebar
│   │   ├── DashboardCard.js    # Dashboard card component
│   │   ├── StatsCard.js        # Statistics card component
│   │   ├── OptimisticForm.js   # 🆕 React 19 useOptimistic demo
│   │   └── FormWithStatus.js   # 🆕 React 19 useFormStatus demo
│   │
│   ├── hooks/                   # 🆕 Custom Hooks
│   │   └── useAsync.js         # React 19 'use' hook example
│   │
│   ├── dashboard/              # Dashboard Page
│   │   └── page.js            # Main dashboard
│   │
│   ├── react19-demo/           # 🆕 React 19 Demo Page
│   │   └── page.js            # Interactive demos
│   │
│   ├── configuration/          # Configuration Page
│   │   └── page.js            # Settings form
│   │
│   ├── contact/                # Contact Page
│   │   └── page.js            # Contact form
│   │
│   ├── services/               # Services Page
│   │   └── page.js            # Services showcase
│   │
│   ├── layout.js               # Root layout with sidebar
│   ├── page.js                 # Home page
│   └── globals.css             # Global styles
│
├── public/                      # Static Assets
│   └── (images, icons, etc.)
│
├── .env.example                # Environment variables template
├── .gitignore                  # Git ignore rules
├── package.json                # Project dependencies (React 19!)
├── tailwind.config.js          # Tailwind configuration
├── postcss.config.js           # PostCSS configuration
├── next.config.js              # Next.js configuration
├── SETUP.md                    # Detailed setup guide
├── DOCS_HINDI.md               # Hindi documentation
├── REACT19_HOOKS_GUIDE.md      # 🆕 React 19 hooks guide
└── README.md                   # This file
```

---

## 🛠️ टेक्नोलॉजी स्टैक (Tech Stack)

### Frontend
- **[Next.js 15](https://nextjs.org/)** - React framework with App Router
- **[React 19](https://react.dev/)** - UI library with latest hooks
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[Lucide React](https://lucide.dev/)** - Beautiful icon library

### React 19 Features
- ✨ **useOptimistic** - Optimistic UI updates
- ✨ **useFormStatus** - Form submission status
- ✨ **useActionState** - Server action state
- ✨ **use** - Promise & context reading
- ✨ **Server Actions** - Direct server functions

### Development Tools
- **ESLint** - Code linting
- **PostCSS** - CSS processing
- **Autoprefixer** - CSS vendor prefixing

### Deployment
- **Vercel** (recommended)
- **Netlify**
- **Docker** (optional)

---

## 💻 उपयोग (Usage)

### Development Commands

```bash
# Development server start करें
npm run dev

# Production build बनाएं
npm run build

# Production server start करें
npm start

# Code lint करें
npm run lint
```

### React 19 Hooks Usage

#### useOptimistic Example
```javascript
'use client'
import { useOptimistic } from 'react'

const [optimisticState, addOptimistic] = useOptimistic(
  state,
  (current, optimisticValue) => [...current, optimisticValue]
)
```

#### useFormStatus Example
```javascript
'use client'
import { useFormStatus } from 'react-dom'

function SubmitButton() {
  const { pending } = useFormStatus()
  return <button disabled={pending}>Submit</button>
}
```

#### useActionState Example
```javascript
'use client'
import { useActionState } from 'react-dom'

const [state, formAction] = useActionState(serverAction, initialState)
```

### Environment Variables

`.env.local` file में ये variables set करें:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
DATABASE_URL=your_database_url
NEXTAUTH_SECRET=your_secret_key
```

---

## 🎨 Customization (कस्टमाइजेशन)

### Colors
`tailwind.config.js` में colors customize करें:

```javascript
theme: {
  extend: {
    colors: {
      primary: '#your-color',
      secondary: '#your-color',
    }
  }
}
```

### Fonts
`app/layout.js` में fonts change करें:

```javascript
import { YourFont } from 'next/font/google'

const yourFont = YourFont({ subsets: ['latin'] })
```

---

## 🐛 Troubleshooting (समस्या समाधान)

### Common Issues

**Port already in use:**
```bash
npm run dev -- -p 3001
```

**Module not found:**
```bash
rm -rf node_modules package-lock.json
npm install
```

**Styling not working:**
```bash
# Clear cache and restart
rm -rf .next
npm run dev
```

**React 19 hooks not working:**
```bash
# Make sure you have React 19 installed
npm install react@19 react-dom@19
```

---

## 🤝 योगदान (Contributing)

हम contributions का स्वागत करते हैं! 🎉

### Steps:
1. Fork करें repository
2. नई branch बनाएं (`git checkout -b feature/AmazingFeature`)
3. Changes commit करें (`git commit -m 'Add some AmazingFeature'`)
4. Branch को push करें (`git push origin feature/AmazingFeature`)
5. Pull Request खोलें

### Contribution Guidelines
- Clean और readable code लिखें
- Comments add करें जहां जरूरी हो
- Existing code style follow करें
- Test करें अपने changes को
- React 19 best practices follow करें

---

## 📝 License

यह project **MIT License** के तहत licensed है। विवरण के लिए [LICENSE](LICENSE) file देखें।

---

## 👨‍💻 Author (लेखक)

**FMS Pathankot**
- GitHub: [@fmspathankot-spec](https://github.com/fmspathankot-spec)
- Email: fmspathankot@gmail.com

---

## 🙏 Acknowledgments (आभार)

- Next.js team for the amazing framework
- React team for React 19 and new hooks
- Tailwind CSS for the utility-first approach
- Lucide for beautiful icons
- All contributors and supporters

---

## 📞 Support (सहायता)

अगर आपको कोई समस्या आए या सवाल हो:

- 🐛 [Open an Issue](https://github.com/fmspathankot-spec/cntx_portal/issues)
- 📧 Email: fmspathankot@gmail.com
- 💬 [Discussions](https://github.com/fmspathankot-spec/cntx_portal/discussions)

---

## 🗺️ Roadmap (भविष्य की योजनाएं)

- [x] React 19 hooks implementation ✅
- [x] useOptimistic demo ✅
- [x] useFormStatus demo ✅
- [x] useActionState demo ✅
- [ ] Authentication system (Login/Register)
- [ ] Database integration
- [ ] API endpoints
- [ ] Real-time notifications
- [ ] User management
- [ ] Advanced analytics
- [ ] Dark mode support
- [ ] Multi-language support
- [ ] Mobile app (React Native)

---

## 📚 Documentation

- **[Setup Guide](./SETUP.md)** - Complete installation guide
- **[Hindi Docs](./DOCS_HINDI.md)** - Detailed Hindi documentation
- **[React 19 Guide](./REACT19_HOOKS_GUIDE.md)** - React 19 hooks guide

---

## ⭐ Star History

अगर यह project आपके काम आया, तो कृपया इसे **star** ⭐ करें!

---

<div align="center">

**Made with ❤️ and React 19 by FMS Pathankot**

[⬆ Back to Top](#-cntx-portal---context-transfer-portal)

</div>
