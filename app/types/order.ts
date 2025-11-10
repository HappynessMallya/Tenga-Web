// Legacy Order interface (for backward compatibility)
export interface LegacyOrder {
  id: string;
  customer_id: string;
  vendor_id?: string;
  delivery_agent_id?: string;
  status: OrderStatus;
  total_amount_tsh: number;
  // Mapped field for component compatibility
  total_amount?: number;
  delivery_fee_tsh?: number;
  // Mapped field for component compatibility
  delivery_fee?: number;
  service_fee?: number;
  customer_address?: {
    street: string;
    city: string;
    state: string;
    country: string;
    postal_code: string;
    latitude: number;
    longitude: number;
  };
  order_items?: LegacyOrderItem[];
  delivery_address: string;
  pickup_address?: string;
  special_instructions?: string;
  created_at: string;
  updated_at: string;
  accepted_at?: string;
  processing_at?: string;
  ready_at?: string;
  out_for_delivery_at?: string;
  delivered_at?: string;
  cancelled_at?: string;
  picked_up_at?: string;
  users?: {
    full_name: string;
    phone: string;
  };
  // Nested customer data from database joins
  customers?: {
    id: string;
    users: {
      full_name: string;
      phone: string;
      email: string;
    };
  };
  // Nested vendor data from database joins
  vendors?: {
    id: string;
    business_name: string;
    business_address: string;
    users?: {
      full_name: string;
      phone: string;
      email: string;
    };
  };
  // Flattened customer data for component compatibility
  customer_name?: string;
  customer_phone?: string;
  customer_email?: string;
  // Delivery agent contact information (populated after pickup)
  delivery_agent?: {
    id: string;
    name: string;
    full_name?: string;
    phone?: string;
    vehicle_type?: string;
    vehicle_number?: string;
  };
}

// New Order interface matching API response
export interface Order {
  id: string;
  status: string;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  notes: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
  pickupAddress: AddressWithId;
  deliveryAddress: AddressWithId;
  trips: Trip[];
  cleaner: any;
  payment: any;
}

export interface OrderItem {
  id: string;
  serviceType: string;
  description: string;
  quantity: number;
  weightLbs: number;
  price: number;
  externalTagId: string | null;
}

export interface Address {
  latitude: string;
  longitude: string;
  description: string;
  city: string;
  country: string;
  houseNumber: string | null;
  streetName: string | null;
  postCode: string | null;
  landMark: string | null;
  type: string;
  geoHash: string | null;
  cityGeoHash: string | null;
  locationGeoHash: string | null;
  regionGeoHash: string | null;
  slotId: string | null;
  images: any[];
  customerCare: any[];
  storageSpace: any;
  openingHours: any;
  locationTypeUuid: string | null;
  street: string | null;
  state: string | null;
  zipCode: string | null;
  geo: any;
  unit: string | null;
  formatted: string | null;
}

export interface AddressWithId {
  id: string;
  address: Address;
}

export interface Trip {
  id: string;
  status: string;
  driver: any;
}

export interface OrdersResponse {
  orders: Order[];
  pagination: {
    limit: number;
    offset: number;
    total: number;
  };
}

export interface LegacyOrderItem {
  id: string;
  order_id: string;
  garment_item_id: string;
  item_name: string;
  quantity: number;
  unit_price_tsh: number;
  total_price_tsh: number;
  special_instructions?: string;
}

export type OrderStatus =
  | 'pending'
  | 'accepted'
  | 'vendor_assigned'
  | 'washing'
  | 'washing_completed'
  | 'ready_for_delivery'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled';

export interface CreateOrderData {
  items: {
    garment_item_id: string;
    quantity: number;
    unit_price_tsh: number;
    total_price_tsh: number;
    special_instructions?: string;
  }[];
  delivery_address: string;
}
