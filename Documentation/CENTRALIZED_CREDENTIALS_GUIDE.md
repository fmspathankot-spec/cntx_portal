# 🔐 Centralized Credentials System - Guide

## 🎯 **Problem Solved**

**Before:** Har router ke liye alag username/password dalna padta tha
**After:** Ek baar credentials save karo, sabhi routers use karein!

---

## ✨ **Features**

```
✅ Ek credential, multiple routers
✅ Ek jagah password change karo, sab routers update
✅ Multiple credential sets support
✅ Easy bulk router addition
✅ Backward compatible
```

---

## 🚀 **Quick Start**

### **Step 1: Run Credentials Schema**

```bash
psql -U postgres -d cntx_portal -f python-backend/database/credentials_system.sql
```

### **Step 2: Add Your Common Credentials**

```sql
psql -U postgres -d cntx_portal

-- Add your common credentials
INSERT INTO router_credentials (credential_name, username, password, description)
VALUES ('my_admin', 'admin', 'your_common_password', 'Common admin for all routers');
```

### **Step 3: Add Routers Using Credentials**

```sql
-- Method 1: Using function (EASY!)
SELECT add_router_with_credential(
    'ROUTER-1',           -- hostname
    '10.125.1.1',         -- IP address
    'my_admin',           -- credential name
    'tejas',              -- device type
    'Location 1'          -- location
);

-- Add more routers with same credentials
SELECT add_router_with_credential('ROUTER-2', '10.125.1.2', 'my_admin', 'tejas', 'Location 2');
SELECT add_router_with_credential('ROUTER-3', '10.125.1.3', 'my_admin', 'tejas', 'Location 3');
SELECT add_router_with_credential('ROUTER-4', '10.125.1.4', 'my_admin', 'tejas', 'Location 4');
```

### **Step 4: Add Interfaces**

```sql
-- Add interfaces for each router
INSERT INTO router_interfaces (router_id, interface_name, interface_label, interface_type)
SELECT id, '1/1/1', 'Interface 1/1/1', '100G'
FROM routers WHERE hostname IN ('ROUTER-1', 'ROUTER-2', 'ROUTER-3', 'ROUTER-4');
```

### **Step 5: Run Monitoring**

```bash
cd python-backend
python tejas_router_monitor_v2.py

# Output will show:
# 🔐 Using credentials: admin (from my_admin)
```

---

## 📊 **How It Works**

### **Database Structure:**

```
router_credentials
├── id
├── credential_name (e.g., 'my_admin')
├── username (e.g., 'admin')
├── password (e.g., 'password123')
└── description

routers
├── id
├── hostname
├── ip_address
├── credential_id → references router_credentials
└── ... other fields
```

### **View: v_routers_with_credentials**

Automatically merges router info with credentials:

```sql
SELECT * FROM v_routers_with_credentials;

-- Returns:
-- hostname | ip_address | username | password | credential_name
-- ROUTER-1 | 10.125.1.1 | admin    | pass123  | my_admin
-- ROUTER-2 | 10.125.1.2 | admin    | pass123  | my_admin
```

---

## 💡 **Usage Examples**

### **Example 1: Add 10 Routers with Same Credentials**

```sql
-- One-liner for each router
SELECT add_router_with_credential('PKT-TX-C1', '10.125.1.1', 'my_admin', 'tejas', 'Pathankot');
SELECT add_router_with_credential('PKT-TX-C2', '10.125.1.2', 'my_admin', 'tejas', 'Pathankot');
SELECT add_router_with_credential('JGL-CNN-B1', '10.125.2.1', 'my_admin', 'tejas', 'Jugial');
SELECT add_router_with_credential('JGL-CNN-B2', '10.125.2.2', 'my_admin', 'tejas', 'Jugial');
-- ... add more
```

### **Example 2: Bulk Add with Loop**

```sql
DO $$
DECLARE
    i INTEGER;
BEGIN
    FOR i IN 1..10 LOOP
        PERFORM add_router_with_credential(
            'ROUTER-' || i,
            '10.125.1.' || i,
            'my_admin',
            'tejas',
            'Location ' || i
        );
    END LOOP;
END $$;
```

### **Example 3: Different Credentials for Different Locations**

```sql
-- Add credentials for different locations
INSERT INTO router_credentials (credential_name, username, password, description) VALUES
('pathankot_admin', 'admin', 'pkt_pass', 'Pathankot routers'),
('jugial_admin', 'admin', 'jgl_pass', 'Jugial routers');

-- Add routers with location-specific credentials
SELECT add_router_with_credential('PKT-R1', '10.125.1.1', 'pathankot_admin', 'tejas', 'Pathankot');
SELECT add_router_with_credential('JGL-R1', '10.125.2.1', 'jugial_admin', 'tejas', 'Jugial');
```

### **Example 4: Change Password for All Routers**

```sql
-- Change password once, affects all routers using this credential
UPDATE router_credentials 
SET password = 'new_secure_password' 
WHERE credential_name = 'my_admin';

-- All routers using 'my_admin' will now use new password!
```

### **Example 5: Change Specific Router to Different Credential**

```sql
-- Move ROUTER-1 to use different credentials
UPDATE routers 
SET credential_id = (SELECT id FROM router_credentials WHERE credential_name = 'backup_admin')
WHERE hostname = 'ROUTER-1';
```

---

## 🔍 **Useful Queries**

### **1. View All Routers with Credentials**

```sql
SELECT 
    hostname,
    ip_address,
    username,
    credential_name,
    location
FROM v_routers_with_credentials
ORDER BY hostname;
```

### **2. Count Routers Per Credential**

```sql
SELECT 
    rc.credential_name,
    rc.username,
    COUNT(r.id) as router_count
FROM router_credentials rc
LEFT JOIN routers r ON rc.id = r.credential_id
GROUP BY rc.id, rc.credential_name, rc.username
ORDER BY router_count DESC;
```

### **3. Find Routers Without Credentials**

```sql
SELECT * FROM routers WHERE credential_id IS NULL;
```

### **4. List All Credentials**

```sql
SELECT 
    credential_name,
    username,
    description,
    is_active
FROM router_credentials
ORDER BY credential_name;
```

### **5. Get Credentials for Specific Router**

```sql
SELECT * FROM get_router_credentials(1);  -- router_id = 1
```

---

## 🔄 **Migration from Old System**

### **If you have existing routers with individual credentials:**

```sql
-- Step 1: Create credential from existing router
INSERT INTO router_credentials (credential_name, username, password)
SELECT 
    'common_admin',
    username,
    password
FROM routers
LIMIT 1;

-- Step 2: Update all routers to use this credential
UPDATE routers 
SET credential_id = (SELECT id FROM router_credentials WHERE credential_name = 'common_admin');

-- Step 3: Verify
SELECT * FROM v_routers_with_credentials;
```

---

## 🎯 **Best Practices**

### **1. Naming Convention**

```sql
-- Good credential names:
'location_admin'     -- e.g., 'pathankot_admin', 'jugial_admin'
'role_user'          -- e.g., 'readonly_monitor', 'backup_admin'
'vendor_type'        -- e.g., 'tejas_default', 'cisco_admin'
```

### **2. Multiple Credential Sets**

```sql
-- Production credentials
INSERT INTO router_credentials VALUES 
('prod_admin', 'admin', 'prod_pass', 'Production admin'),
('prod_readonly', 'monitor', 'monitor_pass', 'Production monitoring');

-- Backup credentials
INSERT INTO router_credentials VALUES 
('backup_admin', 'backup', 'backup_pass', 'Backup admin access');
```

### **3. Security**

```sql
-- Mark inactive credentials
UPDATE router_credentials 
SET is_active = false 
WHERE credential_name = 'old_admin';

-- Rotate passwords regularly
UPDATE router_credentials 
SET password = 'new_password', updated_at = CURRENT_TIMESTAMP
WHERE credential_name = 'my_admin';
```

---

## 📋 **Comparison**

### **Old Way (Individual Credentials):**

```sql
-- Add 10 routers - need to type username/password 10 times
INSERT INTO routers (hostname, ip, username, password) VALUES
('R1', '10.1.1.1', 'admin', 'pass123'),
('R2', '10.1.1.2', 'admin', 'pass123'),
('R3', '10.1.1.3', 'admin', 'pass123'),
-- ... 7 more times

-- Change password - need to update 10 rows
UPDATE routers SET password = 'new_pass' WHERE hostname IN ('R1','R2',...);
```

### **New Way (Centralized Credentials):**

```sql
-- Add credential once
INSERT INTO router_credentials VALUES ('my_admin', 'admin', 'pass123');

-- Add 10 routers - just reference credential
SELECT add_router_with_credential('R1', '10.1.1.1', 'my_admin');
SELECT add_router_with_credential('R2', '10.1.1.2', 'my_admin');
-- ... easy!

-- Change password - update 1 row, affects all routers
UPDATE router_credentials SET password = 'new_pass' WHERE credential_name = 'my_admin';
```

---

## 🚀 **Advanced Features**

### **1. Multiple Credentials Per Router (Fallback)**

```sql
-- Primary credential
UPDATE routers SET credential_id = 1 WHERE hostname = 'ROUTER-1';

-- Add fallback credential mapping
INSERT INTO router_credential_mappings (router_id, credential_id, is_primary)
VALUES (1, 2, false);  -- credential_id 2 as backup
```

### **2. Credential Rotation**

```sql
-- Create new credential
INSERT INTO router_credentials VALUES ('my_admin_v2', 'admin', 'new_pass');

-- Switch all routers to new credential
UPDATE routers 
SET credential_id = (SELECT id FROM router_credentials WHERE credential_name = 'my_admin_v2')
WHERE credential_id = (SELECT id FROM router_credentials WHERE credential_name = 'my_admin');

-- Deactivate old credential
UPDATE router_credentials SET is_active = false WHERE credential_name = 'my_admin';
```

---

## 🎉 **Summary**

### **Benefits:**

```
✅ Ek baar credentials save karo
✅ Unlimited routers add karo
✅ Ek click mein password change
✅ Easy bulk operations
✅ Better security management
✅ Audit trail (updated_at)
```

### **Quick Commands:**

```sql
-- Add credential
INSERT INTO router_credentials (credential_name, username, password)
VALUES ('my_cred', 'admin', 'pass');

-- Add router
SELECT add_router_with_credential('ROUTER-1', '10.1.1.1', 'my_cred', 'tejas', 'Loc');

-- View all
SELECT * FROM v_routers_with_credentials;

-- Change password
UPDATE router_credentials SET password = 'new_pass' WHERE credential_name = 'my_cred';
```

---

**🎊 Ab har router ke liye alag credentials nahi dalne padenge!** 🚀

**Ek baar set karo, sab routers use karein!** 💪
