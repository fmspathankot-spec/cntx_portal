# 🌐 Network Monitoring Portal

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-15.5.3-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-19.1.0-blue?style=for-the-badge&logo=react)
![MongoDB](https://img.shields.io/badge/MongoDB-6.18.0-green?style=for-the-badge&logo=mongodb)
![TanStack Query](https://img.shields.io/badge/TanStack_Query-5.85.5-red?style=for-the-badge)

**Real-time Network Monitoring Dashboard for OTN, CPAN, and MAAN Networks**

[Documentation](./NETWORK_MONITORING_GUIDE.md) • [Setup Guide](#-setup-guide) • [API Docs](#-api-documentation)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Setup Guide](#-setup-guide)
- [Usage](#-usage)
- [API Documentation](#-api-documentation)
- [Troubleshooting](#-troubleshooting)

---

## 🎯 Overview

Ye ek **enterprise-grade network monitoring portal** hai jo telecom networks ko real-time monitor karta hai:

### **Monitored Networks:**

1. **OTN (Optical Transport Network)**
   - Route details aur status
   - Link monitoring
   - Service health tracking
   - Port status

2. **CPAN (Customer Premises Access Network)**
   - Link status monitoring
   - Connection details
   - Customer endpoint tracking

3. **MAAN (Metro Area Access Network)**
   - Node status monitoring
   - Metro area connectivity
   - Network topology visualization

---

## ✨ Features

### 🔍 **Monitoring Features**
- ✅ Real-time network status
- ✅ Route details with complete information
- ✅ Link status tracking (Active/Inactive)
- ✅ Service health monitoring
- ✅ Node status checking
- ✅ Port status monitoring

### 📊 **Data Management**
- ✅ Advanced search functionality
- ✅ Region-wise filtering
- ✅ CSV export
- ✅ PDF export with pagination
- ✅ Data caching with React Query
- ✅ Automatic background refetching

### 🎨 **UI/UX**
- ✅ Responsive design (Mobile, Tablet, Desktop)
- ✅ Sidebar navigation with submenus
- ✅ Breadcrumb navigation
- ✅ Loading states
- ✅ Error handling
- ✅ Toast notifications

### ⚡ **Performance**
- ✅ Server-side rendering (SSR)
- ✅ Client-side caching
- ✅ Optimized filtering with useMemo
- ✅ Lazy loading
- ✅ Code splitting

---

## 🛠️ Tech Stack

### **Frontend**
```json
{
  "framework": "Next.js 15.5.3",
  "library": "React 19.1.0",
  "styling": "Tailwind CSS 4",
  "icons": "React Icons 4.12.0"
}
```

### **State Management**
```json
{
  "data-fetching": "TanStack React Query 5.85.5",
  "devtools": "React Query Devtools 5.85.5"
}
```

### **Backend**
```json
{
  "database": "MongoDB 6.18.0",
  "orm": "Mongoose 8.17.1",
  "auth": "Better Auth 1.3.14"
}
```

### **Utilities**
```json
{
  "http-client": "Axios 1.12.2",
  "pdf-export": "jsPDF 3.0.3 + jsPDF-AutoTable 5.0.2",
  "notifications": "React Toastify 9.1.3",
  "telnet": "Telnet Client 2.2.6"
}
```

---

## 📁 Project Structure

```
cntx-app/
├── app/
│   ├── components/              # Reusable Components
│   │   ├── Sidebar.js          # Navigation sidebar
│   │   └── Breadcrumb.js       # Breadcrumb navigation
│   │
│   ├── providers/              # Context Providers
│   │   ├── QueryProvider.js   # React Query provider
│   │   └── ToastProvider.js   # Toast notifications
│   │
│   ├── hooks/                  # Custom Hooks
│   │   └── useOtnRoutes.js    # OTN routes data hook
│   │
│   ├── api/                    # API Routes
│   │   ├── otn-route-detail/
│   │   ├── cpan-link-status/
│   │   └── maan-node-status/
│   │
│   ├── otn-route-details/      # OTN Routes Page
│   │   ├── page.js            # Server component
│   │   ├── otnroutedetailsform.js  # Client component
│   │   └── loading.js         # Loading state
│   │
│   ├── cpanlinkstatus/         # CPAN Links Page
│   ├── MAANPING/               # MAAN Nodes Page
│   │
│   ├── layout.js               # Root layout
│   └── globals.css             # Global styles
│
├── lib/                        # Utility Functions
│   └── mongodb.js             # MongoDB connection
│
├── .env.local                  # Environment variables
├── .env.example               # Environment template
├── package.json               # Dependencies
├── tailwind.config.js         # Tailwind config
└── next.config.js             # Next.js config
```

---

## 🚀 Setup Guide

### **1. Prerequisites**

```bash
# Required
Node.js >= 18.0.0
npm >= 9.0.0
MongoDB >= 6.0.0

# Optional
Git
```

### **2. Installation**

```bash
# Clone repository
git clone https://github.com/fmspathankot-spec/cntx_portal.git
cd cntx_portal

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env.local
```

### **3. Environment Configuration**

Edit `.env.local`:

```env
# API Endpoints
OTN_ROUTE_DETAIL=http://your-api-server.com/api/otn/routes
CPAN_LINK_STATUS=http://your-api-server.com/api/cpan/links
MAAN_NODE_STATUS=http://your-api-server.com/api/maan/nodes

# Database
MONGODB_URI=mongodb://localhost:27017/network-monitoring

# Authentication
BETTER_AUTH_SECRET=your-secret-key-here
BETTER_AUTH_URL=http://localhost:3000

# Next.js
NEXT_PUBLIC_API_URL=http://localhost:3000
NODE_ENV=development
```

### **4. Database Setup**

```bash
# Start MongoDB
mongod --dbpath /path/to/data

# Or using Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### **5. Run Development Server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) 🎉

---

## 💻 Usage

### **Navigation**

```
Dashboard
├── OTN
│   ├── OTN Link Status
│   ├── OTN Route Details
│   ├── OTN Services Status
│   └── OTN All Service Data
│
├── CPAN
│   ├── CPAN Link Status
│   └── CPAN Link Detail
│
└── MAAN
    ├── MAAN Node Status
    ├── OTN Port Status
    └── Project Topology
```

### **Search & Filter**

```javascript
// Search in all fields
Search: "pathankot"

// Filter by region
Region: "Punjab" → Shows only Punjab routes

// Combined
Search: "OTN" + Region: "Delhi" → Shows OTN routes in Delhi
```

### **Export Data**

```javascript
// Export to CSV
Click "Export CSV" → Downloads: otn-routes-2024-01-29.csv

// Export to PDF
Click "Export PDF" → Downloads: otn-routes-2024-01-29.pdf
```

---

## 📡 API Documentation

### **1. OTN Route Details**

**Endpoint:** `GET /api/otn-route-detail`

**Response:**
```json
[
  {
    "id": "1",
    "region": "Punjab",
    "region_name": "Punjab Circle",
    "route_name": "PTK-JLD-OTN-01",
    "endA": "Pathankot",
    "endB": "Jalandhar",
    "link_number": "LNK001"
  }
]
```

### **2. CPAN Link Status**

**Endpoint:** `GET /api/cpan-link-status`

**Response:**
```json
[
  {
    "id": "1",
    "link_name": "CPAN-PTK-001",
    "status": "Active",
    "customer": "Customer A",
    "bandwidth": "100Mbps"
  }
]
```

### **3. MAAN Node Status**

**Endpoint:** `GET /api/maan-node-status`

**Response:**
```json
[
  {
    "id": "1",
    "node_name": "MAAN-PTK-01",
    "status": "Online",
    "ip_address": "192.168.1.1",
    "last_ping": "2024-01-29T10:30:00Z"
  }
]
```

---

## 🔧 Development

### **Adding New Network Type**

1. **Create API Route:**
```javascript
// app/api/new-network/route.js
export async function GET() {
  const response = await fetch(process.env.NEW_NETWORK_API)
  const data = await response.json()
  return Response.json(data)
}
```

2. **Create Custom Hook:**
```javascript
// app/hooks/useNewNetwork.js
export function useNewNetwork(initialData) {
  return useQuery({
    queryKey: ['new-network'],
    queryFn: () => axios.get('/api/new-network'),
    initialData
  })
}
```

3. **Create Page:**
```javascript
// app/new-network/page.js
export default async function NewNetworkPage() {
  const data = await fetch('/api/new-network')
  return <NewNetworkForm initialData={data} />
}
```

4. **Add to Sidebar:**
```javascript
// app/components/Sidebar.js
<li>
  <Link href="/new-network">New Network</Link>
</li>
```

---

## 🐛 Troubleshooting

### **Issue 1: API Connection Failed**

```bash
# Error
Error: Failed to fetch routes

# Solution
1. Check API endpoint in .env.local
2. Verify API server is running
3. Check network connectivity

# Debug
curl http://your-api-server.com/api/otn/routes
```

### **Issue 2: MongoDB Connection Error**

```bash
# Error
MongooseError: connect ECONNREFUSED

# Solution
1. Start MongoDB: mongod
2. Check MONGODB_URI in .env.local
3. Verify MongoDB is running: mongo --eval "db.version()"
```

### **Issue 3: Export Not Working**

```javascript
// Error: PDF export fails

// Solution
1. Check jsPDF import:
   import { jsPDF } from 'jspdf' // ✅ Correct

2. Check autoTable import:
   import autoTable from 'jspdf-autotable' // ✅ Correct

3. Verify data is not empty:
   if (filteredRoutes.length === 0) return
```

### **Issue 4: Slow Performance**

```javascript
// Problem: Page loads slowly

// Solutions:
1. Enable caching in API routes
2. Use React Query caching
3. Optimize images
4. Add loading states
5. Implement pagination
```

---

## 📊 Performance Optimization

### **1. API Caching**

```javascript
// app/api/otn-route-detail/route.js
export async function GET() {
  const response = await fetch(API_URL, {
    next: { revalidate: 60 } // Cache for 60 seconds
  })
  
  return Response.json(data, {
    headers: {
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120'
    }
  })
}
```

### **2. React Query Configuration**

```javascript
// app/providers/QueryProvider.js
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: true
    }
  }
})
```

### **3. Memoization**

```javascript
// Optimize filtering
const filteredRoutes = useMemo(() => {
  return allRoutes.filter(/* filter logic */)
}, [allRoutes, searchTerm, selectedRegion])
```

---

## 🔐 Security

### **Best Practices:**

1. ✅ Never commit `.env.local`
2. ✅ Use environment variables for API keys
3. ✅ Implement authentication
4. ✅ Validate API responses
5. ✅ Sanitize user inputs
6. ✅ Use HTTPS in production

---

## 📚 Resources

- **[Next.js Docs](https://nextjs.org/docs)**
- **[React Query Docs](https://tanstack.com/query/latest)**
- **[MongoDB Docs](https://docs.mongodb.com/)**
- **[Tailwind CSS Docs](https://tailwindcss.com/docs)**
- **[Network Monitoring Guide](./NETWORK_MONITORING_GUIDE.md)**

---

## 🤝 Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

---

## 📄 License

MIT License - Free to use!

---

## 👨‍💻 Author

**FMS Pathankot**
- GitHub: [@fmspathankot-spec](https://github.com/fmspathankot-spec)
- Email: fmspathankot@gmail.com

---

## 🙏 Acknowledgments

- Next.js team
- React team
- TanStack team
- MongoDB team
- Open source community

---

<div align="center">

**Made with ❤️ for Network Monitoring**

[⬆ Back to Top](#-network-monitoring-portal)

</div>
