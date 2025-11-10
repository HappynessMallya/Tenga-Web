import { Alert } from 'react-native';

export const handleError = (error: any, customMessage?: string) => {
  console.error(error);
  Alert.alert(
    'Error',
    customMessage || error.message || 'An unexpected error occurred'
  );
};

export const handleSuccess = (message: string) => {
  Alert.alert('Success', message);
};

export const handleWarning = (message: string) => {
  Alert.alert('Warning', message);
};
