interface LogLevel {
  DEBUG: 0;
  INFO: 1;
  WARN: 2;
  ERROR: 3;
}

type LogLevelKey = keyof LogLevel;

class Logger {
  private static instance: Logger;
  private logLevel: LogLevel[LogLevelKey];
  private isDevelopment: boolean;
  private timers: Map<string, number> = new Map(); // Fallback for timing when console.time is not available

  private readonly LOG_LEVELS: LogLevel = {
    DEBUG: 0,
    INFO: 1,
    WARN: 2,
    ERROR: 3,
  };

  constructor() {
    this.isDevelopment = __DEV__ || process.env.NODE_ENV === 'development';
    this.logLevel = this.isDevelopment ? this.LOG_LEVELS.DEBUG : this.LOG_LEVELS.ERROR;
  }

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private shouldLog(level: LogLevel[LogLevelKey]): boolean {
    return level >= this.logLevel;
  }

  private formatMessage(level: string, message: string, context?: any): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` | Context: ${JSON.stringify(context)}` : '';
    return `[${timestamp}] [${level}] ${message}${contextStr}`;
  }

  debug(message: string, context?: any): void {
    if (this.shouldLog(this.LOG_LEVELS.DEBUG)) {
      console.log(this.formatMessage('DEBUG', message, context));
    }
  }

  info(message: string, context?: any): void {
    if (this.shouldLog(this.LOG_LEVELS.INFO)) {
      console.info(this.formatMessage('INFO', message, context));
    }
  }

  warn(message: string, context?: any): void {
    if (this.shouldLog(this.LOG_LEVELS.WARN)) {
      console.warn(this.formatMessage('WARN', message, context));
    }
  }

  error(message: string, error?: Error | any, context?: any): void {
    if (this.shouldLog(this.LOG_LEVELS.ERROR)) {
      const errorInfo =
        error instanceof Error ? { message: error.message, stack: error.stack } : error;

      const fullContext = { ...context, error: errorInfo };
      console.error(this.formatMessage('ERROR', message, fullContext));
    }
  }

  // Performance logging with fallback for React Native
  time(label: string): void {
    if (this.isDevelopment) {
      // Try to use console.time if available, otherwise use fallback
      if (typeof console.time === 'function') {
        console.time(label);
      } else {
        // Fallback: store start time manually
        this.timers.set(label, Date.now());
        this.debug(`Timer started: ${label}`);
      }
    }
  }

  timeEnd(label: string): void {
    if (this.isDevelopment) {
      // Try to use console.timeEnd if available, otherwise use fallback
      if (typeof console.timeEnd === 'function') {
        console.timeEnd(label);
      } else {
        // Fallback: calculate duration manually
        const startTime = this.timers.get(label);
        if (startTime) {
          const duration = Date.now() - startTime;
          this.debug(`Timer ended: ${label} - ${duration}ms`);
          this.timers.delete(label);
        } else {
          this.debug(`Timer not found: ${label}`);
        }
      }
    }
  }

  // Auth-specific logging
  auth = {
    signIn: (success: boolean, email?: string) => {
      this.info(`Auth sign-in ${success ? 'successful' : 'failed'}`, { email });
    },
    signOut: (success: boolean) => {
      this.info(`Auth sign-out ${success ? 'successful' : 'failed'}`);
    },
    sessionRestored: (userId: string) => {
      this.info('Auth session restored', { userId });
    },
  };

  // Order-specific logging
  order = {
    created: (orderId: string, customerId: string, total: number) => {
      this.info('Order created', { orderId, customerId, total });
    },
    statusChanged: (orderId: string, oldStatus: string, newStatus: string) => {
      this.info('Order status changed', { orderId, oldStatus, newStatus });
    },
  };

  // Network-specific logging
  network = {
    offline: () => this.warn('Network offline detected'),
    online: () => this.info('Network online detected'),
    apiCall: (endpoint: string, method: string, duration?: number) => {
      this.debug('API call', { endpoint, method, duration });
    },
  };
}

export const logger = Logger.getInstance();
