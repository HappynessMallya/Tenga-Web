/**
 * Order Creation Component
 * Component for creating orders with garment selection and scheduling
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../providers/ThemeProvider';
import { useOrderCreation } from '../hooks/useOrderCreation';
import { useGarmentConfig } from '../hooks/useGarmentConfig';
import { GarmentSelection } from './GarmentSelection';
import { Button } from './Button';
import { LoadingSpinner } from './LoadingSpinner';
import { ErrorView } from './ErrorView';
import { CreateOrderItem, CustomerLocation } from '../types/orderCreation';

interface OrderCreationProps {
  businessId: string;
  onOrderCreated?: (orderId: string) => void;
  onCancel?: () => void;
  initialLocation?: CustomerLocation;
}

export const OrderCreation: React.FC<OrderCreationProps> = ({
  businessId,
  onOrderCreated,
  onCancel,
  initialLocation,
}) => {
  const { colors } = useTheme();
  const {
    isLoading,
    error,
    success,
    orderId,
    order,
    pricing,
    selectedItems,
    customerLocation,
    formData,
    validationErrors,
    createOrder,
    clearError,
    addGarmentToOrder,
    removeGarmentFromOrder,
    updateGarmentQuantity,
    setPickupTimeSlot,
    setDeliveryTimeSlot,
    setOrderNotes,
    setOrderTags,
    setCustomerLocationFromAddress,
    getOrderSummary,
    getValidationErrors,
    hasValidationErrors,
    getItemTotal,
    getTotalWeight,
    getTotalItems,
    isOrderReady,
    clearOrder,
    estimatedTotal,
    canSubmit,
  } = useOrderCreation();

  const { getServicePricing, getServiceTypeName } = useGarmentConfig();

  const [showGarmentSelection, setShowGarmentSelection] = useState(false);
  const [notes, setNotes] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');

  // Set initial location if provided
  useEffect(() => {
    if (initialLocation) {
      console.log('📍 OrderCreation: Setting initial location:', initialLocation.description);
      setCustomerLocationFromAddress(
        initialLocation.latitude,
        initialLocation.longitude,
        initialLocation.description,
        initialLocation.city,
        initialLocation.country
      );
    }
  }, [initialLocation, setCustomerLocationFromAddress]);

  // Handle successful order creation
  useEffect(() => {
    if (success && orderId) {
      console.log('✅ OrderCreation: Order created successfully:', orderId);
      Alert.alert(
        'Order Created!',
        `Your order has been created successfully.\nOrder ID: ${orderId}\nTotal: ${pricing?.currency} ${pricing?.totalAmount}`,
        [
          {
            text: 'OK',
            onPress: () => {
              onOrderCreated?.(orderId);
              clearOrder();
            },
          },
        ]
      );
    }
  }, [success, orderId, pricing, onOrderCreated, clearOrder]);

  // Handle garment selection
  const handleGarmentSelected = (garment: {
    categoryId: string;
    categoryName: string;
    garmentTypeId: string;
    garmentTypeName: string;
    serviceType: 'WASH_FOLD' | 'DRY_CLEAN' | 'HANG_DRY' | 'IRON_ONLY';
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }) => {
    console.log('➕ OrderCreation: Garment selected:', garment);
    
    addGarmentToOrder(
      garment.garmentTypeId,
      garment.serviceType,
      `${garment.garmentTypeName} - ${getServiceTypeName(garment.serviceType)}`,
      garment.quantity,
      0.5, // Default weight
      garment.unitPrice
    );
    
    setShowGarmentSelection(false);
  };

  // Handle order creation
  const handleCreateOrder = async () => {
    console.log('🚀 OrderCreation: Creating order');
    
    if (!isOrderReady()) {
      console.log('❌ OrderCreation: Order not ready for submission');
      Alert.alert('Incomplete Order', 'Please complete all required fields before submitting.');
      return;
    }

    // Set notes and tags
    setOrderNotes(notes);
    setOrderTags(tags);

    try {
      await createOrder();
    } catch (err) {
      console.error('❌ OrderCreation: Failed to create order:', err);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    console.log('❌ OrderCreation: Cancelling order creation');
    
    if (selectedItems.length > 0 || notes.trim() || tags.length > 0) {
      Alert.alert(
        'Cancel Order Creation',
        'Are you sure you want to cancel? All entered data will be lost.',
        [
          { text: 'Keep Editing', style: 'cancel' },
          {
            text: 'Cancel',
            style: 'destructive',
            onPress: () => {
              clearOrder();
              onCancel?.();
            },
          },
        ]
      );
    } else {
      onCancel?.();
    }
  };

  // Add tag
  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      const newTags = [...tags, newTag.trim()];
      setTags(newTags);
      setNewTag('');
      console.log('🏷️ Added tag:', newTag.trim());
    }
  };

  // Remove tag
  const handleRemoveTag = (tagToRemove: string) => {
    const newTags = tags.filter(tag => tag !== tagToRemove);
    setTags(newTags);
    console.log('🗑️ Removed tag:', tagToRemove);
  };

  // Render order item
  const renderOrderItem = (item: CreateOrderItem, index: number) => (
    <View key={index} style={[styles.orderItem, { backgroundColor: colors.card }]}>
      <View style={styles.orderItemContent}>
        <Text style={[styles.orderItemName, { color: colors.text }]}>
          {item.description}
        </Text>
        <Text style={[styles.orderItemDetails, { color: colors.textSecondary }]}>
          {item.quantity} × {getServiceTypeName(item.serviceType)}
        </Text>
        <Text style={[styles.orderItemWeight, { color: colors.textSecondary }]}>
          Weight: {item.weightLbs * item.quantity} lbs
        </Text>
      </View>
      
      <View style={styles.orderItemActions}>
        <View style={styles.quantityControls}>
          <TouchableOpacity
            style={[styles.quantityButton, { backgroundColor: colors.border }]}
            onPress={() => updateGarmentQuantity(index, Math.max(1, item.quantity - 1))}
          >
            <Ionicons name="remove" size={16} color={colors.text} />
          </TouchableOpacity>
          
          <Text style={[styles.quantityText, { color: colors.text }]}>
            {item.quantity}
          </Text>
          
          <TouchableOpacity
            style={[styles.quantityButton, { backgroundColor: colors.border }]}
            onPress={() => updateGarmentQuantity(index, item.quantity + 1)}
          >
            <Ionicons name="add" size={16} color={colors.text} />
          </TouchableOpacity>
        </View>
        
        <Text style={[styles.orderItemPrice, { color: colors.primary }]}>
          ${getItemTotal(index)}
        </Text>
        
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => removeGarmentFromOrder(index)}
        >
          <Ionicons name="trash" size={16} color={colors.error} />
        </TouchableOpacity>
      </View>
    </View>
  );

  // Render tags
  const renderTags = () => (
    <View style={styles.tagsContainer}>
      <Text style={[styles.tagsLabel, { color: colors.text }]}>Tags</Text>
      
      <View style={styles.tagsList}>
        {tags.map((tag, index) => (
          <View key={index} style={[styles.tag, { backgroundColor: colors.primary + '20' }]}>
            <Text style={[styles.tagText, { color: colors.primary }]}>{tag}</Text>
            <TouchableOpacity onPress={() => handleRemoveTag(tag)}>
              <Ionicons name="close" size={14} color={colors.primary} />
            </TouchableOpacity>
          </View>
        ))}
      </View>
      
      <View style={styles.addTagContainer}>
        <TextInput
          style={[styles.tagInput, { 
            backgroundColor: colors.background,
            borderColor: colors.border,
            color: colors.text 
          }]}
          placeholder="Add tag..."
          placeholderTextColor={colors.textSecondary}
          value={newTag}
          onChangeText={setNewTag}
          onSubmitEditing={handleAddTag}
        />
        <TouchableOpacity
          style={[styles.addTagButton, { backgroundColor: colors.primary }]}
          onPress={handleAddTag}
        >
          <Ionicons name="add" size={16} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );

  // Loading state
  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <LoadingSpinner message="Creating your order..." />
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ErrorView
          message={error}
          onRetry={() => {
            clearError();
            handleCreateOrder();
          }}
        />
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>
            Create Order
          </Text>
          <TouchableOpacity onPress={handleCancel} style={styles.cancelButton}>
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Customer Location */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Pickup Location
          </Text>
          <Text style={[styles.locationText, { color: colors.textSecondary }]}>
            {customerLocation?.description || 'No location selected'}
          </Text>
        </View>

        {/* Garment Selection */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Garments ({selectedItems.length})
            </Text>
            <TouchableOpacity
              style={[styles.addButton, { backgroundColor: colors.primary }]}
              onPress={() => setShowGarmentSelection(true)}
            >
              <Ionicons name="add" size={16} color="white" />
              <Text style={styles.addButtonText}>Add Item</Text>
            </TouchableOpacity>
          </View>

          {selectedItems.length > 0 ? (
            <View style={styles.itemsList}>
              {selectedItems.map((item, index) => renderOrderItem(item, index))}
            </View>
          ) : (
            <View style={[styles.emptyItems, { backgroundColor: colors.card }]}>
              <Ionicons name="shirt-outline" size={32} color={colors.textSecondary} />
              <Text style={[styles.emptyItemsText, { color: colors.textSecondary }]}>
                No garments selected
              </Text>
            </View>
          )}
        </View>

        {/* Order Notes */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Order Notes
          </Text>
          <TextInput
            style={[styles.notesInput, { 
              backgroundColor: colors.card,
              borderColor: colors.border,
              color: colors.text 
            }]}
            placeholder="Add any special instructions..."
            placeholderTextColor={colors.textSecondary}
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Tags */}
        {renderTags()}

        {/* Order Summary */}
        <View style={[styles.summary, { backgroundColor: colors.card }]}>
          <Text style={[styles.summaryTitle, { color: colors.text }]}>
            Order Summary
          </Text>
          
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
              Items:
            </Text>
            <Text style={[styles.summaryValue, { color: colors.text }]}>
              {getTotalItems()}
            </Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
              Total Weight:
            </Text>
            <Text style={[styles.summaryValue, { color: colors.text }]}>
              {getTotalWeight()} lbs
            </Text>
          </View>
          
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={[styles.totalLabel, { color: colors.text }]}>
              Estimated Total:
            </Text>
            <Text style={[styles.totalValue, { color: colors.primary }]}>
              ${estimatedTotal}
            </Text>
          </View>
        </View>

        {/* Validation Errors */}
        {hasValidationErrors() && (
          <View style={[styles.errorContainer, { backgroundColor: colors.error + '20' }]}>
            <Text style={[styles.errorTitle, { color: colors.error }]}>
              Please fix the following errors:
            </Text>
            {getValidationErrors().map((error, index) => (
              <Text key={index} style={[styles.errorText, { color: colors.error }]}>
                • {error}
              </Text>
            ))}
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actions}>
          <Button
            title="Create Order"
            onPress={handleCreateOrder}
            disabled={!canSubmit || isLoading}
            style={[
              styles.createButton,
              (!canSubmit || isLoading) && { backgroundColor: colors.border }
            ]}
          />
        </View>
      </View>

      {/* Garment Selection Modal */}
      {showGarmentSelection && (
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Select Garment
              </Text>
              <TouchableOpacity
                onPress={() => setShowGarmentSelection(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            
            <GarmentSelection
              businessId={businessId}
              onGarmentSelected={handleGarmentSelected}
            />
          </View>
        </View>
      )}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: 'Roboto-Bold',
  },
  
  cancelButton: {
    padding: 8,
  },
  
  section: {
    marginBottom: 24,
  },
  
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Roboto-Bold',
  },
  
  locationText: {
    fontSize: 14,
    fontFamily: 'Roboto-Regular',
    marginTop: 8,
  },
  
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  
  addButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Roboto-Bold',
  },
  
  itemsList: {
    gap: 12,
  },
  
  orderItem: {
    padding: 16,
    borderRadius: 12,
  },
  
  orderItemContent: {
    marginBottom: 12,
  },
  
  orderItemName: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Roboto-Bold',
    marginBottom: 4,
  },
  
  orderItemDetails: {
    fontSize: 14,
    fontFamily: 'Roboto-Regular',
    marginBottom: 2,
  },
  
  orderItemWeight: {
    fontSize: 12,
    fontFamily: 'Roboto-Regular',
  },
  
  orderItemActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  quantityText: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Roboto-Bold',
    minWidth: 24,
    textAlign: 'center',
  },
  
  orderItemPrice: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Roboto-Bold',
  },
  
  removeButton: {
    padding: 8,
  },
  
  emptyItems: {
    alignItems: 'center',
    padding: 32,
    borderRadius: 12,
  },
  
  emptyItemsText: {
    fontSize: 16,
    fontFamily: 'Roboto-Regular',
    marginTop: 12,
  },
  
  notesInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    fontFamily: 'Roboto-Regular',
    textAlignVertical: 'top',
  },
  
  tagsContainer: {
    marginBottom: 24,
  },
  
  tagsLabel: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Roboto-Bold',
    marginBottom: 12,
  },
  
  tagsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
    gap: 4,
  },
  
  tagText: {
    fontSize: 12,
    fontFamily: 'Roboto-Regular',
  },
  
  addTagContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  
  tagInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    fontFamily: 'Roboto-Regular',
  },
  
  addTagButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  summary: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Roboto-Bold',
    marginBottom: 16,
  },
  
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  
  summaryLabel: {
    fontSize: 14,
    fontFamily: 'Roboto-Regular',
  },
  
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Roboto-Bold',
  },
  
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingTop: 8,
    marginTop: 8,
  },
  
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Roboto-Bold',
  },
  
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Roboto-Bold',
  },
  
  errorContainer: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
  },
  
  errorTitle: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Roboto-Bold',
    marginBottom: 8,
  },
  
  errorText: {
    fontSize: 14,
    fontFamily: 'Roboto-Regular',
    marginBottom: 4,
  },
  
  actions: {
    marginBottom: 32,
  },
  
  createButton: {
    paddingVertical: 16,
  },
  
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    borderRadius: 12,
    overflow: 'hidden',
  },
  
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Roboto-Bold',
  },
  
  closeButton: {
    padding: 4,
  },
});
