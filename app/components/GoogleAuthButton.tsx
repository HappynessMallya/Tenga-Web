import React, { useState, useCallback } from 'react';
import {
  TouchableOpacity,
  Text,
  Image,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { logger } from '../utils/logger';

interface GoogleAuthButtonProps {
  mode: 'signin' | 'signup';
  onSuccess?: (user: any, isNewUser: boolean) => void;
  onError?: (error: string) => void;
  disabled?: boolean;
  style?: any;
}

export const GoogleAuthButton: React.FC<GoogleAuthButtonProps> = ({
  mode,
  onSuccess,
  onError,
  disabled = false,
  style,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleAuth = useCallback(async () => {
    if (isLoading || disabled) return;

    setIsLoading(true);

    try {
      logger.info(`UI-only: ${mode} with Google clicked`);

      // Simulate a short delay and success
      await new Promise(r => setTimeout(r, 500));

      if (onSuccess) {
        onSuccess({ id: 'USER_PLACEHOLDER', full_name: 'Guest User' }, mode === 'signup');
      }
    } catch (error: any) {
      const errorMessage = `Something went wrong with Google ${mode}. Please try again.`;
      if (onError) onError(errorMessage);
      else Alert.alert('Connection Error', errorMessage, [{ text: 'OK', style: 'default' }]);
    } finally {
      setIsLoading(false);
    }
  }, [mode, isLoading, disabled, onSuccess, onError]);

  const buttonText = mode === 'signin' ? 'Log in with Google' : 'Sign up with Google';

  return (
    <TouchableOpacity
      onPress={handleGoogleAuth}
      disabled={isLoading || disabled}
      style={[styles.button, style, (isLoading || disabled) && styles.buttonDisabled]}
      activeOpacity={0.8}
    >
      {isLoading ? (
        <ActivityIndicator color="#1F2937" size="small" />
      ) : (
        <Image
          source={require('../../assets/google.png')}
          style={styles.icon}
          resizeMode="contain"
        />
      )}

      <Text style={[styles.text, (isLoading || disabled) && styles.textDisabled]}>
        {isLoading ? `${mode === 'signin' ? 'Signing in' : 'Signing up'}...` : buttonText}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    minHeight: 56,
  },
  buttonDisabled: {
    opacity: 0.6,
    backgroundColor: '#F9FAFB',
  },
  icon: {
    width: 20,
    height: 20,
    marginRight: 12,
  },
  text: {
    color: '#1F2937',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  textDisabled: {
    color: '#9CA3AF',
  },
});

