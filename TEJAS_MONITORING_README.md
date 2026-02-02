# 🌐 Tejas Router Monitoring System

Complete real-time monitoring solution for Tejas routers with OSPF, BGP, and SFP monitoring.

---

## ✨ **Features**

```
✅ Real-time OSPF neighbor monitoring
✅ BGP session tracking
✅ SFP power level monitoring (all 4 lanes)
✅ Auto-refresh with React Query
✅ Beautiful, responsive UI
✅ Historical data tracking
✅ Database-driven configuration
✅ Flexible parameter system
```

---

## 🚀 **Quick Start**

### **1. Clone Repository**

```bash
git clone https://github.com/fmspathankot-spec/cntx_portal.git
cd cntx_portal
```

### **2. Setup Database**

```bash
# Create database
psql -U postgres -c "CREATE DATABASE cntx_portal"

# Run schemas
psql -U postgres -d cntx_portal -f python-backend/database/schema_multi_parameter.sql
psql -U postgres -d cntx_portal -f python-backend/database/tejas_commands_schema.sql
```

### **3. Add Your Router**

```sql
psql -U postgres -d cntx_portal

INSERT INTO routers (hostname, ip_address, username, password, device_type) 
VALUES ('YOUR-ROUTER', '10.125.x.x', 'admin', 'password', 'tejas');

INSERT INTO router_interfaces (router_id, interface_name, interface_label) 
SELECT id, '1/1/1', 'Interface 1/1/1' FROM routers WHERE hostname = 'YOUR-ROUTER';
```

### **4. Install Dependencies**

```bash
# Frontend
npm install

# Backend
cd python-backend
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install psycopg2-binary paramiko
```

### **5. Configure Environment**

```bash
# Copy example
cp .env.example .env.local

# Edit .env.local
DB_HOST=localhost
DB_PASSWORD=your_password
```

### **6. Run Application**

```bash
# Start Next.js
npm run dev

# In another terminal, run monitoring
cd python-backend
python tejas_router_monitor.py
```

### **7. Access UI**

```
Open: http://localhost:3000/tejas-monitoring
```

---

## 📊 **What Gets Monitored**

### **OSPF Neighbors**
```
✅ Neighbor ID
✅ State (FULL/PTOP, etc.)
✅ Interface
✅ BFD Status
✅ Area ID
✅ Dead Time
```

### **BGP Summary**
```
✅ Router ID
✅ Local AS
✅ Established Sessions
✅ Configured Sessions
✅ Forwarding State
```

### **SFP 100G**
```
✅ RX Power (per lane + average)
✅ TX Power (per lane + average)
✅ Temperature
✅ Voltage
✅ Laser Type
✅ Operational Status
✅ Vendor Information
```

---

## 🏗️ **Architecture**

```
┌─────────────────────────────────────────┐
│  Next.js Frontend (React + React Query) │
│  - Auto-refresh every 15-60 seconds     │
│  - Beautiful UI with Tailwind CSS       │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│  Next.js API Routes                     │
│  - /api/tejas/routers                   │
│  - /api/tejas/ospf-neighbors            │
│  - /api/tejas/bgp-summary               │
│  - /api/tejas/sfp-info                  │
│  - /api/tejas/sfp-stats                 │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│  PostgreSQL Database                    │
│  - Flexible schema                      │
│  - JSON storage for readings            │
│  - Historical data                      │
└─────────────────────────────────────────┘
                    ↑
┌─────────────────────────────────────────┐
│  Python Monitoring Script               │
│  - SSH to routers                       │
│  - Execute commands                     │
│  - Parse output                         │
│  - Save to database                     │
└─────────────────────────────────────────┘
```

---

## 📁 **Project Structure**

```
cntx_portal/
│
├── app/
│   ├── hooks/
│   │   └── useTejasMonitoring.js          # React Query hooks
│   ├── api/tejas/                          # API routes
│   │   ├── routers/route.js
│   │   ├── ospf-neighbors/route.js
│   │   ├── bgp-summary/route.js
│   │   ├── sfp-info/route.js
│   │   └── sfp-stats/route.js
│   └── tejas-monitoring/                   # UI components
│       ├── page.js
│       ├── TejasMonitoringDashboard.js
│       └── components/
│           ├── RouterSelector.js
│           ├── OSPFNeighborsCard.js
│           ├── BGPSummaryCard.js
│           ├── SFPMonitoringCard.js
│           ├── LoadingSpinner.js
│           └── ErrorAlert.js
│
├── python-backend/
│   ├── database/
│   │   ├── schema_multi_parameter.sql      # Base schema
│   │   └── tejas_commands_schema.sql       # Tejas-specific
│   ├── tejas_router_monitor.py             # Monitoring script
│   └── router_multi_parameter_monitor.py   # Generic script
│
└── Documentation/
    ├── COMPLETE_SETUP_GUIDE.md
    ├── MULTI_PARAMETER_MONITORING_GUIDE.md
    └── SFP_MONITORING_SETUP.md
```

---

## 🔄 **Auto-Refresh Intervals**

```
Routers List:     60 seconds
OSPF Neighbors:   30 seconds
BGP Summary:      30 seconds
SFP Info:         15 seconds
SFP Stats:        15 seconds
```

---

## 🎨 **UI Screenshots**

### **Dashboard**
- Router selector with stats
- OSPF neighbors card
- BGP summary card
- SFP monitoring with 4-lane display

### **Features**
- Real-time updates
- Loading states
- Error handling
- Responsive design
- Dark mode ready

---

## 📋 **Monitored Commands**

```bash
# OSPF
sh ip ospf ne

# BGP
sh ip bgp summary sorted

# SFP Info
sh sfp 100g {interface}

# SFP Stats
sh sfp stats 100g {interface}
```

---

## 🔧 **Adding New Parameters**

### **Step 1: Add to Database**

```sql
INSERT INTO monitoring_parameters 
(parameter_name, parameter_category, command_template, applies_to) 
VALUES 
('NEW_PARAMETER', 'CATEGORY', 'command {interface}', 'INTERFACE');
```

### **Step 2: Add Parsers**

```sql
INSERT INTO parameter_parsers 
(parameter_id, field_name, regex_pattern, data_type, unit) 
VALUES 
(X, 'field_name', 'regex_pattern', 'number', 'unit');
```

### **Step 3: Run Monitoring**

```bash
python tejas_router_monitor.py
```

Data automatically appears in UI!

---

## 📊 **Database Views**

```sql
-- Latest OSPF neighbors
SELECT * FROM v_tejas_ospf_neighbors;

-- Latest BGP summary
SELECT * FROM v_tejas_bgp_summary;

-- Latest SFP info
SELECT * FROM v_tejas_sfp_100g_info;

-- Latest SFP stats
SELECT * FROM v_tejas_sfp_100g_stats;
```

---

## 🚀 **Deployment**

### **Production Checklist**

```
✅ Change database password
✅ Set environment variables
✅ Enable SSL for database
✅ Use HTTPS for Next.js
✅ Schedule monitoring script
✅ Setup logging
✅ Configure backups
✅ Monitor performance
```

### **Scheduled Monitoring**

```bash
# Linux Cron (every 5 minutes)
*/5 * * * * cd /path/to/python-backend && python tejas_router_monitor.py

# Windows Task Scheduler
# Create task to run every 5 minutes
```

---

## 🆘 **Troubleshooting**

### **No data showing?**

```bash
# 1. Check database has data
psql -U postgres -d cntx_portal -c "SELECT * FROM routers;"

# 2. Run monitoring script
python tejas_router_monitor.py

# 3. Check API
curl http://localhost:3000/api/tejas/routers
```

### **Connection errors?**

```bash
# Check environment variables
cat .env.local

# Test database connection
psql -U postgres -d cntx_portal

# Check router SSH access
ssh admin@10.125.x.x
```

---

## 📚 **Documentation**

- **Setup Guide**: `Documentation/COMPLETE_SETUP_GUIDE.md`
- **Multi-Parameter Guide**: `Documentation/MULTI_PARAMETER_MONITORING_GUIDE.md`
- **Code Explanation**: `Documentation/COMPLETE_CODE_EXPLANATION_HINDI.md`
- **Visual Diagrams**: `Documentation/VISUAL_FLOW_DIAGRAM.md`

---

## 🎯 **Key Technologies**

```
Frontend:
- Next.js 14
- React 18
- React Query (TanStack Query)
- Tailwind CSS

Backend:
- Python 3.11+
- Paramiko (SSH)
- PostgreSQL
- FastAPI (optional)

Database:
- PostgreSQL 14+
- JSONB for flexible storage
- Views for easy querying
```

---

## 🎉 **Features Highlights**

```
✅ Zero hardcoding - all config in database
✅ Easy to add new parameters (2 SQL queries)
✅ Real-time auto-refresh
✅ Historical data tracking
✅ Beautiful, modern UI
✅ Production-ready
✅ Fully documented
✅ Easy to deploy
```

---

## 📞 **Support**

For issues or questions:
1. Check `Documentation/COMPLETE_SETUP_GUIDE.md`
2. Review troubleshooting section
3. Check database logs
4. Verify environment variables

---

**🎊 Happy Monitoring!** 🚀

**Built with ❤️ for network monitoring**
