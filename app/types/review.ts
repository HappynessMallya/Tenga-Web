export interface Review {
  id: string;
  order_id: string;
  vendor_id: string;
  customer_id: string;
  rating: number;
  comment?: string;
  created_at: string;
}

export interface CreateReviewData {
  order_id: string;
  vendor_id: string;
  rating: number;
  comment?: string;
}
