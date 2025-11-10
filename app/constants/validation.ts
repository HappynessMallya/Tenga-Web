// Validation Patterns
export const VALIDATION_PATTERNS = {
  EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  PHONE_TANZANIA: /^(\+255|0)?[67]\d{8}$/,
  PHONE_INTERNATIONAL: /^\+?[1-9]\d{1,14}$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/,
  NATIONAL_ID: /^\d{20}$/,
  VOTER_ID: /^[A-Z]{2}\d{8}$/,
  DRIVING_LICENSE: /^[A-Z]{2}\d{7}$/,
  PASSPORT: /^[A-Z]{2}\d{7}$/,
  BUSINESS_REGISTRATION: /^[A-Z0-9]{10,15}$/,
  COORDINATES: /^-?\d+\.?\d*$/,
  HEX_COLOR: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
} as const;

// Validation Limits
export const VALIDATION_LIMITS = {
  NAME: {
    MIN: 2,
    MAX: 50,
  },
  BUSINESS_NAME: {
    MIN: 3,
    MAX: 100,
  },
  PASSWORD: {
    MIN: 8,
    MAX: 128,
  },
  PHONE: {
    MIN: 10,
    MAX: 15,
  },
  ADDRESS: {
    MIN: 10,
    MAX: 200,
  },
  DESCRIPTION: {
    MIN: 10,
    MAX: 500,
  },
  REVIEW: {
    MIN: 10,
    MAX: 300,
  },
  SERVICE_NAME: {
    MIN: 3,
    MAX: 50,
  },
  PRICE: {
    MIN: 100, // 100 TSH minimum
    MAX: 1000000, // 1M TSH maximum
  },
  MACHINE_COUNT: {
    MIN: 1,
    MAX: 50,
  },
  DELIVERY_RADIUS: {
    MIN: 1, // 1 km
    MAX: 50, // 50 km
  },
  FILE_SIZE: {
    IMAGE: 5 * 1024 * 1024, // 5MB
    DOCUMENT: 10 * 1024 * 1024, // 10MB
  },
} as const;

// Validation Messages
export const VALIDATION_MESSAGES = {
  REQUIRED: 'This field is required',
  INVALID_EMAIL: 'Please enter a valid email address',
  INVALID_PHONE: 'Please enter a valid Tanzania phone number',
  PASSWORD_TOO_SHORT: 'Password must be at least 8 characters long',
  PASSWORD_WEAK: 'Password must contain uppercase, lowercase, and number',
  NAME_TOO_SHORT: 'Name must be at least 2 characters long',
  NAME_TOO_LONG: 'Name must be less than 50 characters',
  BUSINESS_NAME_TOO_SHORT: 'Business name must be at least 3 characters long',
  INVALID_PRICE: 'Price must be between 100 and 1,000,000 TSH',
  INVALID_COORDINATES: 'Invalid location coordinates',
  FILE_TOO_LARGE: 'File size is too large',
  INVALID_FILE_TYPE: 'Invalid file type',
  TERMS_NOT_ACCEPTED: 'Please accept the terms and conditions',
} as const;

// Form Field Names
export const FORM_FIELDS = {
  EMAIL: 'email',
  PASSWORD: 'password',
  CONFIRM_PASSWORD: 'confirmPassword',
  FULL_NAME: 'fullName',
  PHONE: 'phone',
  BUSINESS_NAME: 'businessName',
  ADDRESS: 'address',
  DESCRIPTION: 'description',
  PRICE: 'price',
  SERVICE_NAME: 'serviceName',
  TERMS_ACCEPTED: 'termsAccepted',
} as const; 