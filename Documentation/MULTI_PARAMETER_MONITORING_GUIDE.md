# 📊 Multi-Parameter Monitoring - Complete Guide

## 🎯 **Overview**

Yeh system **kisi bhi router parameter** ko monitor kar sakta hai - fully configurable!

---

## ✨ **Features**

```
✅ SFP Power (RxPower, TxPower, Temperature, Voltage)
✅ CPU Usage (5sec, 1min, 5min)
✅ Memory Usage (Total, Used, Free, %)
✅ Temperature (Board, Inlet, Outlet)
✅ Fan Status
✅ Power Supply Status
✅ Active Alarms
✅ Interface Status
✅ Interface Traffic
✅ QoS Statistics
✅ ... aur koi bhi parameter jo aap chahein!
```

---

## 🏗️ **Architecture**

```
┌──────────────────────────────────────────────────────────┐
│  monitoring_parameters                                    │
│  - Defines WHAT to monitor                               │
│  - Command templates                                      │
│  - Applies to: INTERFACE / ROUTER / BOTH                 │
└──────────────────────────────────────────────────────────┘
                          ↓
┌──────────────────────────────────────────────────────────┐
│  parameter_parsers                                        │
│  - Regex patterns to extract values                      │
│  - Field names, data types, units                        │
└──────────────────────────────────────────────────────────┘
                          ↓
┌──────────────────────────────────────────────────────────┐
│  parameter_readings                                       │
│  - Stores all readings in JSON format                    │
│  - Flexible schema for any parameter                     │
└──────────────────────────────────────────────────────────┘
```

---

## 🚀 **Quick Setup**

### **Step 1: Create Database**

```bash
psql -U postgres
CREATE DATABASE cntx_portal;
\q
```

### **Step 2: Run Schema**

```bash
psql -U postgres -d cntx_portal -f python-backend/database/schema_multi_parameter.sql
```

### **Step 3: Configure Script**

Edit `router_multi_parameter_monitor.py`:

```python
DB_CONFIG = {
    'host': 'localhost',
    'database': 'cntx_portal',
    'user': 'postgres',
    'password': 'your_password'
}
```

### **Step 4: Run Monitoring**

```bash
cd python-backend
python router_multi_parameter_monitor.py
```

---

## 📊 **Database Schema**

### **Table 1: monitoring_parameters**

```sql
parameter_name       VARCHAR(100)  -- e.g., 'SFP_100G_POWER', 'CPU_USAGE'
parameter_category   VARCHAR(50)   -- 'OPTICAL', 'SYSTEM', 'INTERFACE', 'ALARM'
command_template     VARCHAR(500)  -- 'show sfp 100g {interface}'
applies_to           VARCHAR(50)   -- 'INTERFACE', 'ROUTER', 'BOTH'
```

**Example:**
```sql
INSERT INTO monitoring_parameters 
(parameter_name, parameter_category, command_template, applies_to) 
VALUES 
('SFP_100G_POWER', 'OPTICAL', 'show sfp 100g {interface}', 'INTERFACE'),
('CPU_USAGE', 'SYSTEM', 'display cpu-usage', 'ROUTER');
```

---

### **Table 2: parameter_parsers**

```sql
parameter_id    INTEGER       -- Foreign key to monitoring_parameters
field_name      VARCHAR(100)  -- e.g., 'rx_power', 'cpu_usage_5min'
regex_pattern   VARCHAR(500)  -- 'RxPower\s*:\s*([-\d.]+)'
data_type       VARCHAR(50)   -- 'string', 'number', 'boolean'
unit            VARCHAR(20)   -- 'dBm', 'C', '%', 'Mbps'
```

**Example:**
```sql
INSERT INTO parameter_parsers 
(parameter_id, field_name, regex_pattern, data_type, unit) 
VALUES 
(1, 'rx_power', 'RxPower\s*:\s*([-\d.]+)', 'number', 'dBm'),
(1, 'tx_power', 'TxPower\s*:\s*([-\d.]+)', 'number', 'dBm');
```

---

### **Table 3: parameter_readings**

```sql
router_id       INTEGER   -- Foreign key to routers
interface_id    INTEGER   -- Foreign key to router_interfaces (NULL for router-level)
parameter_id    INTEGER   -- Foreign key to monitoring_parameters
reading_data    JSONB     -- Flexible JSON storage
raw_output      TEXT      -- Original command output
reading_time    TIMESTAMP
```

**Example Data:**
```json
{
  "rx_power": "-5.2",
  "tx_power": "2.1",
  "laser_type": "1310nm DFB",
  "temperature": "45.5",
  "voltage": "3.3",
  "bias_current": "35.2"
}
```

---

## 🎨 **Adding New Parameters**

### **Example 1: Add BGP Neighbor Monitoring**

```sql
-- Step 1: Add parameter
INSERT INTO monitoring_parameters 
(parameter_name, parameter_category, description, command_template, applies_to) 
VALUES 
('BGP_NEIGHBORS', 'ROUTING', 'BGP Neighbor Status', 'display bgp peer', 'ROUTER');

-- Step 2: Add parsers
INSERT INTO parameter_parsers 
(parameter_id, field_name, regex_pattern, data_type, unit) 
VALUES 
(11, 'total_peers', 'Total number of peers:\s*(\d+)', 'number', ''),
(11, 'established_peers', 'Peers in established state:\s*(\d+)', 'number', ''),
(11, 'active_peers', 'Peers in active state:\s*(\d+)', 'number', '');
```

---

### **Example 2: Add OSPF Neighbor Monitoring**

```sql
-- Step 1: Add parameter
INSERT INTO monitoring_parameters 
(parameter_name, parameter_category, description, command_template, applies_to) 
VALUES 
('OSPF_NEIGHBORS', 'ROUTING', 'OSPF Neighbor Status', 'display ospf peer brief', 'ROUTER');

-- Step 2: Add parsers
INSERT INTO parameter_parsers 
(parameter_id, field_name, regex_pattern, data_type, unit) 
VALUES 
(12, 'total_neighbors', 'Total number of neighbors:\s*(\d+)', 'number', ''),
(12, 'full_neighbors', 'Neighbors in Full state:\s*(\d+)', 'number', '');
```

---

### **Example 3: Add Interface Error Monitoring**

```sql
-- Step 1: Add parameter
INSERT INTO monitoring_parameters 
(parameter_name, parameter_category, description, command_template, applies_to) 
VALUES 
('INTERFACE_ERRORS', 'INTERFACE', 'Interface Error Counters', 
 'display interface {interface} | include error', 'INTERFACE');

-- Step 2: Add parsers
INSERT INTO parameter_parsers 
(parameter_id, field_name, regex_pattern, data_type, unit) 
VALUES 
(13, 'input_errors', 'Input errors:\s*(\d+)', 'number', ''),
(13, 'output_errors', 'Output errors:\s*(\d+)', 'number', ''),
(13, 'crc_errors', 'CRC errors:\s*(\d+)', 'number', '');
```

---

## 📋 **Pre-configured Parameters**

### **OPTICAL Category:**
```
✅ SFP_100G_POWER - 100G SFP power levels
✅ SFP_10G_POWER - 10G SFP power levels
✅ OPTICAL_MODULE_INFO - Module information
```

### **SYSTEM Category:**
```
✅ CPU_USAGE - CPU usage statistics
✅ MEMORY_USAGE - Memory usage statistics
✅ TEMPERATURE - System temperature
✅ FAN_STATUS - Fan status
✅ POWER_SUPPLY - Power supply status
```

### **INTERFACE Category:**
```
✅ INTERFACE_STATUS - Interface status and statistics
✅ INTERFACE_BRIEF - Brief interface status
✅ INTERFACE_ERRORS - Error counters
```

### **ALARM Category:**
```
✅ ACTIVE_ALARMS - Active alarms
✅ ALARM_HISTORY - Alarm history
```

### **PERFORMANCE Category:**
```
✅ INTERFACE_TRAFFIC - Traffic statistics
✅ QOS_STATISTICS - QoS statistics
```

---

## 🔍 **Useful Queries**

### **1. View All Configured Parameters**

```sql
SELECT 
    parameter_name,
    parameter_category,
    command_template,
    applies_to
FROM monitoring_parameters
WHERE is_active = true
ORDER BY parameter_category, parameter_name;
```

---

### **2. View Latest Readings for All Parameters**

```sql
SELECT * FROM v_latest_parameter_readings
ORDER BY hostname, interface_name, parameter_category;
```

---

### **3. View SFP Power Readings Only**

```sql
SELECT * FROM v_sfp_power_readings
ORDER BY hostname, interface_name;
```

---

### **4. View System Health Summary**

```sql
SELECT * FROM v_system_health
ORDER BY hostname;
```

---

### **5. Get Reading History for Specific Parameter**

```sql
SELECT 
    r.hostname,
    ri.interface_label,
    pr.reading_data,
    pr.reading_time
FROM parameter_readings pr
JOIN routers r ON pr.router_id = r.id
LEFT JOIN router_interfaces ri ON pr.interface_id = ri.id
JOIN monitoring_parameters mp ON pr.parameter_id = mp.id
WHERE mp.parameter_name = 'SFP_100G_POWER'
  AND ri.interface_label = 'PKT-KATHUA'
ORDER BY pr.reading_time DESC
LIMIT 100;
```

---

### **6. Get Latest Reading for Specific Router and Parameter**

```sql
SELECT get_latest_reading(1, 1, 'SFP_100G_POWER');
```

---

## 🎯 **Custom Parameter Examples**

### **Cisco Commands:**

```sql
-- Interface Status
INSERT INTO monitoring_parameters VALUES
('CISCO_INT_STATUS', 'INTERFACE', 'Cisco Interface Status', 
 'show interface {interface}', 'INTERFACE');

-- BGP Summary
INSERT INTO monitoring_parameters VALUES
('CISCO_BGP_SUMMARY', 'ROUTING', 'Cisco BGP Summary', 
 'show ip bgp summary', 'ROUTER');

-- MPLS LDP Neighbors
INSERT INTO monitoring_parameters VALUES
('CISCO_MPLS_LDP', 'MPLS', 'MPLS LDP Neighbors', 
 'show mpls ldp neighbor', 'ROUTER');
```

---

### **Huawei Commands:**

```sql
-- VLAN Information
INSERT INTO monitoring_parameters VALUES
('HUAWEI_VLAN_INFO', 'VLAN', 'VLAN Information', 
 'display vlan', 'ROUTER');

-- MAC Address Table
INSERT INTO monitoring_parameters VALUES
('HUAWEI_MAC_TABLE', 'L2', 'MAC Address Table', 
 'display mac-address', 'ROUTER');

-- ARP Table
INSERT INTO monitoring_parameters VALUES
('HUAWEI_ARP_TABLE', 'L3', 'ARP Table', 
 'display arp', 'ROUTER');
```

---

## 🌐 **Web Interface Integration**

### **API Route: `/api/parameter-readings`**

```javascript
// app/api/parameter-readings/route.js

import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  host: 'localhost',
  database: 'cntx_portal',
  user: 'postgres',
  password: 'your_password',
});

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const router = searchParams.get('router');
  
  try {
    let query = `
      SELECT * FROM v_latest_parameter_readings
      WHERE 1=1
    `;
    
    const params = [];
    
    if (category) {
      query += ` AND parameter_category = $${params.length + 1}`;
      params.push(category);
    }
    
    if (router) {
      query += ` AND hostname = $${params.length + 1}`;
      params.push(router);
    }
    
    query += ` ORDER BY hostname, interface_name, parameter_category`;
    
    const result = await pool.query(query, params);
    
    return NextResponse.json(result.rows);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

---

### **Frontend Page: `/monitoring-dashboard`**

```javascript
// app/monitoring-dashboard/page.js

"use client";

import { useState, useEffect } from 'react';

export default function MonitoringDashboard() {
  const [readings, setReadings] = useState([]);
  const [category, setCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchReadings();
    const interval = setInterval(fetchReadings, 60000);
    return () => clearInterval(interval);
  }, [category]);
  
  const fetchReadings = async () => {
    try {
      const url = category === 'all' 
        ? '/api/parameter-readings'
        : `/api/parameter-readings?category=${category}`;
      
      const res = await fetch(url);
      const data = await res.json();
      setReadings(data);
      setLoading(false);
    } catch (error) {
      console.error('Error:', error);
      setLoading(false);
    }
  };
  
  const categories = ['all', 'OPTICAL', 'SYSTEM', 'INTERFACE', 'ALARM', 'PERFORMANCE'];
  
  if (loading) return <div>Loading...</div>;
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Multi-Parameter Monitoring</h1>
      
      {/* Category Filter */}
      <div className="mb-4">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-4 py-2 mr-2 rounded ${
              category === cat ? 'bg-blue-600 text-white' : 'bg-gray-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>
      
      {/* Readings Table */}
      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th>Router</th>
            <th>Interface</th>
            <th>Parameter</th>
            <th>Values</th>
            <th>Last Reading</th>
          </tr>
        </thead>
        <tbody>
          {readings.map((reading, index) => (
            <tr key={index}>
              <td>{reading.hostname}</td>
              <td>{reading.interface_label || '-'}</td>
              <td>{reading.parameter_name}</td>
              <td>
                <pre className="text-xs">
                  {JSON.stringify(reading.reading_data, null, 2)}
                </pre>
              </td>
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

## 📈 **Scheduled Monitoring**

### **Windows Task Scheduler:**

```batch
@echo off
cd C:\path\to\python-backend
call venv\Scripts\activate
python router_multi_parameter_monitor.py >> logs\monitor_%date:~-4,4%%date:~-10,2%%date:~-7,2%.log 2>&1
```

### **Linux Cron:**

```bash
*/5 * * * * cd /path/to/python-backend && source venv/bin/activate && python router_multi_parameter_monitor.py >> /var/log/router_monitor.log 2>&1
```

---

## 🎉 **Summary**

### **Kya Mila:**

```
✅ Flexible multi-parameter monitoring
✅ Database-driven configuration
✅ Easy to add new parameters
✅ Regex-based parsing
✅ JSON storage for flexibility
✅ Pre-configured parameters
✅ Web interface ready
✅ Scheduled monitoring
✅ Historical data tracking
```

---

### **How to Add New Parameter:**

```
1. Add to monitoring_parameters table
2. Add regex parsers to parameter_parsers table
3. Run monitoring script
4. Data automatically collected and stored!
```

---

**Ab aap koi bhi router parameter monitor kar sakte hain! 🚀**

**Questions? Documentation dekho ya poocho! 💬**
