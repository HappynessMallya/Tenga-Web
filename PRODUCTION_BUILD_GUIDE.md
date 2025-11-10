# 📱 Tenga Laundry - Production Build Guide

## 🚀 Building Production App Bundle for Play Store

### ✅ Pre-Build Checklist

**Current Configuration:**
- ✅ Package Name: `com.tengalaundry.app`
- ✅ Version: `1.1.0`
- ✅ Version Code: `2`
- ✅ Build Type: `app-bundle` (for Play Store)
- ✅ API URL: `https://lk-7ly1.onrender.com/api`

---

## 🔧 Step 1: Login to EAS

```bash
# Login to your Expo account
npx eas login
```

**Enter your Expo account credentials when prompted.**

---

## 🏗️ Step 2: Build Production App Bundle

```bash
# Build production App Bundle (for Play Store)
npx eas build --platform android --profile production
```

**What this does:**
- Creates an `.aab` (Android App Bundle) file
- Signs it with a release key
- Uploads to EAS servers
- Provides download link when complete

**Build time:** 15-30 minutes

---

## 📥 Step 3: Download the App Bundle

After the build completes:
1. EAS will provide a download link
2. Download the `.aab` file
3. Save it securely (you'll need it for Play Store upload)

---

## 📤 Step 4: Upload to Google Play Store

### 4.1 Login to Google Play Console
- Go to: https://play.google.com/console
- Sign in with your Google account
- Create or select your app

### 4.2 Create New App (if first time)
1. Click **"Create App"**
2. Fill in:
   - **App Name:** Tenga Laundry
   - **Default Language:** English
   - **App Type:** App
   - **Free or Paid:** Free
3. Click **"Create"**

### 4.3 Complete Store Listing
**Required Information:**
- 📝 App description (at least 4000 characters)
- 📸 Screenshots (phone: 2 min, 8 max)
- 🎨 Feature graphic (1024x500px)
- 🏷️ App category (Shopping or Lifestyle)
- 📧 Contact email and website
- 🖼️ App icon (512x512px)

### 4.4 Upload App Bundle
1. Go to **"Production"** → **"Create New Release"**
2. Upload your `.aab` file
3. Fill in **Release Notes** (what's new in this version)
4. Click **"Review Release"**

### 4.5 Submit for Review
1. Review all information
2. Complete content rating questionnaire
3. Accept declarations
4. Click **"Start rollout to Production"**

---

## 📋 App Information for Play Store

**Short Description:**
```
Professional laundry and dry-cleaning service at your fingertips
```

**Long Description Template:**
```
Tenga Laundry - Professional Laundry Service

Transform your laundry experience with Tenga Laundry, Tanzania's premier on-demand laundry and dry-cleaning service.

✨ FEATURES:
• Easy Order Placement - Place orders in minutes
• Wash & Fold Services - Clean, fresh clothes delivered
• Dry Cleaning - Professional garment care
• Ironing Services - Perfectly pressed clothes
• Real-time Order Tracking - Know exactly where your order is
• Flexible Pickup & Delivery - Schedule at your convenience
• Secure Payments - Safe and easy payment options

🏠 CONVENIENCE:
• Schedule pickups from your home or office
• Choose your preferred delivery time
• Professional cleaning and care
• Environmentally friendly processes

📱 USER-FRIENDLY:
• Simple, intuitive interface
• Quick reorder for repeat items
• Order history and management
• Push notifications for order updates

🔐 SECURE & RELIABLE:
• Safe payment processing
• Professional service guarantees
• Customer support always available

Perfect for busy professionals, students, and families who want quality laundry services without the hassle.

Download Tenga Laundry today and experience the future of laundry services!
```

---

## 🎨 Required Assets for Play Store

### Screenshots (Required)
- **Phone (16:9 or 9:16):** 2-8 screenshots
- **Tablet (optional):** 2-8 screenshots

**Suggested Screenshots:**
1. Order placement screen
2. Service selection screen
3. Order tracking screen
4. Order confirmation screen
5. Delivery notification

### Feature Graphic
- **Size:** 1024 x 500px
- **Format:** PNG or JPG
- **Purpose:** Shown at the top of your Play Store listing

### App Icon
- **Size:** 512 x 512px
- **Format:** PNG (no transparency)
- **Used:** In store listing and on device

---

## 🚨 Important Notes

### Version Management
- **Version:** Increment `version` in `app.config.js` for each release
- **Version Code:** Always increment `versionCode` (currently: `2`)
- **Build Number:** iOS uses `buildNumber`

### Environment Variables
All production environment variables are configured in:
- **`eas.json`** - Build-time configuration
- **`app.config.js`** - App-level configuration with fallbacks

### Signing
EAS will automatically:
- Generate signing keys
- Sign your app bundle
- Manage key storage securely

**⚠️ Important:** If you need to regenerate keys, contact Expo support.

---

## 🔄 Update Process

### For Future Updates:

1. **Update Version:**
   ```javascript
   // In app.config.js
   version: '1.2.0',  // Update version
   versionCode: 3,     // Increment version code
   ```

2. **Build New Release:**
   ```bash
   npx eas build --platform android --profile production
   ```

3. **Upload to Play Store:**
   - Go to Play Console
   - Create new release
   - Upload new `.aab` file
   - Update release notes
   - Submit for review

---

## 📞 Support Resources

- **EAS Documentation:** https://docs.expo.dev/build-reference/eas-json/
- **Play Console Help:** https://support.google.com/googleplay/android-developer
- **App Configuration:** Check `eas.json` and `app.config.js`

---

## ✅ Build Command Reference

```bash
# Production Build (App Bundle)
npx eas build --platform android --profile production

# Preview Build (APK for Testing)
npx eas build --platform android --profile preview

# Local Development Build
npx expo run:android --variant release

# Check Build Status
npx eas build:list

# View Build Details
npx eas build:view
```

---

## 🎉 Success Checklist

- [ ] EAS account logged in
- [ ] Production build completed
- [ ] App Bundle (.aab) downloaded
- [ ] Google Play Console account created
- [ ] Store listing completed
- [ ] App Bundle uploaded
- [ ] Release submitted to Google
- [ ] App approved and published

**Good luck with your Play Store submission! 🚀**
