// App Routes Constants
export const ROUTES = {
  // Auth Routes
  AUTH: {
    LOGIN: '/(auth)/login',
    REGISTER: '/(auth)/register',
  },

  // Customer Routes
  CUSTOMER: {
    HOME: '/(customer)/tabs/home',
    ORDERS: '/(customer)/tabs/orders',
    user: '/(customer)/tabs/user',
    ORDER_DETAILS: '/(customer)/order-details',
    ORDER_TRACKING: '/(customer)/order-tracking',
    PAYMENT: '/(customer)/payment',
    VENDOR_DETAILS: '/(customer)/vendor-details',
  },

  // Shared Routes
  SHARED: {
    NOTIFICATIONS: '/notifications',
    SETTINGS: '/settings',
    SUPPORT: '/support',
    TERMS: '/terms',
    PRIVACY: '/privacy',
  },
} as const;

// External Routes
export const EXTERNAL_ROUTES = {
  SUPPORT_EMAIL: 'mailto:support@tenga.co.tz',
  SUPPORT_PHONE: 'tel:+255123456789',
  WEBSITE: 'https://tenga.co.tz',
  PRIVACY_POLICY: 'https://tenga.co.tz/privacy',
  TERMS_OF_SERVICE: 'https://tenga.co.tz/terms',
} as const;

// Deep Link Schemes
export const DEEP_LINKS = {
  ORDER_TRACKING: 'tenga://order-tracking',
  VENDOR_ACCOUNT: 'tenga://vendor',
  PAYMENT: 'tenga://payment',
} as const;
