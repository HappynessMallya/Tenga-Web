# Web Deployment Guide for Tenga Laundry App

This guide explains how to build and deploy your Expo SDK 52 web app to Vercel or Netlify.

## Prerequisites

- Node.js 16+ installed
- Expo CLI installed (`npm install -g expo-cli` or use `npx`)
- Git repository set up (for deployment)

## Building for Web

### Development

To start the development server for web:

```bash
npm run web
# or
npx expo start --web
```

This will start the Metro bundler and open your app in the browser at `http://localhost:8081` (or the next available port).

### Production Build

To create a production build for web:

```bash
npm run web:build
# or
npx expo export --platform web
```

This will generate a `dist/` folder containing all the static files needed for deployment.

## Deployment Options

### Option 1: Deploy to Vercel

Vercel is the easiest option for deploying Expo web apps.

#### Method A: Using Vercel CLI

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Build your app:
   ```bash
   npm run web:build
   ```

3. Deploy:
   ```bash
   cd dist
   vercel
   ```

   Or deploy from the root directory:
   ```bash
   vercel --cwd dist
   ```

#### Method B: Using Vercel Dashboard (Recommended)

1. Push your code to GitHub, GitLab, or Bitbucket.

2. Go to [vercel.com](https://vercel.com) and sign in.

3. Click "New Project" and import your repository.

4. Configure the project:
   - **Framework Preset**: Other
   - **Root Directory**: `./` (or leave default)
   - **Build Command**: `npm run web:build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

5. Add environment variables (if needed):
   - Go to Project Settings → Environment Variables
   - Add any `EXPO_PUBLIC_*` variables from your `.env` file

6. Click "Deploy"

7. Vercel will automatically deploy on every push to your main branch.

#### Vercel Configuration File (Optional)

Create a `vercel.json` in your project root:

```json
{
  "buildCommand": "npm run web:build",
  "outputDirectory": "dist",
  "devCommand": "npm run web",
  "installCommand": "npm install",
  "framework": null,
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### Option 2: Deploy to Netlify

#### Method A: Using Netlify CLI

1. Install Netlify CLI:
   ```bash
   npm install -g netlify-cli
   ```

2. Build your app:
   ```bash
   npm run web:build
   ```

3. Deploy:
   ```bash
   netlify deploy --prod --dir=dist
   ```

#### Method B: Using Netlify Dashboard

1. Push your code to GitHub, GitLab, or Bitbucket.

2. Go to [netlify.com](https://netlify.com) and sign in.

3. Click "Add new site" → "Import an existing project"

4. Select your repository.

5. Configure build settings:
   - **Build command**: `npm run web:build`
   - **Publish directory**: `dist`
   - **Base directory**: (leave empty or set to root)

6. Add environment variables (if needed):
   - Go to Site settings → Environment variables
   - Add any `EXPO_PUBLIC_*` variables

7. Click "Deploy site"

#### Netlify Configuration File

Create a `netlify.toml` in your project root:

```toml
[build]
  command = "npm run web:build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Option 3: Deploy to Other Static Hosting

You can deploy the `dist/` folder to any static hosting service:

- **GitHub Pages**: Push `dist/` contents to `gh-pages` branch
- **AWS S3 + CloudFront**: Upload `dist/` to S3 bucket
- **Firebase Hosting**: Use `firebase deploy --only hosting`
- **Surge.sh**: `surge dist/`
- **Any web server**: Upload `dist/` contents to your server

## Environment Variables

Make sure to set all required environment variables in your hosting platform:

- `EXPO_PUBLIC_API_BASE_URL`
- `EXPO_PUBLIC_API_URL`
- Any other `EXPO_PUBLIC_*` variables

These should be set in your hosting platform's environment variable settings.

## Troubleshooting

### Build Fails

1. Clear cache and rebuild:
   ```bash
   npm run start:clear
   npm run web:build
   ```

2. Check for platform-specific code that might not work on web:
   - Look for `Platform.OS !== 'web'` checks
   - Ensure all native modules have web fallbacks

### Routing Issues (404 on Refresh)

Both Vercel and Netlify configurations above include redirect rules to handle client-side routing. If you still see 404 errors:

- **Vercel**: Ensure the `rewrites` rule in `vercel.json` is correct
- **Netlify**: Ensure the `redirects` rule in `netlify.toml` is correct

### Assets Not Loading

1. Check that all assets are in the `assets/` folder
2. Ensure asset paths are relative (not absolute)
3. Verify the `dist/` folder contains all necessary files

### Performance Optimization

For better performance:

1. Enable compression on your hosting platform
2. Use CDN for static assets
3. Consider enabling caching headers
4. Optimize images before deployment

## Continuous Deployment

Both Vercel and Netlify support automatic deployments:

- **Vercel**: Automatically deploys on push to connected branch
- **Netlify**: Automatically deploys on push to main branch (configurable)

## Custom Domain

Both platforms allow you to add a custom domain:

- **Vercel**: Project Settings → Domains
- **Netlify**: Site Settings → Domain Management

## Monitoring

- **Vercel**: Built-in analytics and monitoring
- **Netlify**: Built-in analytics (paid plans)

## Additional Resources

- [Expo Web Documentation](https://docs.expo.dev/workflow/web/)
- [Vercel Documentation](https://vercel.com/docs)
- [Netlify Documentation](https://docs.netlify.com/)

