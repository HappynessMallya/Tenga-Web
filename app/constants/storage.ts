// AsyncStorage Keys
export const STORAGE_KEYS = {
  // Authentication
  AUTH_TOKEN: '@tenga/auth_token',
  REFRESH_TOKEN: '@tenga/refresh_token',
  USER_DATA: '@tenga_user_data',
  BIOMETRIC_ENABLED: '@tenga/biometric_enabled',

  // User Preferences
  THEME: '@tenga/theme',
  LANGUAGE: '@tenga/language',
  NOTIFICATION_SETTINGS: '@tenga/notification_settings',
  LOCATION_PERMISSION: '@tenga/location_permission',

  // App State
  ONBOARDING_COMPLETED: '@tenga_onboarding_completed',
  LAST_APP_VERSION: '@tenga/last_app_version',
  CRASH_REPORTS_ENABLED: '@tenga/crash_reports_enabled',

  // Cache
  VENDORS_CACHE: '@tenga/vendors_cache',
  ORDERS_CACHE: '@tenga/orders_cache',
  SERVICES_CACHE: '@tenga/services_cache',

  // Temporary Data
  DRAFT_ORDER: '@tenga/draft_order',
  SEARCH_HISTORY: '@tenga/search_history',
  RECENT_ADDRESSES: '@tenga/recent_addresses',

  // Delivery Agent
  DELIVERY_STATUS: '@tenga/delivery_status',
  CURRENT_ROUTE: '@tenga/current_route',

  // Vendor
  VENDOR_SETTINGS: '@tenga/vendor_settings',
  SERVICE_AREAS: '@tenga/service_areas',

  // App State Persistence
  NOTIFICATION_TOKEN: '@tenga_notification_token',
  SETTINGS: '@tenga_settings',
  CACHE_PREFIX: '@tenga_cache_',
} as const;

// Storage Prefixes
export const STORAGE_PREFIXES = {
  CACHE: '@tenga/cache/',
  TEMP: '@tenga/temp/',
  USER: '@tenga/user/',
  SETTINGS: '@tenga/settings/',
} as const;

// Cache Durations (in milliseconds)
export const CACHE_DURATION = {
  SHORT: 5 * 60 * 1000, // 5 minutes
  MEDIUM: 30 * 60 * 1000, // 30 minutes
  LONG: 24 * 60 * 60 * 1000, // 24 hours
  VERY_LONG: 7 * 24 * 60 * 60 * 1000, // 7 days
} as const;

// Storage Limits
export const STORAGE_LIMITS = {
  MAX_SEARCH_HISTORY: 20,
  MAX_RECENT_ADDRESSES: 10,
  MAX_CACHE_SIZE: 50 * 1024 * 1024, // 50MB
  MAX_IMAGE_CACHE: 100,
} as const;
