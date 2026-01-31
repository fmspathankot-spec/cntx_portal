# 🚀 OTN Route Status - Quick Start Guide (Hindi)

## ⚡ **5 Minutes Mein Setup Karo!**

---

## 📋 **Kya Banaya Gaya Hai:**

```
✅ API Route: app/api/otn-route-status/route.js
✅ React Hook: app/hooks/useOtnRouteStatus.js
✅ Documentation: Complete line-by-line explanation
```

---

## 🎯 **Kya Karta Hai:**

```
✅ External API se route status fetch karta hai
✅ Real-time status dikhata hai (UP/DOWN)
✅ Auto-refresh har 1 minute
✅ Search aur filter
✅ CSV/PDF export
✅ Error handling
```

---

## 🔧 **Setup - Step by Step:**

### **Step 1: Pull Latest Code**

```bash
git pull origin main
```

### **Step 2: Add Environment Variable**

```bash
# Edit .env.local
nano .env.local

# Add this line (replace with your actual API URL):
OTN_ROUTE_STATUS=http://your-api-server-url/api/status

# Example:
OTN_ROUTE_STATUS=http://192.168.1.100:8000/api/otn-status
```

### **Step 3: Restart Server**

```bash
# Stop server (Ctrl + C)

# Start again
npm run dev
```

### **Step 4: Test**

```bash
# Open in browser:
http://localhost:3000/otnroutestatus

# Should show route status data
```

---

## 📊 **Kaise Kaam Karta Hai - Simple Flow:**

```
┌─────────────────────────────────────────────┐
│  1. User Opens Page                         │
│     http://localhost:3000/otnroutestatus   │
└──────────────────┬──────────────────────────┘
                   │
                   ↓
┌─────────────────────────────────────────────┐
│  2. Server Component (page.js)              │
│     - Fetches initial data                  │
│     - Passes to client component            │
└──────────────────┬──────────────────────────┘
                   │
                   ↓
┌─────────────────────────────────────────────┐
│  3. API Route (/api/otn-route-status)       │
│     - Reads OTN_ROUTE_STATUS env var        │
│     - Calls external API                    │
│     - Returns JSON data                     │
└──────────────────┬──────────────────────────┘
                   │
                   ↓
┌─────────────────────────────────────────────┐
│  4. External API                             │
│     - Returns route status data             │
│     - Example: [{id: 1, status: "UP"}]     │
└──────────────────┬──────────────────────────┘
                   │
                   ↓
┌─────────────────────────────────────────────┐
│  5. Client Component (otnroutestatusform.js)│
│     - Displays data in table                │
│     - Auto-refreshes every 1 minute         │
│     - Allows search/filter/export           │
└─────────────────────────────────────────────┘
```

---

## 🗂️ **Files Created:**

### **1. API Route**

```
File: app/api/otn-route-status/route.js

Purpose:
- External API se data fetch karta hai
- Error handling karta hai
- CORS support deta hai

Features:
✅ 30 second timeout
✅ Error logging
✅ Development mode details
```

### **2. React Query Hook**

```
File: app/hooks/useOtnRouteStatus.js

Purpose:
- Data fetching + caching
- Auto-refresh
- Retry on error

Features:
✅ 5 min cache
✅ 1 min auto-refresh
✅ 3 retry attempts
✅ Exponential backoff
```

### **3. Documentation**

```
File: Documentation/OTN_ROUTE_STATUS_COMPLETE_GUIDE_HINDI.md

Content:
✅ Complete architecture explanation
✅ Line-by-line code explanation
✅ Flow diagrams
✅ Error handling guide
```

---

## 🎨 **Features:**

### **Auto-Refresh:**

```javascript
refetchInterval: 60 * 1000  // 1 minute

Timeline:
10:00:00 - Initial load
10:01:00 - Auto refresh
10:02:00 - Auto refresh
10:03:00 - Auto refresh
...
```

### **Caching:**

```javascript
staleTime: 5 * 60 * 1000  // 5 minutes
gcTime: 10 * 60 * 1000    // 10 minutes

Example:
10:00 - Fetch data
10:04 - Data still fresh (no refetch)
10:05 - Data stale (refetch on next request)
10:10 - Cache deleted
```

### **Retry Logic:**

```javascript
retry: 3
retryDelay: Exponential backoff

Attempt 1: Wait 1 second
Attempt 2: Wait 2 seconds
Attempt 3: Wait 4 seconds
Then: Give up, show error
```

---

## 🐛 **Troubleshooting:**

### **Error 1: 500 Configuration Error**

```
Message: External API URL is not configured
```

**Fix:**

```bash
# Add to .env.local
OTN_ROUTE_STATUS=http://your-api-url

# Restart server
npm run dev
```

---

### **Error 2: 503 Network Error**

```
Message: Unable to connect to external API
```

**Fix:**

```bash
# Check if API is running
curl http://your-api-url

# Check network
ping your-api-server

# Verify URL in .env.local
cat .env.local | grep OTN_ROUTE_STATUS
```

---

### **Error 3: 504 Timeout**

```
Message: Request timed out after 30 seconds
```

**Fix:**

```bash
# Check API response time
curl -w "@curl-format.txt" http://your-api-url

# API should respond within 30 seconds
# If slower, optimize API or increase timeout
```

---

## 📝 **Environment Variables:**

### **Required:**

```bash
# External API URL for route status
OTN_ROUTE_STATUS=http://your-api-url/api/status
```

### **Optional:**

```bash
# Public API URL (browser-accessible)
NEXT_PUBLIC_OTN_ROUTE_STATUS=http://your-api-url/api/status

# Node environment
NODE_ENV=development
```

---

## 🎯 **Testing:**

### **Test 1: API Route**

```bash
# Test API route directly
curl http://localhost:3000/api/otn-route-status

# Should return JSON data
# If error, check logs
```

### **Test 2: Page Load**

```bash
# Open in browser
http://localhost:3000/otnroutestatus

# Should show:
✅ Route status table
✅ Search bar
✅ Filter dropdowns
✅ Export buttons
```

### **Test 3: Auto-Refresh**

```bash
# Open browser console (F12)
# Wait 1 minute
# Should see log:
"✅ Successfully loaded X route status records"
```

---

## 📊 **Data Format:**

### **Expected API Response:**

```json
[
  {
    "id": 1,
    "region": "North",
    "route_name": "Route-A-B",
    "status": "UP",
    "last_updated": "2024-01-30 10:00:00"
  },
  {
    "id": 2,
    "region": "South",
    "route_name": "Route-C-D",
    "status": "DOWN",
    "last_updated": "2024-01-30 10:00:00"
  }
]
```

### **Required Fields:**

```
✅ id (number)
✅ region (string)
✅ route_name (string)
✅ status (string: "UP" or "DOWN")
✅ last_updated (string: timestamp)
```

---

## 🔍 **Logs - Kya Dekhna Hai:**

### **Success Logs:**

```bash
# Server console:
🔄 Fetching OTN route status from: http://...
✅ Successfully fetched 10 route status records

# Browser console:
🔄 Fetching OTN route status from: /api/otn-route-status
✅ Successfully loaded 10 route status records
```

### **Error Logs:**

```bash
# Configuration error:
❌ OTN_ROUTE_STATUS environment variable is not set
💡 Add OTN_ROUTE_STATUS=http://your-api-url to .env.local

# Network error:
❌ External API error (503):
🌐 Network error: Unable to connect to external API

# Timeout error:
❌ Error in OTN route status API:
⏱️  Request timed out after 30 seconds
```

---

## 💡 **Tips:**

### **Performance:**

```
1. Cache time: 5 minutes
   - Reduces API calls
   - Faster page loads

2. Auto-refresh: 1 minute
   - Real-time updates
   - No manual refresh needed

3. Retry: 3 attempts
   - Handles temporary failures
   - Exponential backoff
```

### **Development:**

```
1. Check logs in console
   - Server logs: Terminal
   - Client logs: Browser console

2. Use development mode
   - Shows detailed errors
   - Includes API URLs

3. Test API separately
   - curl http://localhost:3000/api/otn-route-status
   - Verify response format
```

---

## 📚 **Complete Documentation:**

```
File: Documentation/OTN_ROUTE_STATUS_COMPLETE_GUIDE_HINDI.md

Includes:
✅ Architecture diagram
✅ Line-by-line code explanation
✅ Flow diagrams
✅ Error handling
✅ Best practices
```

---

## ✅ **Checklist:**

```
Setup:
☐ Pull latest code
☐ Add OTN_ROUTE_STATUS to .env.local
☐ Restart server

Testing:
☐ Test API route (curl)
☐ Open page in browser
☐ Check console logs
☐ Wait 1 minute (auto-refresh)
☐ Test search/filter
☐ Test export

Verify:
☐ No errors in console
☐ Data displays correctly
☐ Auto-refresh works
☐ Search works
☐ Export works
```

---

## 🎉 **Summary:**

### **What You Get:**

```
✅ Complete API route
✅ React Query hook
✅ Auto-refresh (1 min)
✅ Caching (5 min)
✅ Error handling
✅ Retry logic
✅ Complete documentation
```

### **What You Need:**

```
1. External API URL
2. Add to .env.local
3. Restart server
4. Done!
```

---

**🚀 Ab Setup Karo!**

```bash
# Quick commands:
git pull origin main
echo "OTN_ROUTE_STATUS=http://your-api-url" >> .env.local
npm run dev
```

**Test Karo:**

```
http://localhost:3000/otnroutestatus
```

**Perfect! 🎊**

---

## 📞 **Help:**

Agar koi problem aaye:

1. Check logs (console + terminal)
2. Verify .env.local
3. Test API separately
4. Read complete documentation
5. Check error messages

**Happy Coding! 🚀**
