// @ts-ignore
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, Modal, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { logger } from '../utils/logger';
import { useTheme } from '../providers/ThemeProvider';

export default function AuthCallback() {
  const { colors } = useTheme();
  const [status, setStatus] = useState('Completing Sign-In...');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isUsingFallback, setIsUsingFallback] = useState(false);

  const params = useLocalSearchParams();

  useEffect(() => {
    logger.info('UI-only AuthCallback: ignoring backend processing', { params });

    const timer = setTimeout(() => {
      setStatus('Profile ready.');
      setIsUsingFallback(true);
      setShowSuccessModal(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, [params]);

  const handleContinue = () => {
    setShowSuccessModal(false);
    router.replace('/(customer)/tabs/home');
  };

  return (
    <>
      <StatusBar style="light" backgroundColor={colors.primary} />
      <LinearGradient
        colors={[colors.primary, colors.primary]}
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          padding: 20,
        }}
      >
        <View
          style={{
            width: 80,
            height: 80,
            backgroundColor: 'rgba(255,255,255,0.2)',
            borderRadius: 40,
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 20,
          }}
        >
          <Text style={{ fontSize: 32 }}>🔐</Text>
        </View>

        <ActivityIndicator size="large" color="#ffffff" />
        <Text
          style={{
            marginTop: 16,
            fontSize: 18,
            color: '#ffffff',
            textAlign: 'center',
            fontWeight: '600',
          }}
        >
          {status}
        </Text>

        <Text
          style={{
            marginTop: 8,
            fontSize: 14,
            color: 'rgba(255,255,255,0.8)',
            textAlign: 'center',
          }}
        >
          Please wait while we set up your account...
        </Text>

        <Modal visible={showSuccessModal} transparent={true} animationType="fade">
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              padding: 20,
            }}
          >
            <View
              style={{
                backgroundColor: 'white',
                borderRadius: 20,
                padding: 30,
                alignItems: 'center',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.25,
                shadowRadius: 4,
                elevation: 5,
                minWidth: 280,
              }}
            >
              <View
                style={{
                  width: 60,
                  height: 60,
                  backgroundColor: colors.success,
                  borderRadius: 30,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginBottom: 20,
                }}
              >
                <Text style={{ fontSize: 24 }}>✅</Text>
              </View>

              <Text
                style={{
                  fontSize: 20,
                  fontWeight: 'bold',
                  color: '#333',
                  marginBottom: 10,
                  textAlign: 'center',
                }}
              >
                Profile Ready!
              </Text>

              <Text
                style={{
                  fontSize: 16,
                  color: '#666',
                  marginBottom: 20,
                  textAlign: 'center',
                }}
              >
                Welcome!{isUsingFallback && '\n\nNote: Using offline setup (UI-only).' }
              </Text>

              <TouchableOpacity
                onPress={handleContinue}
                style={{
                  backgroundColor: colors.primary,
                  paddingHorizontal: 30,
                  paddingVertical: 12,
                  borderRadius: 8,
                  minWidth: 120,
                }}
              >
                <Text
                  style={{
                    color: 'white',
                    fontSize: 16,
                    fontWeight: '600',
                    textAlign: 'center',
                  }}
                >
                  Continue
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </LinearGradient>
    </>
  );
}
