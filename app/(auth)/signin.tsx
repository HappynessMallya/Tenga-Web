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
  Image,
  Dimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as yup from 'yup';

// Components
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { PhoneInput } from '../components/PhoneInput';

// Hooks and services
import { useAuth } from '../hooks/useAuth';
import { signinValidationSchema, SigninFormData } from '../utils/validationSchemas';
import { Country, defaultCountry } from '../constants/countries';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Responsive dimensions
const isSmallScreen = screenHeight < 700;
const isLargeScreen = screenHeight > 800;
const horizontalPadding = screenWidth < 400 ? 16 : 24;
const titleFontSize = isSmallScreen ? 24 : isLargeScreen ? 32 : 28;
const topPadding = isSmallScreen ? 40 : 60;

export default function SignInScreen() {
  // Auth hook
  const { signIn, isLoading, error, clearAuthError } = useAuth();
  const isMountedRef = useRef(true);

  // Form state
  const [formData, setFormData] = useState<SigninFormData>({
    phoneNumber: '',
    password: '',
    countryCode: defaultCountry.code,
  });

  // UI state
  const [errors, setErrors] = useState<Partial<SigninFormData>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<Country>(defaultCountry);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const updateField = useCallback(
    (field: keyof SigninFormData, value: string) => {
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
      await signinValidationSchema.validate(formData, { abortEarly: false });
      setErrors({});
      return true;
    } catch (validationError: any) {
      if (validationError instanceof yup.ValidationError) {
        const newErrors: Partial<SigninFormData> = {};
        validationError.inner.forEach((error) => {
          if (error.path) {
            newErrors[error.path as keyof SigninFormData] = error.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  }, [formData]);

  const handleSignIn = useCallback(async () => {
    const isValid = await validateForm();
    if (!isValid || isLoading) return;
    
    Keyboard.dismiss();
    clearAuthError();
    
    try {
      const response = await signIn({
        phoneNumber: formData.phoneNumber,
        password: formData.password,
        countryCode: formData.countryCode,
      });
      
      // Navigate immediately after successful signin
      console.log('✅ Sign in successful, navigating to home...');
      console.log('📊 Auth state after signin:', { 
        user: response.user?.fullName, 
        isAuthenticated: true 
      });
      
      // Immediate navigation - no setTimeout needed
      console.log('📍 Navigating to: /(customer)/tabs/home');
      router.replace('/(customer)/tabs/home');
      console.log('✅ Navigation call completed');
    } catch (error: any) {
      // Enhanced error handling with specific API error messages
      let errorMessage = 'Sign in failed. Please try again.';
      
      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      // Show detailed error message
      Alert.alert(
        'Sign In Failed',
        errorMessage,
        [{ text: 'OK', style: 'default' }]
      );
      
      console.error('Sign in error:', error);
    }
  }, [formData, isLoading, validateForm, signIn, clearAuthError]);

  const handleGoogleSignIn = useCallback(() => {
    if (isLoading) return;
    Keyboard.dismiss();
    // UI-only: go to home directly
    router.replace('/(customer)/tabs/home');
  }, [isLoading]);

  const handleForgotPassword = () => {
    // TODO: Implement forgot password functionality
    Alert.alert('Forgot Password', 'Password reset functionality will be available soon.', [
      { text: 'OK', style: 'default' },
    ]);
  };


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
          <Text style={styles.title}>Welcome back</Text>

          {/* Form */}
          <View style={styles.formContainer}>
            {/* Phone Number */}
            <PhoneInput
              label="Phone Number"
              value={formData.phoneNumber}
              onChangeText={value => updateField('phoneNumber', value)}
              selectedCountry={selectedCountry}
              onCountryChange={handleCountrySelect}
              error={errors.phoneNumber ? errors.phoneNumber : undefined}
              placeholder="Enter your phone number"
              disabled={isLoading}
            />

            {/* Password */}
            <Input
              placeholder="Password"
              value={formData.password}
              onChangeText={value => updateField('password', value)}
              error={errors.password}
              secureTextEntry={!showPassword}
              autoComplete="password"
              textContentType="password"
              rightIcon={showPassword ? 'eye-off-outline' : 'eye-outline'}
              onRightIconPress={() => setShowPassword(!showPassword)}
              style={styles.input}
            />

            {/* Error Display */}
            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {/* Log in Button */}
            <Button
              title="Login"
              onPress={handleSignIn}
              loading={isLoading}
              style={styles.loginButton}
            />

            {/* Forgot Password */}
            <TouchableOpacity onPress={handleForgotPassword} style={styles.forgotPassword}>
              <Text style={styles.forgotPasswordText}>I forgot my password</Text>
            </TouchableOpacity>

            {/* Divider */}
            {/* <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.dividerLine} />
            </View> */}

            {/* Google Sign In Button */}
            {/* <TouchableOpacity
              onPress={handleGoogleSignIn}
              disabled={isLoading}
              style={styles.googleButton}
            >
              <Image
                source={require('../../assets/google.png')}
                style={styles.googleIconImage}
                resizeMode="contain"
              />
              <Text style={styles.googleButtonText}>Log in with Google</Text>
            </TouchableOpacity> */}

            {/* Sign Up Link */}
            <View style={styles.signupContainer}>
              <Text style={styles.signupText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => router.push('/(auth)/signup')}>
                <Text style={styles.signupLink}>Sign up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
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
  input: {
    // Additional styles if needed
  },
  loginButton: {
    backgroundColor: '#9334ea',
    marginTop: isSmallScreen ? 6 : 8, // Responsive margin
  },
  forgotPassword: {
    alignItems: 'center',
    paddingVertical: isSmallScreen ? 4 : 6, // Responsive padding
  },
  forgotPasswordText: {
    color: '#9334ea',
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
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: isSmallScreen ? 12 : 16, // Responsive margin
    paddingVertical: isSmallScreen ? 2 : 3, // Responsive padding
  },
  signupText: {
    fontSize: 16,
    color: '#6B7280',
    fontFamily: 'Roboto-Regular',
  },
  signupLink: {
    fontSize: 16,
    color: '#9334ea',
    fontWeight: '600',
    fontFamily: 'Roboto-Bold',
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
