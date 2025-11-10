export interface Vendor {
  id: string;
  business_name: string;
  business_description?: string;
  business_phone: string;
  business_email: string;
  business_address: {
    street: string;
    city: string;
    state: string;
    country: string;
    postal_code: string;
  };
  location: {
    latitude: number;
    longitude: number;
  };
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  is_available: boolean;
  created_at: string;
  updated_at: string;
}

export interface ServiceArea {
  id: string;
  vendor_id: string;
  location: {
    latitude: number;
    longitude: number;
  };
  radius_meters: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface VendorStats {
  todayOrders: number;
  todayEarnings: number;
  pendingOrders: number;
  completedOrders: number;
  averageRating: number;
}
