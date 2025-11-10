/**
 * Phone Input Component
 * Professional phone number input with country selection
 * Following comprehensive styling guide with theme integration
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
  StyleSheet,
  TextInputProps,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../providers/ThemeProvider';
import { Country, africanCountries } from '../constants/countries';

interface PhoneInputProps extends Omit<TextInputProps, 'onChangeText' | 'value'> {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  selectedCountry: Country;
  onCountryChange: (country: Country) => void;
  error?: string;
  onBlur?: () => void;
  onFocus?: () => void;
  disabled?: boolean;
  placeholder?: string;
}

export const PhoneInput: React.FC<PhoneInputProps> = ({
  label,
  value,
  onChangeText,
  selectedCountry,
  onCountryChange,
  error,
  onBlur,
  onFocus,
  disabled = false,
  placeholder = "Enter your phone number",
  ...textInputProps
}) => {
  const { colors } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [showCountryModal, setShowCountryModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Memoized filtered countries for better performance
  const filteredCountries = useMemo(() => {
    if (!searchQuery.trim()) return africanCountries;
    
    const query = searchQuery.toLowerCase();
    return africanCountries.filter(country =>
      country.name.toLowerCase().includes(query) ||
      country.code.includes(searchQuery)
    );
  }, [searchQuery]);

  const handleFocus = useCallback(() => {
    setIsFocused(true);
    onFocus?.();
  }, [onFocus]);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    onBlur?.();
  }, [onBlur]);

  const handleCountrySelect = useCallback((country: Country) => {
    onCountryChange(country);
    setShowCountryModal(false);
    setSearchQuery('');
  }, [onCountryChange]);

  const handleOpenCountryModal = useCallback(() => {
    if (!disabled) {
      setShowCountryModal(true);
    }
  }, [disabled]);

  // Memoized country item component for better performance
  const CountryItem = React.memo(({ country }: { country: Country }) => (
    <TouchableOpacity
      style={[
        styles.countryItem,
        {
          backgroundColor: colors.card,
          borderBottomColor: colors.border,
        },
      ]}
      onPress={() => handleCountrySelect(country)}
      activeOpacity={0.7}
    >
      <View style={styles.countryItemContent}>
        <Text style={styles.countryFlag}>{country.flag}</Text>
        <View style={styles.countryInfo}>
          <Text style={[styles.countryName, { color: colors.text }]}>
            {country.name}
          </Text>
          <Text style={[styles.countryCodeText, { color: colors.textSecondary }]}>
            {country.code}
          </Text>
        </View>
        {selectedCountry.code === country.code && (
          <Ionicons
            name="checkmark"
            size={20}
            color={colors.primary}
          />
        )}
      </View>
    </TouchableOpacity>
  ));

  // Memoized styles to prevent unnecessary re-renders
  const inputContainerStyle = useMemo(() => [
    styles.inputContainer,
    {
      backgroundColor: colors.card,
      borderColor: isFocused ? colors.primary : colors.border,
      opacity: disabled ? 0.6 : 1,
    },
    error ? styles.inputContainerError : null,
  ], [colors.card, colors.primary, colors.border, isFocused, disabled, error]);

  const countryCodeStyle = useMemo(() => [
    styles.countryCode,
    { color: colors.text }
  ], [colors.text]);

  const phoneInputStyle = useMemo(() => [
    styles.phoneInput,
    { color: colors.text }
  ], [colors.text]);

  return (
    <View style={styles.container}>
      {/* Label */}
      {label && (
        <Text style={[styles.label, { color: colors.text }]}>
          {label}
        </Text>
      )}

      {/* Input Container */}
      <View style={inputContainerStyle}>
        {/* Country Selector */}
        <TouchableOpacity
          style={styles.countrySelector}
          onPress={handleOpenCountryModal}
          disabled={disabled}
        >
          <Text style={styles.flag}>{selectedCountry.flag}</Text>
          <Text style={countryCodeStyle}>
            {selectedCountry.code}
          </Text>
          <Ionicons
            name="chevron-down"
            size={16}
            color={colors.textSecondary}
          />
        </TouchableOpacity>

        {/* Divider */}
        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        {/* Phone Input */}
        <TextInput
          style={phoneInputStyle}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textSecondary}
          onFocus={handleFocus}
          onBlur={handleBlur}
          editable={!disabled}
          keyboardType="phone-pad"
          autoComplete="tel"
          textContentType="telephoneNumber"
          {...textInputProps}
        />
      </View>

      {/* Error Message */}
      {error && (
        <View style={[styles.errorContainer, { backgroundColor: colors.error + '20' }]}>
          <Text style={[styles.errorText, { color: colors.error }]}>
            {error}
          </Text>
        </View>
      )}

      {/* Country Selection Modal */}
      <Modal
        visible={showCountryModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCountryModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            {/* Modal Header */}
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <TouchableOpacity
                onPress={() => setShowCountryModal(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Select Country
              </Text>
              <View style={styles.placeholder} />
            </View>

            {/* Search Input */}
            <View style={[styles.searchContainer, { backgroundColor: colors.background }]}>
              <Ionicons name="search" size={20} color={colors.textSecondary} />
              <TextInput
                style={[styles.searchInput, { color: colors.text }]}
                placeholder="Search countries..."
                placeholderTextColor={colors.textSecondary}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            {/* Countries List */}
            <ScrollView 
              style={styles.countriesList}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {/* Debug: Show count */}
              {/* <View style={{ padding: 10, backgroundColor: '#f0f0f0' }}>
                <Text style={{ color: 'black', fontSize: 12 }}>
                  Countries to render: {filteredCountries.length}
                </Text>
              </View> */}
              
              {filteredCountries.length > 0 ? (
                filteredCountries.map((country) => (
                  <CountryItem key={country.code} country={country} />
                ))
              ) : (
                <View style={{ padding: 20, alignItems: 'center' }}>
                  <Text style={{ color: colors.text }}>No countries found</Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    fontFamily: 'Roboto-Medium',
  },
  
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 16,
    minHeight: 48,
  },
  
  inputContainerError: {
    borderColor: '#DC2626',
  },
  
  countrySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 12,
  },
  
  flag: {
    fontSize: 20,
    marginRight: 8,
  },
  
  countryCode: {
    fontSize: 16,
    fontFamily: 'Roboto-Regular',
    marginRight: 4,
  },
  
  divider: {
    width: 1,
    height: 24,
    marginRight: 12,
  },
  
  phoneInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Roboto-Regular',
    paddingVertical: 12,
  },
  
  errorContainer: {
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginTop: 8,
  },
  
  errorText: {
    fontSize: 14,
    fontFamily: 'Roboto-Regular',
  },
  
  // Modal Styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
  },
  
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  
  closeButton: {
    padding: 4,
  },
  
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Roboto-Bold',
  },
  
  placeholder: {
    width: 32,
  },
  
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    fontFamily: 'Roboto-Regular',
  },
  
  countriesList: {
    maxHeight: 300,
  },
  
  countryItem: {
    borderBottomWidth: 1,
  },
  
  countryItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  
  countryFlag: {
    fontSize: 24,
    marginRight: 12,
  },
  
  countryInfo: {
    flex: 1,
    marginLeft: 8,
  },
  
  countryName: {
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'Roboto-Medium',
  },
  
  countryCodeText: {
    fontSize: 14,
    marginTop: 2,
    fontFamily: 'Roboto-Regular',
  },
});
