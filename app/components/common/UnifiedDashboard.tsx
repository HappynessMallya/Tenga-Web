import React from 'react';
import { View, Text, ScrollView, RefreshControl, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../providers/ThemeProvider';

export interface DashboardStat {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: string;
  gradient: string[];
  textColor?: string;
}

export interface DashboardSection {
  title: string;
  content: React.ReactNode;
}

interface UnifiedDashboardProps {
  title?: string;
  subtitle?: string;
  headerGradient?: string[];
  stats?: DashboardStat[];
  sections?: DashboardSection[];
  headerActions?: React.ReactNode;
  refreshing?: boolean;
  onRefresh?: () => void;
  children?: React.ReactNode;
}

const StatCard: React.FC<DashboardStat> = ({
  title,
  value,
  subtitle,
  icon,
  gradient,
  textColor = 'white',
}) => (
  <View style={styles.statCardContainer}>
    <LinearGradient colors={gradient} style={styles.statCard}>
      <View style={styles.statCardContent}>
        <View style={styles.statIcon}>
          <Ionicons name={icon as any} size={24} color="white" />
        </View>
        <Text style={[styles.statValue, { color: textColor }]}>{value}</Text>
        <Text style={[styles.statTitle, { color: textColor }]}>{title}</Text>
        {subtitle && <Text style={[styles.statSubtitle, { color: textColor }]}>{subtitle}</Text>}
      </View>
    </LinearGradient>
  </View>
);

const SectionCard: React.FC<{ title: string; children: React.ReactNode }> = ({
  title,
  children,
}) => {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.sectionCard,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
        },
      ]}
    >
      <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
      {children}
    </View>
  );
};

export const UnifiedDashboard: React.FC<UnifiedDashboardProps> = ({
  title,
  subtitle,
  headerGradient,
  stats = [],
  sections = [],
  headerActions,
  refreshing = false,
  onRefresh,
  children,
}) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.backgroundSecondary }]}>
      {/* Header */}
      {title && subtitle && headerGradient && (
        <LinearGradient colors={headerGradient} style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.headerMain}>
              <View style={styles.headerTextContainer}>
                <Text style={styles.headerTitle}>{title}</Text>
                <Text style={styles.headerSubtitle}>{subtitle}</Text>
              </View>
              {headerActions}
            </View>
          </View>
        </LinearGradient>
      )}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { marginTop: title && subtitle && headerGradient ? -24 : 0 },
        ]}
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          ) : undefined
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Stats Grid */}
        {stats && stats.length > 0 && (
          <View style={styles.statsContainer}>
            {/* First row - primary stat */}
            {stats[0] && (
              <View style={styles.statsRow}>
                <StatCard {...stats[0]} />
              </View>
            )}

            {/* Second row - dual stats */}
            {stats.length > 1 && (
              <View style={styles.statsRow}>
                {stats.slice(1, 3).map((stat, index) => (
                  <StatCard key={index} {...stat} />
                ))}
              </View>
            )}

            {/* Third row - dual stats */}
            {stats.length > 3 && (
              <View style={styles.statsRow}>
                {stats.slice(3, 5).map((stat, index) => (
                  <StatCard key={index} {...stat} />
                ))}
              </View>
            )}

            {/* Additional stats in pairs */}
            {stats.length > 5 && (
              <View style={styles.statsRow}>
                {stats.slice(5, 7).map((stat, index) => (
                  <StatCard key={index} {...stat} />
                ))}
              </View>
            )}
          </View>
        )}

        {/* Custom Sections */}
        {sections &&
          sections.map((section, index) => (
            <SectionCard key={index} title={section.title}>
              {section.content}
            </SectionCard>
          ))}

        {/* Custom Children */}
        {children}

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 20,
    paddingBottom: 30,
  },
  headerContent: {
    paddingHorizontal: 16,
  },
  headerMain: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  statsContainer: {
    marginBottom: 24,
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8,
  },
  statCardContainer: {
    flex: 1,
    marginHorizontal: 4,
  },
  statCard: {
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  statCardContent: {
    alignItems: 'center',
  },
  statIcon: {
    width: 48,
    height: 48,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statTitle: {
    fontSize: 14,
    fontWeight: '600',
    opacity: 0.9,
  },
  statSubtitle: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 4,
    textAlign: 'center',
  },
  sectionCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  bottomSpacing: {
    paddingBottom: 32,
  },
});

export default UnifiedDashboard;
