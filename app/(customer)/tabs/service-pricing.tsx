// @ts-nocheck
import { router } from 'expo-router';
import { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../providers/ThemeProvider';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useGarmentConfig } from '../../hooks/useGarmentConfig';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { ErrorView } from '../../components/ErrorView';
import { SimplifiedGarmentCategory, ServiceType } from '../../types/garment';
import { garmentConfigService } from '../../services/garmentConfigService';
import { ResponsiveLayout } from '../../components/ResponsiveLayout';
import { useResponsive, useResponsivePadding } from '../../hooks/useResponsive';

// Service type configurations with detailed information
const SERVICE_TYPE_CONFIG: Record<ServiceType, {
  icon: string;
  title: string;
  description: string;
  process: string[];
  benefits: string[];
  color: string;
  estimatedTime: string;
}> = {
  LAUNDRY: {
    icon: '🧺',
    title: 'Laundry',
    description: 'Standard washing service with gentle detergents',
    process: [
      'Sorting by color and fabric type',
      'Gentle washing with premium detergents',
      'Careful drying to prevent shrinkage',
      'Professional folding and packaging'
    ],
    benefits: [
      'Clean and fresh clothes',
      'Eco-friendly detergents',
      'Gentle on fabrics',
      'Affordable pricing'
    ],
    color: '#3B82F6',
    estimatedTime: '24 hours'
  },
  WASH_PRESS: {
    icon: '👕',
    title: 'Wash & Press',
    description: 'Complete washing with professional pressing for a crisp finish',
    process: [
      'Thorough washing with quality detergents',
      'Careful drying process',
      'Professional steam pressing',
      'Neat folding and packaging'
    ],
    benefits: [
      'Ready-to-wear clothes',
      'Professional pressed finish',
      'Wrinkle-free garments',
      'Perfect for formal wear'
    ],
    color: '#10B981',
    estimatedTime: '24-36 hours'
  },
  DRY_CLEAN: {
    icon: '✨',
    title: 'Dry Clean',
    description: 'Expert dry cleaning for delicate and formal garments',
    process: [
      'Professional inspection and spot treatment',
      'Gentle dry cleaning process',
      'Steam pressing and finishing',
      'Protective packaging'
    ],
    benefits: [
      'Perfect for delicate fabrics',
      'Removes tough stains',
      'Preserves garment shape',
      'Professional finish'
    ],
    color: '#8B5CF6',
    estimatedTime: '48 hours'
  },
  IRON_ONLY: {
    icon: '👔',
    title: 'Iron Only',
    description: 'Professional pressing service for crisp, wrinkle-free garments',
    process: [
      'Steam treatment for wrinkles',
      'Professional pressing techniques',
      'Quality inspection',
      'Careful packaging'
    ],
    benefits: [
      'Crisp, professional look',
      'Quick turnaround',
      'Perfect for formal wear',
      'Expert pressing techniques'
    ],
    color: '#F59E0B',
    estimatedTime: '12 hours'
  },
};

// Helper function to get icon for garment type
const getGarmentIcon = (garmentName: string): string => {
  const iconMap: { [key: string]: string } = {
    'Shirts': '👕',
    'Sweater': '🧥',
    'Jacket': '🧥',
    'Tshirt': '👕',
    'Blouse': '👚',
    'Pants': '👖',
    'Dress': '👗',
    'T-Shirt': '👕',
    'T-Shirts': '👕',
  };
  return iconMap[garmentName] || '👕';
};


export default function ServicePricingScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { isMobile, isDesktop, getValue } = useResponsive();
  const padding = useResponsivePadding();
  const {
    categories,
    isLoading,
    error,
    fetchGarmentConfig,
    clearSelectedGarments
  } = useGarmentConfig();

  const [selectedServiceType, setSelectedServiceType] = useState<ServiceType>('LAUNDRY');
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  // Fetch garment configuration on component mount
  useEffect(() => {
    const businessId = '68d2971b2fc5bd3f6a4b5ed9'; // Default business ID
    fetchGarmentConfig(businessId);
  }, [fetchGarmentConfig]);

  // Set default selected category when data loads
  useEffect(() => {
    if (categories.length > 0 && !selectedCategory) {
      setSelectedCategory(categories[0].id);
    }
  }, [categories, selectedCategory]);

  const handleServiceTypeSelect = useCallback((serviceType: ServiceType) => {
    setSelectedServiceType(serviceType);
  }, []);

  const handleCategorySelect = useCallback((categoryId: string) => {
    setSelectedCategory(categoryId);
  }, []);

  const handleStartOrder = useCallback(() => {
    // Clear any previous selections
    clearSelectedGarments();
    // Navigate to the order flow
    router.push('/(customer)/schedule-pickup');
  }, [clearSelectedGarments]);

  // Get available service types from the first category (they should be consistent)
  const availableServiceTypes: ServiceType[] = categories.length > 0
    ? Object.keys(categories[0].garmentTypes[0]?.pricing || {})
      .filter(st => SERVICE_TYPE_CONFIG[st as ServiceType]) // Only include service types that have configs
      .map(st => st as ServiceType)
    : ['LAUNDRY', 'WASH_PRESS', 'DRY_CLEAN', 'IRON_ONLY'];

  // Get selected category data
  const selectedCategoryData = categories.find(cat => cat.id === selectedCategory);
  const selectedServiceConfig = SERVICE_TYPE_CONFIG[selectedServiceType];

  // If selected service config doesn't exist, reset to default
  useEffect(() => {
    if (!selectedServiceConfig && availableServiceTypes.length > 0) {
      setSelectedServiceType(availableServiceTypes[0]);
    }
  }, [selectedServiceConfig, availableServiceTypes]);

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar style="dark" />
        <View style={{ paddingTop: insets.top }}>
          <LoadingSpinner message="Loading service information..." />
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar style="dark" />
        <View style={{ paddingTop: insets.top }}>
          <ErrorView
            message={error}
            onRetry={() => {
              const businessId = '68d2971b2fc5bd3f6a4b5ed9';
              fetchGarmentConfig(businessId);
            }}
          />
        </View>
      </SafeAreaView>
    );
  }

  // Responsive service type columns
  const serviceTypeColumns = getValue({
    xs: 2, // 2 columns on mobile
    md: 3, // 3 columns on tablet
    lg: 4, // 4 columns on desktop
  }) || 2;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style="dark" />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: insets.top }}
      >
        <ResponsiveLayout>
          {/* Header Section */}
          <View style={[styles.headerSection, { paddingHorizontal: padding.horizontal }]}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>
              Our Services
            </Text>
            <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
              Professional laundry services tailored to your needs
            </Text>
          </View>

          {/* Service Type Selection */}
          <View style={[styles.serviceTypeSection, { paddingHorizontal: padding.horizontal }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Choose Service Type
            </Text>
            <View style={styles.serviceTypeGrid}>
              {availableServiceTypes.map(serviceType => {
                const config = SERVICE_TYPE_CONFIG[serviceType];
                if (!config) return null; // Skip if config doesn't exist

                const isSelected = selectedServiceType === serviceType;

                return (
                  <TouchableOpacity
                    key={serviceType}
                    style={[
                      styles.serviceTypeCard,
                      {
                        backgroundColor: isSelected ? config.color : colors.card,
                        borderColor: isSelected ? config.color : colors.border,
                        width: isDesktop
                          ? `${(100 / serviceTypeColumns) - 2}%`
                          : isMobile
                            ? '48%'
                            : `${(100 / 3) - 2}%`,
                      },
                    ]}
                    onPress={() => handleServiceTypeSelect(serviceType)}
                  >
                    <Text style={styles.serviceTypeIcon}>{config.icon}</Text>
                    <Text style={[
                      styles.serviceTypeTitle,
                      { color: isSelected ? 'white' : colors.text }
                    ]}>
                      {config.title}
                    </Text>
                    <Text style={[
                      styles.serviceTypeTime,
                      { color: isSelected ? 'rgba(255,255,255,0.8)' : colors.textSecondary }
                    ]}>
                      {config.estimatedTime}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Service Details */}
          {selectedServiceConfig && (
            <View style={[styles.serviceDetailsSection, { paddingHorizontal: padding.horizontal }]}>
              <View style={[styles.serviceInfoCard, { backgroundColor: colors.card }]}>
                <View style={styles.serviceInfoHeader}>
                  <Text style={styles.serviceInfoIcon}>{selectedServiceConfig.icon}</Text>
                  <View style={styles.serviceInfoText}>
                    <Text style={[styles.serviceInfoTitle, { color: colors.text }]}>
                      {selectedServiceConfig.title}
                    </Text>
                    <Text style={[styles.serviceInfoDescription, { color: colors.textSecondary }]}>
                      {selectedServiceConfig.description}
                    </Text>
                  </View>
                </View>

                {/* Process Steps */}
                <View style={styles.processSection}>
                  <Text style={[styles.processTitle, { color: colors.text }]}>
                    Our Process
                  </Text>
                  {selectedServiceConfig.process.map((step, index) => (
                    <View key={index} style={styles.processStep}>
                      <View style={[styles.processStepNumber, { backgroundColor: selectedServiceConfig.color }]}>
                        <Text style={styles.processStepNumberText}>{index + 1}</Text>
                      </View>
                      <Text style={[styles.processStepText, { color: colors.textSecondary }]}>
                        {step}
                      </Text>
                    </View>
                  ))}
                </View>

                {/* Benefits */}
                <View style={styles.benefitsSection}>
                  <Text style={[styles.benefitsTitle, { color: colors.text }]}>
                    What You Get
                  </Text>
                  <View style={styles.benefitsList}>
                    {selectedServiceConfig.benefits.map((benefit, index) => (
                      <View key={index} style={styles.benefitItem}>
                        <Ionicons
                          name="checkmark-circle"
                          size={16}
                          color={selectedServiceConfig.color}
                        />
                        <Text style={[styles.benefitText, { color: colors.textSecondary }]}>
                          {benefit}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              </View>
            </View>
          )}

          {/* Pricing Section */}
          <View style={[styles.pricingSection, { paddingHorizontal: padding.horizontal }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Pricing by Garment Type
            </Text>

            {/* Category Tabs - Responsive */}
            {isMobile ? (
              // Mobile: Horizontal scrollable tabs
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={[styles.categoryTabsScrollView, { backgroundColor: colors.card }]}
                contentContainerStyle={styles.categoryTabsContent}
              >
                {categories.map(category => (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.categoryTabMobile,
                      selectedCategory === category.id && {
                        backgroundColor: colors.primary,
                      },
                    ]}
                    onPress={() => handleCategorySelect(category.id)}
                  >
                    <Text
                      style={[
                        styles.categoryTabText,
                        {
                          color: selectedCategory === category.id ? 'white' : colors.textSecondary,
                        },
                      ]}
                      numberOfLines={1}
                    >
                      {category.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            ) : (
              // Desktop/Tablet: Flex wrap tabs
              <View style={[styles.categoryTabsGrid, { backgroundColor: colors.card }]}>
                {categories.map(category => (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.categoryTabDesktop,
                      selectedCategory === category.id && {
                        backgroundColor: colors.primary,
                      },
                    ]}
                    onPress={() => handleCategorySelect(category.id)}
                  >
                    <Text
                      style={[
                        styles.categoryTabText,
                        {
                          color: selectedCategory === category.id ? 'white' : colors.textSecondary,
                        },
                      ]}
                      numberOfLines={1}
                    >
                      {category.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Pricing Items */}
            <View style={styles.pricingItemsContainer}>
              {selectedCategoryData?.garmentTypes.map(garmentType => {
                const price = garmentConfigService.getServicePricing(garmentType, selectedServiceType);
                return (
                  <View key={garmentType.id} style={[styles.pricingItem, { backgroundColor: colors.card }]}>
                    <View style={styles.pricingItemLeft}>
                      <View style={[styles.pricingItemIconContainer, { backgroundColor: colors.backgroundSecondary }]}>
                        <Text style={styles.pricingItemIcon}>
                          {getGarmentIcon(garmentType.name)}
                        </Text>
                      </View>
                      <View style={styles.pricingItemText}>
                        <Text style={[styles.pricingItemName, { color: colors.text }]}>
                          {garmentType.name}
                        </Text>
                        <Text style={[styles.pricingItemDescription, { color: colors.textSecondary }]}>
                          {garmentType.description}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.pricingItemRight}>
                      <Text style={[styles.pricingItemPrice, { color: colors.text }]}>
                        {price ? `TZS ${price.toLocaleString()}` : 'N/A'}
                      </Text>
                      <Text style={[styles.pricingItemPerItem, { color: colors.textSecondary }]}>
                        per item
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Call to Action */}
          <View style={[styles.ctaSection, { paddingHorizontal: padding.horizontal }]}>
            <TouchableOpacity
              style={[styles.startOrderButton, { backgroundColor: colors.primary }]}
              onPress={handleStartOrder}
            >
              <Ionicons name="arrow-forward" size={20} color="white" />
              <Text style={styles.startOrderButtonText}>Start Your Order</Text>
            </TouchableOpacity>
          </View>
        </ResponsiveLayout>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },

  // Header Section
  headerSection: {
    paddingVertical: 20,
    paddingTop: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    lineHeight: 22,
  },

  // Service Type Section
  serviceTypeSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  serviceTypeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  serviceTypeCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: 'center',
    marginBottom: 12,
  },
  serviceTypeIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  serviceTypeTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    textAlign: 'center',
  },
  serviceTypeTime: {
    fontSize: 12,
    textAlign: 'center',
  },

  // Service Details Section
  serviceDetailsSection: {
    marginBottom: 24,
  },
  serviceInfoCard: {
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  serviceInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  serviceInfoIcon: {
    fontSize: 40,
    marginRight: 16,
  },
  serviceInfoText: {
    flex: 1,
  },
  serviceInfoTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  serviceInfoDescription: {
    fontSize: 14,
    lineHeight: 20,
  },

  // Process Section
  processSection: {
    marginBottom: 20,
  },
  processTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  processStep: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  processStepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  processStepNumberText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  processStepText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },

  // Benefits Section
  benefitsSection: {
    marginBottom: 0,
  },
  benefitsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  benefitsList: {
    gap: 8,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  benefitText: {
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },

  // Pricing Section
  pricingSection: {
    marginBottom: 24,
  },

  // Mobile category tabs (horizontal scroll)
  categoryTabsScrollView: {
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
    maxHeight: 60,
  },
  categoryTabsContent: {
    gap: 8,
    paddingHorizontal: 4,
  },
  categoryTabMobile: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 120,
  },

  // Desktop category tabs (flex wrap grid)
  categoryTabsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
    gap: 8,
  },
  categoryTabDesktop: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 100,
    flex: 0,
  },

  categoryTabText: {
    fontSize: 14,
    fontWeight: '500',
  },
  pricingItemsContainer: {
    gap: 12,
  },
  pricingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  pricingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  pricingItemIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  pricingItemIcon: {
    fontSize: 20,
  },
  pricingItemText: {
    flex: 1,
  },
  pricingItemName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  pricingItemDescription: {
    fontSize: 12,
    lineHeight: 16,
  },
  pricingItemRight: {
    alignItems: 'flex-end',
  },
  pricingItemPrice: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  pricingItemPerItem: {
    fontSize: 12,
  },

  // Call to Action Section
  ctaSection: {
    paddingBottom: 32,
  },
  startOrderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  startOrderButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
});
