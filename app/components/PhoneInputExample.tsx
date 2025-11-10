/**
 * Phone Input Example Component
 * Demonstrates usage of the PhoneInput component with validation
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { PhoneInput } from './PhoneInput';
import { Button } from './Button';
import { useTheme } from '../providers/ThemeProvider';
import { Country, defaultCountry } from '../constants/countries';

export const PhoneInputExample: React.FC = () => {
  const { colors } = useTheme();
  
  // Form state
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<Country>(defaultCountry);
  const [phoneError, setPhoneError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  // Validation function
  const validatePhoneNumber = (phone: string, country: Country): string => {
    if (!phone.trim()) {
      return 'Phone number is required';
    }

    // Remove any non-digit characters
    const cleanPhone = phone.replace(/\D/g, '');
    
    // Basic length validation based on country
    if (cleanPhone.length < 7) {
      return 'Phone number is too short';
    }

    if (cleanPhone.length > 15) {
      return 'Phone number is too long';
    }

    // Country-specific validation
    if (country.code === '+255') { // Tanzania
      const validPrefixes = ['75', '76', '77', '78', '65', '66', '67', '68', '71', '72', '73', '74'];
      const prefix = cleanPhone.substring(0, 2);
      if (!validPrefixes.includes(prefix)) {
        return 'Invalid Tanzania phone number prefix';
      }
    }

    return '';
  };

  // Handle phone number change
  const handlePhoneChange = (text: string) => {
    setPhoneNumber(text);
    
    // Clear error when user starts typing
    if (phoneError) {
      setPhoneError('');
    }
  };

  // Handle country change
  const handleCountryChange = (country: Country) => {
    setSelectedCountry(country);
    
    // Re-validate phone number with new country
    if (phoneNumber) {
      const error = validatePhoneNumber(phoneNumber, country);
      setPhoneError(error);
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    const error = validatePhoneNumber(phoneNumber, selectedCountry);
    
    if (error) {
      setPhoneError(error);
      return;
    }

    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      Alert.alert(
        'Success!',
        `Phone number: ${selectedCountry.code} ${phoneNumber}`,
        [{ text: 'OK' }]
      );
    } catch (err) {
      Alert.alert('Error', 'Failed to submit phone number');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle blur validation
  const handleBlur = () => {
    if (phoneNumber) {
      const error = validatePhoneNumber(phoneNumber, selectedCountry);
      setPhoneError(error);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>
          Phone Input Example
        </Text>
        
        <Text style={[styles.description, { color: colors.textSecondary }]}>
          This demonstrates the PhoneInput component with country selection, validation, and error handling.
        </Text>

        {/* Phone Input */}
        <PhoneInput
          label="Phone Number"
          value={phoneNumber}
          onChangeText={handlePhoneChange}
          selectedCountry={selectedCountry}
          onCountryChange={handleCountryChange}
          error={phoneError}
          onBlur={handleBlur}
          placeholder="Enter your phone number"
        />

        {/* Submit Button */}
        <Button
          title={isLoading ? 'Submitting...' : 'Submit Phone Number'}
          onPress={handleSubmit}
          disabled={!phoneNumber || !!phoneError || isLoading}
          style={[
            styles.submitButton,
            (!phoneNumber || !!phoneError || isLoading) && { 
              backgroundColor: colors.border 
            }
          ]}
        />

        {/* Info Section */}
        <View style={[styles.infoContainer, { backgroundColor: colors.card }]}>
          <Text style={[styles.infoTitle, { color: colors.text }]}>
            Features Demonstrated:
          </Text>
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            • Country selection with flags and calling codes{'\n'}
            • Real-time validation{'\n'}
            • Error handling and display{'\n'}
            • Focus and blur states{'\n'}
            • Theme integration{'\n'}
            • Professional styling{'\n'}
            • Accessibility support
          </Text>
        </View>

        {/* Current Values Display */}
        <View style={[styles.valuesContainer, { backgroundColor: colors.card }]}>
          <Text style={[styles.valuesTitle, { color: colors.text }]}>
            Current Values:
          </Text>
          <Text style={[styles.valuesText, { color: colors.textSecondary }]}>
            Country: {selectedCountry.flag} {selectedCountry.name} ({selectedCountry.code}){'\n'}
            Phone: {phoneNumber || 'Not entered'}{'\n'}
            Full Number: {phoneNumber ? `${selectedCountry.code} ${phoneNumber}` : 'Not complete'}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  
  content: {
    padding: 20,
  },
  
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    fontFamily: 'Roboto-Bold',
  },
  
  description: {
    fontSize: 16,
    marginBottom: 32,
    lineHeight: 24,
    fontFamily: 'Roboto-Regular',
  },
  
  submitButton: {
    marginTop: 16,
  },
  
  infoContainer: {
    marginTop: 32,
    padding: 16,
    borderRadius: 12,
  },
  
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    fontFamily: 'Roboto-Bold',
  },
  
  infoText: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: 'Roboto-Regular',
  },
  
  valuesContainer: {
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
  },
  
  valuesTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    fontFamily: 'Roboto-Bold',
  },
  
  valuesText: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: 'Roboto-Regular',
  },
});
