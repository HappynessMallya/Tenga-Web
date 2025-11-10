# CORS Proxy Setup Guide

## Quick Start

The proxy server solves CORS issues by running on the same origin as your web app, so the browser doesn't block requests.

### Option 1: Run Both Together (Easiest) ⭐

```bash
npm run web:dev
```

This starts both the proxy server and the web app automatically.

### Option 2: Run Separately

**Terminal 1** - Start the proxy:
```bash
npm run web:proxy
```

You should see:
```
🚀 Starting CORS Proxy Server...
📡 Proxying to: https://lk-7ly1.onrender.com
🌐 Proxy listening on: http://localhost:3001
✅ CORS Proxy Server running on http://localhost:3001
```

**Terminal 2** - Start the web app:
```bash
npm run web
```

## How It Works

1. **Web app** (localhost:8081) makes requests to **proxy** (localhost:3001)
2. **Proxy** forwards requests to your **API** (https://lk-7ly1.onrender.com)
3. **Proxy** adds CORS headers and sends response back to web app
4. Browser sees same-origin request (no CORS block!)

## Troubleshooting

### "Provisional headers are shown" error
- **Cause**: Proxy server is not running
- **Fix**: Start the proxy with `npm run web:proxy` or use `npm run web:dev`

### "Proxy error" or "502 Bad Gateway"
- **Cause**: Proxy can't connect to your API server
- **Fix**: Check if your API server is running and accessible

### Port 3001 already in use
- **Cause**: Another process is using port 3001
- **Fix**: 
  - Kill the process: `netstat -ano | findstr :3001` then `taskkill /PID <PID> /F`
  - Or change the port in `scripts/dev-proxy.js` (line 18)

## Verify It's Working

1. Start the proxy: `npm run web:proxy`
2. Open browser console (F12)
3. Look for: `🌐 [Web Dev] Using proxy server to avoid CORS: http://localhost:3001/api`
4. Check Network tab - requests should go to `localhost:3001`
5. Check proxy terminal - you should see request logs like:
   ```
   📤 POST /api/auth/signIn -> https://lk-7ly1.onrender.com/api/auth/signIn
   ✅ POST /api/auth/signIn -> 200
   ```

## Production

For production builds, the app will use the direct API URL (no proxy needed). Make sure your production API server has CORS configured properly.

