export interface User {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  role: 'customer' | 'vendor' | 'delivery_agent' | 'admin';
  avatar_url?: string;
  is_active: boolean;
  is_verified: boolean;
  last_seen?: string;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  customer_id: string;
  vendor_id: string;
  delivery_agent_id?: string;
  status: 'pending' | 'accepted' | 'processing' | 'ready' | 'picked_up' | 'delivered' | 'cancelled';
  total_amount: number;
  delivery_fee: number;
  service_fee: number;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  order_id: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  payment_method: 'mobile_money' | 'card';
  transaction_id?: string;
  created_at: string;
  completed_at?: string;
}

export interface Review {
  id: string;
  order_id: string;
  vendor_id: string;
  customer_id: string;
  rating: number;
  comment?: string;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  data?: any;
  read: boolean;
  created_at: string;
}

export * from './auth';
export * from './order';
export * from './notification';
export * from './order';
export * from './payment';
export * from './review';
export * from './vendor';
