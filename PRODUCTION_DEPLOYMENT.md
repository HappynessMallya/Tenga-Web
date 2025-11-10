# Production Deployment Guide

## Overview

The proxy server (`scripts/dev-proxy.js`) is **only for development**. In production, you have several options to handle CORS:

## ✅ Option 1: Configure CORS on Backend (Recommended)

**Best practice** - Configure your backend API to allow requests from your production domain.

### Backend CORS Configuration Example

If your backend is Express.js:
```javascript
const cors = require('cors');

app.use(cors({
  origin: [
    'https://yourdomain.com',
    'https://www.yourdomain.com',
    'https://tengalaundry.app' // Your production domain
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

**Advantages:**
- ✅ No additional infrastructure needed
- ✅ Direct API calls (faster)
- ✅ Standard approach
- ✅ Works with any hosting platform

**Current Setup:**
Your app already uses direct API URL in production (see `app/api/axiosInstance.ts` line 29-34).

---

## ✅ Option 2: Vercel/Netlify Rewrites (Easy)

If you're deploying to **Vercel** or **Netlify**, use their built-in proxy/rewrite feature.

### For Vercel

Create `vercel.json` in your project root:

```json
{
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://lk-7ly1.onrender.com/api/:path*"
    }
  ]
}
```

Then update your production API URL to use relative paths:
```javascript
// In production, use relative path
const apiUrl = '/api'; // This will be proxied by Vercel
```

### For Netlify

Create `netlify.toml` in your project root:

```toml
[[redirects]]
  from = "/api/*"
  to = "https://lk-7ly1.onrender.com/api/:splat"
  status = 200
  force = true
```

**Advantages:**
- ✅ No code changes needed (just config)
- ✅ Free with Vercel/Netlify
- ✅ Automatic HTTPS
- ✅ Same-origin requests (no CORS)

---

## ✅ Option 3: Deploy Proxy as Separate Service

If you need the proxy in production, deploy it as a separate service.

### Deploy Proxy to Railway/Render/Fly.io

1. **Create a separate repo/folder for the proxy:**

```javascript
// proxy-server/index.js
const http = require('http');
const https = require('https');
const { URL } = require('url');

const PROXY_PORT = process.env.PORT || 3001;
const API_BASE_URL = process.env.API_BASE_URL || 'https://lk-7ly1.onrender.com';

// ... (copy from scripts/dev-proxy.js)

server.listen(PROXY_PORT, () => {
  console.log(`✅ Proxy running on port ${PROXY_PORT}`);
});
```

2. **Deploy to Railway/Render:**
   - Create new service
   - Point to proxy code
   - Set `API_BASE_URL` environment variable
   - Get proxy URL (e.g., `https://tenga-proxy.railway.app`)

3. **Update production API URL:**
   ```bash
   EXPO_PUBLIC_API_BASE_URL=https://tenga-proxy.railway.app/api
   ```

**Advantages:**
- ✅ Full control
- ✅ Can add rate limiting, caching, etc.
- ✅ Works with any frontend hosting

**Disadvantages:**
- ❌ Additional service to maintain
- ❌ Extra cost

---

## ✅ Option 4: Use API Gateway/CDN

Use services like:
- **Cloudflare Workers** (free tier available)
- **AWS API Gateway**
- **Google Cloud Endpoints**

These can proxy and add CORS headers automatically.

---

## 🎯 Recommended Approach

**For most cases: Option 1 (Backend CORS) + Option 2 (Vercel/Netlify rewrites)**

1. **Configure CORS on backend** (allows direct API calls)
2. **Use Vercel/Netlify rewrites** as backup (same-origin proxy)

This gives you:
- ✅ Direct API calls when CORS works
- ✅ Proxy fallback if needed
- ✅ No additional services
- ✅ Best performance

---

## 📝 Current Production Configuration

Your app is already configured for production:

```typescript
// app/api/axiosInstance.ts
if (Platform.OS === 'web') {
  const isDev = __DEV__ || process.env.NODE_ENV === 'development';
  
  if (isDev) {
    // Development: Use proxy
    return 'http://localhost:3001/api';
  }
  
  // Production: Use direct API URL
  return process.env.EXPO_PUBLIC_API_BASE_URL || 'https://lk-7ly1.onrender.com/api';
}
```

**What you need to do:**

1. **Set production environment variable:**
   ```bash
   EXPO_PUBLIC_API_BASE_URL=https://lk-7ly1.onrender.com/api
   ```

2. **Configure CORS on your backend** (Option 1) OR

3. **Use Vercel/Netlify rewrites** (Option 2)

---

## 🚀 Deployment Checklist

- [ ] Set `EXPO_PUBLIC_API_BASE_URL` in production environment
- [ ] Configure CORS on backend OR set up Vercel/Netlify rewrites
- [ ] Test API calls in production
- [ ] Verify no CORS errors in browser console
- [ ] Test authentication flow
- [ ] Test all API endpoints

---

## 🔍 Testing Production Build Locally

Test production build before deploying:

```bash
# Build production web app
npm run web:build

# Serve the built files
npx serve dist

# Test in browser
# Open http://localhost:3000
# Check Network tab for API calls
```

---

## 📚 Additional Resources

- [Vercel Rewrites Documentation](https://vercel.com/docs/configuration/routes/rewrites)
- [Netlify Redirects Documentation](https://docs.netlify.com/routing/redirects/)
- [CORS Explained](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)

