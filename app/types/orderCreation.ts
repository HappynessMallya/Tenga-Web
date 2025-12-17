/**
 * Order Creation Types
 * TypeScript interfaces for order creation API request and response
 */

// Customer location for order creation
export interface CustomerLocation {
  latitude: string;
  longitude: string;
  description: string;
  city: string;
  country: string;
}

// Order item for creation
export interface CreateOrderItem {
  garmentTypeId: string;
  serviceType: 'LAUNDRY' | 'WASH_PRESS' | 'DRY_CLEAN' | 'IRON_ONLY';
  description: string;
  quantity: number;
  weightLbs: number;
  price: number;
}

// Order creation request payload
export interface CreateOrderRequest {
  customerLocation: CustomerLocation;
  items: CreateOrderItem[];
  preferredPickupTimeStart: string; // ISO 8601 format
  preferredPickupTimeEnd: string;    // ISO 8601 format
  preferredDeliveryTimeStart: string; // ISO 8601 format
  preferredDeliveryTimeEnd: string;   // ISO 8601 format
  notes?: string;
  tags?: string[];
}

// Order item response
export interface OrderItemResponse {
  id: string;
  orderId: string;
  serviceType: string;
  garmentTypeId: string;
  description: string;
  quantity: number;
  weightLbs: number;
  price: number;
  externalTagId: string | null;
  createdAt: string;
}

// User information in order response
export interface OrderUser {
  id: string;
  fullName: string;
  phoneNumber: string;
  email: string | null;
}

// Customer information in order response
export interface OrderCustomer {
  id: string;
  userId: string;
  loyaltyPoints: number;
  defaultPaymentMethod: string | null;
  createdAt: string;
  updatedAt: string;
  user: OrderUser;
}

// Complete order response
export interface OrderResponse {
  id: string;
  uuid: string;
  customerId: string;
  businessId: string | null;
  officeId: string | null;
  acceptedByStaffId: string | null;
  acceptedAt: string | null;
  isTemporarilyAssigned: boolean;
  permanentlyAssignedToOfficeId: string | null;
  assignedByStaffId: string | null;
  assignedAt: string | null;
  workflowId: string;
  workflowStatus: string;
  status: string;
  pickupAddressId: string | null;
  deliveryAddressId: string | null;
  preferredPickupTimeStart: string;
  preferredPickupTimeEnd: string;
  preferredDeliveryTimeStart: string;
  preferredDeliveryTimeEnd: string;
  cleanerId: string | null;
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
  notes: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  items: OrderItemResponse[];
  customer: OrderCustomer;
}

// Bulk discount information
export interface BulkDiscount {
  applied: boolean;
  discountPercent: number;
  discountAmount: number;
  description: string;
}

// Special surcharge information
export interface SpecialSurcharge {
  applied: boolean;
  surchargePercent: number;
  surchargeAmount: number;
  description: string;
}

// Special surcharges
export interface SpecialSurcharges {
  rushService: SpecialSurcharge;
  weekendService: SpecialSurcharge;
}

// Pricing breakdown
export interface OrderPricing {
  subtotal: number;
  bulkDiscount: BulkDiscount;
  specialSurcharges: SpecialSurcharges;
  taxAmount: number;
  totalAmount: number;
  currency: string;
}

// Complete order creation response
export interface CreateOrderResponse {
  message: string;
  order: OrderResponse;
  pricing: OrderPricing;
}

// Order creation error response
export interface CreateOrderError {
  message: string;
  errors?: {
    field: string;
    message: string;
  }[];
}

// Order creation state for UI
export interface OrderCreationState {
  isLoading: boolean;
  error: string | null;
  success: boolean;
  orderId: string | null;
  order: OrderResponse | null;
  pricing: OrderPricing | null;
}

// Order creation form data
export interface OrderCreationFormData {
  customerLocation: CustomerLocation;
  items: CreateOrderItem[];
  preferredPickupTimeStart: Date;
  preferredPickupTimeEnd: Date;
  preferredDeliveryTimeStart: Date;
  preferredDeliveryTimeEnd: Date;
  notes: string;
  tags: string[];
}

// Validation error for order creation
export interface OrderValidationError {
  field: keyof OrderCreationFormData | keyof CreateOrderItem;
  message: string;
}
