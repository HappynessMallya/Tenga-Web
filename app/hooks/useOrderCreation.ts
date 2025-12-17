/**
 * Order Creation Hook
 * Custom hook for easy access to order creation store
 */

import { useOrderCreationStore } from '../store/orderCreationStore';
import {
  CreateOrderItem,
  CustomerLocation,
  OrderCreationFormData,
  OrderValidationError
} from '../types/orderCreation';

export const useOrderCreation = () => {
  const store = useOrderCreationStore();

  // Helper functions
  const addGarmentToOrder = (
    garmentTypeId: string,
    serviceType: 'LAUNDRY' | 'WASH_PRESS' | 'DRY_CLEAN' | 'IRON_ONLY',
    description: string,
    quantity: number,
    weightLbs: number,
    price: number
  ) => {
    console.log('➕ useOrderCreation: Adding garment to order');
    console.log('👕 Garment:', { garmentTypeId, serviceType, description, quantity, price });

    const item: CreateOrderItem = {
      garmentTypeId,
      serviceType,
      description,
      quantity,
      weightLbs,
      price,
    };

    store.addItem(item);
    console.log('✅ Garment added to order');
  };

  const removeGarmentFromOrder = (index: number) => {
    console.log('➖ useOrderCreation: Removing garment from order at index:', index);
    store.removeItem(index);
  };

  const updateGarmentQuantity = (index: number, quantity: number) => {
    console.log('🔢 useOrderCreation: Updating garment quantity at index:', index, 'to:', quantity);
    store.updateItem(index, { quantity });
  };

  const updateGarmentPrice = (index: number, price: number) => {
    console.log('💰 useOrderCreation: Updating garment price at index:', index, 'to:', price);
    store.updateItem(index, { price });
  };

  const setPickupTimeSlot = (startTime: Date, endTime: Date) => {
    console.log('📅 useOrderCreation: Setting pickup time slot');
    console.log('🕐 Start:', startTime.toISOString());
    console.log('🕐 End:', endTime.toISOString());

    store.updateFormField('preferredPickupTimeStart', startTime);
    store.updateFormField('preferredPickupTimeEnd', endTime);
  };

  const setDeliveryTimeSlot = (startTime: Date, endTime: Date) => {
    console.log('📅 useOrderCreation: Setting delivery time slot');
    console.log('🕐 Start:', startTime.toISOString());
    console.log('🕐 End:', endTime.toISOString());

    store.updateFormField('preferredDeliveryTimeStart', startTime);
    store.updateFormField('preferredDeliveryTimeEnd', endTime);
  };

  const setOrderNotes = (notes: string) => {
    console.log('📝 useOrderCreation: Setting order notes');
    store.updateFormField('notes', notes);
  };

  const setOrderTags = (tags: string[]) => {
    console.log('🏷️ useOrderCreation: Setting order tags:', tags);
    store.updateFormField('tags', tags);
  };

  const setCustomerLocationFromAddress = (
    latitude: string,
    longitude: string,
    description: string,
    city: string,
    country: string
  ) => {
    console.log('📍 useOrderCreation: Setting customer location from address');

    const location: CustomerLocation = {
      latitude,
      longitude,
      description,
      city,
      country,
    };

    store.setCustomerLocation(location);
    console.log('✅ Customer location set');
  };

  const getOrderSummary = () => {
    const { selectedItems, customerLocation, formData, getEstimatedTotal } = store;

    console.log('📋 useOrderCreation: Getting order summary');

    const summary = {
      itemsCount: selectedItems.length,
      estimatedTotal: getEstimatedTotal(),
      customerLocation: customerLocation?.description || 'Not set',
      pickupTime: formData.preferredPickupTimeStart ?
        formData.preferredPickupTimeStart.toLocaleString() : 'Not set',
      deliveryTime: formData.preferredDeliveryTimeStart ?
        formData.preferredDeliveryTimeStart.toLocaleString() : 'Not set',
      notes: formData.notes || 'No notes',
      tags: formData.tags || [],
    };

    console.log('📄 Order summary:', summary);
    return summary;
  };

  const getValidationErrors = (): string[] => {
    const { validationErrors } = store;

    console.log('❌ useOrderCreation: Getting validation errors');

    const errorMessages = validationErrors.map(error => error.message);
    console.log('📝 Error messages:', errorMessages);

    return errorMessages;
  };

  const hasValidationErrors = (): boolean => {
    const { validationErrors } = store;
    const hasErrors = validationErrors.length > 0;

    console.log('🔍 useOrderCreation: Has validation errors:', hasErrors);
    return hasErrors;
  };

  const getItemTotal = (index: number): number => {
    const { selectedItems } = store;

    if (index >= 0 && index < selectedItems.length) {
      const item = selectedItems[index];
      const total = item.price * item.quantity;

      console.log(`💰 Item ${index} total:`, total);
      return total;
    }

    console.log('❌ Invalid item index:', index);
    return 0;
  };

  const getTotalWeight = (): number => {
    const { selectedItems } = store;

    const totalWeight = selectedItems.reduce((sum, item) => {
      return sum + (item.weightLbs * item.quantity);
    }, 0);

    console.log('⚖️ Total weight:', totalWeight, 'lbs');
    return totalWeight;
  };

  const getTotalItems = (): number => {
    const { selectedItems } = store;

    const totalItems = selectedItems.reduce((sum, item) => {
      return sum + item.quantity;
    }, 0);

    console.log('📦 Total items:', totalItems);
    return totalItems;
  };

  const isOrderReady = (): boolean => {
    const { canSubmitOrder, hasValidationErrors } = store;

    const isReady = canSubmitOrder() && !hasValidationErrors();

    console.log('✅ useOrderCreation: Is order ready:', isReady);
    return isReady;
  };

  const clearOrder = () => {
    console.log('🗑️ useOrderCreation: Clearing order');
    store.clearForm();
    store.resetOrderCreation();
  };

  const retryOrderCreation = async () => {
    console.log('🔄 useOrderCreation: Retrying order creation');
    store.clearError();
    await store.createOrder();
  };

  return {
    // State
    isLoading: store.isLoading,
    error: store.error,
    success: store.success,
    orderId: store.orderId,
    order: store.order,
    pricing: store.pricing,
    formData: store.formData,
    selectedItems: store.selectedItems,
    customerLocation: store.customerLocation,
    validationErrors: store.validationErrors,

    // Actions
    createOrder: store.createOrder,
    clearError: store.clearError,
    resetOrderCreation: store.resetOrderCreation,
    validateForm: store.validateForm,
    clearValidationErrors: store.clearValidationErrors,

    // Helper functions
    addGarmentToOrder,
    removeGarmentFromOrder,
    updateGarmentQuantity,
    updateGarmentPrice,
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
    retryOrderCreation,

    // Computed values
    estimatedTotal: store.getEstimatedTotal(),
    canSubmit: store.canSubmitOrder(),
  };
};
