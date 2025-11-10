export interface AppNotification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'order_placed' | 'order_accepted' | 'order_picked_up' | 'order_washing' | 'order_completed' | 'order_out_for_delivery' | 'order_delivered' | 'order_cancelled' | 'payment_received' | 'payment_failed' | 'promotion' | 'system_announcement' | 'verification_approved' | 'verification_rejected';
  data?: any;
  is_read: boolean;
  created_at: string;
}

export interface NotificationPreferences {
  orderUpdates: boolean;
  promotions: boolean;
  deliveryUpdates: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
}

export interface NotificationSound {
  id: string;
  name: string;
  file: string;
}
