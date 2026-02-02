# 🚀 Complete Setup Guide - CNTX Portal

## 📋 **Table of Contents**

1. [Prerequisites](#prerequisites)
2. [Database Setup](#database-setup)
3. [Backend Setup](#backend-setup)
4. [Frontend Setup](#frontend-setup)
5. [Configuration](#configuration)
6. [Running the Application](#running-the-application)
7. [Testing](#testing)
8. [Deployment](#deployment)

---

## 🔧 **Prerequisites**

### **Required Software:**

```bash
✅ Node.js 18+ (https://nodejs.org/)
✅ PostgreSQL 14+ (https://www.postgresql.org/)
✅ Python 3.11+ (https://www.python.org/)
✅ Git (https://git-scm.com/)
```

### **Check Versions:**

```bash
node --version    # Should be v18 or higher
npm --version     # Should be v9 or higher
python --version  # Should be 3.11 or higher
psql --version    # Should be 14 or higher
git --version     # Any recent version
```

---

## 💾 **Database Setup**

### **Step 1: Install PostgreSQL**

```bash
# Windows
# Download from: https://www.postgresql.org/download/windows/

# Linux (Ubuntu/Debian)
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib

# Mac
brew install postgresql
```

### **Step 2: Create Database**

```bash
# Login to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE cntx_portal;

# Exit
\q
```

### **Step 3: Run Schema Files**

```bash
# Navigate to project directory
cd cntx_portal

# Run base schema
psql -U postgres -d cntx_portal -f python-backend/database/schema_multi_parameter.sql

# Run Tejas-specific schema
psql -U postgres -d cntx_portal -f python-backend/database/tejas_commands_schema.sql
```

### **Step 4: Add Your Routers**

```sql
-- Connect to database
psql -U postgres -d cntx_portal

-- Add router
INSERT INTO routers (hostname, ip_address, ssh_port, username, password, device_type, location) 
VALUES 
('YOUR-ROUTER-NAME', '10.125.x.x', 22, 'admin', 'your_password', 'tejas', 'Your Location');

-- Add interfaces
INSERT INTO router_interfaces (router_id, interface_name, interface_label, interface_type) 
SELECT id, '1/1/1', 'Interface Label', '100G'
FROM routers WHERE hostname = 'YOUR-ROUTER-NAME';

-- Verify
SELECT * FROM routers;
SELECT * FROM router_interfaces;

-- Exit
\q
```

---

## 🐍 **Backend Setup**

### **Step 1: Create Virtual Environment**

```bash
cd python-backend

# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Activate (Linux/Mac)
source venv/bin/activate
```

### **Step 2: Install Dependencies**

```bash
# Install required packages
pip install psycopg2-binary paramiko fastapi uvicorn python-dotenv

# Or use requirements.txt (if exists)
pip install -r requirements.txt

# Verify installation
pip list
```

### **Step 3: Configure Database Connection**

Edit `tejas_router_monitor.py`:

```python
DB_CONFIG = {
    'host': 'localhost',
    'port': 5432,
    'database': 'cntx_portal',
    'user': 'postgres',
    'password': 'YOUR_PASSWORD_HERE'  # Change this!
}
```

### **Step 4: Test Python Script**

```bash
# Run monitoring script
python tejas_router_monitor.py

# Expected output:
# 🚀 Starting Tejas Router Monitoring
# ✅ Database connected successfully
# 📊 Found X Tejas routers
# 🔄 Connecting to router...
# ✅ Completed monitoring
```

---

## ⚛️ **Frontend Setup**

### **Step 1: Install Node Dependencies**

```bash
# Navigate to project root
cd cntx_portal

# Install dependencies
npm install

# This will install:
# - Next.js
# - React
# - React Query (@tanstack/react-query)
# - Tailwind CSS
# - PostgreSQL client (pg)
# - And all other dependencies
```

### **Step 2: Configure Environment Variables**

```bash
# Copy example env file
cp .env.example .env.local

# Edit .env.local
nano .env.local  # or use any text editor
```

Add these values:

```bash
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=cntx_portal
DB_USER=postgres
DB_PASSWORD=your_actual_password

# Next.js Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### **Step 3: Verify Installation**

```bash
# Check if all dependencies are installed
npm list --depth=0

# Should show:
# - next
# - react
# - @tanstack/react-query
# - pg
# - tailwindcss
# etc.
```

---

## ⚙️ **Configuration**

### **Database Connection Pool**

Edit `app/api/tejas/*/route.js` files if needed:

```javascript
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'cntx_portal',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  max: 20, // Maximum pool size
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

### **React Query Configuration**

Already configured in `app/hooks/useTejasMonitoring.js`:

```javascript
// Auto-refresh intervals
Routers:        60 seconds
OSPF:           30 seconds
BGP:            30 seconds
SFP Info:       15 seconds
SFP Stats:      15 seconds
```

---

## 🏃 **Running the Application**

### **Method 1: Development Mode**

```bash
# Terminal 1: Start Next.js
cd cntx_portal
npm run dev

# Output:
# ▲ Next.js 14.0.0
# - Local:        http://localhost:3000
# - Ready in 2.5s

# Terminal 2: Run Python monitoring (optional, for testing)
cd python-backend
source venv/bin/activate  # or venv\Scripts\activate on Windows
python tejas_router_monitor.py
```

### **Method 2: Production Mode**

```bash
# Build Next.js
npm run build

# Start production server
npm start

# Output:
# ▲ Next.js 14.0.0
# - Local:        http://localhost:3000
```

### **Method 3: Scheduled Monitoring**

**Windows Task Scheduler:**

```batch
# Create: run_monitoring.bat
@echo off
cd C:\path\to\cntx_portal\python-backend
call venv\Scripts\activate
python tejas_router_monitor.py >> logs\monitor_%date:~-4,4%%date:~-10,2%%date:~-7,2%.log 2>&1
```

Schedule to run every 5 minutes.

**Linux Cron:**

```bash
# Edit crontab
crontab -e

# Add line (run every 5 minutes)
*/5 * * * * cd /path/to/cntx_portal/python-backend && source venv/bin/activate && python tejas_router_monitor.py >> /var/log/tejas_monitor.log 2>&1
```

---

## 🧪 **Testing**

### **Test 1: Database Connection**

```bash
psql -U postgres -d cntx_portal -c "SELECT COUNT(*) FROM routers;"
```

### **Test 2: Python Script**

```bash
cd python-backend
python tejas_router_monitor.py
```

### **Test 3: API Routes**

```bash
# Test routers endpoint
curl http://localhost:3000/api/tejas/routers

# Test OSPF endpoint
curl http://localhost:3000/api/tejas/ospf-neighbors

# Test BGP endpoint
curl http://localhost:3000/api/tejas/bgp-summary

# Test SFP endpoint
curl http://localhost:3000/api/tejas/sfp-info
```

### **Test 4: Frontend**

```
1. Open browser: http://localhost:3000/tejas-monitoring
2. Select a router from dropdown
3. Verify OSPF, BGP, and SFP data loads
4. Check auto-refresh (watch timestamps)
```

---

## 🚀 **Deployment**

### **Option 1: Vercel (Recommended for Next.js)**

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Follow prompts
# Add environment variables in Vercel dashboard
```

### **Option 2: Docker**

```dockerfile
# Dockerfile (create this)
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

```bash
# Build and run
docker build -t cntx-portal .
docker run -p 3000:3000 cntx-portal
```

### **Option 3: Traditional Server**

```bash
# On server
git clone <your-repo>
cd cntx_portal

# Setup
npm install
npm run build

# Use PM2 for process management
npm install -g pm2
pm2 start npm --name "cntx-portal" -- start
pm2 save
pm2 startup
```

---

## 📊 **Monitoring & Logs**

### **Application Logs:**

```bash
# Next.js logs
tail -f .next/server/app-paths-manifest.json

# Python logs
tail -f python-backend/logs/tejas_monitor_*.log

# Database logs (PostgreSQL)
tail -f /var/log/postgresql/postgresql-14-main.log
```

### **Health Checks:**

```bash
# Check if Next.js is running
curl http://localhost:3000/api/health

# Check database connection
psql -U postgres -d cntx_portal -c "SELECT 1;"

# Check Python script
python -c "from tejas_router_monitor import DatabaseManager; print('OK')"
```

---

## 🔒 **Security Checklist**

```
✅ Change default database password
✅ Use environment variables (never commit .env)
✅ Enable SSL for PostgreSQL in production
✅ Use HTTPS for Next.js in production
✅ Encrypt router passwords in database
✅ Set up firewall rules
✅ Regular security updates
✅ Backup database regularly
```

---

## 🆘 **Troubleshooting**

### **Problem: Database connection failed**

```bash
# Check PostgreSQL is running
sudo systemctl status postgresql  # Linux
# or
pg_ctl status  # Windows

# Check connection
psql -U postgres -d cntx_portal

# Check credentials in .env.local
```

### **Problem: Python script fails**

```bash
# Check virtual environment
which python  # Should point to venv

# Reinstall dependencies
pip install --force-reinstall psycopg2-binary paramiko

# Check database connection
python -c "import psycopg2; print('OK')"
```

### **Problem: Next.js won't start**

```bash
# Clear cache
rm -rf .next
npm run build

# Check port 3000 is free
lsof -i :3000  # Linux/Mac
netstat -ano | findstr :3000  # Windows

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### **Problem: API returns no data**

```bash
# Check database has data
psql -U postgres -d cntx_portal -c "SELECT * FROM v_tejas_ospf_neighbors;"

# Run Python script to populate data
python tejas_router_monitor.py

# Check API route
curl http://localhost:3000/api/tejas/routers
```

---

## ✅ **Quick Start Checklist**

```
□ PostgreSQL installed and running
□ Database created (cntx_portal)
□ Schema files executed
□ Routers added to database
□ Python virtual environment created
□ Python dependencies installed
□ Node.js dependencies installed
□ Environment variables configured
□ Python script tested
□ Next.js running (npm run dev)
□ Browser opened (http://localhost:3000/tejas-monitoring)
□ Data visible in UI
```

---

## 📞 **Support**

**Documentation:**
- Complete Code Explanation: `Documentation/COMPLETE_CODE_EXPLANATION_HINDI.md`
- Visual Diagrams: `Documentation/VISUAL_FLOW_DIAGRAM.md`
- Multi-Parameter Guide: `Documentation/MULTI_PARAMETER_MONITORING_GUIDE.md`

**Common Issues:**
- Check logs in `python-backend/logs/`
- Verify database connection
- Ensure all environment variables are set
- Check firewall/network settings

---

**🎉 Setup Complete! Your CNTX Portal is ready!** 🚀

**Access the application:**
- Main Portal: http://localhost:3000
- Tejas Monitoring: http://localhost:3000/tejas-monitoring
- Router Access: http://localhost:3000/router-access

**Happy Monitoring! 📊**
