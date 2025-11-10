/**
 * Order Creation Store (Zustand)
 * Global state management for order creation process
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  orderCreationService,
  CreateOrderRequest,
  CreateOrderResponse,
  OrderCreationFormData,
  CreateOrderItem,
  CustomerLocation,
  OrderCreationState,
  OrderValidationError
} from '../services/orderCreationService';

interface OrderCreationStoreState {
  // State
  isLoading: boolean;
  error: string | null;
  success: boolean;
  orderId: string | null;
  order: CreateOrderResponse['order'] | null;
  pricing: CreateOrderResponse['pricing'] | null;
  
  // Form data
  formData: Partial<OrderCreationFormData>;
  selectedItems: CreateOrderItem[];
  customerLocation: CustomerLocation | null;
  
  // Validation
  validationErrors: OrderValidationError[];
  
  // Actions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setSuccess: (success: boolean) => void;
  setOrderId: (orderId: string | null) => void;
  setOrder: (order: CreateOrderResponse['order'] | null) => void;
  setPricing: (pricing: CreateOrderResponse['pricing'] | null) => void;
  
  // Form actions
  setFormData: (formData: Partial<OrderCreationFormData>) => void;
  updateFormField: <K extends keyof OrderCreationFormData>(
    field: K,
    value: OrderCreationFormData[K]
  ) => void;
  addItem: (item: CreateOrderItem) => void;
  removeItem: (index: number) => void;
  updateItem: (index: number, item: Partial<CreateOrderItem>) => void;
  setCustomerLocation: (location: CustomerLocation) => void;
  clearForm: () => void;
  
  // Validation actions
  setValidationErrors: (errors: OrderValidationError[]) => void;
  clearValidationErrors: () => void;
  validateForm: () => boolean;
  
  // Async actions
  createOrder: () => Promise<void>;
  resetOrderCreation: () => void;
  
  // Utility actions
  clearError: () => void;
  getEstimatedTotal: () => number;
  canSubmitOrder: () => boolean;
}

const initialState: OrderCreationStoreState = {
  isLoading: false,
  error: null,
  success: false,
  orderId: null,
  order: null,
  pricing: null,
  formData: {},
  selectedItems: [],
  customerLocation: null,
  validationErrors: [],
};

export const useOrderCreationStore = create<OrderCreationStoreState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setLoading: (loading) => {
        console.log('⏳ OrderCreationStore: Setting loading:', loading);
        set({ isLoading: loading });
      },

      setError: (error) => {
        console.log('❌ OrderCreationStore: Setting error:', error);
        set({ error });
      },

      setSuccess: (success) => {
        console.log('✅ OrderCreationStore: Setting success:', success);
        set({ success });
      },

      setOrderId: (orderId) => {
        console.log('🆔 OrderCreationStore: Setting order ID:', orderId);
        set({ orderId });
      },

      setOrder: (order) => {
        console.log('📦 OrderCreationStore: Setting order:', order?.id);
        set({ order });
      },

      setPricing: (pricing) => {
        console.log('💰 OrderCreationStore: Setting pricing:', pricing?.totalAmount);
        set({ pricing });
      },

      setFormData: (formData) => {
        console.log('📝 OrderCreationStore: Setting form data');
        set({ formData });
      },

      updateFormField: (field, value) => {
        console.log('🔄 OrderCreationStore: Updating form field:', field);
        set((state) => ({
          formData: { ...state.formData, [field]: value }
        }));
      },

      addItem: (item) => {
        console.log('➕ OrderCreationStore: Adding item:', item.description);
        set((state) => ({
          selectedItems: [...state.selectedItems, item]
        }));
      },

      removeItem: (index) => {
        console.log('➖ OrderCreationStore: Removing item at index:', index);
        set((state) => ({
          selectedItems: state.selectedItems.filter((_, i) => i !== index)
        }));
      },

      updateItem: (index, item) => {
        console.log('🔄 OrderCreationStore: Updating item at index:', index);
        set((state) => {
          const newItems = [...state.selectedItems];
          if (newItems[index]) {
            newItems[index] = { ...newItems[index], ...item };
          }
          return { selectedItems: newItems };
        });
      },

      setCustomerLocation: (location) => {
        console.log('📍 OrderCreationStore: Setting customer location:', location.description);
        set({ customerLocation: location });
      },

      clearForm: () => {
        console.log('🗑️ OrderCreationStore: Clearing form');
        set({
          formData: {},
          selectedItems: [],
          customerLocation: null,
          validationErrors: [],
        });
      },

      setValidationErrors: (errors) => {
        console.log('❌ OrderCreationStore: Setting validation errors:', errors.length);
        set({ validationErrors: errors });
      },

      clearValidationErrors: () => {
        console.log('🧹 OrderCreationStore: Clearing validation errors');
        set({ validationErrors: [] });
      },

      validateForm: () => {
        console.log('🔍 OrderCreationStore: Validating form');
        
        const { formData, selectedItems, customerLocation } = get();
        const errors: OrderValidationError[] = [];
        
        // Validate customer location
        if (!customerLocation) {
          errors.push({ field: 'customerLocation', message: 'Customer location is required' });
        }
        
        // Validate items
        if (selectedItems.length === 0) {
          errors.push({ field: 'items', message: 'At least one item is required' });
        }
        
        // Validate time slots
        if (!formData.preferredPickupTimeStart) {
          errors.push({ field: 'preferredPickupTimeStart', message: 'Pickup start time is required' });
        }
        if (!formData.preferredPickupTimeEnd) {
          errors.push({ field: 'preferredPickupTimeEnd', message: 'Pickup end time is required' });
        }
        if (!formData.preferredDeliveryTimeStart) {
          errors.push({ field: 'preferredDeliveryTimeStart', message: 'Delivery start time is required' });
        }
        if (!formData.preferredDeliveryTimeEnd) {
          errors.push({ field: 'preferredDeliveryTimeEnd', message: 'Delivery end time is required' });
        }
        
        set({ validationErrors: errors });
        
        const isValid = errors.length === 0;
        console.log('✅ OrderCreationStore: Form validation result:', isValid);
        console.log('❌ Validation errors:', errors);
        
        return isValid;
      },

      createOrder: async () => {
        const { 
          formData, 
          selectedItems, 
          customerLocation, 
          isLoading,
          validateForm 
        } = get();
        
        console.log('🚀 OrderCreationStore: createOrder called');
        console.log('📝 Form data:', formData);
        console.log('📦 Selected items:', selectedItems.length);
        console.log('📍 Customer location:', customerLocation);
        console.log('⏳ Current loading state:', isLoading);
        
        // Prevent multiple simultaneous requests
        if (isLoading) {
          console.log('⏸️ OrderCreationStore: Request already in progress, skipping');
          return;
        }

        try {
          console.log('🔄 OrderCreationStore: Setting loading = true');
          set({ isLoading: true, error: null, success: false });

          // Validate form
          console.log('🔍 OrderCreationStore: Validating form before submission');
          const isValid = validateForm();
          
          if (!isValid) {
            console.log('❌ OrderCreationStore: Form validation failed');
            set({ 
              isLoading: false, 
              error: 'Please fix the form errors before submitting' 
            });
            return;
          }

          // Prepare order data
          console.log('📦 OrderCreationStore: Preparing order data');
          const orderData: CreateOrderRequest = {
            customerLocation: customerLocation!,
            items: selectedItems,
            preferredPickupTimeStart: formData.preferredPickupTimeStart!.toISOString(),
            preferredPickupTimeEnd: formData.preferredPickupTimeEnd!.toISOString(),
            preferredDeliveryTimeStart: formData.preferredDeliveryTimeStart!.toISOString(),
            preferredDeliveryTimeEnd: formData.preferredDeliveryTimeEnd!.toISOString(),
            notes: formData.notes || '',
            tags: formData.tags || [],
          };

          console.log('🌐 OrderCreationStore: Making API request');
          const response = await orderCreationService.createOrder(orderData);
          
          console.log('📦 OrderCreationStore: API response received:', JSON.stringify(response, null, 2));
          
          if (response && response.order) {
            console.log('✅ OrderCreationStore: Order created successfully');
            console.log('🆔 Order ID:', response.order.id);
            console.log('💰 Total amount:', response.pricing.totalAmount);
            
            set({
              isLoading: false,
              success: true,
              orderId: response.order.id,
              order: response.order,
              pricing: response.pricing,
              error: null,
            });
            
            console.log('✅ OrderCreationStore: Order creation completed successfully');
          } else {
            console.log('❌ OrderCreationStore: Invalid response format');
            set({ 
              isLoading: false, 
              error: 'Invalid response from server' 
            });
          }
        } catch (error: any) {
          console.error('❌ OrderCreationStore: Failed to create order:', error);
          console.error('❌ OrderCreationStore: Error details:', {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data
          });
          set({ 
            isLoading: false, 
            error: error.message,
            success: false 
          });
        }
      },

      resetOrderCreation: () => {
        console.log('🔄 OrderCreationStore: Resetting order creation state');
        set({
          ...initialState,
          formData: {},
          selectedItems: [],
          customerLocation: null,
        });
      },

      clearError: () => {
        console.log('🧹 OrderCreationStore: Clearing error');
        set({ error: null });
      },

      getEstimatedTotal: () => {
        const { selectedItems } = get();
        console.log('🧮 OrderCreationStore: Calculating estimated total');
        
        const total = orderCreationService.calculateEstimatedTotal(selectedItems);
        console.log('💵 Estimated total:', total);
        
        return total;
      },

      canSubmitOrder: () => {
        const { formData, selectedItems, customerLocation, isLoading } = get();
        console.log('🔍 OrderCreationStore: Checking if order can be submitted');
        
        const canSubmit = !!(
          customerLocation &&
          selectedItems.length > 0 &&
          formData.preferredPickupTimeStart &&
          formData.preferredPickupTimeEnd &&
          formData.preferredDeliveryTimeStart &&
          formData.preferredDeliveryTimeEnd &&
          !isLoading
        );
        
        console.log('✅ Can submit order:', canSubmit);
        return canSubmit;
      },
    }),
    {
      name: 'order-creation-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        formData: state.formData,
        selectedItems: state.selectedItems,
        customerLocation: state.customerLocation,
      }),
    }
  )
);
