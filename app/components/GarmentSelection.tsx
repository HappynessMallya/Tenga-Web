/**
 * Garment Selection Component
 * Component for selecting garment categories, types, and services
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  FlatList,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../providers/ThemeProvider';
import { useGarmentConfig } from '../hooks/useGarmentConfig';
import { SimplifiedGarmentCategory, SimplifiedGarmentType, ServiceType } from '../types/garment';
import { garmentConfigService } from '../services/garmentConfigService';

interface GarmentSelectionProps {
  businessId: string;
  onGarmentSelected?: (garment: {
    categoryId: string;
    categoryName: string;
    garmentTypeId: string;
    garmentTypeName: string;
    serviceType: ServiceType;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }) => void;
  onSelectionComplete?: (garments: any[]) => void;
}

export const GarmentSelection: React.FC<GarmentSelectionProps> = ({
  businessId,
  onGarmentSelected,
  onSelectionComplete,
}) => {
  const { colors } = useTheme();
  const {
    categories,
    isLoading,
    error,
    fetchGarmentConfig,
    clearError,
    isConfigLoaded,
    needsRefresh,
  } = useGarmentConfig();

  const [selectedCategory, setSelectedCategory] = useState<SimplifiedGarmentCategory | null>(null);
  const [selectedGarmentType, setSelectedGarmentType] = useState<SimplifiedGarmentType | null>(null);
  const [selectedService, setSelectedService] = useState<ServiceType | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [showGarmentTypes, setShowGarmentTypes] = useState(false);
  const [showServices, setShowServices] = useState(false);

  // Fetch garment configuration on component mount
  useEffect(() => {
    console.log('🏠 GarmentSelection: Component mounted');
    console.log('🏢 Business ID:', businessId);
    
    if (businessId && (!isConfigLoaded() || needsRefresh())) {
      console.log('🔄 GarmentSelection: Fetching garment config...');
      fetchGarmentConfig(businessId);
    } else if (isConfigLoaded()) {
      console.log('✅ GarmentSelection: Config already loaded');
    }
  }, [businessId, fetchGarmentConfig, isConfigLoaded, needsRefresh]);

  // Handle category selection
  const handleCategorySelect = (category: SimplifiedGarmentCategory) => {
    console.log('📁 GarmentSelection: Category selected:', category.name);
    setSelectedCategory(category);
    setSelectedGarmentType(null);
    setSelectedService(null);
    setShowGarmentTypes(true);
    setShowServices(false);
  };

  // Handle garment type selection
  const handleGarmentTypeSelect = (garmentType: SimplifiedGarmentType) => {
    console.log('👕 GarmentSelection: Garment type selected:', garmentType.name);
    setSelectedGarmentType(garmentType);
    setSelectedService(null);
    setShowGarmentTypes(false);
    setShowServices(true);
  };

  // Handle service selection
  const handleServiceSelect = (serviceType: ServiceType) => {
    console.log('🔄 GarmentSelection: Service selected:', serviceType);
    setSelectedService(serviceType);
    setShowServices(false);
  };

  // Handle quantity change
  const handleQuantityChange = (newQuantity: number) => {
    console.log('🔢 GarmentSelection: Quantity changed to:', newQuantity);
    if (newQuantity > 0) {
      setQuantity(newQuantity);
    }
  };

  // Handle garment addition
  const handleAddGarment = () => {
    if (!selectedCategory || !selectedGarmentType || !selectedService) {
      Alert.alert('Incomplete Selection', 'Please select a category, garment type, and service.');
      return;
    }

    console.log('➕ GarmentSelection: Adding garment to selection');
    
    const unitPrice = garmentConfigService.getServicePricing(selectedGarmentType, selectedService);
    if (unitPrice === null) {
      Alert.alert('Pricing Error', 'No pricing available for this service type.');
      return;
    }

    const totalPrice = unitPrice * quantity;
    
    const garment = {
      categoryId: selectedCategory.id,
      categoryName: selectedCategory.name,
      garmentTypeId: selectedGarmentType.id,
      garmentTypeName: selectedGarmentType.name,
      serviceType: selectedService,
      quantity,
      unitPrice,
      totalPrice,
    };

    console.log('📦 GarmentSelection: Garment data:', garment);
    
    onGarmentSelected?.(garment);
    
    // Reset selection
    setSelectedCategory(null);
    setSelectedGarmentType(null);
    setSelectedService(null);
    setQuantity(1);
    setShowGarmentTypes(false);
    setShowServices(false);
  };

  // Render category item
  const renderCategoryItem = ({ item }: { item: SimplifiedGarmentCategory }) => (
    <TouchableOpacity
      style={[
        styles.categoryItem,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
        },
        selectedCategory?.id === item.id && {
          borderColor: colors.primary,
          backgroundColor: colors.primary + '10',
        },
      ]}
      onPress={() => handleCategorySelect(item)}
    >
      <View style={styles.categoryContent}>
        <Text style={[styles.categoryName, { color: colors.text }]}>
          {item.name}
        </Text>
        <Text style={[styles.categoryDescription, { color: colors.textSecondary }]}>
          {item.description}
        </Text>
        <Text style={[styles.categoryCount, { color: colors.textSecondary }]}>
          {item.garmentTypes.length} items
        </Text>
      </View>
      <Ionicons
        name="chevron-forward"
        size={20}
        color={colors.textSecondary}
      />
    </TouchableOpacity>
  );

  // Render garment type item
  const renderGarmentTypeItem = ({ item }: { item: SimplifiedGarmentType }) => (
    <TouchableOpacity
      style={[
        styles.garmentTypeItem,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
        },
        selectedGarmentType?.id === item.id && {
          borderColor: colors.primary,
          backgroundColor: colors.primary + '10',
        },
      ]}
      onPress={() => handleGarmentTypeSelect(item)}
    >
      <View style={styles.garmentTypeContent}>
        <Text style={[styles.garmentTypeName, { color: colors.text }]}>
          {item.name}
        </Text>
        <Text style={[styles.garmentTypeDescription, { color: colors.textSecondary }]}>
          {item.description}
        </Text>
        <Text style={[styles.garmentTypeServices, { color: colors.textSecondary }]}>
          {Object.keys(item.pricing).length} services available
        </Text>
      </View>
      <Ionicons
        name="chevron-forward"
        size={20}
        color={colors.textSecondary}
      />
    </TouchableOpacity>
  );

  // Render service item
  const renderServiceItem = ({ item }: { item: ServiceType }) => {
    const pricing = selectedGarmentType?.pricing[item];
    const serviceName = garmentConfigService.getServiceTypeName(item);
    
    return (
      <TouchableOpacity
        style={[
          styles.serviceItem,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
          },
          selectedService === item && {
            borderColor: colors.primary,
            backgroundColor: colors.primary + '10',
          },
        ]}
        onPress={() => handleServiceSelect(item)}
      >
        <View style={styles.serviceContent}>
          <Text style={[styles.serviceName, { color: colors.text }]}>
            {serviceName}
          </Text>
          <Text style={[styles.serviceDescription, { color: colors.textSecondary }]}>
            {garmentConfigService.getServiceTypeDescription(item)}
          </Text>
          {pricing && (
            <Text style={[styles.servicePrice, { color: colors.primary }]}>
              ${pricing.amount} {pricing.currency}
            </Text>
          )}
        </View>
        <Ionicons
          name="checkmark"
          size={20}
          color={selectedService === item ? colors.primary : colors.textSecondary}
        />
      </TouchableOpacity>
    );
  };

  // Loading state
  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: colors.text }]}>
            Loading garment configuration...
          </Text>
        </View>
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color={colors.error} />
          <Text style={[styles.errorTitle, { color: colors.text }]}>
            Error Loading Configuration
          </Text>
          <Text style={[styles.errorMessage, { color: colors.textSecondary }]}>
            {error}
          </Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: colors.primary }]}
            onPress={() => {
              clearError();
              fetchGarmentConfig(businessId);
            }}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // No data state
  if (categories.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.emptyContainer}>
          <Ionicons name="shirt-outline" size={48} color={colors.textSecondary} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            No Garment Categories
          </Text>
          <Text style={[styles.emptyMessage, { color: colors.textSecondary }]}>
            No garment categories are available for this business.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        
        {/* Categories List */}
        {!showGarmentTypes && !showServices && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Select Category
            </Text>
            <FlatList
              data={categories}
              keyExtractor={(item) => item.id}
              renderItem={renderCategoryItem}
              scrollEnabled={false}
            />
          </View>
        )}

        {/* Garment Types List */}
        {showGarmentTypes && selectedCategory && (
          <View style={styles.section}>
            <View style={styles.header}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => {
                  setShowGarmentTypes(false);
                  setSelectedCategory(null);
                }}
              >
                <Ionicons name="arrow-back" size={24} color={colors.text} />
              </TouchableOpacity>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                {selectedCategory.name}
              </Text>
            </View>
            <FlatList
              data={selectedCategory.garmentTypes}
              keyExtractor={(item) => item.id}
              renderItem={renderGarmentTypeItem}
              scrollEnabled={false}
            />
          </View>
        )}

        {/* Services List */}
        {showServices && selectedGarmentType && (
          <View style={styles.section}>
            <View style={styles.header}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => {
                  setShowServices(false);
                  setSelectedGarmentType(null);
                }}
              >
                <Ionicons name="arrow-back" size={24} color={colors.text} />
              </TouchableOpacity>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                {selectedGarmentType.name}
              </Text>
            </View>
            
            <FlatList
              data={Object.keys(selectedGarmentType.pricing) as ServiceType[]}
              keyExtractor={(item) => item}
              renderItem={renderServiceItem}
              scrollEnabled={false}
            />

            {/* Quantity Selection */}
            {selectedService && (
              <View style={styles.quantitySection}>
                <Text style={[styles.quantityLabel, { color: colors.text }]}>
                  Quantity
                </Text>
                <View style={styles.quantityControls}>
                  <TouchableOpacity
                    style={[styles.quantityButton, { backgroundColor: colors.border }]}
                    onPress={() => handleQuantityChange(quantity - 1)}
                    disabled={quantity <= 1}
                  >
                    <Ionicons name="remove" size={20} color={colors.text} />
                  </TouchableOpacity>
                  
                  <Text style={[styles.quantityText, { color: colors.text }]}>
                    {quantity}
                  </Text>
                  
                  <TouchableOpacity
                    style={[styles.quantityButton, { backgroundColor: colors.border }]}
                    onPress={() => handleQuantityChange(quantity + 1)}
                  >
                    <Ionicons name="add" size={20} color={colors.text} />
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Add Garment Button */}
            {selectedService && (
              <TouchableOpacity
                style={[styles.addButton, { backgroundColor: colors.primary }]}
                onPress={handleAddGarment}
              >
                <Text style={styles.addButtonText}>
                  Add to Selection
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  
  scrollView: {
    flex: 1,
    padding: 16,
  },
  
  section: {
    marginBottom: 24,
  },
  
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  
  backButton: {
    marginRight: 12,
    padding: 4,
  },
  
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    fontFamily: 'Roboto-Bold',
  },
  
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  
  categoryContent: {
    flex: 1,
  },
  
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Roboto-Bold',
    marginBottom: 4,
  },
  
  categoryDescription: {
    fontSize: 14,
    fontFamily: 'Roboto-Regular',
    marginBottom: 4,
  },
  
  categoryCount: {
    fontSize: 12,
    fontFamily: 'Roboto-Regular',
  },
  
  garmentTypeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  
  garmentTypeContent: {
    flex: 1,
  },
  
  garmentTypeName: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Roboto-Bold',
    marginBottom: 4,
  },
  
  garmentTypeDescription: {
    fontSize: 14,
    fontFamily: 'Roboto-Regular',
    marginBottom: 4,
  },
  
  garmentTypeServices: {
    fontSize: 12,
    fontFamily: 'Roboto-Regular',
  },
  
  serviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  
  serviceContent: {
    flex: 1,
  },
  
  serviceName: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Roboto-Bold',
    marginBottom: 4,
  },
  
  serviceDescription: {
    fontSize: 14,
    fontFamily: 'Roboto-Regular',
    marginBottom: 4,
  },
  
  servicePrice: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Roboto-Bold',
  },
  
  quantitySection: {
    marginTop: 24,
    marginBottom: 16,
  },
  
  quantityLabel: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Roboto-Bold',
    marginBottom: 12,
  },
  
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  quantityButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  quantityText: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Roboto-Bold',
    marginHorizontal: 20,
    minWidth: 30,
    textAlign: 'center',
  },
  
  addButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Roboto-Bold',
  },
  
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  
  loadingText: {
    fontSize: 16,
    fontFamily: 'Roboto-Regular',
  },
  
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Roboto-Bold',
    marginTop: 16,
    marginBottom: 8,
  },
  
  errorMessage: {
    fontSize: 14,
    fontFamily: 'Roboto-Regular',
    textAlign: 'center',
    marginBottom: 24,
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
    fontFamily: 'Roboto-Bold',
  },
  
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Roboto-Bold',
    marginTop: 16,
    marginBottom: 8,
  },
  
  emptyMessage: {
    fontSize: 14,
    fontFamily: 'Roboto-Regular',
    textAlign: 'center',
  },
});
