export const colors = {
  primary: '#9334ea',
  secondary: '#2D3436',
  success: '#00B894',
  error: '#FF7675',
  warning: '#FDCB6E',
  info: '#9334ea', // Changed from blue to purple

  // Text colors
  text: '#2D3436',
  textSecondary: '#636E72',
  textTertiary: '#B2BEC3',

  // Background colors
  background: '#FFFFFF',
  backgroundSecondary: '#F5F6FA',
  card: '#FFFFFF',
  surface: '#F8F9FA',

  // Border colors
  border: '#DFE6E9',
  borderLight: '#F1F2F6',

  // Status colors
  pending: '#FDCB6E',
  processing: '#0984E3',
  completed: '#00B894',
  cancelled: '#FF7675',

  // Additional colors
  gray: '#B2BEC3',
  lightGray: '#DFE6E9',
  darkGray: '#636E72',

  // Map colors
  mapPrimary: '#9334ea',
  mapSecondary: '#2D3436',
  mapBackground: '#FFFFFF',
  mapBorder: '#DFE6E9',

  // Shadow colors
  shadow: 'rgba(0, 0, 0, 0.1)',
  shadowDark: 'rgba(0, 0, 0, 0.2)',

  // Overlay colors
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',

  // Gradient colors
  gradientStart: '#9334ea',
  gradientEnd: '#9334ea',
};

export const typography = {
  fontFamily: {
    regular: 'Roboto-Regular',
    medium: 'Roboto-Medium',
    bold: 'Roboto-Bold',
    light: 'Roboto-Light',
  },
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
  },
  lineHeight: {
    xs: 16,
    sm: 20,
    md: 24,
    lg: 28,
    xl: 32,
    '2xl': 36,
    '3xl': 40,
    '4xl': 48,
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
};

export const animation = {
  duration: {
    fast: 200,
    normal: 300,
    slow: 500,
  },
  easing: {
    easeInOut: 'ease-in-out',
    easeOut: 'ease-out',
    easeIn: 'ease-in',
  },
};

export const theme = {
  colors,
  typography,
  spacing,
  animation,
};

export type Theme = typeof theme;

// useTheme is now exported from providers/ThemeProvider.tsx
// This is kept for backward compatibility but should not be used directly
