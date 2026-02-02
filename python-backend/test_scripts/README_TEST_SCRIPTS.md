# 🧪 Test Scripts - Complete Guide

## 📋 **Test Scripts List**

Yeh 10 test scripts hain jo step-by-step sab kuch test karte hain:

```
01_test_database_connection.py    - Database connection check
02_test_tables_exist.py            - Tables exist karte hain ya nahi
03_test_credentials.py             - Credentials table check
04_test_routers.py                 - Routers table check
05_test_interfaces.py              - Interfaces table check
06_test_ssh_connection.py          - Router SSH connection test
07_test_ospf_command.py            - OSPF command test
08_test_bgp_command.py             - BGP command test
09_test_sfp_command.py             - SFP command test
10_test_save_to_database.py        - Database save/retrieve test
```

---

## 🚀 **How to Run in PyCharm**

### **Step 1: Open Project**
```
1. Open PyCharm
2. File → Open
3. Select: cntx_portal/python-backend
```

### **Step 2: Setup Virtual Environment**
```
1. File → Settings → Project → Python Interpreter
2. Click gear icon → Add
3. Select "Virtualenv Environment"
4. Click OK
```

### **Step 3: Install Dependencies**
```
1. Open Terminal in PyCharm (bottom)
2. Run:
   pip install psycopg2-binary paramiko
```

### **Step 4: Configure Scripts**
```
Har script mein yeh change karo:

DB_CONFIG = {
    'password': 'YOUR_ACTUAL_PASSWORD'  # <-- Apna password daalo
}

ROUTER_CONFIG = {
    'host': 'YOUR_ROUTER_IP',           # <-- Apna router IP
    'username': 'YOUR_USERNAME',         # <-- Apna username
    'password': 'YOUR_PASSWORD'          # <-- Apna password
}
```

### **Step 5: Run Scripts One by One**
```
1. Right-click on script
2. Click "Run '01_test_database_connection'"
3. Check output
4. Move to next script
```

---

## 📊 **Expected Output for Each Script**

### **Script 1: Database Connection**
```
============================================================
🔍 Testing Database Connection...
============================================================

📡 Connecting to database...
✅ Database connected successfully!

📊 Database Info:
   Database: cntx_portal
   User: postgres
   Host: localhost
   Port: 5432

✅ Test Passed! Database connection working perfectly!
============================================================
```

### **Script 2: Tables Exist**
```
============================================================
🔍 Checking if Required Tables Exist...
============================================================

📊 Found 7 tables in database:

   ✅ routers
   ✅ router_credentials
   ✅ router_interfaces
   ✅ monitoring_parameters
   ✅ parameter_parsers
   ✅ parameter_readings
   ✅ router_credential_mappings

✅ Test Passed! All required tables exist!
============================================================
```

### **Script 3: Credentials**
```
============================================================
🔍 Checking Router Credentials...
============================================================

📊 Found 3 credential(s):

   🔐 default_admin
      Username: admin
      Description: Default admin credentials
      Status: ✅ Active

✅ Test Passed! Credentials found in database!
============================================================
```

### **Script 4: Routers**
```
============================================================
🔍 Checking Routers in Database...
============================================================

📊 Found 2 router(s):

   🌐 ROUTER-1
      IP Address: 10.125.1.1
      Username: admin
      Credential: my_admin
      Device Type: tejas
      Location: Location 1
      Status: ✅ Active

✅ Test Passed! Routers found in database!
============================================================
```

### **Script 5: Interfaces**
```
============================================================
🔍 Checking Router Interfaces...
============================================================

📊 Found 2 interface(s):

   🌐 Router: ROUTER-1
      📡 1/1/1 (Interface 1/1/1)
         Type: 100G
         Status: ✅ Monitored

✅ Test Passed! Interfaces found in database!
============================================================
```

### **Script 6: SSH Connection**
```
============================================================
🔍 Testing SSH Connection to Router...
============================================================

📡 Router Details:
   Host: 10.125.1.1
   Port: 22
   Username: admin
   Device Type: tejas

🔄 Creating SSH client...
🔄 Connecting to 10.125.1.1...
✅ SSH connection successful!

🔄 Opening interactive shell...
🔄 Executing command: show version
✅ Command executed successfully!

📄 Output:
------------------------------------------------------------
[Router output here...]
------------------------------------------------------------

✅ Test Passed! SSH connection working!
============================================================
```

### **Script 7: OSPF Command**
```
============================================================
🔍 Testing OSPF Command...
============================================================

🔄 Connecting to 10.125.1.1...
✅ Connected!

🔄 Executing: sh ip ospf ne
✅ Command executed!

📄 Raw Output:
------------------------------------------------------------
Neighbor-ID     Pri   State          DeadTime   Address
10.125.0.1      1     FULL/PTOP      1728       10.130.0.1
------------------------------------------------------------

🔍 Parsing OSPF Neighbors...

✅ Found 2 OSPF neighbor(s):

   Neighbor 1:
      Neighbor ID: 10.125.0.1
      State: FULL/PTOP
      Interface: vlan50
      BFD Status: Enabled
      Area ID: 0.0.0.7

✅ Test Passed! OSPF command working!
============================================================
```

### **Script 8: BGP Command**
```
============================================================
🔍 Testing BGP Command...
============================================================

🔄 Connecting to 10.125.1.1...
✅ Connected!

🔄 Executing: sh ip bgp summary sorted
✅ Command executed!

🔍 Parsing BGP Summary...

✅ BGP Summary:

   Router ID: 10.125.0.xxx
   Local AS: xxxxx
   Established: 36
   Configured: 40
   Forwarding State: enabled

✅ Test Passed! BGP command working!
============================================================
```

### **Script 9: SFP Command**
```
============================================================
🔍 Testing SFP Command...
============================================================

Interface: 1/1/1

🔄 Connecting to 10.125.1.1...
✅ Connected!

🔄 Executing: sh sfp 100g 1/1/1
✅ Command executed!

🔍 Parsing SFP Info...

✅ SFP Information:

   Status: up
   Laser Status: on
   Laser Type: 100GE / QSFP28 / 80km / 1310 nm
   RxPower: -16.3492 dBm
   TxPower: 9.842 dBm
   Temperature: 39.9844 C
   Voltage: 3.2512 V
   Vendor: TEJAS NETWORKS
   Serial: TJAB432023000191

✅ Test Passed! SFP command working!
============================================================
```

### **Script 10: Save to Database**
```
============================================================
🔍 Testing Save to Database...
============================================================

🔄 Connecting to database...
✅ Connected!

🔄 Saving test data...
   Router ID: 1
   Parameter: TEJAS_OSPF_NEIGHBORS
   Data: 2 neighbors

✅ Reading saved with ID: 123

🔄 Retrieving saved data...
✅ Data retrieved successfully!

📄 Retrieved Data:
   ID: 123
   Router: ROUTER-1
   Parameter: TEJAS_OSPF_NEIGHBORS
   Reading Time: 2024-02-02 13:30:45
   Data: {...}

✅ Test Passed! Database save/retrieve working!
============================================================
```

---

## 🎯 **Testing Sequence**

```
Run in this order:

1. ✅ 01_test_database_connection.py
   ↓ (Database working?)
   
2. ✅ 02_test_tables_exist.py
   ↓ (All tables created?)
   
3. ✅ 03_test_credentials.py
   ↓ (Credentials added?)
   
4. ✅ 04_test_routers.py
   ↓ (Routers added?)
   
5. ✅ 05_test_interfaces.py
   ↓ (Interfaces added?)
   
6. ✅ 06_test_ssh_connection.py
   ↓ (Can connect to router?)
   
7. ✅ 07_test_ospf_command.py
   ↓ (OSPF command working?)
   
8. ✅ 08_test_bgp_command.py
   ↓ (BGP command working?)
   
9. ✅ 09_test_sfp_command.py
   ↓ (SFP command working?)
   
10. ✅ 10_test_save_to_database.py
    ↓ (Can save to database?)
    
✅ ALL TESTS PASSED!
```

---

## 🆘 **Common Errors & Solutions**

### **Error: ModuleNotFoundError: No module named 'psycopg2'**
```bash
Solution:
pip install psycopg2-binary
```

### **Error: ModuleNotFoundError: No module named 'paramiko'**
```bash
Solution:
pip install paramiko
```

### **Error: Database connection failed**
```bash
Solutions:
1. Check PostgreSQL is running
2. Verify password in DB_CONFIG
3. Check database exists:
   psql -U postgres -c "\l"
```

### **Error: SSH connection failed**
```bash
Solutions:
1. Check router IP is correct
2. Verify username/password
3. Ping router: ping 10.125.1.1
4. Check SSH is enabled on router
```

### **Error: No tables found**
```bash
Solution:
Run schema files:
psql -U postgres -d cntx_portal -f python-backend/database/schema_multi_parameter.sql
psql -U postgres -d cntx_portal -f python-backend/database/tejas_commands_schema.sql
psql -U postgres -d cntx_portal -f python-backend/database/credentials_system.sql
```

---

## 📝 **Notes**

1. **Har script independent hai** - Alag alag run kar sakte ho
2. **Password change karna mat bhoolna** - Har script mein
3. **Router details update karo** - Scripts 6-9 mein
4. **Sequence follow karo** - 1 se 10 tak order mein
5. **Output check karo** - Har script ka expected output dekho

---

**🎊 Ab PyCharm mein ek ek script run karo aur output check karo!** 🚀

**Koi problem ho to batao!** 💬
