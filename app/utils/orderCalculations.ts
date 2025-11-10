import { LaundryItem, ServiceType } from '../store/orderStore';

/**
 * Calculate total order amount
 */
export const calculateOrderTotal = (
  laundryItems: LaundryItem[],
  serviceTypes: ServiceType[]
): number => {
  let total = 0;
  
  // Calculate laundry items total
  laundryItems.forEach(item => {
    total += item.price * item.quantity;
  });
  
  // Add service processing fees (if any)
  const selectedServices = serviceTypes.filter(service => service.selected);
  selectedServices.forEach(service => {
    // Add any service-specific fees here
    // For now, just the base item prices
  });
  
  return total;
};

/**
 * Calculate delivery date based on pickup date and selected services
 */
export const calculateDeliveryDate = (
  pickupDate: Date,
  serviceTypes: ServiceType[]
): Date => {
  const selectedServices = serviceTypes.filter(service => service.selected);
  const maxProcessingHours = selectedServices.length > 0 
    ? Math.max(...selectedServices.map(s => s.processingHours))
    : 24;
  
  const deliveryDate = new Date(pickupDate);
  deliveryDate.setHours(deliveryDate.getHours() + maxProcessingHours);
  
  return deliveryDate;
};

/**
 * Format date for display
 */
export const formatDate = (date: Date): string => {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  if (date.toDateString() === today.toDateString()) {
    return 'Today';
  } else if (date.toDateString() === tomorrow.toDateString()) {
    return 'Tomorrow';
  } else {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  }
};

/**
 * Format time for display
 */
export const formatTime = (date: Date): string => {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

/**
 * Format currency (Tanzanian Shillings)
 */
export const formatCurrency = (amount: number): string => {
  return `TSh ${amount.toLocaleString()}`;
};

/**
 * Get initial pickup date (tonight if before 9 PM, tomorrow if after)
 */
export const getInitialPickupDate = (): Date => {
  const now = new Date();
  const isBefore9PM = now.getHours() < 21;
  
  const date = new Date();
  if (!isBefore9PM) {
    date.setDate(date.getDate() + 1);
  }
  
  // Set to 8 AM for pickup
  date.setHours(8, 0, 0, 0);
  
  return date;
};

/**
 * Generate pickup time slots
 */
export const getPickupTimeSlots = (): Array<{ label: string; value: string; disabled?: boolean }> => {
  const slots = [
    { label: '8:00 AM - 12:00 PM', value: 'morning' },
    { label: '12:00 PM - 5:00 PM', value: 'afternoon' },
    { label: '5:00 PM - 9:00 PM', value: 'evening' },
  ];
  
  // Disable evening slot if it's past 9 PM
  const now = new Date();
  if (now.getHours() >= 21) {
    slots[2].disabled = true;
  }
  
  return slots;
};

/**
 * Validate order data
 */
export const validateOrderData = (orderData: {
  laundryItems: LaundryItem[];
  serviceTypes: ServiceType[];
  pickupDate: Date | null;
  location: any;
}): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (orderData.laundryItems.length === 0) {
    errors.push('Please select at least one laundry item');
  }
  
  if (!orderData.serviceTypes.some(service => service.selected)) {
    errors.push('Please select at least one service type');
  }
  
  if (!orderData.pickupDate) {
    errors.push('Please select a pickup date');
  }
  
  if (!orderData.location) {
    errors.push('Please provide a pickup location');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};
