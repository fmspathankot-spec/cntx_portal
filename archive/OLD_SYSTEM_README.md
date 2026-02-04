# Old Monitoring System - Archive

**Date Archived:** 2026-02-04  
**Reason:** Replaced with live fetch system (on-demand SSH)

---

## 📋 Old Architecture (Python Script + Database Storage)

### **How It Worked:**

```
Python Script (tejas_router_monitor_v2_fixed.py)
    ↓
Every X minutes:
  - SSH to router
  - Fetch OSPF neighbors
  - Fetch BGP summary
  - Fetch SFP info/stats
    ↓
Save to database:
  - monitoring_parameters table
  - parameter_readings table
    ↓
Frontend fetches from database
    ↓
Shows stored data (historical)
```

---

## 🗄️ Database Tables (Old System)

### **monitoring_parameters**
```sql
CREATE TABLE monitoring_parameters (
  id SERIAL PRIMARY KEY,
  router_id INTEGER REFERENCES routers(id),
  parameter_type VARCHAR(50),  -- 'ospf_neighbor', 'bgp_summary', 'sfp_info', 'sfp_stats'
  parameter_name VARCHAR(100),
  unit VARCHAR(20),
  threshold_min FLOAT,
  threshold_max FLOAT,
  is_active BOOLEAN DEFAULT true
);
```

### **parameter_readings**
```sql
CREATE TABLE parameter_readings (
  id SERIAL PRIMARY KEY,
  parameter_id INTEGER REFERENCES monitoring_parameters(id),
  value FLOAT,
  status VARCHAR(20),  -- 'normal', 'warning', 'critical'
  metadata JSONB,      -- Full OSPF/BGP/SFP data
  timestamp TIMESTAMP DEFAULT NOW()
);
```

---

## 🐍 Python Script

**File:** `python-backend/tejas_router_monitor_v2_fixed.py`

**Features:**
- ✅ SSH connection to routers
- ✅ Parse OSPF neighbors
- ✅ Parse BGP summary
- ✅ Parse SFP info/stats
- ✅ Save to database
- ✅ Run continuously in background

**Usage:**
```bash
cd python-backend
python tejas_router_monitor_v2_fixed.py
```

---

## 🌐 Old APIs

### **GET /api/tejas-monitoring/[routerId]**
Returns stored monitoring data from database

**Response:**
```json
{
  "success": true,
  "router": {...},
  "ospf": {
    "data": {
      "neighbor_count": 2,
      "neighbors": [...]
    }
  },
  "bgp": {...},
  "sfp_info": [...],
  "sfp_stats": [...]
}
```

### **Deleted APIs:**
- `/api/tejas/ospf-neighbors`
- `/api/tejas/bgp-summary`
- `/api/tejas/sfp-info`
- `/api/tejas/sfp-stats`

---

## ✅ Advantages (Old System)

1. **Historical Data** - Can see trends over time
2. **Fast Loading** - Data from database (no SSH delay)
3. **Auto-refresh** - Frontend updates automatically
4. **Offline Access** - Works even if router is down

---

## ❌ Disadvantages (Old System)

1. **Stale Data** - Not real-time (depends on script interval)
2. **Extra Complexity** - Python script + database storage
3. **Storage Overhead** - Database grows over time
4. **Maintenance** - Need to keep Python script running

---

## 🔄 New System (Live Fetch)

### **Why Changed:**

User wanted:
- ✅ On-demand data only (no storage)
- ✅ Real-time fresh data
- ✅ Simpler architecture
- ✅ No Python script dependency

### **New Architecture:**

```
User clicks "Fetch Live"
    ↓
API connects via SSH
    ↓
Executes command
    ↓
Parses output
    ↓
Returns JSON (NO database save)
    ↓
Shows in UI
```

---

## 📚 Reference Files (Archived)

### **Python Scripts:**
- `python-backend/tejas_router_monitor_v2_fixed.py` - Main monitoring script
- `python-backend/tejas_monitor_dry_run.py` - Test script with dummy data

### **Database Migrations:**
- `database/migrations/003_create_monitoring_tables.sql` - Old monitoring tables
- `database/migrations/004_add_monitoring_parameters.sql` - Parameters setup

### **API Routes (Deleted):**
- `app/api/tejas-monitoring/[routerId]/route.js`
- `app/api/tejas/ospf-neighbors/route.js`
- `app/api/tejas/bgp-summary/route.js`
- `app/api/tejas/sfp-info/route.js`
- `app/api/tejas/sfp-stats/route.js`

---

## 🔧 How to Restore (If Needed)

1. **Restore Database Tables:**
   ```bash
   psql -U postgres -d cntx_portal -f database/migrations/003_create_monitoring_tables.sql
   psql -U postgres -d cntx_portal -f database/migrations/004_add_monitoring_parameters.sql
   ```

2. **Run Python Script:**
   ```bash
   cd python-backend
   python tejas_router_monitor_v2_fixed.py
   ```

3. **Restore API Routes:**
   - Check git history for deleted files
   - Restore from commit before deletion

---

## 📊 Comparison

| Feature | Old System | New System |
|---------|-----------|------------|
| Data Source | Database | Live SSH |
| Speed | Fast | Slower (SSH) |
| Real-time | No | Yes |
| Historical | Yes | No |
| Storage | Required | Not required |
| Complexity | High | Low |
| Maintenance | Python script | None |

---

**Note:** This documentation is for reference only. The old system is no longer in use but preserved for learning and potential future restoration.
