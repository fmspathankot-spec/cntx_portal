# 📚 Tejas Router Monitoring Script - Complete Hindi Guide

## 🎯 Script Ka Purpose

Yeh script **Tejas routers** ko monitor karta hai aur unka data database mein save karta hai:
- OSPF neighbors check karta hai
- BGP status check karta hai  
- SFP (optical transceiver) ki health check karta hai
- Sab data PostgreSQL database mein save karta hai

---

## 📦 Part 1: Imports (Libraries)

```python
import paramiko
```
**Kya hai:** SSH library - routers se connect karne ke liye  
**Kyu chahiye:** Routers ko remotely access karne ke liye (jaise PuTTY)

```python
import time
```
**Kya hai:** Time operations ke liye  
**Kyu chahiye:** Commands ke beech wait karne ke liye (router ko response dene ka time)

```python
import re
```
**Kya hai:** Regular expressions - text patterns match karne ke liye  
**Kyu chahiye:** Router output se specific data extract karne ke liye (jaise IP address, numbers)

```python
import psycopg2
from psycopg2.extras import RealDictCursor
```
**Kya hai:** PostgreSQL database library  
**Kyu chahiye:** Database se connect karne aur data save karne ke liye  
**RealDictCursor:** Results ko dictionary format mein deta hai (easy to use)

```python
from datetime import datetime
```
**Kya hai:** Date aur time operations  
**Kyu chahiye:** Readings ka timestamp save karne ke liye

```python
import logging
```
**Kya hai:** Logging library  
**Kyu chahiye:** Script ki activities ko log file mein save karne ke liye (debugging)

```python
import json
```
**Kya hai:** JSON format handling  
**Kyu chahiye:** Data ko JSON format mein database mein save karne ke liye

```python
import os
from dotenv import load_dotenv
```
**Kya hai:** Environment variables handle karne ke liye  
**Kyu chahiye:** Password aur config ko .env file se load karne ke liye (security)

---

## 📁 Part 2: Setup & Configuration

### Logs Directory

```python
if not os.path.exists('logs'):
    os.makedirs('logs')
```
**Kya karta hai:** Check karta hai ki 'logs' folder hai ya nahi  
**Agar nahi hai:** Automatically create kar deta hai  
**Kyu:** Log files save karne ke liye folder chahiye

### Logging Setup

```python
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(f'logs/tejas_monitor_{datetime.now().strftime("%Y%m%d")}.log'),
        logging.StreamHandler()
    ]
)
```

**Line by line:**

1. `level=logging.INFO` - Kis level ki logs save karni hai (INFO, WARNING, ERROR)
2. `format='%(asctime)s - %(levelname)s - %(message)s'` - Log message ka format
   - `%(asctime)s` - Time stamp
   - `%(levelname)s` - Log level (INFO/ERROR)
   - `%(message)s` - Actual message
3. `FileHandler(...)` - Log file mein save karo
   - `tejas_monitor_20240202.log` - Daily log file (date ke saath)
4. `StreamHandler()` - Screen par bhi print karo

**Example output:**
```
2024-02-02 10:30:45 - INFO - ✅ Database connected
2024-02-02 10:30:46 - ERROR - ❌ Connection failed
```

### Database Configuration

```python
DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'port': int(os.getenv('DB_PORT', '5432')),
    'database': os.getenv('DB_NAME', 'cntx_portal'),
    'user': os.getenv('DB_USER', 'postgres'),
    'password': os.getenv('DB_PASSWORD')
}
```

**Kya karta hai:**
- `.env` file se values read karta hai
- `os.getenv('DB_HOST', 'localhost')` - Pehle .env se try karo, nahi mila to 'localhost' use karo
- `int(os.getenv('DB_PORT', '5432'))` - Port ko integer mein convert karo

**Example .env file:**
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=cntx_portal
DB_USER=postgres
DB_PASSWORD=mypassword123
```

### Password Validation

```python
if not DB_CONFIG['password']:
    logger.error("❌ DB_PASSWORD not set in environment variables!")
    logger.error("💡 Create .env file with: DB_PASSWORD=your_password")
    exit(1)
```

**Kya karta hai:** Agar password nahi mila to script band kar do  
**Kyu:** Bina password ke database connect nahi ho sakta

---

## 🔧 Part 3: TejasCommandParser Class

Yeh class router ke output ko parse karti hai (samajhti hai).

### Method 1: parse_ospf_neighbors

```python
@staticmethod
def parse_ospf_neighbors(output):
    """Parse OSPF neighbor output"""
    neighbors = []
    lines = output.split('\n')
    in_table = False
```

**Kya karta hai:**
- Router se aaya hua OSPF output parse karta hai
- `neighbors = []` - Empty list banao neighbors store karne ke liye
- `lines = output.split('\n')` - Output ko lines mein tod do
- `in_table = False` - Flag to track ki table start hui ya nahi

**Example OSPF Output:**
```
Neighbor-ID     Pri  State      Dead-Time  Address        Interface
---------------------------------------------------------------------------
10.125.0.1      1    FULL/PTOP  00:00:35   10.125.0.1     vlan50
10.125.0.2      1    FULL/PTOP  00:00:38   10.125.0.2     vlan20
```

```python
for line in lines:
    if '---' in line and 'Neighbor-ID' in output[:output.index(line)]:
        in_table = True
        continue
```

**Kya karta hai:**
- Har line ko check karo
- Agar line mein `---` hai aur usse pehle `Neighbor-ID` hai
- Matlab table start ho gayi
- `in_table = True` set kar do
- `continue` - Next line par jao

```python
if in_table and line.strip():
    parts = line.split()
    if len(parts) >= 11 and re.match(r'^\d+\.\d+\.\d+\.\d+$', parts[0]):
```

**Kya karta hai:**
- Agar table start ho gayi hai aur line empty nahi hai
- `line.split()` - Line ko spaces se tod do
- `len(parts) >= 11` - Kam se kam 11 parts hone chahiye
- `re.match(r'^\d+\.\d+\.\d+\.\d+$', parts[0])` - First part IP address hona chahiye
  - `\d+` - Ek ya zyada digits
  - `\.` - Dot (.)
  - Pattern: `10.125.0.1` match karega

```python
neighbor = {
    'neighbor_id': parts[0],      # 10.125.0.1
    'priority': parts[1],          # 1
    'state': parts[2],             # FULL/PTOP
    'dead_time': parts[3],         # 00:00:35
    'neighbor_address': parts[4],  # 10.125.0.1
    'interface': parts[5],         # vlan50
    'bfd_status': parts[9],        # Enabled
    'area_id': parts[10]           # 0.0.0.0
}
neighbors.append(neighbor)
```

**Kya karta hai:**
- Har part ko dictionary mein store karo
- Dictionary ko neighbors list mein add karo

```python
return {
    'neighbor_count': len(neighbors),
    'neighbors': neighbors
}
```

**Return karta hai:**
```json
{
  "neighbor_count": 2,
  "neighbors": [
    {
      "neighbor_id": "10.125.0.1",
      "state": "FULL/PTOP",
      "interface": "vlan50"
    },
    {
      "neighbor_id": "10.125.0.2",
      "state": "FULL/PTOP",
      "interface": "vlan20"
    }
  ]
}
```

### Method 2: parse_bgp_summary

```python
@staticmethod
def parse_bgp_summary(output):
    """Parse BGP summary output"""
    result = {}
```

**Kya karta hai:** BGP output se important information extract karta hai

```python
router_id_match = re.search(r'BGP router identifier is ([\d.]+)', output)
if router_id_match:
    result['router_id'] = router_id_match.group(1)
```

**Kya karta hai:**
- `re.search(...)` - Output mein pattern dhundo
- Pattern: `BGP router identifier is 10.125.0.1`
- `([\d.]+)` - Brackets mein jo hai wo capture karo (IP address)
- `.group(1)` - First captured group return karo
- Result: `10.125.0.1`

**Example:**
```
Input:  "BGP router identifier is 10.125.0.1, Local AS number 65001"
Output: result['router_id'] = "10.125.0.1"
```

```python
local_as_match = re.search(r'Local AS number (\d+)', output)
if local_as_match:
    result['local_as'] = local_as_match.group(1)
```

**Kya karta hai:**
- AS number extract karo
- `(\d+)` - Ek ya zyada digits capture karo
- Example: `65001`

### Method 3: parse_sfp_100g_info

```python
@staticmethod
def parse_sfp_100g_info(output):
    """Parse SFP 100G info output"""
    result = {}
    
    fields = {
        'laser_status': r'MSA Laser Status\s*:\s*(\w+)',
        'rx_power': r'RxPower\s*:\s*([-\d.]+)',
        'tx_power': r'TxPower\s*:\s*([-\d.]+)',
    }
```

**Kya karta hai:**
- SFP (optical module) ki information parse karta hai
- `fields` dictionary mein patterns define kiye hain

**Pattern explanation:**
- `\s*` - Zero ya zyada spaces
- `:` - Colon
- `\s*` - Zero ya zyada spaces
- `(\w+)` - Word characters capture karo (ON/OFF)
- `([-\d.]+)` - Numbers with optional minus aur decimal (-12.5)

**Example SFP Output:**
```
MSA Laser Status    : ON
RxPower             : -5.23 dBm
TxPower             : -2.45 dBm
Module Temperature  : 45.5 C
```

```python
for field, pattern in fields.items():
    match = re.search(pattern, output)
    if match:
        result[field] = match.group(1).strip()
    else:
        result[field] = 'N/A'
```

**Kya karta hai:**
- Har field ke liye pattern match karo
- Agar mila to value save karo
- Nahi mila to 'N/A' save karo
- `.strip()` - Extra spaces remove karo

**Result:**
```json
{
  "laser_status": "ON",
  "rx_power": "-5.23",
  "tx_power": "-2.45",
  "module_temperature": "45.5"
}
```

### Method 4: parse_sfp_100g_stats

```python
rx_power_match = re.search(r'Received Power.*?0=([-\d.]+);1=([-\d.]+);2=([-\d.]+);3=([-\d.]+)', output)
```

**Kya karta hai:**
- 100G SFP mein 4 lanes hoti hain (0, 1, 2, 3)
- Har lane ka power alag se hota hai
- Pattern: `Received Power: 0=-5.2;1=-5.3;2=-5.1;3=-5.4`

```python
if rx_power_match:
    result['rx_power_lane0'] = rx_power_match.group(1)  # -5.2
    result['rx_power_lane1'] = rx_power_match.group(2)  # -5.3
    result['rx_power_lane2'] = rx_power_match.group(3)  # -5.1
    result['rx_power_lane3'] = rx_power_match.group(4)  # -5.4
```

**Kya karta hai:** Har lane ka power alag se save karo

```python
rx_powers = [float(rx_power_match.group(i)) for i in range(1, 5)]
result['rx_power_avg'] = str(round(sum(rx_powers) / len(rx_powers), 4))
```

**Kya karta hai:**
- Sabhi lanes ka power list mein dalo
- `sum(rx_powers)` - Total kar do
- `/ len(rx_powers)` - 4 se divide kar do (average)
- `round(..., 4)` - 4 decimal places tak round kar do
- Example: `-5.2500`

---

## 💾 Part 4: DatabaseManager Class

Yeh class database operations handle karti hai.

### Constructor

```python
def __init__(self, config):
    self.config = config
    self.conn = None
```

**Kya karta hai:**
- `self.config` - Database config save karo
- `self.conn = None` - Connection initially None hai

### Connect Method

```python
def connect(self):
    try:
        self.conn = psycopg2.connect(**self.config)
        logger.info("✅ Database connected")
        return self.conn
    except Exception as e:
        logger.error(f"❌ Database connection failed: {e}")
        raise
```

**Kya karta hai:**
- `psycopg2.connect(**self.config)` - Database se connect karo
  - `**self.config` - Dictionary ko arguments mein expand karo
  - Matlab: `connect(host='localhost', port=5432, ...)`
- Agar success to log karo aur connection return karo
- Agar fail to error log karo aur exception raise karo

### Get Tejas Routers

```python
def get_tejas_routers(self):
    """Get all Tejas routers with credentials"""
    try:
        cursor = self.conn.cursor(cursor_factory=RealDictCursor)
```

**Kya karta hai:**
- `cursor` - Database query execute karne ke liye
- `RealDictCursor` - Results dictionary format mein milenge

```python
query = """
    SELECT * FROM v_routers_with_credentials
    WHERE device_type = 'tejas' AND is_active = true
    ORDER BY hostname
"""
```

**Kya hai:**
- SQL query jo routers fetch karti hai
- `v_routers_with_credentials` - View jo routers aur credentials merge karta hai
- `WHERE device_type = 'tejas'` - Sirf Tejas routers
- `AND is_active = true` - Sirf active routers
- `ORDER BY hostname` - Name se sort karo

```python
cursor.execute(query)
routers = cursor.fetchall()
cursor.close()
```

**Kya karta hai:**
- Query execute karo
- Sab results fetch karo (list of dictionaries)
- Cursor close karo

**Return:**
```python
[
  {
    'id': 1,
    'hostname': 'PATHANKOT-1',
    'ip_address': '10.125.1.1',
    'username': 'admin',
    'password': 'pass123',
    'ssh_port': 22
  },
  {
    'id': 2,
    'hostname': 'GURDASPUR-1',
    ...
  }
]
```

### Get Router Interfaces

```python
def get_router_interfaces(self, router_id):
    """Get interfaces for router"""
    query = """
        SELECT id, interface_name, interface_label, interface_type
        FROM router_interfaces
        WHERE router_id = %s AND is_monitored = true
        ORDER BY interface_name
    """
    cursor.execute(query, (router_id,))
```

**Kya karta hai:**
- Specific router ke interfaces fetch karo
- `%s` - Placeholder for parameter (SQL injection se bachne ke liye)
- `(router_id,)` - Parameter pass karo (tuple format mein)
- `is_monitored = true` - Sirf wo interfaces jo monitor karne hain

**Return:**
```python
[
  {
    'id': 1,
    'interface_name': '1/1/1',
    'interface_label': 'Interface 1/1/1',
    'interface_type': '100G'
  },
  {
    'id': 2,
    'interface_name': '1/1/2',
    ...
  }
]
```

### Save Reading

```python
def save_reading(self, router_id, interface_id, parameter_name, reading_data, raw_output):
    """Save parameter reading"""
```

**Parameters:**
- `router_id` - Kis router ka data hai
- `interface_id` - Kis interface ka data hai (None for OSPF/BGP)
- `parameter_name` - Kaunsa parameter (TEJAS_OSPF_NEIGHBORS)
- `reading_data` - Parsed data (dictionary)
- `raw_output` - Original router output (text)

```python
cursor.execute(
    "SELECT id FROM monitoring_parameters WHERE parameter_name = %s",
    (parameter_name,)
)
result = cursor.fetchone()
```

**Kya karta hai:**
- Parameter ka ID dhundo
- `fetchone()` - Ek hi result chahiye

```python
if not result:
    logger.warning(f"⚠️  Parameter {parameter_name} not found")
    return
```

**Kya karta hai:**
- Agar parameter nahi mila to warning do aur return kar jao
- Data save nahi hoga

```python
parameter_id = result[0]
```

**Kya karta hai:**
- Result tuple hai: `(5,)`
- `[0]` se first value nikalo: `5`

```python
query = """
    INSERT INTO parameter_readings 
    (router_id, interface_id, parameter_id, reading_data, raw_output, reading_time)
    VALUES (%s, %s, %s, %s, %s, %s)
"""

cursor.execute(query, (
    router_id,
    interface_id,
    parameter_id,
    json.dumps(reading_data),  # Dictionary ko JSON string mein convert karo
    raw_output,
    datetime.now()  # Current timestamp
))
```

**Kya karta hai:**
- Database mein reading insert karo
- `json.dumps(reading_data)` - Python dictionary ko JSON string mein convert karo
  - Input: `{'neighbor_count': 2}`
  - Output: `'{"neighbor_count": 2}'`
- `datetime.now()` - Current date aur time

```python
self.conn.commit()
cursor.close()
```

**Kya karta hai:**
- `commit()` - Changes database mein permanently save karo
- `close()` - Cursor close karo

---

## 🔌 Part 5: TejasRouterMonitor Class

Yeh class actual monitoring karta hai.

### Execute Command Method

```python
@staticmethod
def execute_command(chan, command, wait_time=2):
    """Execute command and return output"""
    chan.send(f"{command}\n")
    time.sleep(wait_time)
```

**Kya karta hai:**
- `chan` - SSH channel (router se connection)
- `command` - Jo command execute karni hai
- `chan.send(f"{command}\n")` - Command bhejo aur Enter press karo (`\n`)
- `time.sleep(wait_time)` - 2 seconds wait karo (router ko response dene ka time)

**Example:**
```python
execute_command(chan, 'sh ip ospf ne', 2)
# Router ko bhejega: "sh ip ospf ne\n"
# 2 seconds wait karega
```

```python
resp = b""
while chan.recv_ready():
    resp += chan.recv(9999)
```

**Kya karta hai:**
- `resp = b""` - Empty bytes string banao
- `chan.recv_ready()` - Check karo ki data aaya hai ya nahi
- `chan.recv(9999)` - Maximum 9999 bytes read karo
- `resp +=` - Data ko append karte jao

**Kyu loop:**
- Router ka output bada ho sakta hai
- Ek baar mein pura nahi aata
- Isliye loop mein sab data collect karo

```python
return resp.decode('ascii', errors='ignore')
```

**Kya karta hai:**
- `resp` bytes format mein hai: `b'Neighbor-ID...'`
- `.decode('ascii')` - Bytes ko string mein convert karo
- `errors='ignore'` - Agar koi special character hai jo decode nahi ho sakta, ignore kar do
- Return: Normal string

### Monitor Router Method

```python
@staticmethod
def monitor_router(router, interfaces, db_manager):
    """Monitor single router"""
    host = router['ip_address']
    hostname = router['hostname']
    port = router['ssh_port']
    username = router['username']
    password = router['password']
    router_id = router['id']
```

**Kya karta hai:**
- Router dictionary se values extract karo
- Readable variable names mein store karo

```python
results = {
    'router': hostname,
    'ospf': None,
    'bgp': None,
    'interfaces': {}
}
```

**Kya karta hai:**
- Results store karne ke liye dictionary banao
- Initially sab None hai
- Monitoring ke baad fill hoga

### SSH Connection

```python
ssh = paramiko.SSHClient()
ssh.load_system_host_keys()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
```

**Line by line:**

1. `SSHClient()` - SSH client object banao
2. `load_system_host_keys()` - System ke saved SSH keys load karo
3. `set_missing_host_key_policy(AutoAddPolicy())` - Agar router ki key nahi hai to automatically accept kar lo

**Kyu AutoAddPolicy:**
- First time connect karte waqt router ki key nahi hoti
- Manually accept karne ki zarurat nahi
- Automatically trust kar leta hai

```python
ssh.connect(host, port, username, password, 
           look_for_keys=False, allow_agent=False, timeout=10)
```

**Parameters:**
- `host` - Router ka IP address
- `port` - SSH port (usually 22)
- `username` - Login username
- `password` - Login password
- `look_for_keys=False` - SSH keys mat dhundo, password use karo
- `allow_agent=False` - SSH agent mat use karo
- `timeout=10` - 10 seconds mein connect nahi hua to fail

```python
chan = ssh.invoke_shell()
time.sleep(1)
```

**Kya karta hai:**
- `invoke_shell()` - Interactive shell start karo (jaise PuTTY mein terminal)
- `chan` - Channel object (isse commands bhejenge)
- `time.sleep(1)` - 1 second wait karo (shell ready hone ka time)

**Chan kya hai:**
- Channel = Router se active connection
- Isse commands bhej sakte hain
- Isse output receive kar sakte hain
- Jaise phone call - ek line khuli hai communication ke liye

### Clear Initial Output

```python
if chan.recv_ready():
    chan.recv(9999)
```

**Kya karta hai:**
- Shell start hone par router welcome message bhejta hai
- Wo message clear kar do
- Taaki actual command ka output clean mile

**Example welcome message:**
```
Welcome to Tejas Router
Last login: Mon Feb 2 10:30:45 2024
Router>
```

### Disable Pagination

```python
chan.send('conf t\n')
time.sleep(1)
chan.send('set cli pagination off\n')
time.sleep(1)
chan.send('end\n')
time.sleep(1)
```

**Kya karta hai:**

1. `conf t` - Configuration mode mein jao
2. `set cli pagination off` - Pagination band kar do
3. `end` - Configuration mode se bahar aao

**Pagination kya hai:**
- Normally router output page by page dikhata hai
- Har page ke baad `--More--` aata hai
- Space press karna padta hai
- Pagination off karne se pura output ek saath aata hai

**Kyu zaruri:**
- Script automatically chal rahi hai
- Space press nahi kar sakti
- Isliye pagination off karna padta hai

### Monitor OSPF

```python
logger.info(f"  🔍 Checking OSPF neighbors...")
ospf_output = TejasRouterMonitor.execute_command(chan, 'sh ip ospf ne')
```

**Kya karta hai:**
- Log message print karo
- `sh ip ospf ne` command execute karo
- Output `ospf_output` variable mein store karo

```python
ospf_data = TejasCommandParser.parse_ospf_neighbors(ospf_output)
```

**Kya karta hai:**
- Raw output ko parse karo
- Structured data mein convert karo

```python
results['ospf'] = ospf_data
```

**Kya karta hai:**
- Parsed data ko results dictionary mein save karo

```python
db_manager.save_reading(router_id, None, 'TEJAS_OSPF_NEIGHBORS', 
                       ospf_data, ospf_output)
```

**Kya karta hai:**
- Database mein reading save karo
- `None` - Interface ID (OSPF router-level hai, interface-level nahi)
- `'TEJAS_OSPF_NEIGHBORS'` - Parameter name
- `ospf_data` - Parsed data
- `ospf_output` - Raw output

### Monitor BGP

```python
logger.info(f"  🔍 Checking BGP summary...")
bgp_output = TejasRouterMonitor.execute_command(chan, 'sh ip bgp summary sorted', 3)
bgp_data = TejasCommandParser.parse_bgp_summary(bgp_output)
results['bgp'] = bgp_data
db_manager.save_reading(router_id, None, 'TEJAS_BGP_SUMMARY', 
                       bgp_data, bgp_output)
```

**Same process:**
1. Command execute karo
2. Output parse karo
3. Results mein save karo
4. Database mein save karo

**Note:** `wait_time=3` - BGP output bada hota hai, isliye 3 seconds wait

### Monitor SFP Interfaces

```python
for interface in interfaces:
    interface_name = interface['interface_name']  # '1/1/1'
    interface_label = interface['interface_label']  # 'Interface 1/1/1'
    interface_id = interface['id']  # 1
```

**Kya karta hai:**
- Har interface ke liye loop chalao
- Interface details extract karo

```python
logger.info(f"  📡 Monitoring {interface_label} ({interface_name})...")
```

**Output:**
```
  📡 Monitoring Interface 1/1/1 (1/1/1)...
```

```python
results['interfaces'][interface_name] = {
    'label': interface_label,
    'sfp_info': None,
    'sfp_stats': None
}
```

**Kya karta hai:**
- Results dictionary mein interface ke liye entry banao
- Initially data None hai

#### SFP Info

```python
sfp_info_output = TejasRouterMonitor.execute_command(
    chan, f'sh sfp 100g {interface_name}', 2
)
```

**Kya karta hai:**
- Command: `sh sfp 100g 1/1/1`
- SFP module ki basic information fetch karo

```python
sfp_info_data = TejasCommandParser.parse_sfp_100g_info(sfp_info_output)
results['interfaces'][interface_name]['sfp_info'] = sfp_info_data
```

**Kya karta hai:**
- Output parse karo
- Results mein save karo

```python
db_manager.save_reading(router_id, interface_id, 'TEJAS_SFP_100G_INFO',
                       sfp_info_data, sfp_info_output)
```

**Kya karta hai:**
- Database mein save karo
- `interface_id` - Ab interface ID hai (OSPF/BGP mein None tha)

#### SFP Stats

```python
sfp_stats_output = TejasRouterMonitor.execute_command(
    chan, f'sh sfp stats 100g {interface_name}', 2
)
sfp_stats_data = TejasCommandParser.parse_sfp_100g_stats(sfp_stats_output)
results['interfaces'][interface_name]['sfp_stats'] = sfp_stats_data
db_manager.save_reading(router_id, interface_id, 'TEJAS_SFP_100G_STATS',
                       sfp_stats_data, sfp_stats_output)
```

**Same process:**
- Stats command execute karo
- Parse karo
- Save karo

### Close Connection

```python
ssh.close()
logger.info(f"✅ Completed monitoring {hostname}")
```

**Kya karta hai:**
- SSH connection close karo
- Success message log karo

### Error Handling

```python
except Exception as e:
    logger.error(f"❌ Error monitoring {hostname}: {e}")
```

**Kya karta hai:**
- Agar koi bhi error aaye to catch karo
- Error log karo
- Script crash nahi hogi

```python
return results
```

**Kya return karta hai:**
```python
{
  'router': 'PATHANKOT-1',
  'ospf': {
    'neighbor_count': 2,
    'neighbors': [...]
  },
  'bgp': {
    'router_id': '10.125.0.1',
    'local_as': '65001'
  },
  'interfaces': {
    '1/1/1': {
      'label': 'Interface 1/1/1',
      'sfp_info': {...},
      'sfp_stats': {...}
    }
  }
}
```

### Monitor All Routers

```python
@staticmethod
def monitor_all_routers(db_manager):
    """Monitor all Tejas routers"""
    routers = db_manager.get_tejas_routers()
```

**Kya karta hai:**
- Database se sab Tejas routers fetch karo

```python
if not routers:
    logger.warning("⚠️  No Tejas routers found")
    return {}
```

**Kya karta hai:**
- Agar koi router nahi mila to warning do
- Empty dictionary return karo

```python
all_results = {}

for router in routers:
    interfaces = db_manager.get_router_interfaces(router['id'])
    result = TejasRouterMonitor.monitor_router(router, interfaces, db_manager)
    all_results[result['router']] = result
```

**Kya karta hai:**
- Har router ke liye:
  1. Interfaces fetch karo
  2. Router monitor karo
  3. Results dictionary mein add karo

**Return:**
```python
{
  'PATHANKOT-1': {...},
  'GURDASPUR-1': {...},
  'BATALA-1': {...}
}
```

---

## 📊 Part 6: Display Results

```python
def display_results(all_results):
    """Display monitoring results"""
    print("\n" + "="*100)
    print("📊 TEJAS ROUTER MONITORING RESULTS")
    print("="*100 + "\n")
```

**Kya karta hai:**
- Beautiful header print karo
- `"="*100` - 100 equal signs print karo

```python
for router_name, results in all_results.items():
    print(f"\n🌐 Router: {router_name}")
    print("-" * 100)
```

**Kya karta hai:**
- Har router ke liye loop chalao
- Router name print karo
- Separator line print karo

```python
if results['ospf']:
    print(f"\n  🔄 OSPF Neighbors: {results['ospf']['neighbor_count']}")
    for neighbor in results['ospf'].get('neighbors', []):
        print(f"    - {neighbor['neighbor_id']} ({neighbor['state']}) via {neighbor['interface']}")
```

**Kya karta hai:**
- Agar OSPF data hai to print karo
- Neighbor count dikhao
- Har neighbor ki details dikhao

**Output:**
```
  🔄 OSPF Neighbors: 2
    - 10.125.0.1 (FULL/PTOP) via vlan50
    - 10.125.0.2 (FULL/PTOP) via vlan20
```

```python
if results['bgp']:
    print(f"\n  🔄 BGP Summary:")
    print(f"    Router ID: {results['bgp'].get('router_id', 'N/A')}")
    print(f"    Local AS: {results['bgp'].get('local_as', 'N/A')}")
```

**Kya karta hai:**
- BGP summary print karo
- `.get('router_id', 'N/A')` - Agar key nahi hai to 'N/A' print karo

```python
if results['interfaces']:
    print(f"\n  📡 Interface SFP Monitoring:")
    for interface_name, interface_data in results['interfaces'].items():
        label = interface_data['label']
        print(f"\n    🔌 {label} ({interface_name}):")
        
        if interface_data['sfp_info']:
            info = interface_data['sfp_info']
            print(f"      RxPower: {info.get('rx_power', 'N/A')} dBm")
            print(f"      TxPower: {info.get('tx_power', 'N/A')} dBm")
```

**Kya karta hai:**
- Har interface ka SFP data print karo
- RxPower aur TxPower dikhao

**Output:**
```
  📡 Interface SFP Monitoring:

    🔌 Interface 1/1/1 (1/1/1):
      RxPower: -5.23 dBm
      TxPower: -2.45 dBm
```

---

## 🚀 Part 7: Main Function

```python
def main():
    """Main execution"""
    logger.info("🚀 Starting Tejas Router Monitoring v2 (Environment Variables)")
    logger.info(f"📊 Database: {DB_CONFIG['database']}@{DB_CONFIG['host']}:{DB_CONFIG['port']}")
```

**Kya karta hai:**
- Script start message log karo
- Database config dikhao

```python
db_manager = DatabaseManager(DB_CONFIG)
```

**Kya karta hai:**
- DatabaseManager object banao
- Config pass karo

```python
try:
    db_manager.connect()
```

**Kya karta hai:**
- Database se connect karo
- Agar fail to exception raise hoga

```python
all_results = TejasRouterMonitor.monitor_all_routers(db_manager)
```

**Kya karta hai:**
- Sab routers monitor karo
- Results dictionary return hogi

```python
display_results(all_results)
```

**Kya karta hai:**
- Results screen par print karo

```python
logger.info("✅ Monitoring completed successfully")
```

**Kya karta hai:**
- Success message log karo

```python
except Exception as e:
    logger.error(f"❌ Error in main execution: {e}")
```

**Kya karta hai:**
- Agar koi error aaye to catch karo
- Error log karo
- Script crash nahi hogi

```python
finally:
    db_manager.close()
```

**Kya karta hai:**
- `finally` - Error aaye ya na aaye, yeh block chalega
- Database connection close karo
- Resources free karo

```python
input("\nPress Enter to exit...")
```

**Kya karta hai:**
- User ko Enter press karne ka wait karo
- Taaki output dekh sake
- Window automatically close na ho

```python
if __name__ == "__main__":
    main()
```

**Kya karta hai:**
- Agar script directly run ho rahi hai (imported nahi)
- To main() function call karo

---

## 🔄 Complete Flow Summary

### Step-by-Step Execution:

1. **Script Start**
   - Libraries import ho
   - Logging setup ho
   - .env file load ho
   - Database config ready ho

2. **Main Function Call**
   - DatabaseManager object bane
   - Database se connect ho

3. **Get Routers**
   - Database se Tejas routers fetch ho
   - Har router ke credentials mile

4. **For Each Router:**
   
   **A. SSH Connection**
   - Router se SSH connect ho
   - Shell start ho
   - Pagination off ho
   
   **B. OSPF Monitoring**
   - `sh ip ospf ne` command execute ho
   - Output parse ho
   - Database mein save ho
   
   **C. BGP Monitoring**
   - `sh ip bgp summary sorted` command execute ho
   - Output parse ho
   - Database mein save ho
   
   **D. For Each Interface:**
   - SFP info command execute ho
   - Parse aur save ho
   - SFP stats command execute ho
   - Parse aur save ho
   
   **E. Connection Close**
   - SSH connection close ho
   - Next router par jao

5. **Display Results**
   - Sab routers ka data screen par print ho

6. **Cleanup**
   - Database connection close ho
   - Script end ho

---

## 📝 Key Concepts Explained

### 1. Chan (Channel) Kya Hai?

```python
chan = ssh.invoke_shell()
```

**Simple explanation:**
- Chan = Phone line
- SSH = Phone call
- Commands = Aap kya bol rahe ho
- Output = Dusra person kya bol raha hai

**Technical:**
- Channel = Active communication stream
- Bidirectional - send bhi kar sakte, receive bhi
- Interactive - real-time communication

### 2. Why Sleep/Wait?

```python
time.sleep(2)
```

**Kyu zaruri:**
- Router ko command process karne ka time chahiye
- Network delay ho sakta hai
- Output generate hone mein time lagta hai
- Bina wait ke output incomplete milega

**Example:**
```python
chan.send('sh ip ospf ne\n')
# Immediately read karoge to output nahi milega
time.sleep(2)  # Wait karo
# Ab output ready hai
output = chan.recv(9999)
```

### 3. Regular Expressions (Regex)

```python
re.search(r'BGP router identifier is ([\d.]+)', output)
```

**Kya hai:**
- Pattern matching ka powerful tool
- Text se specific data extract karne ke liye

**Pattern breakdown:**
- `\d` - Digit (0-9)
- `+` - Ek ya zyada
- `\.` - Literal dot
- `[\d.]+` - Digits aur dots (IP address)
- `(...)` - Capture group (yeh part chahiye)

**Example:**
```
Input:  "BGP router identifier is 10.125.0.1, Local AS"
Pattern: r'BGP router identifier is ([\d.]+)'
Match:   "10.125.0.1"
```

### 4. Try-Except-Finally

```python
try:
    # Risky code
    db_manager.connect()
except Exception as e:
    # Error handling
    logger.error(f"Error: {e}")
finally:
    # Always runs
    db_manager.close()
```

**Kyu use karte:**
- `try` - Code jo fail ho sakta hai
- `except` - Agar error aaye to kya karna hai
- `finally` - Error aaye ya na aaye, yeh chalega (cleanup)

### 5. JSON Dumps

```python
json.dumps(reading_data)
```

**Kya karta hai:**
- Python dictionary → JSON string

**Example:**
```python
Input:  {'neighbor_count': 2, 'neighbors': [...]}
Output: '{"neighbor_count": 2, "neighbors": [...]}'
```

**Kyu:**
- Database mein JSON column hai
- String format mein store karna padta hai

### 6. Dictionary .get() Method

```python
results['bgp'].get('router_id', 'N/A')
```

**Kya hai:**
- Safe way to access dictionary
- Agar key nahi hai to default value return karo

**Comparison:**
```python
# Unsafe
value = results['bgp']['router_id']  # KeyError if not exists

# Safe
value = results['bgp'].get('router_id', 'N/A')  # Returns 'N/A' if not exists
```

---

## 🎯 Important Points

### 1. Error Handling
- Har risky operation try-except mein hai
- Script crash nahi hogi
- Errors log file mein save hongi

### 2. Security
- Password .env file mein hai
- Code mein hardcoded nahi
- .gitignore mein .env hai (commit nahi hoga)

### 3. Logging
- Har important action log hota hai
- Debug karna easy hai
- Daily log files banti hain

### 4. Database
- Centralized credentials use hote hain
- Ek jagah change karo, sab jagah update ho
- Secure aur maintainable

### 5. Modularity
- Har kaam alag function/class mein
- Reusable code
- Easy to understand aur modify

---

## 🚦 Execution Flow Diagram

```
START
  ↓
Load .env file
  ↓
Setup logging
  ↓
Create DatabaseManager
  ↓
Connect to database
  ↓
Get all Tejas routers
  ↓
FOR EACH ROUTER:
  ↓
  Get router interfaces
  ↓
  SSH connect to router
  ↓
  Disable pagination
  ↓
  Execute OSPF command → Parse → Save to DB
  ↓
  Execute BGP command → Parse → Save to DB
  ↓
  FOR EACH INTERFACE:
    ↓
    Execute SFP info command → Parse → Save to DB
    ↓
    Execute SFP stats command → Parse → Save to DB
  ↓
  Close SSH connection
  ↓
NEXT ROUTER
  ↓
Display all results
  ↓
Close database connection
  ↓
END
```

---

## 💡 Common Questions

### Q1: Chan.recv(9999) mein 9999 kyu?
**A:** Maximum bytes to read. Router output usually itna bada nahi hota. Agar zyada hai to loop mein multiple times read hoga.

### Q2: Why RealDictCursor?
**A:** Normal cursor tuple return karta hai: `(1, 'PATHANKOT', '10.125.1.1')`  
RealDictCursor dictionary return karta hai: `{'id': 1, 'hostname': 'PATHANKOT', 'ip': '10.125.1.1'}`  
Dictionary easy to use hai.

### Q3: Pagination off kyu karna padta?
**A:** Router normally output page by page dikhata hai. Script automatically chal rahi hai, Space press nahi kar sakti. Isliye pagination off.

### Q4: Why json.dumps for database?
**A:** PostgreSQL mein JSONB column hai. Python dictionary directly store nahi ho sakta. Pehle JSON string mein convert karna padta hai.

### Q5: Error aane par script band kyu nahi hoti?
**A:** Try-except use kiya hai. Error catch ho jata hai, log ho jata hai, script continue chalti hai.

---

## 🎓 Learning Points

Yeh script sikhati hai:
1. SSH automation (paramiko)
2. Database operations (psycopg2)
3. Text parsing (regex)
4. Error handling
5. Logging
6. Environment variables
7. Object-oriented programming
8. Modular code design

---

**Ab script samajh aa gayi? Koi doubt ho to batao!** 🚀
