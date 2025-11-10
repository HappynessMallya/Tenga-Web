/**
 * Order Creation Service
 * Handles API calls for creating orders
 */

import API from '../api/axiosInstance';
import { 
  CreateOrderRequest, 
  CreateOrderResponse, 
  CreateOrderError,
  OrderCreationFormData,
  CreateOrderItem,
  CustomerLocation 
} from '../types/orderCreation';

// Order creation service functions
export const orderCreationService = {
  /**
   * Create a new order
   */
  createOrder: async (orderData: CreateOrderRequest): Promise<CreateOrderResponse> => {
    try {
      console.log('🌐 OrderCreationService: createOrder called');
      console.log('📦 Order data:', JSON.stringify(orderData, null, 2));
      
      const url = '/orders';
      console.log('🔗 OrderCreationService: Making POST request to URL:', url);
      
      const response = await API.post(url, orderData);
      
      console.log('📦 OrderCreationService: Raw response received:');
      console.log('📊 Status:', response.status);
      console.log('📋 Headers:', response.headers);
      console.log('📄 Data:', JSON.stringify(response.data, null, 2));
      
      return response.data;
    } catch (error: any) {
      console.error('❌ OrderCreationService: Failed to create order:', error);
      console.error('❌ OrderCreationService: Error details:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          headers: error.config?.headers,
          data: error.config?.data
        }
      });
      
      // Handle specific error cases
      if (error.response?.status === 400) {
        console.log('🔍 OrderCreationService: 400 Bad Request - Validation error');
        const errorData: CreateOrderError = error.response.data;
        throw new Error(`Validation error: ${errorData.message || 'Invalid order data'}`);
      } else if (error.response?.status === 401) {
        console.log('🔐 OrderCreationService: 401 Unauthorized - Authentication required');
        throw new Error('Authentication required. Please log in again.');
      } else if (error.response?.status === 403) {
        console.log('🚫 OrderCreationService: 403 Forbidden - Access denied');
        throw new Error('Access denied. You do not have permission to create orders.');
      } else if (error.response?.status === 422) {
        console.log('📝 OrderCreationService: 422 Unprocessable Entity - Business logic error');
        const errorData: CreateOrderError = error.response.data;
        throw new Error(`Order creation failed: ${errorData.message || 'Invalid order parameters'}`);
      } else if (error.response?.status === 500) {
        console.log('💥 OrderCreationService: 500 Server Error');
        throw new Error('Server error while creating order. Please try again.');
      } else {
        console.log('❓ OrderCreationService: Unknown error occurred');
        throw new Error('Failed to create order. Please try again.');
      }
    }
  },

  /**
   * Transform form data to API request format
   */
  transformFormDataToRequest: (formData: OrderCreationFormData): CreateOrderRequest => {
    console.log('🔄 OrderCreationService: Transforming form data to request format');
    console.log('📝 Form data:', JSON.stringify(formData, null, 2));
    
    const request: CreateOrderRequest = {
      customerLocation: formData.customerLocation,
      items: formData.items,
      preferredPickupTimeStart: formData.preferredPickupTimeStart.toISOString(),
      preferredPickupTimeEnd: formData.preferredPickupTimeEnd.toISOString(),
      preferredDeliveryTimeStart: formData.preferredDeliveryTimeStart.toISOString(),
      preferredDeliveryTimeEnd: formData.preferredDeliveryTimeEnd.toISOString(),
      notes: formData.notes,
      tags: formData.tags,
    };
    
    console.log('✅ OrderCreationService: Transformation complete');
    console.log('📦 Request data:', JSON.stringify(request, null, 2));
    
    return request;
  },

  /**
   * Validate order creation data
   */
  validateOrderData: (orderData: CreateOrderRequest): string[] => {
    console.log('🔍 OrderCreationService: Validating order data');
    const errors: string[] = [];
    
    // Validate customer location
    if (!orderData.customerLocation) {
      errors.push('Customer location is required');
    } else {
      if (!orderData.customerLocation.latitude || !orderData.customerLocation.longitude) {
        errors.push('Customer location coordinates are required');
      }
      if (!orderData.customerLocation.description) {
        errors.push('Customer location description is required');
      }
      if (!orderData.customerLocation.city) {
        errors.push('Customer location city is required');
      }
      if (!orderData.customerLocation.country) {
        errors.push('Customer location country is required');
      }
    }
    
    // Validate items
    if (!orderData.items || orderData.items.length === 0) {
      errors.push('At least one item is required');
    } else {
      orderData.items.forEach((item, index) => {
        if (!item.garmentTypeId) {
          errors.push(`Item ${index + 1}: Garment type is required`);
        }
        if (!item.serviceType) {
          errors.push(`Item ${index + 1}: Service type is required`);
        }
        if (!item.description) {
          errors.push(`Item ${index + 1}: Description is required`);
        }
        if (item.quantity <= 0) {
          errors.push(`Item ${index + 1}: Quantity must be greater than 0`);
        }
        if (item.weightLbs <= 0) {
          errors.push(`Item ${index + 1}: Weight must be greater than 0`);
        }
        if (item.price <= 0) {
          errors.push(`Item ${index + 1}: Price must be greater than 0`);
        }
      });
    }
    
    // Validate time slots
    if (!orderData.preferredPickupTimeStart) {
      errors.push('Pickup start time is required');
    }
    if (!orderData.preferredPickupTimeEnd) {
      errors.push('Pickup end time is required');
    }
    if (!orderData.preferredDeliveryTimeStart) {
      errors.push('Delivery start time is required');
    }
    if (!orderData.preferredDeliveryTimeEnd) {
      errors.push('Delivery end time is required');
    }
    
    // Validate time logic
    if (orderData.preferredPickupTimeStart && orderData.preferredPickupTimeEnd) {
      const pickupStart = new Date(orderData.preferredPickupTimeStart);
      const pickupEnd = new Date(orderData.preferredPickupTimeEnd);
      if (pickupStart >= pickupEnd) {
        errors.push('Pickup start time must be before pickup end time');
      }
    }
    
    if (orderData.preferredDeliveryTimeStart && orderData.preferredDeliveryTimeEnd) {
      const deliveryStart = new Date(orderData.preferredDeliveryTimeStart);
      const deliveryEnd = new Date(orderData.preferredDeliveryTimeEnd);
      if (deliveryStart >= deliveryEnd) {
        errors.push('Delivery start time must be before delivery end time');
      }
    }
    
    if (orderData.preferredPickupTimeEnd && orderData.preferredDeliveryTimeStart) {
      const pickupEnd = new Date(orderData.preferredPickupTimeEnd);
      const deliveryStart = new Date(orderData.preferredDeliveryTimeStart);
      if (pickupEnd >= deliveryStart) {
        errors.push('Pickup end time must be before delivery start time');
      }
    }
    
    console.log('✅ OrderCreationService: Validation complete');
    console.log('❌ Validation errors:', errors);
    
    return errors;
  },

  /**
   * Calculate estimated total from items
   */
  calculateEstimatedTotal: (items: CreateOrderItem[]): number => {
    console.log('🧮 OrderCreationService: Calculating estimated total');
    
    const total = items.reduce((sum, item) => {
      const itemTotal = item.price * item.quantity;
      console.log(`💰 Item: ${item.description} - ${item.quantity} x $${item.price} = $${itemTotal}`);
      return sum + itemTotal;
    }, 0);
    
    console.log('💵 Estimated total:', total);
    return total;
  },

  /**
   * Format order data for display
   */
  formatOrderForDisplay: (order: CreateOrderResponse): string => {
    console.log('📋 OrderCreationService: Formatting order for display');
    
    const { order: orderData, pricing } = order;
    
    const summary = `
Order Created Successfully!

Order ID: ${orderData.id}
Status: ${orderData.status}
Customer: ${orderData.customer.user.fullName}

Items: ${orderData.items.length}
Subtotal: ${pricing.currency} ${pricing.subtotal}
Tax: ${pricing.currency} ${pricing.taxAmount}
Total: ${pricing.currency} ${pricing.totalAmount}

Pickup: ${new Date(orderData.preferredPickupTimeStart).toLocaleString()}
Delivery: ${new Date(orderData.preferredDeliveryTimeStart).toLocaleString()}
    `.trim();
    
    console.log('📄 Formatted order summary:', summary);
    return summary;
  },

  /**
   * Create order item from garment selection
   */
  createOrderItem: (
    garmentTypeId: string,
    serviceType: 'WASH_FOLD' | 'DRY_CLEAN' | 'HANG_DRY' | 'IRON_ONLY',
    description: string,
    quantity: number,
    weightLbs: number,
    price: number
  ): CreateOrderItem => {
    console.log('➕ OrderCreationService: Creating order item');
    
    const item: CreateOrderItem = {
      garmentTypeId,
      serviceType,
      description,
      quantity,
      weightLbs,
      price,
    };
    
    console.log('📦 Created order item:', JSON.stringify(item, null, 2));
    return item;
  },

  /**
   * Create customer location from address data
   */
  createCustomerLocation: (
    latitude: string,
    longitude: string,
    description: string,
    city: string,
    country: string
  ): CustomerLocation => {
    console.log('📍 OrderCreationService: Creating customer location');
    
    const location: CustomerLocation = {
      latitude,
      longitude,
      description,
      city,
      country,
    };
    
    console.log('📍 Created customer location:', JSON.stringify(location, null, 2));
    return location;
  },
};
