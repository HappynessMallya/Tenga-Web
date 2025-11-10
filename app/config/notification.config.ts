export interface NotificationConfig {
  // Expo Push Settings
  expoPushUrl: string;
  rateLimitPerMinute: number;
  batchSize: number;
  batchTimeoutMs: number;

  // Retry Settings
  maxRetries: number;
  retryDelayMs: number;

  // Performance Settings
  enableBatching: boolean;
  enableRateLimit: boolean;
  enableDeduplication: boolean;

  // Development Settings
  logLevel: 'error' | 'warn' | 'info' | 'debug';
  mockNotifications: boolean;
}

const getEnvironment = (): 'development' | 'staging' | 'production' => {
  if (__DEV__) return 'development';
  if (process.env.NODE_ENV === 'staging') return 'staging';
  return 'production';
};

const configs: Record<string, NotificationConfig> = {
  development: {
    expoPushUrl: 'https://exp.host/--/api/v2/push/send',
    rateLimitPerMinute: 10, // More relaxed in dev
    batchSize: 5,
    batchTimeoutMs: 2000,
    maxRetries: 2,
    retryDelayMs: 1000,
    enableBatching: true,
    enableRateLimit: false, // Disabled in dev for testing
    enableDeduplication: true,
    logLevel: 'debug',
    mockNotifications: false,
  },
  staging: {
    expoPushUrl: 'https://exp.host/--/api/v2/push/send',
    rateLimitPerMinute: 5,
    batchSize: 10,
    batchTimeoutMs: 1000,
    maxRetries: 3,
    retryDelayMs: 2000,
    enableBatching: true,
    enableRateLimit: true,
    enableDeduplication: true,
    logLevel: 'info',
    mockNotifications: false,
  },
  production: {
    expoPushUrl: 'https://exp.host/--/api/v2/push/send',
    rateLimitPerMinute: 3, // Conservative in production
    batchSize: 20,
    batchTimeoutMs: 500,
    maxRetries: 5,
    retryDelayMs: 5000,
    enableBatching: true,
    enableRateLimit: true,
    enableDeduplication: true,
    logLevel: 'error',
    mockNotifications: false,
  },
};

export const notificationConfig: NotificationConfig =
  configs[getEnvironment()] || configs.production;

// Notification priorities for better UX
export const NOTIFICATION_PRIORITIES = {
  critical: {
    // Order cancelled, payment failed
    sound: true,
    vibration: [0, 500, 200, 500],
    importance: 'high',
    showInForeground: true,
  },
  important: {
    // Order status updates, delivery notifications
    sound: true,
    vibration: [0, 250, 100, 250],
    importance: 'default',
    showInForeground: true,
  },
  normal: {
    // Promotions, general announcements
    sound: false,
    vibration: [0, 100],
    importance: 'low',
    showInForeground: false,
  },
} as const;

// Helper function to get priority config
export const getNotificationPriority = (type: string) => {
  switch (type) {
    case 'order_cancelled':
    case 'payment_failed':
    case 'delivery_failed':
      return NOTIFICATION_PRIORITIES.critical;

    case 'order_placed':
    case 'order_confirmed':
    case 'order_picked_up':
    case 'order_delivered':
    case 'payment_received':
      return NOTIFICATION_PRIORITIES.important;

    case 'promotion':
    case 'system_announcement':
    case 'rating_request':
      return NOTIFICATION_PRIORITIES.normal;

    default:
      return NOTIFICATION_PRIORITIES.normal;
  }
};
