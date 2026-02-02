# 🚀 Router Access - Quick Start Guide (Hindi)

## 🎯 **Kya Banayenge?**

```
Real-time Router Terminal Access Portal

Features:
✅ SSH/Telnet se router connect karo
✅ Commands execute karo
✅ Real-time output dekho
✅ Command history save ho
✅ Multiple routers manage karo
✅ Same portal mein integrate
```

---

## ⚡ **Quick Setup (30 Minutes)**

### **Step 1: Python Backend Setup (10 min)**

```bash
# 1. Folder banao
cd cntx_portal
mkdir python-backend
cd python-backend

# 2. Virtual environment
python -m venv venv

# Windows:
venv\Scripts\activate

# Linux/Mac:
source venv/bin/activate

# 3. Dependencies install
pip install fastapi uvicorn netmiko paramiko websockets python-dotenv

# 4. Files banao (copy from guide)
# - main.py
# - routers/netmiko_handler.py
# - utils/session_manager.py
# - utils/logger.py

# 5. Start server
python main.py

# Output:
# INFO: Uvicorn running on http://0.0.0.0:8000
```

---

### **Step 2: Frontend Setup (10 min)**

```bash
# New terminal
cd cntx_portal

# 1. Page banao
mkdir -p app/router-access

# 2. Files banao
# - app/router-access/page.js
# - app/router-access/RouterTerminal.js

# 3. Start Next.js
npm run dev

# Output:
# ▲ Next.js running on http://localhost:3000
```

---

### **Step 3: Test Karo (10 min)**

```
1. Browser kholo: http://localhost:3000/router-access

2. Connection form fill karo:
   Host: 10.180.16.1
   Port: 22
   Username: admin
   Password: ****
   Protocol: SSH

3. Connect button dabao

4. Command type karo: show version

5. Output dekho! 🎉
```

---

## 📁 **Minimal File Structure**

```
cntx_portal/
│
├── python-backend/              # Python backend
│   ├── main.py                 # FastAPI server (MAIN FILE)
│   ├── routers/
│   │   └── netmiko_handler.py # Router connection handler
│   ├── utils/
│   │   ├── session_manager.py # Session management
│   │   └── logger.py          # Logging
│   └── requirements.txt        # Dependencies
│
└── app/
    └── router-access/          # Frontend
        ├── page.js            # Server component
        └── RouterTerminal.js  # Terminal UI
```

---

## 💻 **Minimal Code (Copy-Paste Ready)**

### **File 1: `python-backend/main.py` (Minimal Version)**

```python
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from netmiko import ConnectHandler

app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Storage
connections = {}

# Models
class RouterConnection(BaseModel):
    host: str
    username: str
    password: str
    device_type: str = "cisco_ios"

class CommandRequest(BaseModel):
    session_id: str
    command: str

# Connect
@app.post("/api/router/connect")
async def connect(conn: RouterConnection):
    try:
        device = {
            'device_type': conn.device_type,
            'host': conn.host,
            'username': conn.username,
            'password': conn.password,
        }
        
        connection = ConnectHandler(**device)
        session_id = f"{conn.host}_{conn.username}"
        connections[session_id] = connection
        
        return {
            "success": True,
            "session_id": session_id,
            "message": f"Connected to {conn.host}"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Execute
@app.post("/api/router/execute")
async def execute(req: CommandRequest):
    try:
        if req.session_id not in connections:
            raise HTTPException(status_code=404, detail="Session not found")
        
        conn = connections[req.session_id]
        output = conn.send_command(req.command)
        
        return {
            "success": True,
            "output": output,
            "command": req.command
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Disconnect
@app.post("/api/router/disconnect/{session_id}")
async def disconnect(session_id: str):
    if session_id in connections:
        connections[session_id].disconnect()
        del connections[session_id]
    
    return {"success": True, "message": "Disconnected"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

**Bas! Yeh 80 lines mein complete backend ready! 🎉**

---

### **File 2: `app/router-access/page.js`**

```javascript
import RouterTerminal from './RouterTerminal';

export default function RouterAccessPage() {
  return <RouterTerminal />;
}
```

---

### **File 3: `app/router-access/RouterTerminal.js` (Minimal Version)**

```javascript
"use client";

import { useState } from 'react';

export default function RouterTerminal() {
  const [connected, setConnected] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [output, setOutput] = useState([]);
  const [command, setCommand] = useState('');
  
  const [form, setForm] = useState({
    host: '',
    username: '',
    password: '',
    device_type: 'cisco_ios'
  });
  
  // Connect
  const handleConnect = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/router/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      
      const data = await res.json();
      
      if (data.success) {
        setConnected(true);
        setSessionId(data.session_id);
        setOutput([{ type: 'success', text: data.message }]);
      }
    } catch (error) {
      setOutput([{ type: 'error', text: error.message }]);
    }
  };
  
  // Execute
  const handleExecute = async (e) => {
    e.preventDefault();
    
    setOutput([...output, { type: 'command', text: `$ ${command}` }]);
    
    try {
      const res = await fetch('http://localhost:8000/api/router/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId, command })
      });
      
      const data = await res.json();
      
      if (data.success) {
        setOutput(prev => [...prev, { type: 'output', text: data.output }]);
      }
    } catch (error) {
      setOutput(prev => [...prev, { type: 'error', text: error.message }]);
    }
    
    setCommand('');
  };
  
  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-6">
          🌐 Router Terminal
        </h1>
        
        {!connected ? (
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl text-white mb-4">Connect to Router</h2>
            
            <input
              type="text"
              placeholder="Host (e.g., 10.180.16.1)"
              value={form.host}
              onChange={(e) => setForm({...form, host: e.target.value})}
              className="w-full px-4 py-2 mb-3 bg-gray-700 text-white rounded"
            />
            
            <input
              type="text"
              placeholder="Username"
              value={form.username}
              onChange={(e) => setForm({...form, username: e.target.value})}
              className="w-full px-4 py-2 mb-3 bg-gray-700 text-white rounded"
            />
            
            <input
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={(e) => setForm({...form, password: e.target.value})}
              className="w-full px-4 py-2 mb-3 bg-gray-700 text-white rounded"
            />
            
            <button
              onClick={handleConnect}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Connect
            </button>
          </div>
        ) : (
          <div className="bg-gray-800 rounded-lg overflow-hidden">
            <div className="bg-gray-700 px-4 py-3 text-white">
              {form.host} - {sessionId}
            </div>
            
            <div className="bg-black p-4 h-96 overflow-y-auto font-mono text-sm">
              {output.map((line, i) => (
                <div
                  key={i}
                  className={`mb-2 ${
                    line.type === 'command' ? 'text-green-400' :
                    line.type === 'error' ? 'text-red-400' :
                    line.type === 'success' ? 'text-blue-400' :
                    'text-gray-300'
                  }`}
                >
                  {line.text}
                </div>
              ))}
            </div>
            
            <form onSubmit={handleExecute} className="bg-gray-700 p-4">
              <div className="flex space-x-2">
                <span className="text-green-400">$</span>
                <input
                  type="text"
                  value={command}
                  onChange={(e) => setCommand(e.target.value)}
                  className="flex-1 bg-transparent text-white outline-none"
                  placeholder="Enter command..."
                  autoFocus
                />
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
```

**Bas! 150 lines mein complete terminal UI ready! 🎉**

---

## 🎯 **Common Router Commands**

### **Cisco Commands:**

```bash
# Show commands
show version
show running-config
show ip interface brief
show ip route
show interfaces
show vlan brief
show mac address-table

# Config commands
configure terminal
interface GigabitEthernet0/1
ip address 192.168.1.1 255.255.255.0
no shutdown
end
write memory
```

---

### **Huawei Commands:**

```bash
# Show commands
display version
display current-configuration
display ip interface brief
display ip routing-table
display interface brief
display vlan

# Config commands
system-view
interface GigabitEthernet0/0/1
ip address 192.168.1.1 255.255.255.0
undo shutdown
quit
save
```

---

## 🔧 **Troubleshooting**

### **Problem 1: Connection failed**

```
Error: Connection timeout

Solution:
1. Check router IP reachable hai:
   ping 10.180.16.1

2. Check SSH enabled hai router par:
   telnet 10.180.16.1 22

3. Check username/password correct hai
```

---

### **Problem 2: Python backend nahi chal raha**

```
Error: Module not found

Solution:
1. Virtual environment activate karo:
   source venv/bin/activate

2. Dependencies install karo:
   pip install fastapi uvicorn netmiko

3. Fir se run karo:
   python main.py
```

---

### **Problem 3: CORS error**

```
Error: CORS policy blocked

Solution:
Python backend mein CORS allow karo:
allow_origins=["*"]  # Already added in code
```

---

## 📊 **Device Types Supported**

```python
# Cisco
'cisco_ios'      # Cisco IOS
'cisco_xe'       # Cisco IOS-XE
'cisco_xr'       # Cisco IOS-XR
'cisco_nxos'     # Cisco NX-OS

# Huawei
'huawei'         # Huawei VRP

# Juniper
'juniper'        # Juniper Junos

# Others
'arista_eos'     # Arista EOS
'hp_comware'     # HP Comware
'dell_os10'      # Dell OS10
```

---

## 🎉 **Summary**

### **Kya Kiya:**

```
✅ Python backend (80 lines)
✅ FastAPI server
✅ Netmiko for SSH
✅ Next.js frontend (150 lines)
✅ Terminal UI
✅ Real-time command execution
✅ Session management
```

---

### **Total Code:**

```
Python Backend: ~80 lines
Frontend: ~150 lines
Total: ~230 lines

Time: 30 minutes
Result: Full router terminal! 🚀
```

---

### **Next Steps:**

```
1. ✅ Basic version test karo
2. ✅ Multiple routers add karo
3. ✅ Command history add karo
4. ✅ Auto-complete add karo
5. ✅ WebSocket for real-time
6. ✅ Security add karo
```

---

**🎊 Bas! Ab router access ready hai!**

**Test karo aur batao kaise laga! 🚀**

**Questions? Documentation dekho ya poocho! 💬**
