// @ts-ignore
import { router } from 'expo-router';
import { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StyleSheet,
  Keyboard,
  Alert,
  Dimensions,
  Modal,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as yup from 'yup';

// Components
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { PhoneInput } from '../components/PhoneInput';

// Services & Hooks
import { useAuth } from '../hooks/useAuth';
import { signupValidationSchema, SignupFormData } from '../utils/validationSchemas';
import { Country, defaultCountry } from '../constants/countries';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Responsive dimensions
const isSmallScreen = screenHeight < 700;
const isLargeScreen = screenHeight > 800;
const horizontalPadding = screenWidth < 400 ? 16 : 24;
const titleFontSize = isSmallScreen ? 24 : isLargeScreen ? 32 : 28;
const topPadding = isSmallScreen ? 40 : 60;

export default function SignUpScreen() {
  // Auth hook
  const { register, isLoading, error, clearAuthError } = useAuth();
  const isMountedRef = useRef(true);

  // Form state
  const [formData, setFormData] = useState<SignupFormData>({
    fullName: '',
    phoneNumber: '',
    email: '',
    password: '',
    confirmPassword: '',
    countryCode: defaultCountry.code,
  });

  // UI state
  const [errors, setErrors] = useState<Partial<SignupFormData>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<Country>(defaultCountry);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const updateField = useCallback(
    (field: keyof SignupFormData, value: string) => {
      setFormData(prev => ({ ...prev, [field]: value }));

      // Clear error when user starts typing
      if (errors[field]) {
        setErrors(prev => ({ ...prev, [field]: undefined }));
      }
    },
    [errors]
  );

  const handleCountrySelect = useCallback((country: Country) => {
    setSelectedCountry(country);
    setFormData(prev => ({ ...prev, countryCode: country.code }));
    
    // Clear country code error if any
    if (errors.countryCode) {
      setErrors(prev => ({ ...prev, countryCode: undefined as any }));
    }
  }, [errors.countryCode]);

  const validateForm = useCallback(async (): Promise<boolean> => {
    try {
      await signupValidationSchema.validate(formData, { abortEarly: false });
      setErrors({});
      return true;
    } catch (validationError: any) {
      if (validationError instanceof yup.ValidationError) {
        const newErrors: Partial<SignupFormData> = {};
        validationError.inner.forEach((error) => {
          if (error.path) {
            newErrors[error.path as keyof SignupFormData] = error.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  }, [formData]);

  const handleSignUp = useCallback(async () => {
    const isValid = await validateForm();
    if (!isValid || isLoading) return;
    
    Keyboard.dismiss();
    clearAuthError();
    
    try {
      await register({
        fullName: formData.fullName,
        phoneNumber: formData.phoneNumber,
        email: formData.email,
        password: formData.password,
        countryCode: formData.countryCode,
        roles: 'CUSTOMER',
      });
      
      // Show success modal after successful signup
      if (__DEV__) console.log('✅ Signup successful, showing success modal...');
      setShowSuccessModal(true);
    } catch (error: any) {
      // Enhanced error handling with specific API error messages
      let errorMessage = 'Registration failed. Please try again.';
      
      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      // Show detailed error message
      Alert.alert(
        'Registration Failed',
        errorMessage,
        [{ text: 'OK', style: 'default' }]
      );
      
      if (__DEV__) console.error('Sign up error:', error);
    }
  }, [formData, isLoading, validateForm, register, clearAuthError]);

  const handleGoToSignIn = useCallback(() => {
    setShowSuccessModal(false);
    router.replace('/(auth)/signin');
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          {/* Title */}
          <Text style={styles.title}>Welcome to Tenga</Text>

          {/* Form */}
          <View style={styles.formContainer}>
            {/* Full Name */}
            <Input
              placeholder="Full Name"
              value={formData.fullName}
              onChangeText={value => updateField('fullName', value)}
              error={errors.fullName}
              autoComplete="name"
              textContentType="name"
              style={styles.input}
            />

            {/* Phone number */}
            <PhoneInput
              label="Phone Number"
              value={formData.phoneNumber}
              onChangeText={value => updateField('phoneNumber', value)}
              selectedCountry={selectedCountry}
              onCountryChange={handleCountrySelect}
              error={errors.phoneNumber || ''}
              placeholder="Enter your phone number"
              disabled={isLoading}
            />

            {/* Email */}
            <Input
              placeholder="Email"
              value={formData.email}
              onChangeText={value => updateField('email', value)}
              error={errors.email}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              textContentType="emailAddress"
              style={styles.input}
            />

            {/* Password */}
            <Input
              placeholder="Create password"
              value={formData.password}
              onChangeText={value => updateField('password', value)}
              error={errors.password}
              secureTextEntry={!showPassword}
              autoComplete="password-new"
              textContentType="newPassword"
              rightIcon={showPassword ? 'eye-off-outline' : 'eye-outline'}
              onRightIconPress={() => setShowPassword(!showPassword)}
              style={styles.input}
            />

            {/* Confirm Password */}
            <Input
              placeholder="Confirm password"
              value={formData.confirmPassword}
              onChangeText={value => updateField('confirmPassword', value)}
              error={errors.confirmPassword}
              secureTextEntry={!showConfirmPassword}
              autoComplete="password-new"
              textContentType="newPassword"
              rightIcon={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
              onRightIconPress={() => setShowConfirmPassword(!showConfirmPassword)}
              style={styles.input}
            />

            {/* Google Sign Up Button */}
            {/* <TouchableOpacity
              onPress={handleGoogleSignUp}
              disabled={isLoading}
              style={styles.googleButton}
            >
              <Image
                source={require('../../assets/google.png')}
                style={styles.googleIconImage}
                resizeMode="contain"
              />
              <Text style={styles.googleButtonText}>Sign up with Google</Text>
            </TouchableOpacity> */}

            {/* Divider */}
            {/* <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.dividerLine} />
            </View> */}

            {/* Error Display */}
            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {/* Create Account Button */}
            <Button
              title="Create account"
              onPress={handleSignUp}
              loading={isLoading}
              style={styles.createButton}
            />

            {/* Sign In Link */}
            <View style={styles.signinContainer}>
              <Text style={styles.signinText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => router.push('/(auth)/signin')}>
                <Text style={styles.signinLink}>Sign in</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Success Modal */}
      <Modal
        visible={showSuccessModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowSuccessModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.successIconContainer}>
              <Text style={styles.successIcon}>✅</Text>
            </View>
            
            <Text style={styles.modalTitle}>Account Created Successfully!</Text>
            <Text style={styles.modalMessage}>
              Welcome to Tenga! Your account has been created successfully. You can now sign in to start using our laundry services.
            </Text>
            
            <TouchableOpacity
              style={styles.modalButton}
              onPress={handleGoToSignIn}
            >
              <Text style={styles.modalButtonText}>Go to Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: topPadding, // Responsive top padding
    minHeight: screenHeight, // Ensure full height
  },
  content: {
    paddingHorizontal: horizontalPadding, // Responsive horizontal padding
    paddingBottom: isSmallScreen ? 20 : 40, // Responsive bottom padding
  },
  title: {
    fontSize: titleFontSize, // Responsive font size
    fontWeight: 'bold',
    color: '#000',
    marginBottom: isSmallScreen ? 16 : 24, // Responsive margin
    textAlign: 'center',
    marginTop: topPadding, // Responsive top margin
  },
  formContainer: {
    gap: isSmallScreen ? 12 : 16, // Responsive gap
  },
  nameRow: {
    flexDirection: 'row',
    gap: 12,
  },
  nameFieldContainer: {
    flex: 1,
  },
  nameInput: {
    // Additional styles if needed
  },
  input: {
    // Additional styles if needed
  },
  createButton: {
    backgroundColor: '#9334ea',
    marginTop: isSmallScreen ? 6 : 8, // Responsive margin
  },
  signinContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: isSmallScreen ? 12 : 16, // Responsive margin
    paddingVertical: isSmallScreen ? 2 : 3, // Responsive padding
  },
  signinText: {
    fontSize: 16,
    color: '#6B7280',
    fontFamily: 'Roboto-Regular',
  },
  signinLink: {
    fontSize: 16,
    color: '#9334ea',
    fontWeight: '600',
    fontFamily: 'Roboto-Bold',
  },
  
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    maxWidth: 320,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  successIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#E8F5E8',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  successIcon: {
    fontSize: 32,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: 'Roboto-Bold',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 12,
  },
  modalMessage: {
    fontSize: 16,
    fontFamily: 'Roboto-Regular',
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  modalButton: {
    backgroundColor: '#9334ea',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 32,
    minWidth: 160,
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Roboto-Medium',
    textAlign: 'center',
  },
  googleButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  googleIconImage: {
    width: 20,
    height: 20,
    marginRight: 12,
  },
  googleButtonText: {
    color: '#1F2937',
    fontSize: 16,
    fontWeight: '500',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: isSmallScreen ? 6 : 8, // Responsive margin
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  errorContainer: {
    backgroundColor: '#FEE2E2',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
    textAlign: 'center',
  },
});
