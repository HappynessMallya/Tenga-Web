/**
 * ResponsiveExample Component
 * 
 * Example implementation showing how to use the responsive design system.
 * This file serves as a reference for developers.
 * 
 * You can copy patterns from this file when making other screens responsive.
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { 
  ResponsiveLayout, 
  ResponsiveContainer, 
  ResponsiveGrid, 
  ResponsiveStack 
} from '../ResponsiveLayout';
import { 
  useResponsive, 
  useResponsivePadding, 
  useResponsiveFontSize 
} from '../../hooks/useResponsive';

export function ResponsiveExample() {
  const { isMobile, isTablet, isDesktop, breakpoint, getValue, width } = useResponsive();
  const padding = useResponsivePadding();
  const fontSize = useResponsiveFontSize();

  return (
    <ScrollView style={styles.container}>
      {/* Header with responsive centering */}
      <ResponsiveContainer>
        <Text style={[styles.title, { fontSize: fontSize['2xl'] }]}>
          Responsive Design Example
        </Text>
        <Text style={[styles.subtitle, { fontSize: fontSize.base }]}>
          Current breakpoint: {breakpoint} | Screen width: {Math.round(width)}px
        </Text>
      </ResponsiveContainer>

      {/* Device type badges */}
      <ResponsiveContainer>
        <ResponsiveStack direction="horizontal" spacing={12}>
          <View style={[styles.badge, isMobile && styles.badgeActive]}>
            <Text style={styles.badgeText}>
              {isMobile ? '✓' : ''} Mobile
            </Text>
          </View>
          <View style={[styles.badge, isTablet && styles.badgeActive]}>
            <Text style={styles.badgeText}>
              {isTablet ? '✓' : ''} Tablet
            </Text>
          </View>
          <View style={[styles.badge, isDesktop && styles.badgeActive]}>
            <Text style={styles.badgeText}>
              {isDesktop ? '✓' : ''} Desktop
            </Text>
          </View>
        </ResponsiveStack>
      </ResponsiveContainer>

      {/* Responsive grid example */}
      <ResponsiveContainer>
        <Text style={[styles.sectionTitle, { fontSize: fontSize.lg }]}>
          Responsive Grid
        </Text>
        <ResponsiveGrid
          columns={{
            xs: 1,
            sm: 2,
            md: 2,
            lg: 3,
            xl: 4,
          }}
          gap={16}
        >
          {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
            <View key={item} style={styles.gridItem}>
              <Text style={styles.gridItemText}>Item {item}</Text>
            </View>
          ))}
        </ResponsiveGrid>
      </ResponsiveContainer>

      {/* Responsive values example */}
      <ResponsiveContainer>
        <Text style={[styles.sectionTitle, { fontSize: fontSize.lg }]}>
          Responsive Values
        </Text>
        <ResponsiveStack spacing={{ xs: 12, md: 16, lg: 20 }}>
          <View style={[styles.card, { padding: padding.card }]}>
            <Text style={[styles.cardTitle, { fontSize: fontSize.md }]}>
              Responsive Padding
            </Text>
            <Text style={[styles.cardText, { fontSize: fontSize.sm }]}>
              Horizontal: {padding.horizontal}px
            </Text>
            <Text style={[styles.cardText, { fontSize: fontSize.sm }]}>
              Vertical: {padding.vertical}px
            </Text>
            <Text style={[styles.cardText, { fontSize: fontSize.sm }]}>
              Card: {padding.card}px
            </Text>
          </View>

          <View style={[styles.card, { padding: padding.card }]}>
            <Text style={[styles.cardTitle, { fontSize: fontSize.md }]}>
              Custom Responsive Values
            </Text>
            <Text style={[styles.cardText, { fontSize: fontSize.sm }]}>
              Button Size: {getValue({
                xs: 'Small',
                md: 'Medium',
                lg: 'Large',
              })}
            </Text>
            <Text style={[styles.cardText, { fontSize: fontSize.sm }]}>
              Columns: {getValue({
                xs: 1,
                sm: 2,
                lg: 3,
                xl: 4,
              })}
            </Text>
          </View>

          <View style={[styles.card, { padding: padding.card }]}>
            <Text style={[styles.cardTitle, { fontSize: fontSize.md }]}>
              Conditional Rendering
            </Text>
            {isMobile && (
              <Text style={[styles.cardText, { fontSize: fontSize.sm, color: '#10B981' }]}>
                ✓ Showing mobile layout
              </Text>
            )}
            {isTablet && (
              <Text style={[styles.cardText, { fontSize: fontSize.sm, color: '#3B82F6' }]}>
                ✓ Showing tablet layout
              </Text>
            )}
            {isDesktop && (
              <Text style={[styles.cardText, { fontSize: fontSize.sm, color: '#8B5CF6' }]}>
                ✓ Showing desktop layout
              </Text>
            )}
          </View>
        </ResponsiveStack>
      </ResponsiveContainer>

      {/* Responsive button */}
      <ResponsiveContainer>
        <TouchableOpacity
          style={[
            styles.button,
            {
              paddingVertical: getValue({ xs: 12, md: 14, lg: 16 }) || 12,
              paddingHorizontal: getValue({ xs: 20, md: 24, lg: 28 }) || 20,
            },
          ]}
        >
          <Text style={[styles.buttonText, { fontSize: fontSize.base }]}>
            {getValue({
              xs: 'Tap Here',
              md: 'Click Here',
              lg: 'Click to Continue',
            })}
          </Text>
        </TouchableOpacity>
      </ResponsiveContainer>

      {/* Layout constraints visualization */}
      <ResponsiveLayout fullWidth noPadding>
        <View style={styles.fullWidthSection}>
          <ResponsiveContainer>
            <Text style={[styles.sectionTitle, { fontSize: fontSize.lg, color: 'white' }]}>
              Layout Container
            </Text>
            <Text style={[styles.cardText, { fontSize: fontSize.sm, color: 'white' }]}>
              This content is inside ResponsiveContainer which automatically
              centers and constrains max-width on larger screens.
            </Text>
          </ResponsiveContainer>
        </View>
      </ResponsiveLayout>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  title: {
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 20,
    marginBottom: 8,
  },
  subtitle: {
    color: '#6B7280',
    marginBottom: 20,
  },
  sectionTitle: {
    fontWeight: '600',
    color: '#111827',
    marginTop: 20,
    marginBottom: 16,
  },
  badge: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#E5E7EB',
  },
  badgeActive: {
    backgroundColor: '#9334ea',
  },
  badgeText: {
    color: '#1F2937',
    fontWeight: '500',
    fontSize: 14,
  },
  gridItem: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  gridItemText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#9334ea',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  cardText: {
    color: '#6B7280',
    marginBottom: 4,
  },
  button: {
    backgroundColor: '#9334ea',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    shadowColor: '#9334ea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
  },
  fullWidthSection: {
    backgroundColor: '#9334ea',
    paddingVertical: 40,
  },
});

