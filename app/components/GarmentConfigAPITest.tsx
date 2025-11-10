/**
 * Garment Configuration API Test Component
 * Demonstrates the garment configuration API integration
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../providers/ThemeProvider';
import { useGarmentConfig } from '../hooks/useGarmentConfig';
import { GarmentSelection } from './GarmentSelection';
import { SimplifiedGarmentCategory, SimplifiedGarmentType, ServiceType } from '../types/garment';
import { garmentConfigService } from '../services/garmentConfigService';

export const GarmentConfigAPITest: React.FC = () => {
  const { colors } = useTheme();
  const {
    categories,
    selectedGarments,
    isLoading,
    error,
    fetchGarmentConfig,
    clearError,
    isConfigLoaded,
    needsRefresh,
    getTotalPrice,
    clearSelection,
  } = useGarmentConfig();

  const [businessId] = useState('68d2971b2fc5bd3f6a4b5ed9'); // Default business ID
  const [showGarmentSelection, setShowGarmentSelection] = useState(false);

  // Fetch garment configuration on component mount
  useEffect(() => {
    console.log('🏠 GarmentConfigAPITest: Component mounted');
    console.log('🏢 Business ID:', businessId);
    
    if (businessId && (!isConfigLoaded() || needsRefresh())) {
      console.log('🔄 GarmentConfigAPITest: Fetching garment config...');
      fetchGarmentConfig(businessId);
    } else if (isConfigLoaded()) {
      console.log('✅ GarmentConfigAPITest: Config already loaded');
    }
  }, [businessId, fetchGarmentConfig, isConfigLoaded, needsRefresh]);

  // Handle garment selection
  const handleGarmentSelected = (garment: any) => {
    console.log('➕ GarmentConfigAPITest: Garment selected:', garment);
    Alert.alert(
      'Garment Added',
      `${garment.garmentTypeName} (${garmentConfigService.getServiceTypeName(garment.serviceType)}) x${garment.quantity} - $${garment.totalPrice}`,
      [{ text: 'OK' }]
    );
  };

  // Handle refresh
  const handleRefresh = () => {
    console.log('🔄 GarmentConfigAPITest: Manual refresh triggered');
    clearError();
    fetchGarmentConfig(businessId);
  };

  // Handle clear selection
  const handleClearSelection = () => {
    console.log('🗑️ GarmentConfigAPITest: Clearing selection');
    clearSelection();
  };

  // Render category summary
  const renderCategorySummary = (category: SimplifiedGarmentCategory) => (
    <View key={category.id} style={[styles.categorySummary, { backgroundColor: colors.card }]}>
      <Text style={[styles.categoryName, { color: colors.text }]}>
        {category.name}
      </Text>
      <Text style={[styles.categoryDescription, { color: colors.textSecondary }]}>
        {category.description}
      </Text>
      <Text style={[styles.categoryCount, { color: colors.textSecondary }]}>
        {category.garmentTypes.length} garment types
      </Text>
      
      {/* Show garment types */}
      {category.garmentTypes.map((garmentType) => (
        <View key={garmentType.id} style={styles.garmentTypeSummary}>
          <Text style={[styles.garmentTypeName, { color: colors.text }]}>
            • {garmentType.name}
          </Text>
          <Text style={[styles.garmentTypeDescription, { color: colors.textSecondary }]}>
            {garmentType.description}
          </Text>
          
          {/* Show available services and pricing */}
          <View style={styles.servicesContainer}>
            {Object.entries(garmentType.pricing).map(([serviceType, pricing]) => (
              <View key={serviceType} style={styles.serviceSummary}>
                <Text style={[styles.serviceName, { color: colors.primary }]}>
                  {garmentConfigService.getServiceTypeName(serviceType as ServiceType)}
                </Text>
                <Text style={[styles.servicePrice, { color: colors.text }]}>
                  ${pricing.amount} {pricing.currency}
                </Text>
              </View>
            ))}
          </View>
        </View>
      ))}
    </View>
  );

  // Render selected garments
  const renderSelectedGarments = () => {
    if (selectedGarments.length === 0) {
      return (
        <View style={[styles.emptySelection, { backgroundColor: colors.card }]}>
          <Ionicons name="shirt-outline" size={32} color={colors.textSecondary} />
          <Text style={[styles.emptySelectionText, { color: colors.textSecondary }]}>
            No garments selected
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.selectedGarmentsContainer}>
        <Text style={[styles.selectedGarmentsTitle, { color: colors.text }]}>
          Selected Garments ({selectedGarments.length})
        </Text>
        
        {selectedGarments.map((garment, index) => (
          <View key={index} style={[styles.selectedGarmentItem, { backgroundColor: colors.card }]}>
            <View style={styles.selectedGarmentContent}>
              <Text style={[styles.selectedGarmentName, { color: colors.text }]}>
                {garment.garmentTypeName}
              </Text>
              <Text style={[styles.selectedGarmentService, { color: colors.textSecondary }]}>
                {garmentConfigService.getServiceTypeName(garment.serviceType)}
              </Text>
              <Text style={[styles.selectedGarmentQuantity, { color: colors.textSecondary }]}>
                Quantity: {garment.quantity}
              </Text>
            </View>
            <Text style={[styles.selectedGarmentPrice, { color: colors.primary }]}>
              ${garment.totalPrice}
            </Text>
          </View>
        ))}
        
        <View style={[styles.totalContainer, { backgroundColor: colors.primary + '10' }]}>
          <Text style={[styles.totalLabel, { color: colors.text }]}>
            Total Price:
          </Text>
          <Text style={[styles.totalPrice, { color: colors.primary }]}>
            ${getTotalPrice()}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>
            Garment Configuration API Test
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Testing garment categories, types, and pricing API
          </Text>
        </View>

        {/* API Status */}
        <View style={[styles.statusContainer, { backgroundColor: colors.card }]}>
          <Text style={[styles.statusTitle, { color: colors.text }]}>
            API Status
          </Text>
          
          <View style={styles.statusRow}>
            <Text style={[styles.statusLabel, { color: colors.textSecondary }]}>
              Business ID:
            </Text>
            <Text style={[styles.statusValue, { color: colors.text }]}>
              {businessId}
            </Text>
          </View>
          
          <View style={styles.statusRow}>
            <Text style={[styles.statusLabel, { color: colors.textSecondary }]}>
              Loading:
            </Text>
            <Text style={[styles.statusValue, { color: isLoading ? colors.warning : colors.success }]}>
              {isLoading ? 'Yes' : 'No'}
            </Text>
          </View>
          
          <View style={styles.statusRow}>
            <Text style={[styles.statusLabel, { color: colors.textSecondary }]}>
              Config Loaded:
            </Text>
            <Text style={[styles.statusValue, { color: isConfigLoaded() ? colors.success : colors.error }]}>
              {isConfigLoaded() ? 'Yes' : 'No'}
            </Text>
          </View>
          
          <View style={styles.statusRow}>
            <Text style={[styles.statusLabel, { color: colors.textSecondary }]}>
              Categories Count:
            </Text>
            <Text style={[styles.statusValue, { color: colors.text }]}>
              {categories.length}
            </Text>
          </View>
          
          {error && (
            <View style={styles.errorRow}>
              <Text style={[styles.errorLabel, { color: colors.error }]}>
                Error:
              </Text>
              <Text style={[styles.errorValue, { color: colors.error }]}>
                {error}
              </Text>
            </View>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.primary }]}
            onPress={handleRefresh}
            disabled={isLoading}
          >
            <Ionicons name="refresh" size={20} color="white" />
            <Text style={styles.actionButtonText}>Refresh</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.secondary }]}
            onPress={() => setShowGarmentSelection(!showGarmentSelection)}
          >
            <Ionicons name="shirt" size={20} color="white" />
            <Text style={styles.actionButtonText}>
              {showGarmentSelection ? 'Hide Selection' : 'Show Selection'}
            </Text>
          </TouchableOpacity>
          
          {selectedGarments.length > 0 && (
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.error }]}
              onPress={handleClearSelection}
            >
              <Ionicons name="trash" size={20} color="white" />
              <Text style={styles.actionButtonText}>Clear Selection</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Garment Selection Component */}
        {showGarmentSelection && (
          <View style={styles.garmentSelectionContainer}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Garment Selection
            </Text>
            <GarmentSelection
              businessId={businessId}
              onGarmentSelected={handleGarmentSelected}
            />
          </View>
        )}

        {/* Selected Garments */}
        <View style={styles.selectedGarmentsSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Selected Garments
          </Text>
          {renderSelectedGarments()}
        </View>

        {/* Categories Summary */}
        {categories.length > 0 && (
          <View style={styles.categoriesSection}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Available Categories
            </Text>
            {categories.map(renderCategorySummary)}
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  
  content: {
    padding: 16,
  },
  
  header: {
    marginBottom: 24,
  },
  
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: 'Roboto-Bold',
    marginBottom: 8,
  },
  
  subtitle: {
    fontSize: 16,
    fontFamily: 'Roboto-Regular',
  },
  
  statusContainer: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  
  statusTitle: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Roboto-Bold',
    marginBottom: 12,
  },
  
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  
  statusLabel: {
    fontSize: 14,
    fontFamily: 'Roboto-Regular',
  },
  
  statusValue: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Roboto-Bold',
  },
  
  errorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  
  errorLabel: {
    fontSize: 14,
    fontFamily: 'Roboto-Regular',
  },
  
  errorValue: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Roboto-Bold',
    flex: 1,
    textAlign: 'right',
  },
  
  actionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
    gap: 12,
  },
  
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  
  actionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Roboto-Bold',
  },
  
  garmentSelectionContainer: {
    marginBottom: 24,
  },
  
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    fontFamily: 'Roboto-Bold',
    marginBottom: 16,
  },
  
  selectedGarmentsSection: {
    marginBottom: 24,
  },
  
  selectedGarmentsContainer: {
    gap: 12,
  },
  
  selectedGarmentsTitle: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Roboto-Bold',
    marginBottom: 12,
  },
  
  selectedGarmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
  },
  
  selectedGarmentContent: {
    flex: 1,
  },
  
  selectedGarmentName: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Roboto-Bold',
    marginBottom: 4,
  },
  
  selectedGarmentService: {
    fontSize: 14,
    fontFamily: 'Roboto-Regular',
    marginBottom: 2,
  },
  
  selectedGarmentQuantity: {
    fontSize: 12,
    fontFamily: 'Roboto-Regular',
  },
  
  selectedGarmentPrice: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Roboto-Bold',
  },
  
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginTop: 12,
  },
  
  totalLabel: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Roboto-Bold',
  },
  
  totalPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'Roboto-Bold',
  },
  
  emptySelection: {
    alignItems: 'center',
    padding: 32,
    borderRadius: 12,
  },
  
  emptySelectionText: {
    fontSize: 16,
    fontFamily: 'Roboto-Regular',
    marginTop: 12,
  },
  
  categoriesSection: {
    marginBottom: 24,
  },
  
  categorySummary: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  
  categoryName: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Roboto-Bold',
    marginBottom: 4,
  },
  
  categoryDescription: {
    fontSize: 14,
    fontFamily: 'Roboto-Regular',
    marginBottom: 8,
  },
  
  categoryCount: {
    fontSize: 12,
    fontFamily: 'Roboto-Regular',
    marginBottom: 12,
  },
  
  garmentTypeSummary: {
    marginLeft: 16,
    marginBottom: 12,
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
    marginBottom: 8,
  },
  
  servicesContainer: {
    marginLeft: 16,
  },
  
  serviceSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  
  serviceName: {
    fontSize: 14,
    fontFamily: 'Roboto-Regular',
  },
  
  servicePrice: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Roboto-Bold',
  },
});
