// @ts-nocheck
import { useMemo } from 'react';
import { useTheme as useThemeContext } from '../providers/ThemeProvider';
import { colors as staticColors, theme as staticTheme } from '../theme';

/**
 * Safe theme hook that always returns valid theme data
 * Fallback mechanism ensures app doesn't crash if theme context fails
 */
export const useSafeTheme = () => {
  // Always call hooks at the top level
  let contextTheme;
  try {
    contextTheme = useThemeContext();
  } catch (error) {
    console.warn('useSafeTheme: Context theme failed, using static fallback:', error);
    contextTheme = null;
  }

  return useMemo(() => {
    // Validate that we have valid colors from the context
    if (contextTheme?.colors && typeof contextTheme.colors === 'object') {
      // Create a safe colors object with fallbacks only for missing properties
      const safeColors = {
        ...staticColors, // Start with static colors as base
        ...contextTheme.colors, // Override with context colors (this ensures no properties are lost)
      };

      return {
        ...contextTheme,
        colors: safeColors,
      };
    }

    // Fallback to static theme with guaranteed colors object
    return {
      ...staticTheme,
      colors: staticColors || {},
      theme: 'light' as const,
      setTheme: () => console.warn('setTheme not available in static fallback mode'),
    };
  }, [contextTheme]);
};

/**
 * Hook to get just the colors safely - guaranteed to never be undefined
 */
export const useSafeColors = () => {
  const { colors } = useSafeTheme();
  // Triple safety check to ensure colors is never undefined
  return colors || staticColors || {};
};

/**
 * Emergency fallback colors for extreme cases
 */
export const getEmergencyColors = () => ({
  primary: '#9334ea',
  secondary: '#2D3436',
  success: '#00B894',
  error: '#FF7675',
  warning: '#FDCB6E',
  info: '#9334ea',
  text: '#2D3436',
  textSecondary: '#636E72',
  textTertiary: '#B2BEC3',
  background: '#FFFFFF',
  backgroundSecondary: '#F5F6FA',
  card: '#FFFFFF',
  border: '#DFE6E9',
  borderLight: '#F1F2F6',
});
