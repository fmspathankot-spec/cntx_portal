# 📡 SFP Monitoring Setup Guide - PostgreSQL Integration

## 🎯 **Overview**

Aapka existing hardcoded script ab PostgreSQL database se routers aur interfaces fetch karega.

---

## 🔄 **Changes Summary**

### **Before (Hardcoded):**
```python
routers = [
    {'host': '10.125.xx.xx', 'hostname':'PKT-TX-C1', ...},
    {'host': '10.125.xxx.xxx', 'hostname':'JGL-CNN-B4', ...}
]

interface_labels = {
    '10.125.xx.xxx:1/4/5': 'PKT-KATHUA',
    ...
}
```

### **After (Database-driven):**
```python
# Routers automatically fetched from database
routers = db_manager.get_routers()

# Interfaces automatically fetched for each router
interfaces = db_manager.get_router_interfaces(router_id)

# Readings automatically saved to database
db_manager.save_sfp_reading(...)
```

---

## 🛠️ **Setup Steps**

### **Step 1: Install PostgreSQL (if not installed)**

```bash
# Windows:
# Download from: https://www.postgresql.org/download/windows/
# Install and remember password

# Linux:
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib

# Mac:
brew install postgresql
```

---

### **Step 2: Create Database**

```bash
# Login to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE cntx_portal;

# Connect to database
\c cntx_portal

# Exit
\q
```

---

### **Step 3: Run Database Schema**

```bash
# Method 1: Using psql
psql -U postgres -d cntx_portal -f python-backend/database/schema.sql

# Method 2: Copy-paste in pgAdmin
# Open pgAdmin → cntx_portal → Query Tool
# Copy schema.sql content and execute
```

---

### **Step 4: Install Python Dependencies**

```bash
cd python-backend

# Activate virtual environment
source venv/bin/activate  # Linux/Mac
# or
venv\Scripts\activate  # Windows

# Install dependencies
pip install psycopg2-binary paramiko

# Or add to requirements.txt
echo "psycopg2-binary==2.9.9" >> requirements.txt
echo "paramiko==3.4.0" >> requirements.txt
pip install -r requirements.txt
```

---

### **Step 5: Configure Database Connection**

Edit `router_sfp_monitor.py`:

```python
# Database configuration
DB_CONFIG = {
    'host': 'localhost',      # Your PostgreSQL host
    'port': 5432,             # PostgreSQL port
    'database': 'cntx_portal', # Database name
    'user': 'postgres',       # Your username
    'password': 'your_password'  # Your password
}
```

---

### **Step 6: Add Your Routers to Database**

```sql
-- Method 1: Using SQL
INSERT INTO routers (hostname, ip_address, ssh_port, username, password, device_type, location) 
VALUES 
('PKT-TX-C1', '10.125.xx.xx', 22, 'your_username', 'your_password', 'huawei', 'Pathankot'),
('JGL-CNN-B4', '10.125.xxx.xxx', 22, 'your_username', 'your_password', 'huawei', 'Jugial');

-- Add interfaces for PKT-TX-C1 (router_id = 1)
INSERT INTO router_interfaces (router_id, interface_name, interface_label, sfp_command) 
VALUES 
(1, '1/4/5', 'PKT-KATHUA', 'show sfp 100g'),
(1, '1/5/11', 'PKT-JUGIAL', 'show sfp 100g');

-- Add interfaces for JGL-CNN-B4 (router_id = 2)
INSERT INTO router_interfaces (router_id, interface_name, interface_label, sfp_command) 
VALUES 
(2, '1/1/1', 'JUGIAL-PKT', 'show sfp 100g'),
(2, '1/1/2', 'JUGIAL-MAHANPUR', 'show sfp 100g');
```

---

### **Step 7: Run the Script**

```bash
cd python-backend
python router_sfp_monitor.py

# Output:
# 🚀 Starting SFP Monitoring System
# ✅ Database connected successfully
# 📊 Fetched 2 active routers from database
# 🔄 Connecting to PKT-TX-C1 (10.125.xx.xx)...
#   📡 Checking PKT-KATHUA (1/4/5)...
#   📡 Checking PKT-JUGIAL (1/5/11)...
# ✅ Completed monitoring PKT-TX-C1
# ...
# ✅ Monitoring completed successfully
```

---

## 📊 **Database Schema**

### **Table 1: routers**
```sql
id              SERIAL PRIMARY KEY
hostname        VARCHAR(100)      -- Router name
ip_address      VARCHAR(50)       -- Router IP
ssh_port        INTEGER           -- SSH port (default 22)
username        VARCHAR(50)       -- SSH username
password        VARCHAR(255)      -- SSH password
device_type     VARCHAR(50)       -- cisco_ios, huawei, etc.
location        VARCHAR(100)      -- Physical location
description     TEXT              -- Description
is_active       BOOLEAN           -- Active/Inactive
created_at      TIMESTAMP
updated_at      TIMESTAMP
```

### **Table 2: router_interfaces**
```sql
id              SERIAL PRIMARY KEY
router_id       INTEGER           -- Foreign key to routers
interface_name  VARCHAR(50)       -- e.g., '1/5/11'
interface_label VARCHAR(100)      -- e.g., 'PKT-KATHUA'
sfp_command     VARCHAR(100)      -- Command to check SFP
is_monitored    BOOLEAN           -- Monitor this interface?
created_at      TIMESTAMP
updated_at      TIMESTAMP
```

### **Table 3: sfp_readings**
```sql
id              SERIAL PRIMARY KEY
router_id       INTEGER           -- Foreign key to routers
interface_id    INTEGER           -- Foreign key to router_interfaces
rx_power        VARCHAR(20)       -- RxPower in dBm
tx_power        VARCHAR(20)       -- TxPower in dBm
laser_type      VARCHAR(100)      -- Laser type
reading_time    TIMESTAMP         -- When reading was taken
created_at      TIMESTAMP
```

---

## 🔍 **Useful Database Queries**

### **1. View All Routers**
```sql
SELECT * FROM routers WHERE is_active = true;
```

### **2. View All Interfaces**
```sql
SELECT 
    r.hostname,
    ri.interface_name,
    ri.interface_label,
    ri.is_monitored
FROM router_interfaces ri
JOIN routers r ON ri.router_id = r.id
ORDER BY r.hostname, ri.interface_name;
```

### **3. View Latest SFP Readings**
```sql
SELECT * FROM v_latest_sfp_readings;
```

### **4. View Reading History for Specific Interface**
```sql
SELECT 
    r.hostname,
    ri.interface_label,
    sr.rx_power,
    sr.tx_power,
    sr.reading_time
FROM sfp_readings sr
JOIN router_interfaces ri ON sr.interface_id = ri.id
JOIN routers r ON sr.router_id = r.id
WHERE ri.interface_label = 'PKT-KATHUA'
ORDER BY sr.reading_time DESC
LIMIT 100;
```

### **5. View Router Summary**
```sql
SELECT * FROM v_router_summary;
```

---

## 🎨 **Web Interface Integration**

### **Next.js API Route**

Create `app/api/sfp-readings/route.js`:

```javascript
import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'cntx_portal',
  user: 'postgres',
  password: 'your_password',
});

export async function GET(request) {
  try {
    const result = await pool.query(`
      SELECT * FROM v_latest_sfp_readings
      ORDER BY hostname, interface_name
    `);
    
    return NextResponse.json(result.rows);
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
```

### **Frontend Page**

Create `app/sfp-monitoring/page.js`:

```javascript
"use client";

import { useState, useEffect } from 'react';

export default function SFPMonitoring() {
  const [readings, setReadings] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchReadings();
    const interval = setInterval(fetchReadings, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);
  
  const fetchReadings = async () => {
    try {
      const res = await fetch('/api/sfp-readings');
      const data = await res.json();
      setReadings(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching readings:', error);
      setLoading(false);
    }
  };
  
  if (loading) return <div>Loading...</div>;
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">SFP Monitoring</h1>
      
      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th>Router</th>
            <th>Interface</th>
            <th>Label</th>
            <th>RxPower</th>
            <th>TxPower</th>
            <th>Laser Type</th>
            <th>Last Reading</th>
          </tr>
        </thead>
        <tbody>
          {readings.map((reading, index) => (
            <tr key={index}>
              <td>{reading.hostname}</td>
              <td>{reading.interface_name}</td>
              <td>{reading.interface_label}</td>
              <td>{reading.rx_power} dBm</td>
              <td>{reading.tx_power} dBm</td>
              <td>{reading.laser_type}</td>
              <td>{new Date(reading.reading_time).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

---

## 🔒 **Security Best Practices**

### **1. Encrypt Passwords**

```python
from cryptography.fernet import Fernet

# Generate key (do once, store securely)
key = Fernet.generate_key()
cipher = Fernet(key)

# Encrypt password before storing
encrypted_password = cipher.encrypt(password.encode())

# Decrypt when needed
decrypted_password = cipher.decrypt(encrypted_password).decode()
```

### **2. Use Environment Variables**

```python
import os
from dotenv import load_dotenv

load_dotenv()

DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'port': int(os.getenv('DB_PORT', 5432)),
    'database': os.getenv('DB_NAME', 'cntx_portal'),
    'user': os.getenv('DB_USER', 'postgres'),
    'password': os.getenv('DB_PASSWORD'),
}
```

Create `.env` file:
```bash
DB_HOST=localhost
DB_PORT=5432
DB_NAME=cntx_portal
DB_USER=postgres
DB_PASSWORD=your_secure_password
```

---

## 📈 **Scheduled Monitoring**

### **Windows Task Scheduler**

```batch
# Create batch file: run_sfp_monitor.bat
@echo off
cd C:\path\to\python-backend
call venv\Scripts\activate
python router_sfp_monitor.py
```

Schedule in Task Scheduler:
- Trigger: Every 5 minutes
- Action: Run `run_sfp_monitor.bat`

### **Linux Cron**

```bash
# Edit crontab
crontab -e

# Add line (run every 5 minutes)
*/5 * * * * cd /path/to/python-backend && source venv/bin/activate && python router_sfp_monitor.py >> /var/log/sfp_monitor.log 2>&1
```

---

## 🎯 **Migration from Hardcoded to Database**

### **Step-by-Step:**

```python
# 1. Your existing routers list
routers = [
    {'host': '10.125.xx.xx', 'hostname':'PKT-TX-C1', ...},
]

# 2. Convert to SQL INSERT
for router in routers:
    print(f"""
    INSERT INTO routers (hostname, ip_address, ssh_port, username, password, device_type)
    VALUES ('{router['hostname']}', '{router['host']}', {router['port']}, 
            '{router['username']}', '{router['password']}', 'huawei');
    """)

# 3. Your existing interface_labels
interface_labels = {
    '10.125.xx.xxx:1/4/5': 'PKT-KATHUA',
}

# 4. Convert to SQL INSERT
for key, label in interface_labels.items():
    ip, interface = key.split(':')
    print(f"""
    INSERT INTO router_interfaces (router_id, interface_name, interface_label)
    SELECT id, '{interface}', '{label}'
    FROM routers WHERE ip_address = '{ip}';
    """)
```

---

## ✅ **Testing**

### **Test 1: Database Connection**
```bash
python -c "import psycopg2; conn = psycopg2.connect(host='localhost', database='cntx_portal', user='postgres', password='your_password'); print('✅ Connected')"
```

### **Test 2: Fetch Routers**
```bash
python -c "from router_sfp_monitor import DatabaseManager; db = DatabaseManager({'host':'localhost','database':'cntx_portal','user':'postgres','password':'your_password'}); db.connect(); print(db.get_routers())"
```

### **Test 3: Run Monitoring**
```bash
python router_sfp_monitor.py
```

---

## 🎉 **Summary**

```
✅ Database schema created
✅ Routers table with connection details
✅ Interfaces table with labels
✅ SFP readings table for history
✅ Python script reads from database
✅ Automatic saving of readings
✅ Web interface ready
✅ Scheduled monitoring setup
```

---

**Ab aapka script fully database-driven hai! 🚀**

**Koi problem ho to batao!** 💬
