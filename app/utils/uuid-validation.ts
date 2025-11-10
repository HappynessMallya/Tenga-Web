/**
 * Utility functions for UUID validation to prevent database errors
 */

/**
 * Validates if a string is a valid UUID format
 */
export const isValidUUID = (uuid: string): boolean => {
  if (!uuid || typeof uuid !== 'string') {
    return false;
  }
  
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

/**
 * Validates if a UUID is not empty and has valid format
 */
export const isValidNonEmptyUUID = (uuid: string | null | undefined): boolean => {
  if (!uuid || uuid.trim() === '') {
    return false;
  }
  return isValidUUID(uuid);
};

/**
 * Safe UUID validator that logs warnings for debugging
 */
export const validateUUID = (uuid: string | null | undefined, fieldName: string = 'UUID'): string | null => {
  if (!uuid || uuid.trim() === '') {
    console.warn(`${fieldName} is empty or null`);
    return null;
  }
  
  if (!isValidUUID(uuid)) {
    console.warn(`${fieldName} has invalid format: ${uuid}`);
    return null;
  }
  
  return uuid;
};

/**
 * Validates user ID from auth data
 */
export const validateUserID = (userData: any, context: string = 'Unknown'): string | null => {
  if (!userData?.user?.id) {
    console.warn(`${context}: No user ID in auth data`);
    return null;
  }
  
  return validateUUID(userData.user.id, `${context} user ID`);
};

/**
 * Creates a safe database query wrapper that validates UUIDs
 */
export const safeQuery = <T>(
  queryFn: () => Promise<T>,
  uuidValidations: { value: string | null | undefined; name: string }[]
): Promise<T | null> => {
  // Validate all UUIDs first
  for (const { value, name } of uuidValidations) {
    if (!validateUUID(value, name)) {
      console.warn(`safeQuery: Skipping query due to invalid ${name}`);
      return Promise.resolve(null);
    }
  }
  
  // All UUIDs are valid, execute the query
  return queryFn().catch(error => {
    console.error('safeQuery: Database query failed', error);
    throw error;
  });
}; 