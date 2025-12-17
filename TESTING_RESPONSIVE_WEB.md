# Testing Responsive Design on Web

Quick guide to test the responsive design features in your web browser.

## 🚀 Start the Web Server

```bash
# Install dependencies (if not already done)
npm install

# Start the web development server
npm run web
```

The app will open in your default browser at `http://localhost:8081` (or similar port).

## 🔍 Testing Different Screen Sizes

### Method 1: Chrome DevTools (Recommended)

1. **Open DevTools**
   - Windows/Linux: Press `F12` or `Ctrl+Shift+I`
   - Mac: Press `Cmd+Option+I`

2. **Toggle Device Toolbar**
   - Windows/Linux: Press `Ctrl+Shift+M`
   - Mac: Press `Cmd+Shift+M`
   - Or click the device icon in DevTools toolbar

3. **Test These Sizes:**

   **Mobile Portrait (xs)**
   - Select "iPhone SE" (375px width)
   - Navigate to payment screen
   - ✓ Content should use full width
   - ✓ Single column layout
   - ✓ Smaller font sizes
   - ✓ Compact padding

   **Mobile Landscape (sm)**
   - Select "iPhone 12 Pro" and rotate (844px width)
   - ✓ Slightly increased padding
   - ✓ Better spacing

   **Tablet (md)**
   - Select "iPad" (768px width)
   - ✓ Content starts to center
   - ✓ Max-width: 720px
   - ✓ Increased padding
   - ✓ Larger fonts

   **Desktop (lg)**
   - Select "Responsive" and set to 1024px width
   - ✓ Content centered with max-width: 960px
   - ✓ More generous padding
   - ✓ Optimal reading width
   - ✓ Modals sized appropriately

   **Large Desktop (xl)**
   - Set to 1280px or 1440px width
   - ✓ Content max-width: 1140px
   - ✓ Maximum padding
   - ✓ Professional layout
   - ✓ No awkward stretching

   **4K / Extra Large (2xl)**
   - Set to 1920px width
   - ✓ Content max-width: 1320px
   - ✓ Content doesn't stretch awkwardly
   - ✓ Excellent readability

### Method 2: Manual Browser Resizing

1. Open the app in your browser
2. Press `F11` to exit fullscreen (if needed)
3. Manually resize the browser window
4. Watch the layout adapt in real-time

### Method 3: Multiple Browser Windows

1. Open multiple browser windows side by side
2. Resize each to different widths
3. Compare layouts simultaneously

## 📱 What to Look For

### ✅ Good Responsive Design

**Mobile (xs/sm)**
- Full-width content usage
- Single-column layouts
- Touch-friendly button sizes (minimum 44x44px)
- Readable text (14-16px base)
- Appropriate spacing (16-20px padding)

**Tablet (md)**
- Content starts centering
- 2-column grids where appropriate
- Better spacing (24px padding)
- Slightly larger text (16-18px)
- Modals not too wide (600px max)

**Desktop (lg+)**
- Content centered with max-width (960-1320px)
- 3-4 column grids where appropriate
- Generous spacing (32-40px padding)
- Larger, more readable text (18-20px headings)
- Modals sized for desktop (650-700px)
- No awkward stretching on wide screens

### ❌ Common Issues to Check

1. **Text too small on mobile** → Should be at least 14px
2. **Content too wide on desktop** → Should have max-width
3. **Buttons too small on mobile** → Should be touch-friendly
4. **Modals too wide on desktop** → Should constrain width
5. **Padding inconsistent** → Should scale with screen size
6. **Text lines too long** → Should max out around 960px

## 🎯 Specific Screens to Test

### Payment Screen (`/payment`)
This screen has been fully updated with responsive design:

**Mobile (< 768px)**
- Check header layout
- Verify phone input is full-width
- Check button is touch-friendly
- Verify modal takes most of screen

**Tablet (768-1024px)**
- Content should start centering
- Cards should have nice spacing
- Modal should be narrower (600px)

**Desktop (1024px+)**
- Content centered with max-width
- Header centered
- Footer/button bar centered
- Modals sized appropriately (650-700px)
- No awkward empty space

### Other Screens to Update

After testing the payment screen, you can apply the same patterns to:
- Order summary
- Service selection
- Account settings
- Order tracking
- All other customer screens

## 🛠️ Developer Tools Tips

### View Current Breakpoint

Add this to any screen temporarily:

```typescript
const { breakpoint, width, isMobile, isTablet, isDesktop } = useResponsive();

console.log('Current breakpoint:', breakpoint);
console.log('Width:', width);
console.log('Device type:', { isMobile, isTablet, isDesktop });
```

### Responsive Debug Overlay

You can add a debug overlay to see current breakpoint:

```typescript
<View style={{
  position: 'absolute',
  top: 10,
  right: 10,
  backgroundColor: 'rgba(0,0,0,0.7)',
  padding: 8,
  borderRadius: 4,
}}>
  <Text style={{ color: 'white', fontSize: 12 }}>
    {breakpoint} | {Math.round(width)}px
  </Text>
</View>
```

## 📊 Breakpoint Reference

| Breakpoint | Width | Max Content | Use Case |
|------------|-------|-------------|----------|
| xs | 0-640px | 100% | Mobile portrait |
| sm | 640-768px | 100% | Mobile landscape |
| md | 768-1024px | 720px | Tablet |
| lg | 1024-1280px | 960px | Desktop |
| xl | 1280-1536px | 1140px | Large desktop |
| 2xl | 1536px+ | 1320px | Extra large |

## 🎨 Visual Testing Checklist

### Layout
- [ ] Content doesn't stretch awkwardly on large screens
- [ ] Content is properly centered on desktop
- [ ] Max-width constraints applied correctly
- [ ] Spacing scales appropriately

### Typography
- [ ] Font sizes are readable at all breakpoints
- [ ] Line lengths are optimal (45-75 characters)
- [ ] Headings scale proportionally
- [ ] Text remains readable when zoomed

### Interactive Elements
- [ ] Buttons are touch-friendly on mobile (44x44px minimum)
- [ ] Touch targets have adequate spacing
- [ ] Hover states work on desktop
- [ ] Focus states are visible

### Components
- [ ] Cards have appropriate padding at each size
- [ ] Modals are properly sized (not too wide/narrow)
- [ ] Forms are easy to use at all sizes
- [ ] Navigation adapts appropriately

### Images & Media
- [ ] Images scale properly
- [ ] Icons remain crisp
- [ ] No pixelation or distortion

## 🐛 Common Issues & Fixes

### Content Not Centering
**Problem:** Content stays full-width on desktop  
**Fix:** Wrap in `<ResponsiveLayout>`

### Modal Too Wide
**Problem:** Modal stretches to full width on desktop  
**Fix:** Add responsive width:
```typescript
const modalWidth = getValue({
  xs: '90%',
  md: '600px',
  lg: '700px',
}) || '90%';
```

### Inconsistent Padding
**Problem:** Padding is same on all devices  
**Fix:** Use `useResponsivePadding()` hook

### Text Too Small/Large
**Problem:** Font size doesn't scale  
**Fix:** Use `getValue()` or `useResponsiveFontSize()`

## 📱 Mobile Browser Testing

### iOS Safari
```bash
# On your Mac (requires iPhone on same network)
# 1. Enable Web Inspector on iPhone (Settings > Safari > Advanced)
# 2. Connect iPhone to Mac
# 3. Open Safari on Mac > Develop > [Your iPhone]
```

### Android Chrome
```bash
# Use Chrome DevTools remote debugging
# 1. Enable USB debugging on Android
# 2. Connect via USB
# 3. Open chrome://inspect in Chrome
```

## 🚀 Production Testing

Before deploying:

1. Test on real devices:
   - iPhone (Safari)
   - Android phone (Chrome)
   - iPad (Safari)
   - Desktop (Chrome, Firefox, Safari, Edge)

2. Test common scenarios:
   - Creating an order
   - Making a payment
   - Viewing order history
   - Updating profile

3. Check performance:
   - Layout shift should be minimal
   - No lag when resizing
   - Smooth animations

## 📚 Resources

- **Full Guide:** `RESPONSIVE_DESIGN_GUIDE.md`
- **Implementation Summary:** `RESPONSIVE_DESIGN_IMPLEMENTATION_SUMMARY.md`
- **Example Code:** `app/components/examples/ResponsiveExample.tsx`
- **Updated Screen:** `app/(customer)/payment.tsx`

## ✅ Final Checklist

Before marking responsive design as complete:

- [ ] Tested all breakpoints (xs, sm, md, lg, xl, 2xl)
- [ ] Content centers properly on desktop
- [ ] Modals sized appropriately
- [ ] Typography scales well
- [ ] Touch targets adequate on mobile
- [ ] No horizontal scrolling at any size
- [ ] Navigation works at all sizes
- [ ] Forms are usable at all sizes
- [ ] Images/icons look good
- [ ] Performance is good (no lag)

---

**Happy Testing!** 🎉

If you find any issues, refer to the troubleshooting section in `RESPONSIVE_DESIGN_GUIDE.md`.


