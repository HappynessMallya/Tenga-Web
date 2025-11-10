/**
 * Safe Parameter Utilities
 * 
 * Prevents undefined values from being passed to expo-router context
 * which can cause "value.trim is not a function" errors
 */

export type SafeParams = Record<string, string | string[] | undefined>;

/**
 * Safely extracts a string parameter, handling undefined/null values
 */
export const safeStringParam = (
  value: string | string[] | undefined,
  defaultValue: string = ''
): string => {
  if (!value || value === 'undefined' || value === 'null') {
    return defaultValue;
  }
  
  if (Array.isArray(value)) {
    return value[0] && value[0] !== 'undefined' ? String(value[0]) : defaultValue;
  }
  
  return typeof value === 'string' ? value : String(value);
};

/**
 * Safely extracts an optional string parameter
 */
export const safeOptionalStringParam = (
  value: string | string[] | undefined
): string | null => {
  if (!value || value === 'undefined' || value === 'null') {
    return null;
  }
  
  if (Array.isArray(value)) {
    return value[0] && value[0] !== 'undefined' ? String(value[0]) : null;
  }
  
  return typeof value === 'string' ? value : String(value);
};

/**
 * Safely parses a JSON string parameter
 */
export const safeJsonParam = <T = any>(
  value: string | string[] | undefined,
  defaultValue: T
): T => {
  try {
    const stringValue = safeStringParam(value);
    if (!stringValue || stringValue === '') {
      return defaultValue;
    }
    return JSON.parse(stringValue) || defaultValue;
  } catch {
    return defaultValue;
  }
};

/**
 * Safely extracts a number parameter
 */
export const safeNumberParam = (
  value: string | string[] | undefined,
  defaultValue: number = 0
): number => {
  const stringValue = safeStringParam(value);
  if (!stringValue) {
    return defaultValue;
  }
  
  const parsed = parseFloat(stringValue);
  return isNaN(parsed) ? defaultValue : parsed;
};

/**
 * Safely extracts a boolean parameter
 */
export const safeBooleanParam = (
  value: string | string[] | undefined,
  defaultValue: boolean = false
): boolean => {
  const stringValue = safeStringParam(value);
  if (!stringValue) {
    return defaultValue;
  }
  
  return stringValue.toLowerCase() === 'true';
};

/**
 * Comprehensive safe parameter extraction with type safety
 */
export const extractSafeParams = <T extends Record<string, any>>(
  params: SafeParams,
  config: {
    [K in keyof T]: {
      type: 'string' | 'number' | 'boolean' | 'json' | 'optional_string';
      defaultValue?: T[K];
    };
  }
): T => {
  const result = {} as T;
  
  Object.entries(config).forEach(([key, { type, defaultValue }]) => {
    const paramValue = params[key];
    
    switch (type) {
      case 'string':
        result[key as keyof T] = safeStringParam(paramValue, defaultValue as string) as T[keyof T];
        break;
      case 'number':
        result[key as keyof T] = safeNumberParam(paramValue, defaultValue as number) as T[keyof T];
        break;
      case 'boolean':
        result[key as keyof T] = safeBooleanParam(paramValue, defaultValue as boolean) as T[keyof T];
        break;
      case 'json':
        result[key as keyof T] = safeJsonParam(paramValue, defaultValue) as T[keyof T];
        break;
      case 'optional_string':
        result[key as keyof T] = safeOptionalStringParam(paramValue) as T[keyof T];
        break;
      default:
        result[key as keyof T] = defaultValue as T[keyof T];
    }
  });
  
  return result;
};

/**
 * Hook for safe parameter extraction in components
 */
export const useSafeParams = <T extends Record<string, any>>(
  params: SafeParams,
  config: {
    [K in keyof T]: {
      type: 'string' | 'number' | 'boolean' | 'json' | 'optional_string';
      defaultValue?: T[K];
    };
  }
): T => {
  return extractSafeParams(params, config);
};
