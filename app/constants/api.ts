// API Configuration Constants
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    VERIFY: '/auth/verify',
  },
  USERS: {
    user: '/users/user',
    UPDATE_USER: '/users/user',
    UPLOAD_AVATAR: '/users/avatar',
  },
  ORDERS: {
    CREATE: '/orders',
    LIST: '/orders',
    DETAILS: '/orders/:id',
    UPDATE_STATUS: '/orders/:id/status',
    CANCEL: '/orders/:id/cancel',
    TRACK: '/orders/:id/track',
  },
  VENDORS: {
    LIST: '/vendors',
    DETAILS: '/vendors/:id',
    SERVICES: '/vendors/:id/services',
    ANALYTICS: '/vendors/:id/analytics',
    EARNINGS: '/vendors/:id/earnings',
  },
  DELIVERY: {
    ASSIGNMENTS: '/delivery/assignments',
    ACCEPT: '/delivery/:id/accept',
    COMPLETE: '/delivery/:id/complete',
    LOCATION_UPDATE: '/delivery/:id/location',
  },
  NOTIFICATIONS: {
    LIST: '/notifications',
    MARK_READ: '/notifications/:id/read',
    MARK_ALL_READ: '/notifications/read-all',
    SETTINGS: '/notifications/settings',
  },
  PAYMENTS: {
    METHODS: '/payments/methods',
    PROCESS: '/payments/process',
    HISTORY: '/payments/history',
  },
};

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
} as const;

// Request Timeout
export const REQUEST_TIMEOUT = 30000; // 30 seconds

// API Headers
export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
}; 