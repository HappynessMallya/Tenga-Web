# CORS Setup Guide for Web

If you're seeing "Unable to connect to the server" errors when trying to login on web, this is likely a **CORS (Cross-Origin Resource Sharing)** issue.

## What is CORS?

CORS is a browser security feature that blocks requests from one domain to another unless the server explicitly allows it. When your web app (running on `localhost:8081` or your domain) tries to make requests to your API server (e.g., `https://lk-7ly1.onrender.com`), the browser checks if the server allows cross-origin requests.

## Solution: Configure CORS on Your API Server

Your API server needs to include CORS headers in its responses. Here's what needs to be configured:

### Required CORS Headers

The server should respond with these headers:

```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS, PATCH
Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With
Access-Control-Allow-Credentials: false
```

### For Specific Domains (More Secure)

Instead of `*`, you can specify your web domain:

```
Access-Control-Allow-Origin: https://yourdomain.com
Access-Control-Allow-Origin: http://localhost:8081  (for development)
```

### Example Server Configuration

#### Express.js / Node.js

```javascript
const cors = require('cors');

app.use(cors({
  origin: ['http://localhost:8081', 'https://yourdomain.com'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false
}));
```

#### Python (Flask)

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

#### Python (Django)

```python
# settings.py
CORS_ALLOWED_ORIGINS = [
    "http://localhost:8081",
    "https://yourdomain.com",
]

CORS_ALLOW_METHODS = [
    'DELETE',
    'GET',
    'OPTIONS',
    'PATCH',
    'POST',
    'PUT',
]

CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
]
```

## Testing CORS

You can test if CORS is configured correctly using:

1. **Browser DevTools**: Check the Network tab for CORS errors
2. **cURL**:
   ```bash
   curl -H "Origin: http://localhost:8081" \
        -H "Access-Control-Request-Method: POST" \
        -H "Access-Control-Request-Headers: Content-Type,Authorization" \
        -X OPTIONS \
        https://lk-7ly1.onrender.com/api/auth/login
   ```

3. **Online CORS Tester**: Use tools like https://www.test-cors.org

## Temporary Workaround (Development Only)

If you can't modify the server immediately, you can use a proxy during development:

### Option 1: Use Expo's Proxy (if available)

Add to `app.config.js`:
```javascript
web: {
  bundler: 'metro',
  proxy: {
    '/api': {
      target: 'https://lk-7ly1.onrender.com',
      changeOrigin: true,
    }
  }
}
```

### Option 2: Use a Local Proxy Server

Create a simple proxy server or use tools like:
- `http-proxy-middleware` for Node.js
- `cors-anywhere` (temporary development only)

## Current Configuration

The app is configured to:
- ✅ Use AsyncStorage on web (instead of SecureStore)
- ✅ Handle CORS errors with better error messages
- ✅ Not send credentials (`withCredentials: false`)
- ✅ Use the API URL from environment variables

## Next Steps

1. **Check your API server logs** - Look for CORS-related errors
2. **Verify API URL** - Make sure `EXPO_PUBLIC_API_BASE_URL` is set correctly
3. **Test API directly** - Try accessing the API endpoint directly in a browser
4. **Configure CORS on server** - Add the CORS headers mentioned above

## Debugging

Check the browser console for:
- CORS error messages
- Network request details
- API URL being used
- Response headers from the server

The updated axios configuration will now log more detailed information about CORS issues in the browser console.

