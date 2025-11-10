# CORS Debugging Guide

## Current Issue
You're seeing CORS errors and can't see network responses in the browser. This means the browser is blocking requests before they reach the server.

## Quick Solutions

### Option 1: Use Development Proxy (Recommended for Development)

1. **Start the proxy server:**
   ```bash
   npm run web:proxy
   ```

2. **Update your `.env` file:**
   ```
   EXPO_PUBLIC_API_BASE_URL=http://localhost:3001/api
   ```

3. **In a new terminal, start the web app:**
   ```bash
   npm run web
   ```

The proxy server will:
- Forward requests to your API server
- Add CORS headers automatically
- Allow you to see requests in the browser Network tab

### Option 2: Check Browser Network Tab

1. Open browser DevTools (F12)
2. Go to **Network** tab
3. Check for:
   - **Red/failed requests** - These are blocked by CORS
   - **OPTIONS requests** - Preflight requests (should return 200)
   - **Request headers** - Check what's being sent
   - **Response headers** - Check if CORS headers are present

### Option 3: Test API Directly

Open your browser and try accessing:
```
https://lk-7ly1.onrender.com/api/auth/signIn
```

If you see a response, the API is working. If you see a CORS error, the server needs CORS configuration.

### Option 4: Use Browser Extension (Development Only)

Install a CORS browser extension like:
- **CORS Unblock** (Chrome)
- **CORS Toggle** (Firefox)

⚠️ **Warning**: Only use this for development! Never use in production.

## Check What's Happening

### In Browser Console

Look for these messages:
- `🌐 API Base URL configured:` - Shows the API URL being used
- `🔐 AxiosInterceptor: Request interceptor triggered` - Request is being made
- `🚫 CORS Error Detected!` - CORS error details

### In Network Tab

1. Filter by **XHR** or **Fetch**
2. Look for your API endpoint
3. Check the **Status** column:
   - **Red/CORS error** = Blocked by browser
   - **200/201** = Success (but might still have CORS issues)
   - **404/500** = Server error (not CORS)

4. Click on the request and check:
   - **Headers** tab → **Request Headers** - What's being sent
   - **Headers** tab → **Response Headers** - Look for `Access-Control-*` headers
   - **Preview/Response** tab - The actual response (if not blocked)

## Common CORS Issues

### Issue 1: Preflight OPTIONS Request Failing

**Symptom**: You see an OPTIONS request that fails

**Solution**: Server needs to handle OPTIONS requests:
```javascript
// Server should respond to OPTIONS with:
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
```

### Issue 2: No CORS Headers in Response

**Symptom**: Request shows in Network tab but fails with CORS error

**Solution**: Server needs to add CORS headers to all responses

### Issue 3: Credentials Issue

**Symptom**: Error mentions "credentials"

**Solution**: We've already set `withCredentials: false` in the axios config

## Server-Side Fix (Permanent Solution)

Your API server at `https://lk-7ly1.onrender.com` needs to add CORS middleware.

### Example for Express.js:

```javascript
const cors = require('cors');

app.use(cors({
  origin: ['http://localhost:8081', 'http://localhost:19006', 'https://yourdomain.com'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false
}));
```

### Example for Python (Flask):

```python
from flask_cors import CORS

CORS(app, resources={
    r"/api/*": {
        "origins": ["http://localhost:8081", "https://yourdomain.com"],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})
```

## Testing CORS

### Test with cURL:

```bash
curl -H "Origin: http://localhost:8081" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: Content-Type,Authorization" \
     -X OPTIONS \
     https://lk-7ly1.onrender.com/api/auth/signIn \
     -v
```

Look for `Access-Control-Allow-Origin` in the response headers.

## Next Steps

1. **Try the proxy server first** (Option 1) - This will work immediately
2. **Check the Network tab** to see what's actually happening
3. **Contact your backend team** to add CORS headers to the API server
4. **For production**, ensure the server has proper CORS configuration

## Debugging Commands

```bash
# Start proxy server
npm run web:proxy

# In another terminal, start web app
npm run web

# Or use concurrently (if installed)
npm run web:dev
```

The proxy server will log all requests, making it easier to debug.

