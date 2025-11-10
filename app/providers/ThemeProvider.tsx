// @ts-nocheck
import { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { theme as staticTheme, colors as staticColors, Theme } from '../theme';

interface ThemeContextType {
  theme: 'light' | 'dark' | null;
  colors: typeof staticColors;
  staticTheme: Theme;
  setTheme: (theme: 'light' | 'dark') => void;
  isDark: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const colorScheme = useColorScheme();
  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark' | null>(colorScheme || 'light');
  const [isInitialized, setIsInitialized] = useState(false);

  // Use the comprehensive color palette from app/theme/index.ts
  // In the future, you can extend this to have dark mode variants
  const colors = staticColors;

  // Helper functions
  const toggleTheme = () => {
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    setCurrentTheme(newTheme);
  };

  // Ensure all required properties are available
  const value: ThemeContextType = {
    theme: currentTheme,
    colors: colors || staticColors, // Double fallback
    staticTheme: staticTheme,
    setTheme: (newTheme: 'light' | 'dark') => setCurrentTheme(newTheme),
    isDark: currentTheme === 'dark',
    toggleTheme,
  };

  // Add safety check to ensure context value is valid
  useEffect(() => {
    if (!value.colors || !value.staticTheme) {
      console.error('ThemeProvider: Invalid context value', value);
    } else {
      console.log(
        'ThemeProvider: Successfully initialized with colors:',
        Object.keys(value.colors).length
      );
      setIsInitialized(true);
    }
  }, [value.colors, value.staticTheme]);

  // Add debugging for context access
  if (!isInitialized) {
    console.log('ThemeProvider: Still initializing...');
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export const useThemeContext = () => {
  const context = useContext(ThemeContext);
  if (context === null) {
    throw new Error('useThemeContext must be used within a ThemeProvider');
  }
  return context;
};

// Main theme hook - should be imported from here, not from theme/index.ts
export const useTheme = () => {
  const context = useContext(ThemeContext);

  // Enhanced debugging and fallback handling
  if (context === null || !context.colors) {
    const warningMessage =
      context === null
        ? 'useTheme called outside of ThemeProvider, using static theme'
        : 'ThemeProvider context incomplete (no colors), using static theme';

    console.warn(warningMessage);
    console.debug('Static theme fallback:', {
      hasColors: !!staticColors,
      hasTheme: !!staticTheme,
      colorsKeys: Object.keys(staticColors || {}).slice(0, 5),
    });

    // Return a safe fallback that always has colors
    return {
      ...staticTheme,
      colors: staticColors || {},
      theme: 'light' as const,
      setTheme: () => console.warn('setTheme called outside of ThemeProvider'),
      isDark: false,
      toggleTheme: () => console.warn('toggleTheme called outside of ThemeProvider'),
    };
  }

  // Ensure colors is always defined
  const safeColors = context.colors || staticColors || {};

  return {
    ...context.staticTheme,
    colors: safeColors,
    theme: context.theme,
    setTheme: context.setTheme,
    isDark: context.isDark,
    toggleTheme: context.toggleTheme,
  };
};
