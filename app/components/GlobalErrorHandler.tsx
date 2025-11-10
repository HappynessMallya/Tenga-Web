import React, { useEffect } from 'react';
import { Alert } from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { logger } from '../utils/logger';

interface GlobalErrorHandlerProps {
  children: React.ReactNode;
}

export const GlobalErrorHandler: React.FC<GlobalErrorHandlerProps> = ({ children }) => {
  const { error, clearAuthError } = useAuth();

  useEffect(() => {
    if (error) {
      logger.error('🚨 Global auth error detected:', { error });
      
      // Show error to user
      Alert.alert(
        'Authentication Error',
        error,
        [
          {
            text: 'OK',
            onPress: () => {
              clearAuthError();
            }
          }
        ]
      );
    }
  }, [error, clearAuthError]);

  return <React.Fragment>{children}</React.Fragment>;
};
