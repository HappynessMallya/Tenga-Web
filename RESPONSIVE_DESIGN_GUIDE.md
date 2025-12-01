# Responsive Design Guide for Tenga App

This guide explains how to create responsive layouts in the Tenga laundry app that work seamlessly across mobile, tablet, and desktop web browsers.

## 📱 Overview

The app now includes a comprehensive responsive design system that automatically adapts to different screen sizes:

- **Mobile Portrait** (xs): 0-640px
- **Mobile Landscape** (sm): 640-768px
- **Tablet** (md): 768-1024px
- **Desktop** (lg): 1024-1280px
- **Large Desktop** (xl): 1280-1536px
- **Extra Large Desktop** (2xl): 1536px+

## 🎨 Core Utilities

### 1. useResponsive Hook

The `useResponsive` hook provides comprehensive responsive information and utilities:

```typescript
import { useResponsive } from '../hooks/useResponsive';

function MyComponent() {
  const { 
    isMobile, 
    isTablet, 
    isDesktop, 
    isWeb,
    breakpoint,
    getValue 
  } = useResponsive();

  // Use breakpoint-specific values
  const padding = getValue({
    xs: 16,
    md: 24,
    lg: 32,
    xl: 40,
  }); // Returns appropriate value based on current breakpoint

  return (
    <View style={{ padding }}>
      {isMobile && <Text>Mobile View</Text>}
      {isDesktop && <Text>Desktop View</Text>}
    </View>
  );
}
```

#### Available Properties

- `width`: Current screen width in pixels
- `height`: Current screen height in pixels
- `breakpoint`: Current breakpoint ('xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl')
- `isMobile`: True for screens < 768px
- `isTablet`: True for screens 768-1024px
- `isDesktop`: True for screens >= 1024px
- `isWeb`: True when running on web platform
- `isXs`, `isSm`, `isMd`, `isLg`, `isXl`, `is2xl`: Specific breakpoint checks
- `getValue<T>(values)`: Get appropriate value for current breakpoint

### 2. ResponsiveLayout Component

Automatically centers content on larger screens with proper max-width constraints:

```typescript
import { ResponsiveLayout } from '../components/ResponsiveLayout';

function PaymentScreen() {
  return (
    <ResponsiveLayout>
      {/* Content will be centered with max-width on desktop */}
      <Text>Payment Details</Text>
    </ResponsiveLayout>
  );
}
```

#### Props

- `children`: Content to render
- `style`: Custom container styles
- `fullWidth`: Disable max-width constraint (default: false)
- `noPadding`: Remove horizontal padding (default: false)
- `center`: Center content horizontally (default: true)

### 3. ResponsiveContainer Component

Similar to ResponsiveLayout but includes automatic responsive padding:

```typescript
import { ResponsiveContainer } from '../components/ResponsiveLayout';

function MyScreen() {
  return (
    <ResponsiveContainer>
      {/* Automatically padded based on screen size */}
      <Text>Content with smart padding</Text>
    </ResponsiveContainer>
  );
}
```

### 4. ResponsiveGrid Component

Create responsive grid layouts with automatic column adjustment:

```typescript
import { ResponsiveGrid } from '../components/ResponsiveLayout';

function ServiceGrid() {
  return (
    <ResponsiveGrid
      columns={{
        xs: 1,    // 1 column on mobile
        md: 2,    // 2 columns on tablet
        lg: 3,    // 3 columns on desktop
        xl: 4,    // 4 columns on large desktop
      }}
      gap={16}
    >
      {services.map(service => (
        <ServiceCard key={service.id} service={service} />
      ))}
    </ResponsiveGrid>
  );
}
```

### 5. ResponsiveStack Component

Stack items with responsive spacing:

```typescript
import { ResponsiveStack } from '../components/ResponsiveLayout';

function OrderForm() {
  return (
    <ResponsiveStack
      spacing={{
        xs: 12,
        md: 16,
        lg: 20,
      }}
      direction="vertical"
    >
      <TextInput placeholder="Name" />
      <TextInput placeholder="Email" />
      <TextInput placeholder="Phone" />
    </ResponsiveStack>
  );
}
```

### 6. Helper Hooks

#### useResponsivePadding

Get consistent padding values across your app:

```typescript
import { useResponsivePadding } from '../hooks/useResponsive';

function MyComponent() {
  const padding = useResponsivePadding();
  
  return (
    <View style={{
      paddingHorizontal: padding.horizontal, // 16-40px based on screen
      paddingVertical: padding.vertical,     // 16-32px based on screen
    }}>
      <Text>Content</Text>
    </View>
  );
}
```

#### useResponsiveFontSize

Get responsive font sizes:

```typescript
import { useResponsiveFontSize } from '../hooks/useResponsive';

function MyText() {
  const fontSize = useResponsiveFontSize();
  
  return (
    <Text style={{ fontSize: fontSize.lg }}>
      Responsive Text
    </Text>
  );
}
```

#### useMaxContentWidth

Get maximum content width for centering:

```typescript
import { useMaxContentWidth } from '../hooks/useResponsive';

function CenteredContent() {
  const maxWidth = useMaxContentWidth();
  
  return (
    <View style={{ width: '100%', maxWidth, alignSelf: 'center' }}>
      <Text>Centered Content</Text>
    </View>
  );
}
```

## 🎯 Best Practices

### 1. Always Use Responsive Wrappers

Wrap your main content in `ResponsiveLayout` or `ResponsiveContainer`:

```typescript
// ✅ Good
function MyScreen() {
  return (
    <SafeAreaView>
      <ResponsiveLayout>
        <Header />
        <Content />
      </ResponsiveLayout>
    </SafeAreaView>
  );
}

// ❌ Bad - content will be full-width on large screens
function MyScreen() {
  return (
    <SafeAreaView>
      <Header />
      <Content />
    </SafeAreaView>
  );
}
```

### 2. Use getValue for Conditional Values

Instead of multiple ternary operators:

```typescript
// ✅ Good
const { getValue } = useResponsive();
const fontSize = getValue({
  xs: 14,
  md: 16,
  lg: 18,
}) || 14;

// ❌ Bad
const fontSize = isMobile ? 14 : isTablet ? 16 : 18;
```

### 3. Responsive Modals

Make modals responsive on web:

```typescript
function PaymentModal() {
  const { getValue, isWeb } = useResponsive();
  
  const modalWidth = getValue({
    xs: '90%',
    sm: '85%',
    md: '600px',
    lg: '650px',
    xl: '700px',
  }) || '90%';

  return (
    <Modal visible={visible}>
      <View style={styles.modalOverlay}>
        <View style={{
          width: modalWidth,
          maxWidth: isWeb ? 700 : undefined,
        }}>
          {/* Modal content */}
        </View>
      </View>
    </Modal>
  );
}
```

### 4. Responsive Typography

Scale text sizes appropriately:

```typescript
function ResponsiveText({ children }) {
  const { getValue } = useResponsive();
  
  return (
    <Text style={{
      fontSize: getValue({ xs: 16, md: 18, lg: 20 }) || 16,
      lineHeight: getValue({ xs: 24, md: 27, lg: 30 }) || 24,
    }}>
      {children}
    </Text>
  );
}
```

### 5. Platform-Specific Rendering

Combine with platform checks when needed:

```typescript
import { Platform } from 'react-native';

function MapView() {
  const { isDesktop } = useResponsive();
  
  if (Platform.OS === 'web') {
    return <WebMapView large={isDesktop} />;
  }
  
  return <NativeMapView />;
}
```

## 📐 Layout Patterns

### Sidebar Layout (Desktop)

```typescript
function DashboardScreen() {
  const { isDesktop } = useResponsive();
  
  if (isDesktop) {
    return (
      <View style={{ flexDirection: 'row' }}>
        <Sidebar style={{ width: 250 }} />
        <ResponsiveLayout fullWidth>
          <MainContent />
        </ResponsiveLayout>
      </View>
    );
  }
  
  return (
    <ResponsiveLayout>
      <MainContent />
    </ResponsiveLayout>
  );
}
```

### Multi-Column Layout

```typescript
function ServicesList() {
  return (
    <ResponsiveLayout>
      <ResponsiveGrid
        columns={{
          xs: 1,
          sm: 2,
          lg: 3,
        }}
        gap={20}
      >
        {services.map(service => (
          <ServiceCard key={service.id} {...service} />
        ))}
      </ResponsiveGrid>
    </ResponsiveLayout>
  );
}
```

### Responsive Form Layout

```typescript
function OrderForm() {
  const { isMobile } = useResponsive();
  
  return (
    <ResponsiveContainer>
      <ResponsiveStack spacing={{ xs: 16, md: 20 }}>
        <View style={{
          flexDirection: isMobile ? 'column' : 'row',
          gap: 16,
        }}>
          <TextInput placeholder="First Name" style={{ flex: 1 }} />
          <TextInput placeholder="Last Name" style={{ flex: 1 }} />
        </View>
        <TextInput placeholder="Email" />
        <TextInput placeholder="Phone" />
      </ResponsiveStack>
    </ResponsiveContainer>
  );
}
```

## 🎨 Theme Integration

The responsive breakpoints are integrated into the theme:

```typescript
import { theme } from '../theme';

// Access breakpoints
const breakpoints = theme.breakpoints;
// { xs: 0, sm: 640, md: 768, lg: 1024, xl: 1280, '2xl': 1536 }

// Access layout config
const maxWidth = theme.layout.maxWidth;
// { xs: '100%', sm: '100%', md: '720px', lg: '960px', xl: '1140px', '2xl': '1320px' }
```

## 🧪 Testing Responsive Layouts

### Browser Developer Tools

1. Open Chrome/Firefox DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M / Cmd+Shift+M)
3. Test different screen sizes:
   - iPhone SE (375px) - Mobile
   - iPad (768px) - Tablet
   - Desktop (1280px) - Desktop
   - 4K (1920px+) - Large Desktop

### React Native Debugger

For native app testing:
- Use iOS Simulator with different devices
- Use Android Emulator with various screen sizes
- Test on physical devices

## 📱 Mobile-First Approach

Always start with mobile design and enhance for larger screens:

```typescript
// ✅ Good - Mobile-first
const padding = getValue({
  xs: 16,    // Start with mobile
  md: 24,    // Enhance for tablet
  lg: 32,    // Enhance for desktop
}) || 16;

// ❌ Less ideal - Desktop-first
const padding = isDesktop ? 32 : isTablet ? 24 : 16;
```

## 🚀 Performance Tips

1. **Use useMemo for expensive calculations:**

```typescript
const responsiveStyle = useMemo(() => ({
  padding: getValue({ xs: 16, md: 24, lg: 32 }),
  fontSize: getValue({ xs: 14, md: 16, lg: 18 }),
}), [breakpoint]);
```

2. **Avoid inline getValue calls in render:**

```typescript
// ✅ Good
const padding = getValue({ xs: 16, md: 24 }) || 16;
return <View style={{ padding }} />;

// ❌ Bad - getValue called on every render
return <View style={{ padding: getValue({ xs: 16, md: 24 }) || 16 }} />;
```

3. **Use breakpoint checks instead of multiple getValue calls:**

```typescript
// ✅ Good
if (isMobile) return <MobileView />;
return <DesktopView />;

// ❌ Bad
return getValue({ xs: <MobileView />, lg: <DesktopView /> });
```

## 🔧 Migration Guide

To make an existing screen responsive:

1. **Import responsive utilities:**
```typescript
import { useResponsive, useResponsivePadding } from '../hooks/useResponsive';
import { ResponsiveLayout } from '../components/ResponsiveLayout';
```

2. **Wrap content in ResponsiveLayout:**
```typescript
<ResponsiveLayout>
  {/* Your existing content */}
</ResponsiveLayout>
```

3. **Replace fixed values with responsive ones:**
```typescript
// Before
<View style={{ padding: 20 }}>

// After
const padding = useResponsivePadding();
<View style={{ padding: padding.horizontal }}>
```

4. **Update modals:**
```typescript
const modalWidth = getValue({
  xs: '90%',
  md: '600px',
  lg: '700px',
}) || '90%';

<View style={{ width: modalWidth }} />
```

## 📚 Examples

Check out these screens for responsive design examples:
- `app/(customer)/payment.tsx` - Responsive payment screen
- `app/(customer)/tabs/account.tsx` - Responsive account screen (partial)

## 🐛 Troubleshooting

### Content not centering on desktop
- Make sure you're using `ResponsiveLayout` or `ResponsiveContainer`
- Check that `fullWidth={true}` is not set

### Modal too wide on desktop
- Add `maxWidth` to modal container
- Use responsive `getValue` for width

### Text too small/large
- Use `useResponsiveFontSize()` hook
- Test on multiple screen sizes

### Padding inconsistent
- Use `useResponsivePadding()` for consistent spacing
- Avoid hardcoded padding values

## 🎯 Next Steps

1. Apply responsive design to all screens
2. Test on various devices and browsers
3. Add platform-specific optimizations
4. Create reusable responsive components
5. Document any screen-specific responsive patterns

---

**Need help?** Check the implementation in `app/hooks/useResponsive.ts` and `app/components/ResponsiveLayout.tsx` for more details.

