/**
 * useResponsive Hook
 * 
 * Provides responsive design utilities for web and mobile platforms.
 * Automatically detects screen size and provides breakpoint-based values.
 */

import { useState, useEffect, useMemo } from 'react';
import { Dimensions, Platform, ScaledSize } from 'react-native';

export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

export interface ResponsiveBreakpoints {
  xs: number;  // Mobile portrait (0-640px)
  sm: number;  // Mobile landscape (640-768px)
  md: number;  // Tablet (768-1024px)
  lg: number;  // Desktop (1024-1280px)
  xl: number;  // Large desktop (1280-1536px)
  '2xl': number; // Extra large desktop (1536px+)
}

export const BREAKPOINTS: ResponsiveBreakpoints = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
};

export interface ResponsiveValue {
  /** Current screen width in pixels */
  width: number;
  /** Current screen height in pixels */
  height: number;
  /** Current breakpoint */
  breakpoint: Breakpoint;
  /** Is mobile device (< 768px) */
  isMobile: boolean;
  /** Is tablet device (768-1024px) */
  isTablet: boolean;
  /** Is desktop device (>= 1024px) */
  isDesktop: boolean;
  /** Is web platform */
  isWeb: boolean;
  /** Is extra small screen (< 640px) */
  isXs: boolean;
  /** Is small screen (640-768px) */
  isSm: boolean;
  /** Is medium screen (768-1024px) */
  isMd: boolean;
  /** Is large screen (1024-1280px) */
  isLg: boolean;
  /** Is extra large screen (1280-1536px) */
  isXl: boolean;
  /** Is 2xl screen (>= 1536px) */
  is2xl: boolean;
  /** Get responsive value based on breakpoint */
  getValue: <T>(values: Partial<Record<Breakpoint, T>>) => T | undefined;
}

/**
 * Get current breakpoint based on screen width
 */
function getBreakpoint(width: number): Breakpoint {
  if (width >= BREAKPOINTS['2xl']) return '2xl';
  if (width >= BREAKPOINTS.xl) return 'xl';
  if (width >= BREAKPOINTS.lg) return 'lg';
  if (width >= BREAKPOINTS.md) return 'md';
  if (width >= BREAKPOINTS.sm) return 'sm';
  return 'xs';
}

/**
 * Hook to get responsive values based on screen size
 * 
 * @example
 * ```tsx
 * const { isMobile, isDesktop, getValue } = useResponsive();
 * 
 * const padding = getValue({
 *   xs: 16,
 *   md: 24,
 *   lg: 32
 * });
 * ```
 */
export function useResponsive(): ResponsiveValue {
  const [dimensions, setDimensions] = useState<ScaledSize>(() => 
    Dimensions.get('window')
  );

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions(window);
    });

    return () => subscription?.remove();
  }, []);

  const responsive = useMemo(() => {
    const { width, height } = dimensions;
    const breakpoint = getBreakpoint(width);
    const isWeb = Platform.OS === 'web';

    return {
      width,
      height,
      breakpoint,
      isWeb,
      isMobile: width < BREAKPOINTS.md,
      isTablet: width >= BREAKPOINTS.md && width < BREAKPOINTS.lg,
      isDesktop: width >= BREAKPOINTS.lg,
      isXs: breakpoint === 'xs',
      isSm: breakpoint === 'sm',
      isMd: breakpoint === 'md',
      isLg: breakpoint === 'lg',
      isXl: breakpoint === 'xl',
      is2xl: breakpoint === '2xl',
      getValue: <T>(values: Partial<Record<Breakpoint, T>>): T | undefined => {
        // Get value for current breakpoint or fallback to smaller breakpoint
        const orderedBreakpoints: Breakpoint[] = ['2xl', 'xl', 'lg', 'md', 'sm', 'xs'];
        const currentIndex = orderedBreakpoints.indexOf(breakpoint);
        
        for (let i = currentIndex; i < orderedBreakpoints.length; i++) {
          const bp = orderedBreakpoints[i];
          if (bp && values[bp] !== undefined) {
            return values[bp];
          }
        }
        
        return undefined;
      },
    };
  }, [dimensions]);

  return responsive;
}

/**
 * Get responsive padding based on screen size
 */
export function useResponsivePadding() {
  const { getValue } = useResponsive();
  
  return {
    horizontal: getValue({
      xs: 16,
      sm: 20,
      md: 24,
      lg: 32,
      xl: 40,
    }) || 16,
    vertical: getValue({
      xs: 16,
      sm: 20,
      md: 24,
      lg: 28,
      xl: 32,
    }) || 16,
    card: getValue({
      xs: 16,
      sm: 18,
      md: 20,
      lg: 24,
      xl: 28,
    }) || 16,
  };
}

/**
 * Get responsive font sizes based on screen size
 */
export function useResponsiveFontSize() {
  const { getValue } = useResponsive();
  
  return {
    xs: getValue({ xs: 10, md: 11, lg: 12 }) || 10,
    sm: getValue({ xs: 12, md: 13, lg: 14 }) || 12,
    base: getValue({ xs: 14, md: 15, lg: 16 }) || 14,
    md: getValue({ xs: 16, md: 17, lg: 18 }) || 16,
    lg: getValue({ xs: 18, md: 19, lg: 20 }) || 18,
    xl: getValue({ xs: 20, md: 22, lg: 24 }) || 20,
    '2xl': getValue({ xs: 24, md: 26, lg: 28 }) || 24,
    '3xl': getValue({ xs: 28, md: 30, lg: 32 }) || 28,
    '4xl': getValue({ xs: 32, md: 36, lg: 40 }) || 32,
  };
}

/**
 * Get maximum content width based on screen size (for centering content on desktop)
 */
export function useMaxContentWidth() {
  const { getValue, isWeb, width } = useResponsive();
  
  if (!isWeb) {
    return width; // Full width on mobile
  }
  
  return getValue({
    xs: width,
    sm: width,
    md: 720,
    lg: 960,
    xl: 1140,
    '2xl': 1320,
  }) || width;
}

