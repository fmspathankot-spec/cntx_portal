# 🔧 API Setup Guide - Complete Documentation (Hindi)

## ✅ **Problem Fix: 404 Error on Auto-Refresh**

---

## 🐛 **Problem:**

```
Error: Unable to Load Routes
API Error (404): <!DOCTYPE html>...404...This page could not be found.
```

### **Kab Aata Hai:**
```
✅ Page load hone par: Works fine (initial data)
❌ 1 minute ke baad: 404 error (auto-refresh)
❌ Manual refresh: 404 error
```

### **Kyun Aata Hai:**
```
1. API route `/api/otn-route-detail` exist nahi karta
2. Environment variable `OTN_ROUTE_DETAIL` set nahi hai
3. Auto-refresh try karta hai API call karne ki
4. API route nahi milta → 404 error
```

---

## ✅ **Solution:**

### **Step 1: API Route Created ✅**

**File:** `app/api/otn-route-detail/route.js`

```javascript
// Features:
✅ Proxy to external API
✅ Error handling
✅ Timeout handling (30 seconds)
✅ CORS support
✅ Proper logging
✅ Development error details
```

### **Step 2: Environment Variable Setup**

**File:** `.env.example` (Updated)

```bash
# OTN Route Details API
OTN_ROUTE_DETAIL=http://localhost:8000/api/otn-routes
```

---

## 🚀 **Setup Instructions:**

### **1. Create `.env.local` File**

```bash
# In project root directory
cp .env.example .env.local
```

### **2. Edit `.env.local`**

```bash
# Open .env.local and update:
OTN_ROUTE_DETAIL=http://your-actual-api-url/api/otn-routes

# Example:
OTN_ROUTE_DETAIL=http://192.168.1.100:8000/api/otn-routes
# OR
OTN_ROUTE_DETAIL=https://api.example.com/otn-routes
```

### **3. Restart Dev Server**

```bash
# Stop server (Ctrl + C)

# Start again
npm run dev
```

---

## 📊 **How It Works:**

### **Flow Diagram:**

```
User Browser
    ↓
Next.js Frontend (localhost:3000)
    ↓
API Route (/api/otn-route-detail)
    ↓
External API (from OTN_ROUTE_DETAIL env var)
    ↓
Data Returns
    ↓
Cached by React Query (5 minutes)
    ↓
Auto-refresh every 1 minute
```

### **Initial Load:**

```javascript
// Server-side (page.js)
1. Fetch from external API
2. Pass as initialData to component
3. Component shows data immediately

// Client-side (useOtnRoutes hook)
4. React Query uses initialData
5. No API call needed initially
```

### **Auto-Refresh (After 1 Minute):**

```javascript
// Client-side (useOtnRoutes hook)
1. React Query triggers refetch
2. Calls /api/otn-route-detail
3. API route proxies to external API
4. Data updates automatically
5. No page reload needed
```

---

## 🔧 **API Route Details:**

### **Endpoint:**
```
GET /api/otn-route-detail
```

### **Features:**

#### **1. Error Handling:**
```javascript
✅ 500: Configuration error (env var missing)
✅ 503: Network error (can't connect)
✅ 504: Timeout error (30 seconds)
✅ 500: Generic errors
```

#### **2. Timeout:**
```javascript
// 30 seconds timeout
signal: AbortSignal.timeout(30000)
```

#### **3. CORS Support:**
```javascript
headers: {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}
```

#### **4. Logging:**
```javascript
✅ Request URL
✅ Success count
✅ Error details
✅ Development mode: Full error messages
```

---

## 📋 **Environment Variables:**

### **Required:**

```bash
# External API URL for OTN routes
OTN_ROUTE_DETAIL=http://your-api-url/api/otn-routes
```

### **Optional:**

```bash
# Node environment
NODE_ENV=development

# Public API URL (for browser)
NEXT_PUBLIC_API_URL=http://localhost:3000
```

---

## 🎯 **Testing:**

### **1. Check Environment Variable:**

```bash
# In terminal
echo $OTN_ROUTE_DETAIL

# Should show your API URL
# If empty, env var not set
```

### **2. Test API Route:**

```bash
# Open in browser or curl
curl http://localhost:3000/api/otn-route-detail

# Should return JSON data
# If 500 error, check env var
```

### **3. Test Auto-Refresh:**

```bash
1. Open page: http://localhost:3000/otn-route-details
2. Wait 1 minute
3. Check browser console
4. Should see: "Successfully loaded X routes"
5. No 404 error
```

---

## 🐛 **Troubleshooting:**

### **Problem 1: 404 Error**

```
Error: API Error (404): ...page could not be found
```

**Solution:**
```bash
# 1. Check if API route exists
ls app/api/otn-route-detail/route.js

# 2. If not, pull latest code
git pull origin main

# 3. Restart server
npm run dev
```

---

### **Problem 2: 500 Configuration Error**

```
Error: API configuration error
Message: External API URL is not configured
```

**Solution:**
```bash
# 1. Create .env.local
cp .env.example .env.local

# 2. Add OTN_ROUTE_DETAIL
echo "OTN_ROUTE_DETAIL=http://your-api-url" >> .env.local

# 3. Restart server
npm run dev
```

---

### **Problem 3: 503 Network Error**

```
Error: Network error
Message: Unable to connect to external API
```

**Solution:**
```bash
# 1. Check if external API is running
curl http://your-api-url/api/otn-routes

# 2. Check network connection
ping your-api-server

# 3. Check firewall settings
# 4. Verify API URL in .env.local
```

---

### **Problem 4: 504 Timeout Error**

```
Error: Request timeout
Message: The request to external API timed out
```

**Solution:**
```bash
# 1. Check if external API is slow
curl -w "@curl-format.txt" http://your-api-url

# 2. Increase timeout in route.js (if needed)
signal: AbortSignal.timeout(60000) // 60 seconds

# 3. Check network latency
```

---

## 📊 **React Query Configuration:**

### **Current Settings:**

```javascript
// In useOtnRoutes.js

staleTime: 5 * 60 * 1000,        // 5 minutes
gcTime: 10 * 60 * 1000,          // 10 minutes
refetchInterval: 60 * 1000,      // 1 minute
refetchOnWindowFocus: true,      // On tab focus
refetchOnReconnect: true,        // On reconnect
retry: 3,                        // 3 retries
```

### **What This Means:**

```
staleTime (5 min):
- Data considered fresh for 5 minutes
- No refetch if data < 5 min old

gcTime (10 min):
- Keep in cache for 10 minutes
- Remove from cache after 10 min

refetchInterval (1 min):
- Auto-refresh every 1 minute
- Even if data is fresh

refetchOnWindowFocus:
- Refresh when user returns to tab
- Ensures latest data

retry (3):
- Retry 3 times on failure
- Wait: 1s, 2s, 4s between retries
```

---

## 🎨 **File Structure:**

```
cntx_portal/
├── app/
│   ├── api/
│   │   └── otn-route-detail/
│   │       └── route.js          ← NEW! API route
│   ├── hooks/
│   │   └── useOtnRoutes.js       ← React Query hook
│   └── otn-route-details/
│       ├── page.js               ← Server component
│       └── otnroutedetailsform.js ← Client component
├── .env.example                  ← Updated with OTN_ROUTE_DETAIL
├── .env.local                    ← Create this (not in git)
└── Documentation/
    └── API_SETUP_HINDI.md        ← This file
```

---

## ✅ **Summary:**

### **What Was Fixed:**

```
✅ Created API route: /api/otn-route-detail
✅ Added error handling
✅ Added timeout handling
✅ Added CORS support
✅ Updated .env.example
✅ Added documentation
```

### **What You Need to Do:**

```
1. Pull latest code:
   git pull origin main

2. Create .env.local:
   cp .env.example .env.local

3. Add your API URL:
   OTN_ROUTE_DETAIL=http://your-api-url

4. Restart server:
   npm run dev

5. Test:
   - Open page
   - Wait 1 minute
   - Check console
   - No 404 error!
```

---

## 🎉 **Expected Behavior:**

### **Before Fix:**

```
✅ Initial load: Works (server-side data)
❌ After 1 min: 404 error
❌ Refresh: 404 error
```

### **After Fix:**

```
✅ Initial load: Works (server-side data)
✅ After 1 min: Auto-refresh works
✅ Refresh: Works
✅ Tab focus: Refreshes
✅ Network reconnect: Refreshes
```

---

## 📝 **Notes:**

### **Important:**

```
1. .env.local is in .gitignore
   - Never commit to git
   - Each developer needs their own

2. Restart server after .env changes
   - Changes not picked up automatically
   - Must restart npm run dev

3. OTN_ROUTE_DETAIL is required
   - Without it, API returns 500 error
   - Check spelling carefully

4. Use correct API URL
   - Include protocol (http:// or https://)
   - Include port if needed
   - Test URL separately first
```

---

## 🚀 **Quick Commands:**

```bash
# Setup
git pull origin main
cp .env.example .env.local
nano .env.local  # Add OTN_ROUTE_DETAIL
npm run dev

# Test
curl http://localhost:3000/api/otn-route-detail

# Check logs
# Open browser console
# Should see: "Successfully loaded X routes"
```

---

**🎊 Ab 404 Error Nahi Aayega! 🚀**

**Test Karo:**
1. ✅ Pull code
2. ✅ Setup .env.local
3. ✅ Restart server
4. ✅ Wait 1 minute
5. ✅ Check console
6. ✅ No error!

**Perfect! 🎉**
