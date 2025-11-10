import React from 'react';
import { colors as staticColors } from '../theme';

/**
 * Debug utility to safely destructure colors and provide helpful error messages
 */
export const safeDestructureColors = (theme: any, componentName: string = 'Unknown Component') => {
  if (!theme) {
    console.error(`${componentName}: theme is undefined or null`);
    return staticColors || {};
  }

  if (!theme.colors) {
    console.error(`${componentName}: theme.colors is undefined`, {
      theme,
      hasTheme: !!theme,
      themeKeys: Object.keys(theme || {}),
    });
    return staticColors || {};
  }

  if (typeof theme.colors !== 'object') {
    console.error(`${componentName}: theme.colors is not an object`, {
      colorsType: typeof theme.colors,
      colors: theme.colors,
    });
    return staticColors || {};
  }

  return theme.colors;
};

/**
 * Safe useTheme wrapper that provides debugging information
 */
export const debugUseTheme = (useThemeHook: () => any, componentName: string) => {
  try {
    const theme = useThemeHook();
    const colors = safeDestructureColors(theme, componentName);
    
    return {
      ...theme,
      colors,
    };
  } catch (error) {
    console.error(`${componentName}: useTheme hook failed`, error);
    return {
      colors: staticColors || {},
      theme: 'light' as const,
      setTheme: () => console.warn(`${componentName}: setTheme not available`),
    };
  }
};

/**
 * Component wrapper to catch and handle theme-related errors
 */
export const withSafeTheme = <TProps extends object>(
  WrappedComponent: React.ComponentType<TProps>,
  componentName: string
): React.ComponentType<TProps> => {
  const SafeComponent = (props: TProps) => {
    try {
      return React.createElement(WrappedComponent, props);
    } catch (error) {
      if (error instanceof Error && error.message.includes('colors')) {
        console.error(`${componentName}: Theme colors error caught`, error);
        // You could render a fallback UI here
        return null;
      }
      throw error; // Re-throw non-theme errors
    }
  };

  // Set display name for debugging
  SafeComponent.displayName = `withSafeTheme(${componentName})`;
  
  return SafeComponent;
}; 