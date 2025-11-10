export interface Payment {
  id: string;
  order_id: string; // This will be the same UUID used for both payment and order
  amount: number;
  status: PaymentStatus;
  payment_method: PaymentMethod;
  transaction_id?: string;
  selcom_transaction_id?: string;
  phone?: string;
  payment_proof?: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'cancelled';
export type PaymentMethod = 'mobile_money' | 'card';

export interface CreatePaymentData {
  order_id?: string; // Optional - will be set after order creation
  amount: number;
  payment_method: PaymentMethod;
  phone?: string;
}

// BongoPay API Types
export interface BongoPayCreateRequest {
  phone: string;
  amount: number;
  order_id: string;
  callback_url: string;
}

export interface BongoPayCreateResponse {
  order_id: string;
  status: string;
  reference?: string;
  transaction_id?: string;
  message?: string;
}

// Actual BongoPay API Response Format
export interface BongoPayActualResponse {
  reference: string;
  transid: string;
  resultcode: string;
  result: string;
  message: string;
  data: any[];
}

export interface BongoPayStatusResponse {
  order_id: string;
  payment_status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED'; // BongoPay returns uppercase
  amount: number;
  phone: string;
  transaction_id: string;
  selcom_transaction_id: string;
  created_at: string;
  updated_at: string;
}

export interface PaymentError {
  message: string;
  errors?: Record<string, string[]>;
}
