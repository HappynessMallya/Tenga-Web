import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Types
export interface LaundryItem {
  id: string;
  name: string;
  category: string;
  price: number;
  quantity: number;
  icon: string;
  description?: string;
  pricing?: {
    WASH_FOLD?: { amount: number; currency: string };
    DRY_CLEAN?: { amount: number; currency: string };
    HANG_DRY?: { amount: number; currency: string };
    IRON_ONLY?: { amount: number; currency: string };
  };
}

export interface ServiceType {
  id: string;
  name: string;
  processingHours: number;
  selected: boolean;
}

export interface Location {
  address: string;
  latitude?: number;
  longitude?: number;
  isCurrentLocation: boolean;
  city?: string;
  country?: string;
}

export interface OrderData {
  laundryItems: LaundryItem[];
  serviceTypes: ServiceType[];
  pickupDate: Date | null;
  deliveryDate: Date | null;
  location: Location | null;
  notes: string;
  total: number;
  paymentMethod: string | null;
  orderId: string | null;
  orderUuid: string | null;
}

// Platform-aware storage for Zustand (SecureStore on native, AsyncStorage on web)
const secureStorage = createJSONStorage(() => ({
  setItem: async (name: string, value: string) => {
    if (Platform.OS === 'web') {
      await AsyncStorage.setItem(name, value);
    } else {
      await SecureStore.setItemAsync(name, value);
    }
  },
  getItem: async (name: string) => {
    if (Platform.OS === 'web') {
      return await AsyncStorage.getItem(name);
    } else {
      return await SecureStore.getItemAsync(name);
    }
  },
  removeItem: async (name: string) => {
    if (Platform.OS === 'web') {
      await AsyncStorage.removeItem(name);
    } else {
      await SecureStore.deleteItemAsync(name);
    }
  },
}));

interface OrderStore extends OrderData {
  // Actions
  setOrderData: <K extends keyof OrderData>(key: K, value: OrderData[K]) => void;
  updateLaundryItem: (itemId: string, updates: Partial<LaundryItem>) => void;
  toggleServiceType: (serviceId: string) => void;
  calculateTotal: () => void;
  calculateDeliveryDate: () => void;
  resetOrder: () => void;
  setLocation: (location: Location) => void;
  setPaymentMethod: (method: string) => void;
  setOrderId: (orderId: string) => void;
  setOrderUuid: (orderUuid: string) => void;
}

const initialState: OrderData = {
  laundryItems: [],
  serviceTypes: [
    { id: 'wash-fold', name: 'Wash & Fold', processingHours: 24, selected: false },
    { id: 'dry-clean', name: 'Dry Cleaning', processingHours: 48, selected: false },
    { id: 'iron-only', name: 'Iron Only', processingHours: 12, selected: false },
  ],
  pickupDate: null,
  deliveryDate: null,
  location: null,
  notes: '',
  total: 0,
  paymentMethod: null,
  orderId: null,
  orderUuid: null,
};

export const useOrderStore = create<OrderStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      setOrderData: (key, value) => {
        set((state) => ({ ...state, [key]: value }));
        // Recalculate totals when relevant data changes
        if (key === 'laundryItems' || key === 'serviceTypes') {
          get().calculateTotal();
          get().calculateDeliveryDate();
        }
      },

      updateLaundryItem: (itemId, updates) => {
        set((state) => ({
          ...state,
          laundryItems: state.laundryItems.map((item) =>
            item.id === itemId ? { ...item, ...updates } : item
          ),
        }));
        get().calculateTotal();
      },

      toggleServiceType: (serviceId) => {
        set((state) => ({
          ...state,
          serviceTypes: state.serviceTypes.map((service) =>
            service.id === serviceId
              ? { ...service, selected: !service.selected }
              : service
          ),
        }));
        get().calculateTotal();
        get().calculateDeliveryDate();
      },

      calculateTotal: () => {
        const { laundryItems, serviceTypes } = get();
        const selectedServices = serviceTypes.filter(service => service.selected);
        
        let total = 0;
        
        // Calculate laundry items total
        laundryItems.forEach(item => {
          total += item.price * item.quantity;
        });
        
        // Add service processing fees (if any)
        selectedServices.forEach(service => {
          // Add any service-specific fees here
          // For now, just the base item prices
        });
        
        set({ total });
      },

      calculateDeliveryDate: () => {
        const { pickupDate, serviceTypes } = get();
        if (!pickupDate) return;
        
        const selectedServices = serviceTypes.filter(service => service.selected);
        const maxProcessingHours = selectedServices.length > 0 
          ? Math.max(...selectedServices.map(s => s.processingHours))
          : 24;
        
        const deliveryDate = new Date(pickupDate);
        deliveryDate.setHours(deliveryDate.getHours() + maxProcessingHours);
        
        set({ deliveryDate });
      },

      setLocation: (location) => {
        set({ location });
      },

      setPaymentMethod: (method) => {
        set({ paymentMethod: method });
      },

      setOrderId: (orderId) => {
        set({ orderId });
      },

      setOrderUuid: (orderUuid) => {
        set({ orderUuid });
      },

      resetOrder: () => {
        set(initialState);
      },
    }),
    {
      name: 'order-storage',
      storage: secureStorage,
      partialize: (state) => ({
        laundryItems: state.laundryItems,
        serviceTypes: state.serviceTypes,
        location: state.location,
        paymentMethod: state.paymentMethod,
        orderId: state.orderId,
        orderUuid: state.orderUuid,
      }),
    }
  )
);
