/**
 * ResponsiveLayout Component
 * 
 * Provides responsive layout wrapper for content
 * Centers content on larger screens and handles proper spacing
 */

import React from 'react';
import { View, ViewStyle, StyleSheet, Platform } from 'react-native';
import { useResponsive, useMaxContentWidth } from '../hooks/useResponsive';

interface ResponsiveLayoutProps {
  children: React.ReactNode;
  /** Custom style for the container */
  style?: ViewStyle;
  /** Disable max-width constraint on desktop */
  fullWidth?: boolean;
  /** Add horizontal padding */
  noPadding?: boolean;
  /** Center content horizontally */
  center?: boolean;
}

/**
 * ResponsiveLayout - Wraps content and provides responsive layout
 * 
 * @example
 * ```tsx
 * <ResponsiveLayout>
 *   <Text>Your content here</Text>
 * </ResponsiveLayout>
 * ```
 */
export function ResponsiveLayout({
  children,
  style,
  fullWidth = false,
  noPadding = false,
  center = true,
}: ResponsiveLayoutProps) {
  const { isWeb, isDesktop } = useResponsive();
  const maxWidth = useMaxContentWidth();

  const containerStyle: ViewStyle = {
    width: '100%',
    ...(isWeb && isDesktop && !fullWidth && center && {
      maxWidth,
      marginHorizontal: 'auto',
      alignSelf: 'center',
    }),
    ...(noPadding && {
      paddingHorizontal: 0,
    }),
  };

  return (
    <View style={[containerStyle, style]}>
      {children}
    </View>
  );
}

/**
 * ResponsiveContainer - Similar to ResponsiveLayout but with default padding
 */
export function ResponsiveContainer({
  children,
  style,
  fullWidth = false,
}: Omit<ResponsiveLayoutProps, 'noPadding'>) {
  const { isWeb, isDesktop, getValue } = useResponsive();
  const maxWidth = useMaxContentWidth();

  const padding = getValue({
    xs: 16,
    sm: 20,
    md: 24,
    lg: 32,
    xl: 40,
  }) || 16;

  const containerStyle: ViewStyle = {
    width: '100%',
    paddingHorizontal: padding,
    ...(isWeb && isDesktop && !fullWidth && {
      maxWidth,
      marginHorizontal: 'auto',
      alignSelf: 'center',
    }),
  };

  return (
    <View style={[containerStyle, style]}>
      {children}
    </View>
  );
}

/**
 * ResponsiveGrid - Grid layout for responsive content
 */
interface ResponsiveGridProps {
  children: React.ReactNode;
  /** Number of columns for each breakpoint */
  columns?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
    '2xl'?: number;
  };
  /** Gap between items */
  gap?: number;
  style?: ViewStyle;
}

export function ResponsiveGrid({
  children,
  columns = { xs: 1, sm: 1, md: 2, lg: 3, xl: 4 },
  gap = 16,
  style,
}: ResponsiveGridProps) {
  const { getValue } = useResponsive();
  
  const numColumns = getValue(columns) || 1;
  
  return (
    <View 
      style={[
        styles.grid,
        {
          flexDirection: 'row',
          flexWrap: 'wrap',
          margin: -gap / 2,
        },
        style,
      ]}
    >
      {React.Children.map(children, (child, index) => (
        <View
          key={index}
          style={{
            width: `${100 / numColumns}%`,
            padding: gap / 2,
          }}
        >
          {child}
        </View>
      ))}
    </View>
  );
}

/**
 * ResponsiveStack - Stack layout with responsive spacing
 */
interface ResponsiveStackProps {
  children: React.ReactNode;
  /** Spacing between items */
  spacing?: number | {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
    '2xl'?: number;
  };
  /** Stack direction */
  direction?: 'vertical' | 'horizontal';
  style?: ViewStyle;
}

export function ResponsiveStack({
  children,
  spacing = 16,
  direction = 'vertical',
  style,
}: ResponsiveStackProps) {
  const { getValue } = useResponsive();
  
  const space = typeof spacing === 'number' 
    ? spacing 
    : (getValue(spacing) || 16);
  
  const isHorizontal = direction === 'horizontal';
  
  return (
    <View 
      style={[
        {
          flexDirection: isHorizontal ? 'row' : 'column',
        },
        style,
      ]}
    >
      {React.Children.map(children, (child, index) => {
        const isLast = index === React.Children.count(children) - 1;
        return (
          <View
            key={index}
            style={{
              [isHorizontal ? 'marginRight' : 'marginBottom']: isLast ? 0 : space,
            }}
          >
            {child}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});

