# 🚀 Vercel Deployment Checklist for Tenga Laundry App

## ✅ Pre-Deployment Checklist

### 1. **Vercel Configuration** ✓
Your `vercel.json` is already configured correctly:
- ✅ Build Command: `npm run web:build`
- ✅ Output Directory: `dist`
- ✅ Rewrites configured for SPA routing
- ✅ API proxy configured
- ✅ CORS headers set

### 2. **Environment Variables to Set in Vercel**

Go to your Vercel project → **Settings** → **Environment Variables** and add:

#### Required Environment Variables:

```
EXPO_PUBLIC_API_BASE_URL=https://lk-7ly1.onrender.com/api
EXPO_PUBLIC_API_URL=https://lk-7ly1.onrender.com/api
```

#### Optional (if you use these features):

```
EXPO_PUBLIC_SUPABASE_URL=your-supabase-url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
BONGO_PAY_API_KEY=your-bongopay-api-key
BONGO_PAY_BASE_URL=https://bongopay.vastlabs.co.tz/api/v1
GOOGLE_MAPS_API_KEY=your-google-maps-api-key
EXPO_PUBLIC_APP_URL=https://your-vercel-app.vercel.app
NODE_ENV=production
```

**Important Notes:**
- Variables prefixed with `EXPO_PUBLIC_` are exposed to client-side code
- Set these for **Production**, **Preview**, and **Development** environments in Vercel
- Never commit sensitive keys to your repository

### 3. **Build Settings in Vercel Dashboard**

When importing your project or in **Settings** → **General**:

- **Framework Preset**: Other (or leave blank)
- **Root Directory**: `./` (project root)
- **Build Command**: `npm run web:build` (already in vercel.json)
- **Output Directory**: `dist` (already in vercel.json)
- **Install Command**: `npm install` (default)

### 4. **Deployment Steps**

#### Option A: Deploy via Vercel Dashboard (Recommended)

1. **Connect Repository:**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub/GitLab/Bitbucket repository
   - Select the repository

2. **Configure Project:**
   - Framework: Other
   - Root Directory: `./` (leave default)
   - Build and Output settings are auto-detected from `vercel.json`

3. **Add Environment Variables:**
   - Click "Environment Variables" section
   - Add all `EXPO_PUBLIC_*` variables from your `.env` file
   - Make sure to set them for Production, Preview, and Development

4. **Deploy:**
   - Click "Deploy"
   - Wait for build to complete
   - Your app will be live at `https://your-project.vercel.app`

#### Option B: Deploy via Vercel CLI

```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel
vercel login

# Deploy (from project root)
vercel

# For production deployment
vercel --prod
```

### 5. **Post-Deployment Verification**

After deployment, verify:

- [ ] App loads at the Vercel URL
- [ ] API calls work (check browser console for errors)
- [ ] Routing works (try navigating to different pages)
- [ ] Assets load correctly (images, fonts, etc.)
- [ ] No CORS errors in browser console
- [ ] Environment variables are accessible (check Network tab)

### 6. **Troubleshooting**

#### Build Fails with "expo-router" error:
```bash
# Make sure dependencies are installed
npm install
```

#### Build Fails with "Cannot find module 'ajv/dist/compile/codegen'":
✅ **FIXED**: Added `overrides` in `package.json` to ensure compatible versions of `ajv` and `ajv-keywords`.
- The fix is already in your `package.json`
- If you still see this error, delete `node_modules` and `package-lock.json`, then run `npm install` again

#### 404 Errors on Page Refresh:
- ✅ Already handled by `vercel.json` rewrites
- If still happening, check that rewrites are correct

#### API Calls Fail:
- Check CORS settings on your backend API
- Verify `EXPO_PUBLIC_API_BASE_URL` is set correctly
- Check browser console for specific error messages

#### Environment Variables Not Working:
- Make sure variables are prefixed with `EXPO_PUBLIC_` for client-side access
- Redeploy after adding new environment variables
- Check that variables are set for the correct environment (Production/Preview/Development)

### 7. **Continuous Deployment**

Vercel automatically deploys:
- **Production**: On push to your main/master branch
- **Preview**: On push to other branches or pull requests

You can configure this in **Settings** → **Git**

### 8. **Custom Domain**

To add a custom domain:
1. Go to **Settings** → **Domains**
2. Add your domain
3. Follow DNS configuration instructions
4. SSL certificate is automatically provisioned

---

## 📋 Quick Reference

**Build Command:** `npm run web:build`  
**Output Directory:** `dist`  
**Node Version:** 16+ (Vercel auto-detects)  
**Framework:** Expo (Other)

**Key Files:**
- `vercel.json` - Vercel configuration ✓
- `app.config.js` - Expo configuration
- `package.json` - Dependencies and scripts
- `.env` - Local environment variables (not committed)

---

## 🎯 Current Status

✅ `vercel.json` configured  
✅ Build command set  
✅ Output directory set  
✅ Routing configured  
✅ API proxy configured  
✅ CORS headers set  

⚠️ **Action Required:** Set environment variables in Vercel dashboard

---

## 📞 Need Help?

- [Vercel Documentation](https://vercel.com/docs)
- [Expo Web Deployment](https://docs.expo.dev/workflow/web/)
- Check `WEB_DEPLOYMENT.md` for more details

