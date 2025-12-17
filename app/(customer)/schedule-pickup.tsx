// @ts-ignore
import { router } from 'expo-router';
import { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../providers/ThemeProvider';
import { formatCurrency } from '../utils/orderCalculations';
import { useGarmentConfig } from '../hooks/useGarmentConfig';
import { useGarmentConfigStore } from '../store/garmentConfigStore';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorView } from '../components/ErrorView';
import { SimplifiedGarmentType, ServiceType } from '../types/garment';

// Premium service configuration with luxury colors and sophisticated design
const SERVICE_TYPES: { [key in ServiceType]: {
  label: string;
  color: string;
  icon: string;
  emoji: string;
  description: string;
} } = {
  LAUNDRY: {
    label: 'Laundry',
    color: '#2c3e50',
    icon: 'refresh',
    emoji: '🧺',
    description: 'Standard washing service'
  },
  WASH_PRESS: {
    label: 'Wash & Press',
    color: '#2c3e50',
    icon: 'checkmark-circle',
    emoji: '👕',
    description: 'Washing with professional pressing'
  },
  DRY_CLEAN: {
    label: 'Dry Clean',
    color: '#34495e',
    icon: 'snow',
    emoji: '✨',
    description: 'Expert dry cleaning service'
  },
  IRON_ONLY: {
    label: 'Press Only',
    color: '#2c2c2c',
    icon: 'flame',
    emoji: '👔',
    description: 'Professional pressing service'
  },
};

// Helper function to get appropriate icon for garment type
const getIconForGarmentType = (typeKey: string): string => {
  const iconMap: { [key: string]: string } = {
    'Shirts': 'shirt',
    'Sweater': 'shirt',
    'Jacket': 'shirt',
    'Tshirt': 'shirt',
    'Blouse': 'shirt',
    'Pants': 'shirt',
    'Dress': 'shirt',
  };
  return iconMap[typeKey] || 'shirt';
};

// Garment Card Component with Dropdown
const GarmentCard = ({
  garmentType,
  selectedGarments,
  onAddGarment,
  onRemoveGarment,
  colors
}: {
  garmentType: SimplifiedGarmentType;
  selectedGarments: any[];
  onAddGarment: (garmentType: SimplifiedGarmentType, serviceType: ServiceType) => void;
  onRemoveGarment: (garmentType: SimplifiedGarmentType, serviceType: ServiceType) => void;
  colors: any;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const availableServices = Object.keys(garmentType.pricing) as ServiceType[];

  const getQuantityForService = (serviceType: ServiceType): number => {
    const selected = selectedGarments.find(
      item => item.garmentTypeId === garmentType.id && item.serviceType === serviceType
    );
    return selected ? selected.quantity : 0;
  };

  const totalSelected = availableServices.reduce((sum, service) => sum + getQuantityForService(service), 0);
  const totalPrice = availableServices.reduce((sum, service) => {
    const quantity = getQuantityForService(service);
    const price = garmentType.pricing[service]?.amount || 0;
    return sum + (quantity * price);
  }, 0);

  return (
    <View style={[
      styles.garmentCard,
      {
        backgroundColor: colors.card,
        borderColor: totalSelected > 0 ? '#2c3e50' : '#e8e8e8',
        borderWidth: totalSelected > 0 ? 1 : 0.5,
        shadowColor: totalSelected > 0 ? '#2c3e50' : '#000',
        shadowOpacity: totalSelected > 0 ? 0.08 : 0.02,
        shadowRadius: totalSelected > 0 ? 8 : 3,
        elevation: totalSelected > 0 ? 3 : 1,
      }
    ]}>
      <TouchableOpacity
        style={styles.garmentHeader}
        onPress={() => setIsExpanded(!isExpanded)}
        activeOpacity={0.7}
      >
        <View style={styles.garmentInfo}>
          <View style={[
            styles.garmentIcon,
            {
              backgroundColor: totalSelected > 0 ? '#2c3e50' : '#f8f9fa',
              shadowColor: '#2c3e50',
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 2,
            }
          ]}>
            <Ionicons
              name={getIconForGarmentType(garmentType.name) as any}
              size={22}
              color={totalSelected > 0 ? 'white' : '#2c3e50'}
            />
          </View>
          <View style={styles.garmentDetails}>
            <Text style={[
              styles.garmentName,
              {
                color: totalSelected > 0 ? '#2c3e50' : colors.text,
                fontWeight: totalSelected > 0 ? '600' : '500',
                letterSpacing: 0.3,
              }
            ]}>
              {garmentType.name}
            </Text>
            <View style={styles.garmentMeta}>
              <Text style={[styles.garmentDescription, { color: colors.textSecondary }]}>
                {availableServices.length} service{availableServices.length !== 1 ? 's' : ''} available
              </Text>
              {totalSelected > 0 && (
                <View style={styles.garmentSummary}>
                  <View style={[styles.selectedBadge, { backgroundColor: colors.primary }]}>
                    <Text style={styles.selectedBadgeText}>
                      {totalSelected} items
                    </Text>
                  </View>
                  <Text style={[styles.garmentPrice, { color: colors.primary }]}>
                    {formatCurrency(totalPrice)}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>
        <View style={styles.garmentActions}>
          <Ionicons
            name={isExpanded ? "chevron-up" : "chevron-down"}
            size={20}
            color={colors.textSecondary}
          />
        </View>
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.serviceTypesContainer}>
          {availableServices.map((serviceType) => {
            const serviceConfig = SERVICE_TYPES[serviceType];
            const quantity = getQuantityForService(serviceType);
            const price = garmentType.pricing[serviceType]?.amount || 0;
            const isSelected = quantity > 0;

            return (
              <TouchableOpacity
                key={serviceType}
                style={[
                  styles.serviceTypeRow,
                  {
                    backgroundColor: isSelected ? '#f8f9fa' : colors.background,
                    borderColor: isSelected ? '#2c3e50' : '#e8e8e8',
                    borderWidth: isSelected ? 1 : 0.5,
                    shadowColor: isSelected ? '#2c3e50' : 'transparent',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: isSelected ? 0.05 : 0,
                    shadowRadius: 4,
                    elevation: isSelected ? 2 : 0,
                  }
                ]}
                onPress={() => onAddGarment(garmentType, serviceType)}
                activeOpacity={0.8}
              >
                <View style={styles.serviceInfo}>
                  <Text style={styles.serviceEmoji}>
                    {serviceConfig.emoji}
                  </Text>
                  <View style={styles.serviceDetails}>
                    <Text style={[
                      styles.serviceLabel,
                      {
                        color: isSelected ? '#2c3e50' : colors.text,
                        fontWeight: isSelected ? '600' : '500',
                        letterSpacing: 0.2,
                      }
                    ]}>
                      {serviceConfig.label}
                    </Text>
                    <Text style={[
                      styles.serviceDescription,
                      {
                        color: colors.textSecondary,
                        fontSize: 12,
                        marginTop: 2,
                      }
                    ]}>
                      {serviceConfig.description}
                    </Text>
                    <Text style={[
                      styles.servicePrice,
                      {
                        color: isSelected ? '#2c3e50' : colors.primary,
                        fontWeight: isSelected ? '600' : '500',
                        letterSpacing: 0.3,
                      }
                    ]}>
                      {formatCurrency(price)}
                    </Text>
                  </View>
                </View>

                <View style={styles.quantityControls}>
                  {quantity > 0 && (
                    <>
                      <TouchableOpacity
                        style={[
                          styles.quantityButton,
                          {
                            backgroundColor: '#2c3e50',
                            shadowColor: '#2c3e50',
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.15,
                            shadowRadius: 3,
                            elevation: 2,
                          }
                        ]}
                        onPress={() => onRemoveGarment(garmentType, serviceType)}
                        activeOpacity={0.7}
                      >
                        <Ionicons name="remove" size={16} color="white" />
                      </TouchableOpacity>
                      <View style={[
                        styles.quantityBadge,
                        {
                          backgroundColor: '#2c3e50',
                          shadowColor: '#2c3e50',
                          shadowOffset: { width: 0, height: 1 },
                          shadowOpacity: 0.1,
                          shadowRadius: 2,
                          elevation: 1,
                        }
                      ]}>
                        <Text style={styles.quantityText}>
                          {quantity}
                        </Text>
                      </View>
                    </>
                  )}
                  <TouchableOpacity
                    style={[
                      styles.addButton,
                      {
                        backgroundColor: isSelected ? '#2c3e50' : '#f8f9fa',
                        borderColor: '#2c3e50',
                        borderWidth: 1,
                        shadowColor: '#2c3e50',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: isSelected ? 0.15 : 0.05,
                        shadowRadius: 3,
                        elevation: isSelected ? 2 : 1,
                      }
                    ]}
                    onPress={() => onAddGarment(garmentType, serviceType)}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name="add"
                      size={16}
                      color={isSelected ? 'white' : '#2c3e50'}
                    />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </View>
  );
};

export default function SchedulePickupScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const {
    selectedGarments,
    addGarmentToSelection,
    removeGarmentFromSelection,
    getTotalPrice,
    categories,
    isLoading,
    error,
    fetchGarmentConfig,
    clearSelection
  } = useGarmentConfig();
  const [activeTab, setActiveTab] = useState<string>('');

  // Set initial tab when categories load
  useEffect(() => {
    if (categories.length > 0 && !activeTab) {
      setActiveTab(categories[0].id);
    }
  }, [categories]);

  // Fetch garment config on component mount
  useEffect(() => {
    console.log('🔍 SchedulePickup: Component mounted');
    console.log('📊 SchedulePickup: Current state:', {
      categoriesLength: categories.length,
      isLoading,
      error,
    });

    if (categories.length === 0 && !isLoading && !error) {
      console.log('🚀 SchedulePickup: Fetching garment config with businessId: 68d2971b2fc5bd3f6a4b5ed9');
      fetchGarmentConfig('68d2971b2fc5bd3f6a4b5ed9');
    } else {
      console.log('⏭️ SchedulePickup: Skipping fetch - categories:', categories.length, 'loading:', isLoading, 'error:', error);
    }
  }, []);

  // Clear invalid garments on load (ones with old service types)
  useEffect(() => {
    if (selectedGarments.length > 0 && categories.length > 0) {
      const validServiceTypes: ServiceType[] = ['LAUNDRY', 'WASH_PRESS', 'DRY_CLEAN', 'IRON_ONLY'];
      const hasInvalidGarments = selectedGarments.some(
        garment => !validServiceTypes.includes(garment.serviceType)
      );

      if (hasInvalidGarments) {
        console.log('🗑️ SchedulePickup: Found invalid garments with old service types, clearing all');
        console.log('⚠️ Old service types detected - clearing cache to prevent errors');
        clearSelection();
      }
    }
  }, [categories]);

  const handleAddGarment = (garmentType: SimplifiedGarmentType, serviceType: ServiceType) => {
    console.log('➕ Adding garment:', garmentType.name, serviceType);
    addGarmentToSelection(garmentType, serviceType, 1);
  };

  const handleRemoveGarment = (garmentType: SimplifiedGarmentType, serviceType: ServiceType) => {
    console.log('➖ Removing garment:', garmentType.name, serviceType);

    // Find the existing garment
    const existingIndex = selectedGarments.findIndex(
      item => item.garmentTypeId === garmentType.id && item.serviceType === serviceType
    );

    if (existingIndex !== -1) {
      const existingGarment = selectedGarments[existingIndex];
      if (existingGarment.quantity > 1) {
        // If quantity > 1, decrement by 1
        console.log('🔄 Decrementing quantity from', existingGarment.quantity, 'to', existingGarment.quantity - 1);
        // Update quantity using the store's updateGarmentQuantity function
        const { updateGarmentQuantity } = useGarmentConfigStore.getState();
        updateGarmentQuantity(existingIndex, existingGarment.quantity - 1);
      } else {
        // If quantity = 1, remove the entire item
        console.log('🗑️ Removing garment completely');
        removeGarmentFromSelection(existingIndex);
      }
    } else {
      console.log('❌ Garment not found to remove');
    }
  };

  const handleClearAll = () => {
    if (selectedGarments.length === 0) {
      return;
    }

    Alert.alert(
      'Clear All Items',
      `Are you sure you want to remove all ${selectedGarments.length} item${selectedGarments.length !== 1 ? 's' : ''} from your selection?`,
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: () => {
            console.log('🗑️ Clearing all selected garments');
            clearSelection();
          }
        }
      ]
    );
  };

  const handleContinue = () => {
    if (selectedGarments.length === 0) {
      Alert.alert(
        'No Items Selected',
        'Please select at least one garment to continue.'
      );
      return;
    }

    // Navigate directly to time-location (skipping service-type step)
    router.push('/(customer)/time-location');
  };

  const selectedItemsCount = selectedGarments.reduce((sum, item) => sum + item.quantity, 0);
  const selectedItemsTotal = getTotalPrice();

  // Show loading state
  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar style="dark" />
        <View style={styles.loadingContainer}>
          <LoadingSpinner size="large" />
          <Text style={[styles.loadingText, { color: colors.text }]}>
            Loading garment options...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show error state
  if (error) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar style="dark" />
        <View style={styles.errorContainer}>
          <ErrorView
            message={error}
            onRetry={() => fetchGarmentConfig('68d2971b2fc5bd3f6a4b5ed9')}
          />
        </View>
      </SafeAreaView>
    );
  }

  // Show empty state if no items
  if (categories.length === 0 && !isLoading && !error) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar style="dark" />
        <View style={styles.errorContainer}>
          <Text style={[styles.emptyText, { color: colors.text }]}>
            No garment options available
          </Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: colors.primary }]}
            onPress={() => fetchGarmentConfig('68d2971b2fc5bd3f6a4b5ed9')}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={[styles.header, {
        backgroundColor: colors.card,
        paddingTop: insets.top + 16,
        paddingBottom: 16
      }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
            Select Garments
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]} numberOfLines={1}>
            Step 1 of 5
          </Text>
        </View>
        <View style={styles.headerActions}>
          {selectedGarments.length > 0 && (
            <TouchableOpacity
              style={[styles.clearButton, { marginRight: 8 }]}
              onPress={handleClearAll}
            >
              <Ionicons name="trash-outline" size={20} color="#ef4444" />
              <Text style={[styles.clearButtonText, { color: '#ef4444' }]}>
                Clear
              </Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.helpButton}>
            <Ionicons name="help-circle-outline" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Category Tabs */}
      {categories.length > 0 && (
        <View style={[styles.tabsContainer, { backgroundColor: colors.card }]}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabsContent}
            decelerationRate="normal"
            bounces={false}
            alwaysBounceHorizontal={false}
            scrollEventThrottle={16}
          >
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.tab,
                  {
                    backgroundColor: activeTab === category.id ? colors.primary : colors.background,
                    borderColor: activeTab === category.id ? colors.primary : colors.border,
                    shadowColor: activeTab === category.id ? colors.primary : 'transparent',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: activeTab === category.id ? 0.3 : 0,
                    shadowRadius: 4,
                    elevation: activeTab === category.id ? 4 : 0,
                  }
                ]}
                onPress={() => setActiveTab(category.id)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.tabText,
                    {
                      color: activeTab === category.id ? 'white' : colors.text,
                    }
                  ]}
                  numberOfLines={1}
                >
                  {category.name}
                </Text>
                <View style={[
                  styles.tabCount,
                  {
                    backgroundColor: activeTab === category.id ? 'rgba(255,255,255,0.2)' : colors.primary + '20',
                  }
                ]}>
                  <Text style={[
                    styles.tabCountText,
                    {
                      color: activeTab === category.id ? 'white' : colors.primary,
                    }
                  ]}>
                    {category.garmentTypes.length}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Instructions */}
        <View style={[styles.instructionsCard, { backgroundColor: colors.card }]}>
          <View style={styles.instructionsHeader}>
            <Ionicons name="information-circle" size={20} color={colors.primary} />
            <Text style={[styles.instructionsTitle, { color: colors.text }]}>
              How to Select Items
            </Text>
          </View>
          <Text style={[styles.instructionsText, { color: colors.textSecondary }]}>
            Choose garments from different categories and select the service type for each item. You can mix and match services based on your needs.
          </Text>
        </View>

        {/* Garment Items */}
        {activeTab && (
          <View style={styles.itemsSection}>
            {categories
              .find(cat => cat.id === activeTab)
              ?.garmentTypes.map((garmentType: SimplifiedGarmentType) => (
                <GarmentCard
                  key={garmentType.id}
                  garmentType={garmentType}
                  selectedGarments={selectedGarments}
                  onAddGarment={handleAddGarment}
                  onRemoveGarment={handleRemoveGarment}
                  colors={colors}
                />
              ))}
          </View>
        )}

        {/* Summary removed - now shown in continue button */}
      </ScrollView>

      {/* Continue Button */}
      <View style={[
        styles.footer,
        {
          backgroundColor: colors.card,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -1 },
          shadowOpacity: 0.05,
          shadowRadius: 2,
          elevation: 1,
        }
      ]}>
        <TouchableOpacity
          style={[
            styles.continueButton,
            {
              backgroundColor: selectedItemsCount > 0 ? '#2c3e50' : '#e8e8e8',
              shadowColor: selectedItemsCount > 0 ? '#2c3e50' : 'transparent',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: selectedItemsCount > 0 ? 0.2 : 0,
              shadowRadius: 8,
              elevation: selectedItemsCount > 0 ? 4 : 0,
            },
          ]}
          onPress={handleContinue}
          disabled={selectedItemsCount === 0}
          activeOpacity={0.8}
        >
          <View style={styles.continueButtonContent}>
            <View style={styles.continueButtonLeft}>
              <Text
                style={[
                  styles.continueButtonText,
                  {
                    color: selectedItemsCount > 0 ? 'white' : '#6b7280',
                    fontWeight: selectedItemsCount > 0 ? '600' : '500',
                    letterSpacing: 0.5,
                  },
                ]}
              >
                {selectedItemsCount > 0 ? 'Continue' : 'Select items to continue'}
              </Text>
              {selectedItemsCount > 0 && (
                <View style={styles.continueButtonSummary}>
                  <Text style={[
                    styles.continueButtonItems,
                    { color: 'rgba(255, 255, 255, 0.8)' }
                  ]}>
                    {selectedItemsCount} item{selectedItemsCount !== 1 ? 's' : ''}
                  </Text>
                  <Text style={[
                    styles.continueButtonPrice,
                    { color: 'white', fontWeight: '600' }
                  ]}>
                    {formatCurrency(selectedItemsTotal)}
                  </Text>
                </View>
              )}
            </View>
            <View style={styles.continueButtonArrow}>
              <Ionicons
                name={selectedItemsCount > 0 ? "arrow-forward" : "arrow-forward-outline"}
                size={20}
                color={selectedItemsCount > 0 ? 'white' : '#6b7280'}
              />
            </View>
          </View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    minHeight: 60,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
    borderRadius: 20,
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
    textAlign: 'center',
    fontWeight: '400',
    letterSpacing: 0.2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  clearButtonText: {
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 4,
  },
  helpButton: {
    padding: 8,
    borderRadius: 20,
  },
  tabsContainer: {
    paddingVertical: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  tabsContent: {
    paddingHorizontal: 20,
    paddingRight: 60, // Increased padding to ensure last tab is fully visible
    alignItems: 'center',
    flexDirection: 'row',
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 25,
    borderWidth: 1.5,
    marginRight: 12,
    minWidth: 100,
    maxWidth: 180, // Increased to allow full text display
    justifyContent: 'center',
    flexShrink: 0, // Prevent tabs from shrinking
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    marginRight: 8,
    textAlign: 'center',
    flexShrink: 0, // Prevent text from shrinking
  },
  tabCount: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabCountText: {
    fontSize: 12,
    fontWeight: '700',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  instructionsCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  instructionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  instructionsText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#666',
  },
  itemsSection: {
    marginBottom: 20,
  },
  garmentCard: {
    borderRadius: 16,
    padding: 0,
    marginBottom: 16,
    marginHorizontal: 8,
    overflow: 'hidden',
  },
  garmentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 16,
    paddingRight: 12,
  },
  garmentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  garmentDetails: {
    flex: 1,
    marginLeft: 16,
  },
  garmentName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  garmentDescription: {
    fontSize: 14,
    lineHeight: 18,
  },
  serviceTypesContainer: {
    paddingHorizontal: 8,
    paddingBottom: 20,
  },
  serviceTypeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 18,
    marginBottom: 12,
    borderRadius: 12,
    marginHorizontal: 0,
  },
  serviceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 16,
  },
  serviceIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  serviceDetails: {
    flex: 1,
    marginLeft: 16,
    minWidth: 0,
  },
  serviceLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
    flexShrink: 1,
  },
  serviceDescription: {
    fontSize: 12,
    fontWeight: '400',
    marginBottom: 4,
    flexShrink: 1,
  },
  servicePrice: {
    fontSize: 16,
    fontWeight: '600',
    flexShrink: 0,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flexShrink: 0,
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
    minWidth: 20,
    textAlign: 'center',
  },
  serviceEmoji: {
    fontSize: 20,
    marginRight: 16,
  },
  quantityBadge: {
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  garmentIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  garmentMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
    flexWrap: 'wrap',
  },
  selectedBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  selectedBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: 'white',
  },
  summaryCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  summaryContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  summaryTotal: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  footer: {
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  summaryInfo: {
    flex: 1,
  },
  summarySubtext: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    fontWeight: '400',
    marginTop: 2,
  },
  summaryTotalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  continueButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 4,
  },
  continueButtonLeft: {
    flex: 1,
    paddingRight: 8,
  },
  continueButtonSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    gap: 8,
  },
  continueButtonItems: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    fontWeight: '400',
  },
  continueButtonPrice: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  garmentSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexShrink: 0,
  },
  garmentPrice: {
    fontSize: 14,
    fontWeight: '600',
    flexShrink: 0,
  },
  garmentActions: {
    padding: 8,
  },
  continueButtonArrow: {
    paddingLeft: 8,
  },
});