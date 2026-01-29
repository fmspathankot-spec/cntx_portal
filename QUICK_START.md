# ⚡ Quick Start Guide - Network Monitoring Portal

## 🚀 5-Minute Setup

### **Step 1: Clone & Install (2 minutes)**

```bash
git clone https://github.com/fmspathankot-spec/cntx_portal.git
cd cntx_portal
npm install
```

### **Step 2: Configure Environment (1 minute)**

```bash
# Copy example file
cp .env.example .env.local

# Edit .env.local
nano .env.local
```

**Minimum Required:**
```env
OTN_ROUTE_DETAIL=http://your-api-server.com/api/otn/routes
MONGODB_URI=mongodb://localhost:27017/network-monitoring
```

### **Step 3: Run (1 minute)**

```bash
npm run dev
```

Open: http://localhost:3000 🎉

---

## 📋 Common Tasks

### **View OTN Routes**
```
1. Click "OTN" in sidebar
2. Click "OTN Route Details"
3. See all routes
```

### **Search Routes**
```
1. Type in search box: "pathankot"
2. Results filter automatically
```

### **Filter by Region**
```
1. Select region from dropdown
2. See routes for that region only
```

### **Export Data**
```
CSV: Click "Export CSV" button
PDF: Click "Export PDF" button
```

---

## 🔧 Your Project Structure

```
aapka-project/
├── app/
│   ├── components/
│   │   ├── Sidebar.js           ← Navigation
│   │   └── Breadcrumb.js        ← Path display
│   │
│   ├── hooks/
│   │   └── useOtnRoutes.js      ← Data fetching
│   │
│   ├── api/
│   │   └── otn-route-detail/    ← API endpoint
│   │
│   └── otn-route-details/
│       ├── page.js              ← Server component
│       ├── otnroutedetailsform.js ← Client component
│       └── loading.js           ← Loading state
│
└── .env.local                   ← Your config
```

---

## 💡 Key Concepts

### **1. Server vs Client Components**

```javascript
// Server Component (default)
// app/otn-route-details/page.js
export default async function Page() {
  const data = await fetch(API_URL) // Runs on server
  return <Form initialData={data} />
}

// Client Component (needs 'use client')
// app/otn-route-details/otnroutedetailsform.js
'use client'
export default function Form({ initialData }) {
  const [search, setSearch] = useState('') // Needs client
  return <input onChange={e => setSearch(e.target.value)} />
}
```

### **2. Data Flow**

```
Server (page.js)
    ↓ Fetch data
    ↓ Pass as initialData
Client (form.js)
    ↓ Use in useOtnRoutes hook
    ↓ Display in table
```

### **3. React Query Caching**

```javascript
// First visit: API call
// Second visit: Uses cache (no API call)
// After 5 minutes: Refetches automatically
```

---

## 🐛 Quick Fixes

### **Problem: API not working**
```bash
# Check API URL
echo $OTN_ROUTE_DETAIL

# Test API manually
curl http://your-api-server.com/api/otn/routes
```

### **Problem: MongoDB error**
```bash
# Start MongoDB
mongod

# Or with Docker
docker run -d -p 27017:27017 mongo
```

### **Problem: Port 3000 in use**
```bash
# Use different port
npm run dev -- -p 3001
```

---

## 📝 Cheat Sheet

### **Common Commands**

```bash
# Development
npm run dev          # Start dev server
npm run build        # Build for production
npm start            # Start production server

# Database
mongod               # Start MongoDB
mongo                # MongoDB shell

# Git
git pull             # Update code
git status           # Check changes
```

### **File Locations**

```bash
# Add new page
app/your-page/page.js

# Add API route
app/api/your-route/route.js

# Add component
app/components/YourComponent.js

# Add hook
app/hooks/useYourHook.js
```

### **Environment Variables**

```bash
# Access in code
process.env.OTN_ROUTE_DETAIL

# Access in browser (must start with NEXT_PUBLIC_)
process.env.NEXT_PUBLIC_API_URL
```

---

## 🎯 Next Steps

### **Beginner:**
1. ✅ Read [NETWORK_MONITORING_GUIDE.md](./NETWORK_MONITORING_GUIDE.md)
2. ✅ Explore existing pages
3. ✅ Try search and filter
4. ✅ Export some data

### **Intermediate:**
1. ✅ Add new network type (CPAN/MAAN)
2. ✅ Customize sidebar
3. ✅ Add new filters
4. ✅ Modify export format

### **Advanced:**
1. ✅ Add authentication
2. ✅ Implement real-time updates
3. ✅ Add charts/graphs
4. ✅ Create mobile app

---

## 📚 Learn More

- **[Full Documentation](./NETWORK_MONITORING_GUIDE.md)** - Complete guide
- **[Network README](./NETWORK_README.md)** - Project overview
- **[React 19 Guide](./REACT19_HOOKS_GUIDE.md)** - React 19 features

---

## 💬 Need Help?

### **Common Questions:**

**Q: Kaise naya page add karun?**
```bash
# Create file
mkdir app/my-page
touch app/my-page/page.js

# Add content
export default function MyPage() {
  return <div>My Page</div>
}

# Add to sidebar
<Link href="/my-page">My Page</Link>
```

**Q: API kaise change karun?**
```bash
# Edit .env.local
OTN_ROUTE_DETAIL=http://new-api-url.com/api

# Restart server
npm run dev
```

**Q: Export kaise customize karun?**
```javascript
// Edit exportToPDF function in otnroutedetailsform.js
const exportToPDF = () => {
  // Add your custom columns
  const headers = [['#', 'Region', 'Your Column']]
  // ...
}
```

---

## 🎉 You're Ready!

Aapka setup complete hai! Ab aap:
- ✅ Network routes dekh sakte hain
- ✅ Data search kar sakte hain
- ✅ Region-wise filter kar sakte hain
- ✅ CSV/PDF export kar sakte hain

**Happy Monitoring! 🚀**

---

<div align="center">

Questions? Email: fmspathankot@gmail.com

[⬆ Back to Top](#-quick-start-guide---network-monitoring-portal)

</div>
