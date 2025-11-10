/**
 * Database helper utilities for common query patterns and error handling
 */

/**
 * Safe single query that handles the PGRST116 error (no rows returned)
 * Returns null instead of throwing when no rows are found
 */
export const safeSingle = async <T>(
  queryBuilder: any,
  errorContext: string = 'Query'
): Promise<T | null> => {
  try {
    const { data, error } = await queryBuilder.single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned - this is often expected
        console.log(`${errorContext}: No rows found`);
        return null;
      }
      
      // Other errors should be logged and handled
      console.error(`${errorContext} error:`, error);
      throw error;
    }
    
    return data as T;
  } catch (error) {
    console.error(`${errorContext} failed:`, error);
    throw error;
  }
};

/**
 * Safe query that always returns an array, even on error
 */
export const safeQuery = async <T>(
  queryBuilder: any,
  errorContext: string = 'Query'
): Promise<T[]> => {
  try {
    const { data, error } = await queryBuilder;
    
    if (error) {
      console.error(`${errorContext} error:`, error);
      return [];
    }
    
    return (data as T[]) || [];
  } catch (error) {
    console.error(`${errorContext} failed:`, error);
    return [];
  }
};

/**
 * Safe upsert operation with proper error handling
 */
export const safeUpsert = async <T>(
  table: any,
  data: any,
  conflictColumns: string[] = ['id'],
  errorContext: string = 'Upsert'
): Promise<{ data: T | null; error: any }> => {
  try {
    const { data: result, error } = await table
      .upsert(data, { onConflict: conflictColumns.join(',') })
      .select()
      .single();
    
    if (error) {
      console.error(`${errorContext} error:`, error);
      return { data: null, error };
    }
    
    return { data: result as T, error: null };
  } catch (error) {
    console.error(`${errorContext} failed:`, error);
    return { data: null, error };
  }
};

/**
 * Check if a record exists without throwing errors
 */
export const recordExists = async (
  queryBuilder: any,
  errorContext: string = 'Existence check'
): Promise<boolean> => {
  try {
    const { data, error } = await queryBuilder.select('id').limit(1);
    
    if (error) {
      console.error(`${errorContext} error:`, error);
      return false;
    }
    
    return data && data.length > 0;
  } catch (error) {
    console.error(`${errorContext} failed:`, error);
    return false;
  }
};

/**
 * Get or create a record pattern
 */
export const getOrCreate = async <T>(
  table: any,
  searchCriteria: any,
  createData: any,
  errorContext: string = 'Get or create'
): Promise<T | null> => {
  try {
    // First try to find existing record
    const existing = await safeSingle<T>(
      table.select('*').match(searchCriteria),
      `${errorContext} - search`
    );
    
    if (existing) {
      return existing;
    }
    
    // Create new record if not found
    const { data: created, error } = await table
      .insert(createData)
      .select()
      .single();
    
    if (error) {
      console.error(`${errorContext} - create error:`, error);
      return null;
    }
    
    return created as T;
  } catch (error) {
    console.error(`${errorContext} failed:`, error);
    return null;
  }
}; 