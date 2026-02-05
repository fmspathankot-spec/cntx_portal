# Tejas Monitoring Setup Guide

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     CNTX Portal (Next.js)                   │
│                        Port: 3000                            │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Frontend (React)                                    │   │
│  │  - Tejas Monitoring Dashboard                        │   │
│  │  - Router Selection                                  │   │
│  │  - Data Visualization                                │   │
│  └──────────────────┬───────────────────────────────────┘   │
│                     │ HTTP API Calls                        │
│  ┌──────────────────▼───────────────────────────────────┐   │
│  │  Next.js API Routes (Proxy Layer)                    │   │
│  │  - /api/tejas/live/ospf                              │   │
│  │  - /api/tejas/live/bgp                               │   │
│  │  - /api/tejas/live/sfp                               │   │
│  └──────────────────┬───────────────────────────────────┘   │
└────────────────────┬┬───────────────────────────────────────┘
                     ││ HTTP Proxy
                     ││
┌────────────────────▼▼───────────────────────────────────────┐
│              Python Backend (Flask/FastAPI)                  │
│                     Port: 8000                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  SSH Client (Paramiko)                              │   │
│  │  - Connection Management                             │   │
│  │  - Command Execution                                 │   │
│  │  - Terminal Configuration (conf t, pagination off)   │   │
│  └──────────────────┬───────────────────────────────────┘   │
└────────────────────┬┬───────────────────────────────────────┘
                     ││ SSH Protocol
                     ││
┌────────────────────▼▼───────────────────────────────────────┐
│                   Tejas Routers                              │
│  - GDP-TX (10.125.0.8)                                       │
│  - GDP-RX (10.125.0.9)                                       │
│  - Other routers...                                          │
└──────────────────────────────────────────────────────────────┘
```

---

## Why Python Backend for SSH?

### ✅ Advantages:
1. **Paramiko Library** - Industry standard, battle-tested SSH library
2. **Better Error Handling** - Mature SSH implementation
3. **Reliability** - Proven in production environments
4. **Separation of Concerns** - Backend handles infrastructure, frontend handles UI
5. **Scalability** - Can scale independently
6. **Easier Debugging** - SSH issues easier to troubleshoot

### ❌ Node.js SSH (Not Used):
- Less mature SSH libraries (ssh2)
- Can block event loop
- Harder to debug SSH issues
- Not industry standard for network operations

---

## Setup Instructions

### 1. Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Edit `.env.local` and set:

```env
# Python Backend URL
PYTHON_BACKEND_URL=http://localhost:8000

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/cntx_portal
```

---

### 2. Start Python Backend

```bash
# Navigate to Python backend directory
cd backend

# Install dependencies
pip install -r requirements.txt

# Start server
python app.py
```

**Expected output:**
```
 * Running on http://localhost:8000
 * Debug mode: on
```

---

### 3. Start Next.js Frontend

```bash
# In project root
npm run dev
```

**Expected output:**
```
  ▲ Next.js 14.x.x
  - Local:        http://localhost:3000
  - Ready in 2.3s
```

---

### 4. Verify Setup

#### Test Python Backend:
```bash
curl http://localhost:8000/health
```

Expected response:
```json
{
  "status": "ok",
  "service": "tejas-monitoring-backend"
}
```

#### Test Next.js Proxy:
```bash
curl http://localhost:3000/api/tejas/live/ospf?routerId=16
```

Expected response:
```json
{
  "success": true,
  "router": {
    "id": 16,
    "hostname": "GDP-TX",
    "ip_address": "10.125.0.8"
  },
  "data": {
    "neighbor_count": 2,
    "neighbors": [...]
  }
}
```

---

## API Flow

### Example: Fetching OSPF Data

```
1. User clicks "Fetch Live Data" in frontend
   ↓
2. Frontend calls: GET /api/tejas/live/ospf?routerId=16
   ↓
3. Next.js API Route (Proxy):
   - Validates routerId
   - Forwards to Python backend
   ↓
4. Python Backend:
   - Fetches router credentials from database
   - Establishes SSH connection
   - Executes: conf t → set cli pagination off → end → show ip ospf neighbor
   - Parses output
   - Returns JSON
   ↓
5. Next.js API Route:
   - Receives Python response
   - Returns to frontend
   ↓
6. Frontend:
   - Displays data in cards
   - Shows OSPF neighbors
```

---

## SSH Command Sequence

Python backend executes commands in this order:

```bash
# 1. Enter configuration mode
conf t

# 2. Disable pagination (important for proper output)
set cli pagination off

# 3. Exit configuration mode
end

# 4. Execute actual command
show ip ospf neighbor
# OR
show ip bgp summary
# OR
show sfp 100g 1/5/11

# 5. Exit session
exit
```

---

## Troubleshooting

### Error: "Python backend not available"

**Cause:** Python backend is not running

**Solution:**
```bash
cd backend
python app.py
```

---

### Error: "Router credentials not configured"

**Cause:** Router doesn't have credentials in database

**Solution:**
```sql
-- Check router credentials
SELECT r.hostname, rc.username 
FROM routers r 
LEFT JOIN router_credentials rc ON r.credential_id = rc.id 
WHERE r.id = 16;

-- Add credentials if missing
INSERT INTO router_credentials (username, password) 
VALUES ('admin', 'your_password');

UPDATE routers 
SET credential_id = (SELECT id FROM router_credentials WHERE username = 'admin')
WHERE id = 16;
```

---

### Error: "SSH connection timeout"

**Cause:** Router not reachable or wrong IP/port

**Solution:**
1. Verify router IP: `ping 10.125.0.8`
2. Check SSH port: `telnet 10.125.0.8 22`
3. Verify credentials in database
4. Check firewall rules

---

## Performance

### Single SSH Session Approach:

**Before (Multiple Sessions):**
- OSPF: 1 SSH session
- BGP: 1 SSH session  
- SFP (3 interfaces): 3 SSH sessions
- **Total: 5 sessions, ~25 seconds**

**After (Single Session):**
- All commands in 1 SSH session
- **Total: 1 session, ~8 seconds**
- **3x faster!**

---

## File Structure

```
cntx_portal/
├── app/
│   └── api/
│       └── tejas/
│           └── live/
│               ├── ospf/route.js    # Proxy to Python
│               ├── bgp/route.js     # Proxy to Python
│               └── sfp/route.js     # Proxy to Python
├── lib/
│   ├── ssh-client.js                # NOT USED (backup only)
│   └── ssh-client.js.backup-nodejs  # Node.js SSH backup
├── docs/
│   └── TEJAS_MONITORING_SETUP.md    # This file
└── .env.example                      # Environment variables template

backend/                              # Python Backend (separate repo/folder)
├── app.py                           # Flask/FastAPI app
├── ssh_client.py                    # Paramiko SSH client
├── parsers.py                       # Output parsers
└── requirements.txt                 # Python dependencies
```

---

## Security Notes

1. **Never commit credentials** to git
2. **Use environment variables** for sensitive data
3. **Rotate passwords** regularly
4. **Use SSH keys** instead of passwords (recommended)
5. **Limit SSH access** to specific IPs
6. **Monitor SSH logs** for suspicious activity

---

## Future Improvements

1. **Connection Pooling** - Reuse SSH connections
2. **Caching** - Cache router data for 30 seconds
3. **WebSocket** - Real-time updates
4. **SSH Keys** - Replace password authentication
5. **Rate Limiting** - Prevent API abuse
6. **Monitoring** - Track SSH connection health

---

## Support

For issues or questions:
1. Check logs: `tail -f backend/logs/app.log`
2. Verify environment variables
3. Test Python backend directly
4. Check database connectivity
5. Review SSH connection logs
