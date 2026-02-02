# 🌐 Router Access Architecture - Real-Time Command Execution

## 🎯 **Overview**

Router access ke liye **Python backend + Next.js frontend** ka combination best hai.

---

## 🏗️ **Architecture Design**

```
┌─────────────────────────────────────────────────────────────┐
│                    USER BROWSER                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Next.js Frontend (React)                              │ │
│  │  - Command input form                                   │ │
│  │  - Real-time output display                            │ │
│  │  - WebSocket connection                                │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                          ↓ WebSocket
┌─────────────────────────────────────────────────────────────┐
│                  NEXT.JS API ROUTES                          │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  /api/router/execute                                    │ │
│  │  - Receives command                                     │ │
│  │  - Forwards to Python backend                          │ │
│  │  - Returns output                                       │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                          ↓ HTTP/WebSocket
┌─────────────────────────────────────────────────────────────┐
│                  PYTHON BACKEND (FastAPI)                    │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  FastAPI Server                                         │ │
│  │  - SSH/Telnet connection management                    │ │
│  │  - Command execution                                    │ │
│  │  - Output streaming                                     │ │
│  │  - Session management                                   │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  Libraries:                                                  │
│  - paramiko (SSH)                                           │
│  - telnetlib (Telnet)                                       │
│  - netmiko (Network devices)                               │
│  - FastAPI (API server)                                     │
│  - WebSockets (Real-time)                                   │
└─────────────────────────────────────────────────────────────┘
                          ↓ SSH/Telnet
┌─────────────────────────────────────────────────────────────┐
│                    NETWORK ROUTERS                           │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Router 1 (10.180.16.1)                                │ │
│  │  Router 2 (10.180.16.2)                                │ │
│  │  Router 3 (10.180.16.3)                                │ │
│  │  ...                                                    │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔧 **Technology Stack**

### **Backend: Python FastAPI**

```python
Why Python?
✅ Excellent SSH/Telnet libraries (paramiko, netmiko)
✅ Easy to handle network devices
✅ FastAPI for modern async API
✅ WebSocket support for real-time
✅ Better error handling for network operations

Libraries:
- FastAPI: Modern web framework
- paramiko: SSH connections
- netmiko: Network device automation
- telnetlib: Telnet connections
- asyncio: Async operations
- websockets: Real-time communication
```

### **Frontend: Next.js (Current Portal)**

```javascript
Why Next.js?
✅ Already using it
✅ Easy integration with Python backend
✅ WebSocket support
✅ Real-time UI updates
✅ Same portal, no separate app needed

Features:
- Command input form
- Real-time output display
- Session management
- Command history
- Auto-complete
```

---

## 📁 **Project Structure**

```
cntx_portal/
│
├── app/                              # Next.js Frontend
│   ├── router-access/               # New page for router access
│   │   ├── page.js                  # Server component
│   │   └── RouterTerminal.js        # Client component (terminal UI)
│   │
│   └── api/
│       └── router/
│           ├── execute/route.js     # Execute command API
│           ├── connect/route.js     # Connect to router API
│           └── disconnect/route.js  # Disconnect API
│
├── python-backend/                   # Python Backend (NEW)
│   ├── main.py                      # FastAPI server
│   ├── routers/
│   │   ├── ssh_handler.py          # SSH connection handler
│   │   ├── telnet_handler.py       # Telnet connection handler
│   │   └── command_executor.py     # Command execution logic
│   │
│   ├── models/
│   │   ├── router.py               # Router model
│   │   └── command.py              # Command model
│   │
│   ├── utils/
│   │   ├── session_manager.py      # Session management
│   │   └── logger.py               # Logging
│   │
│   ├── requirements.txt            # Python dependencies
│   └── .env                        # Python environment variables
│
└── Documentation/
    └── ROUTER_ACCESS_GUIDE.md      # This guide
```

---

## 🚀 **Implementation Plan**

### **Phase 1: Python Backend Setup (Week 1)**

```
Day 1-2: Setup FastAPI
✅ Install Python dependencies
✅ Create FastAPI server
✅ Setup basic routes
✅ Test API endpoints

Day 3-4: SSH/Telnet Implementation
✅ Implement SSH connection (paramiko)
✅ Implement Telnet connection
✅ Test with real routers
✅ Error handling

Day 5-7: Advanced Features
✅ Session management
✅ Command history
✅ WebSocket for real-time
✅ Security (authentication)
```

### **Phase 2: Frontend Integration (Week 2)**

```
Day 1-2: Terminal UI
✅ Create router-access page
✅ Terminal component
✅ Command input
✅ Output display

Day 3-4: API Integration
✅ Connect to Python backend
✅ Execute commands
✅ Display output
✅ Handle errors

Day 5-7: Advanced Features
✅ Real-time updates (WebSocket)
✅ Command history
✅ Auto-complete
✅ Multiple sessions
```

---

## 💻 **Code Examples**

### **1. Python Backend - FastAPI Server**

```python
# python-backend/main.py

from fastapi import FastAPI, WebSocket, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import paramiko
import asyncio
from typing import Optional

app = FastAPI(title="Router Access API")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Next.js dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Models
class RouterConnection(BaseModel):
    host: str
    port: int = 22
    username: str
    password: str
    protocol: str = "ssh"  # ssh or telnet

class CommandRequest(BaseModel):
    session_id: str
    command: str

# Session storage (in production, use Redis)
sessions = {}

# SSH Connection
@app.post("/api/router/connect")
async def connect_router(connection: RouterConnection):
    """Connect to router via SSH/Telnet"""
    try:
        if connection.protocol == "ssh":
            # SSH connection using paramiko
            client = paramiko.SSHClient()
            client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
            
            client.connect(
                hostname=connection.host,
                port=connection.port,
                username=connection.username,
                password=connection.password,
                timeout=10
            )
            
            # Create session
            session_id = f"{connection.host}_{connection.username}"
            sessions[session_id] = {
                "client": client,
                "protocol": "ssh",
                "host": connection.host
            }
            
            return {
                "success": True,
                "session_id": session_id,
                "message": f"Connected to {connection.host}"
            }
        
        elif connection.protocol == "telnet":
            # Telnet connection
            import telnetlib
            
            tn = telnetlib.Telnet(connection.host, connection.port, timeout=10)
            tn.read_until(b"login: ")
            tn.write(connection.username.encode('ascii') + b"\n")
            tn.read_until(b"Password: ")
            tn.write(connection.password.encode('ascii') + b"\n")
            
            session_id = f"{connection.host}_{connection.username}"
            sessions[session_id] = {
                "client": tn,
                "protocol": "telnet",
                "host": connection.host
            }
            
            return {
                "success": True,
                "session_id": session_id,
                "message": f"Connected to {connection.host}"
            }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Execute Command
@app.post("/api/router/execute")
async def execute_command(request: CommandRequest):
    """Execute command on router"""
    try:
        if request.session_id not in sessions:
            raise HTTPException(status_code=404, detail="Session not found")
        
        session = sessions[request.session_id]
        
        if session["protocol"] == "ssh":
            # SSH command execution
            client = session["client"]
            stdin, stdout, stderr = client.exec_command(request.command)
            
            output = stdout.read().decode('utf-8')
            error = stderr.read().decode('utf-8')
            
            return {
                "success": True,
                "output": output,
                "error": error,
                "command": request.command
            }
        
        elif session["protocol"] == "telnet":
            # Telnet command execution
            tn = session["client"]
            tn.write(request.command.encode('ascii') + b"\n")
            output = tn.read_until(b"#", timeout=5).decode('ascii')
            
            return {
                "success": True,
                "output": output,
                "error": "",
                "command": request.command
            }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Disconnect
@app.post("/api/router/disconnect/{session_id}")
async def disconnect_router(session_id: str):
    """Disconnect from router"""
    try:
        if session_id in sessions:
            session = sessions[session_id]
            
            if session["protocol"] == "ssh":
                session["client"].close()
            elif session["protocol"] == "telnet":
                session["client"].close()
            
            del sessions[session_id]
            
            return {
                "success": True,
                "message": "Disconnected successfully"
            }
        else:
            raise HTTPException(status_code=404, detail="Session not found")
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# WebSocket for real-time output
@app.websocket("/ws/router/{session_id}")
async def websocket_endpoint(websocket: WebSocket, session_id: str):
    """WebSocket for real-time command output"""
    await websocket.accept()
    
    try:
        while True:
            # Receive command from client
            data = await websocket.receive_text()
            
            # Execute command
            if session_id in sessions:
                session = sessions[session_id]
                
                if session["protocol"] == "ssh":
                    client = session["client"]
                    stdin, stdout, stderr = client.exec_command(data)
                    output = stdout.read().decode('utf-8')
                    
                    # Send output back to client
                    await websocket.send_text(output)
    
    except Exception as e:
        await websocket.close()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

---

### **2. Python Backend - Netmiko (Better for Network Devices)**

```python
# python-backend/routers/netmiko_handler.py

from netmiko import ConnectHandler
from typing import Dict, List

class NetworkDeviceHandler:
    """Handle network device connections using Netmiko"""
    
    def __init__(self):
        self.connections = {}
    
    def connect(self, device_config: Dict) -> str:
        """
        Connect to network device
        
        device_config = {
            'device_type': 'cisco_ios',  # or 'huawei', 'juniper', etc.
            'host': '10.180.16.1',
            'username': 'admin',
            'password': 'password',
            'port': 22,
            'secret': 'enable_password'  # optional
        }
        """
        try:
            # Create connection
            connection = ConnectHandler(**device_config)
            
            # Enter enable mode if needed
            if device_config.get('secret'):
                connection.enable()
            
            # Store connection
            session_id = f"{device_config['host']}_{device_config['username']}"
            self.connections[session_id] = connection
            
            return session_id
        
        except Exception as e:
            raise Exception(f"Connection failed: {str(e)}")
    
    def execute_command(self, session_id: str, command: str) -> str:
        """Execute single command"""
        if session_id not in self.connections:
            raise Exception("Session not found")
        
        connection = self.connections[session_id]
        output = connection.send_command(command)
        
        return output
    
    def execute_commands(self, session_id: str, commands: List[str]) -> List[str]:
        """Execute multiple commands"""
        if session_id not in self.connections:
            raise Exception("Session not found")
        
        connection = self.connections[session_id]
        outputs = []
        
        for command in commands:
            output = connection.send_command(command)
            outputs.append(output)
        
        return outputs
    
    def execute_config_commands(self, session_id: str, commands: List[str]) -> str:
        """Execute configuration commands"""
        if session_id not in self.connections:
            raise Exception("Session not found")
        
        connection = self.connections[session_id]
        output = connection.send_config_set(commands)
        
        return output
    
    def disconnect(self, session_id: str):
        """Disconnect from device"""
        if session_id in self.connections:
            self.connections[session_id].disconnect()
            del self.connections[session_id]
    
    def get_prompt(self, session_id: str) -> str:
        """Get device prompt"""
        if session_id not in self.connections:
            raise Exception("Session not found")
        
        connection = self.connections[session_id]
        return connection.find_prompt()

# Usage example
handler = NetworkDeviceHandler()

# Connect to Cisco router
device = {
    'device_type': 'cisco_ios',
    'host': '10.180.16.1',
    'username': 'admin',
    'password': 'cisco123',
    'secret': 'enable123'
}

session_id = handler.connect(device)

# Execute commands
output = handler.execute_command(session_id, 'show version')
print(output)

# Execute multiple commands
commands = ['show ip interface brief', 'show running-config']
outputs = handler.execute_commands(session_id, commands)

# Configuration commands
config_commands = [
    'interface GigabitEthernet0/1',
    'description WAN Link',
    'ip address 192.168.1.1 255.255.255.0',
    'no shutdown'
]
output = handler.execute_config_commands(session_id, config_commands)

# Disconnect
handler.disconnect(session_id)
```

---

### **3. Next.js Frontend - Router Terminal Component**

```javascript
// app/router-access/RouterTerminal.js

"use client";

import { useState, useEffect, useRef } from 'react';

export default function RouterTerminal() {
  const [connected, setConnected] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [output, setOutput] = useState([]);
  const [command, setCommand] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Connection form state
  const [connectionForm, setConnectionForm] = useState({
    host: '',
    port: 22,
    username: '',
    password: '',
    protocol: 'ssh'
  });
  
  const outputRef = useRef(null);
  
  // Auto-scroll to bottom
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output]);
  
  // Connect to router
  const handleConnect = async () => {
    setLoading(true);
    
    try {
      const response = await fetch('http://localhost:8000/api/router/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(connectionForm)
      });
      
      const data = await response.json();
      
      if (data.success) {
        setConnected(true);
        setSessionId(data.session_id);
        setOutput([
          ...output,
          { type: 'success', text: data.message }
        ]);
      }
    } catch (error) {
      setOutput([
        ...output,
        { type: 'error', text: `Connection failed: ${error.message}` }
      ]);
    } finally {
      setLoading(false);
    }
  };
  
  // Execute command
  const handleExecuteCommand = async (e) => {
    e.preventDefault();
    
    if (!command.trim()) return;
    
    // Add command to output
    setOutput([
      ...output,
      { type: 'command', text: `$ ${command}` }
    ]);
    
    setLoading(true);
    
    try {
      const response = await fetch('http://localhost:8000/api/router/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          command: command
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setOutput(prev => [
          ...prev,
          { type: 'output', text: data.output }
        ]);
      }
    } catch (error) {
      setOutput(prev => [
        ...prev,
        { type: 'error', text: `Error: ${error.message}` }
      ]);
    } finally {
      setLoading(false);
      setCommand('');
    }
  };
  
  // Disconnect
  const handleDisconnect = async () => {
    try {
      await fetch(`http://localhost:8000/api/router/disconnect/${sessionId}`, {
        method: 'POST'
      });
      
      setConnected(false);
      setSessionId(null);
      setOutput([
        ...output,
        { type: 'info', text: 'Disconnected from router' }
      ]);
    } catch (error) {
      console.error('Disconnect error:', error);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-6">
          🌐 Router Terminal Access
        </h1>
        
        {!connected ? (
          // Connection Form
          <div className="bg-gray-800 rounded-lg p-6 shadow-xl">
            <h2 className="text-xl font-semibold text-white mb-4">
              Connect to Router
            </h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-300 mb-2">Host/IP</label>
                <input
                  type="text"
                  value={connectionForm.host}
                  onChange={(e) => setConnectionForm({
                    ...connectionForm,
                    host: e.target.value
                  })}
                  className="w-full px-4 py-2 bg-gray-700 text-white rounded"
                  placeholder="10.180.16.1"
                />
              </div>
              
              <div>
                <label className="block text-gray-300 mb-2">Port</label>
                <input
                  type="number"
                  value={connectionForm.port}
                  onChange={(e) => setConnectionForm({
                    ...connectionForm,
                    port: parseInt(e.target.value)
                  })}
                  className="w-full px-4 py-2 bg-gray-700 text-white rounded"
                />
              </div>
              
              <div>
                <label className="block text-gray-300 mb-2">Username</label>
                <input
                  type="text"
                  value={connectionForm.username}
                  onChange={(e) => setConnectionForm({
                    ...connectionForm,
                    username: e.target.value
                  })}
                  className="w-full px-4 py-2 bg-gray-700 text-white rounded"
                  placeholder="admin"
                />
              </div>
              
              <div>
                <label className="block text-gray-300 mb-2">Password</label>
                <input
                  type="password"
                  value={connectionForm.password}
                  onChange={(e) => setConnectionForm({
                    ...connectionForm,
                    password: e.target.value
                  })}
                  className="w-full px-4 py-2 bg-gray-700 text-white rounded"
                />
              </div>
              
              <div>
                <label className="block text-gray-300 mb-2">Protocol</label>
                <select
                  value={connectionForm.protocol}
                  onChange={(e) => setConnectionForm({
                    ...connectionForm,
                    protocol: e.target.value
                  })}
                  className="w-full px-4 py-2 bg-gray-700 text-white rounded"
                >
                  <option value="ssh">SSH</option>
                  <option value="telnet">Telnet</option>
                </select>
              </div>
            </div>
            
            <button
              onClick={handleConnect}
              disabled={loading}
              className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Connecting...' : 'Connect'}
            </button>
          </div>
        ) : (
          // Terminal
          <div className="bg-gray-800 rounded-lg shadow-xl overflow-hidden">
            {/* Terminal Header */}
            <div className="bg-gray-700 px-4 py-3 flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="ml-4 text-gray-300 font-mono text-sm">
                  {connectionForm.host} - {sessionId}
                </span>
              </div>
              
              <button
                onClick={handleDisconnect}
                className="px-4 py-1 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Disconnect
              </button>
            </div>
            
            {/* Terminal Output */}
            <div
              ref={outputRef}
              className="bg-black p-4 h-96 overflow-y-auto font-mono text-sm"
            >
              {output.map((line, index) => (
                <div
                  key={index}
                  className={`mb-2 ${
                    line.type === 'command' ? 'text-green-400' :
                    line.type === 'error' ? 'text-red-400' :
                    line.type === 'success' ? 'text-blue-400' :
                    line.type === 'info' ? 'text-yellow-400' :
                    'text-gray-300'
                  }`}
                >
                  {line.text}
                </div>
              ))}
              
              {loading && (
                <div className="text-gray-500">
                  <span className="animate-pulse">Executing...</span>
                </div>
              )}
            </div>
            
            {/* Command Input */}
            <form onSubmit={handleExecuteCommand} className="bg-gray-700 p-4">
              <div className="flex space-x-2">
                <span className="text-green-400 font-mono">$</span>
                <input
                  type="text"
                  value={command}
                  onChange={(e) => setCommand(e.target.value)}
                  className="flex-1 bg-transparent text-white font-mono outline-none"
                  placeholder="Enter command..."
                  disabled={loading}
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

---

## 📋 **Continued in next part...**

Yeh bahut bada topic hai. Main agle message mein:
1. Complete setup guide
2. Security best practices
3. Common router commands
4. Error handling
5. Production deployment

Kya main continue karun? 🚀
