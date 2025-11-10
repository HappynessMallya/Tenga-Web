/**
 * Country Picker Component
 * Reusable dropdown/modal for selecting African countries with phone codes
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../providers/ThemeProvider';
import { Country, africanCountries } from '../constants/countries';

interface CountryPickerProps {
  selectedCountry: Country;
  onSelectCountry: (country: Country) => void;
  disabled?: boolean;
  placeholder?: string;
}

export const CountryPicker: React.FC<CountryPickerProps> = ({
  selectedCountry,
  onSelectCountry,
  disabled = false,
  placeholder = "Select Country",
}) => {
  const { colors } = useTheme();
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter countries based on search query
  const filteredCountries = africanCountries.filter(country =>
    country.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    country.code.includes(searchQuery)
  );

  const handleSelectCountry = (country: Country) => {
    onSelectCountry(country);
    setShowModal(false);
    setSearchQuery('');
  };

  const handleOpenModal = () => {
    if (!disabled) {
      setShowModal(true);
    }
  };

  const renderCountryItem = ({ item }: { item: Country }) => (
    <TouchableOpacity
      style={[
        styles.countryItem,
        {
          backgroundColor: colors.card,
          borderBottomColor: colors.border || '#f0f0f0',
        },
      ]}
      onPress={() => handleSelectCountry(item)}
    >
      <View style={styles.countryItemContent}>
        <Text style={styles.countryFlag}>{item.flag}</Text>
        <View style={styles.countryInfo}>
          <Text style={[styles.countryName, { color: colors.text }]}>
            {item.name}
          </Text>
          <Text style={[styles.countryCode, { color: colors.textSecondary }]}>
            {item.code}
          </Text>
        </View>
        {selectedCountry.code === item.code && (
          <Ionicons
            name="checkmark"
            size={20}
            color={colors.primary}
          />
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Country Picker Button */}
      <TouchableOpacity
        style={[
          styles.pickerButton,
          {
            backgroundColor: colors.card,
            borderColor: colors.border || '#e1e5e9',
            opacity: disabled ? 0.6 : 1,
          },
        ]}
        onPress={handleOpenModal}
        disabled={disabled}
      >
        <View style={styles.pickerButtonContent}>
          <Text style={styles.countryFlag}>{selectedCountry.flag}</Text>
          <View style={styles.pickerTextContainer}>
            <Text style={[styles.pickerText, { color: colors.text }]}>
              {selectedCountry.name}
            </Text>
            <Text style={[styles.pickerCode, { color: colors.textSecondary }]}>
              {selectedCountry.code}
            </Text>
          </View>
          <Ionicons
            name="chevron-down"
            size={16}
            color={colors.textSecondary || '#666'}
          />
        </View>
      </TouchableOpacity>

      {/* Country Selection Modal */}
      <Modal
        visible={showModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          {/* Modal Header */}
          <View style={[styles.modalHeader, { borderBottomColor: colors.border || '#e1e5e9' }]}>
            <TouchableOpacity
              onPress={() => setShowModal(false)}
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
          <View style={[styles.searchContainer, { backgroundColor: colors.card }]}>
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
          <FlatList
            data={filteredCountries}
            keyExtractor={(item) => item.code}
            renderItem={renderCountryItem}
            style={styles.countriesList}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          />
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    minHeight: 44,
  },
  pickerButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  countryFlag: {
    fontSize: 20,
    marginRight: 8,
  },
  pickerTextContainer: {
    flex: 1,
  },
  pickerText: {
    fontSize: 16,
    fontWeight: '500',
  },
  pickerCode: {
    fontSize: 14,
    marginTop: 2,
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  closeButton: {
    padding: 4,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
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
    borderColor: '#e1e5e9',
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  countriesList: {
    flex: 1,
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
  countryInfo: {
    flex: 1,
    marginLeft: 8,
  },
  countryName: {
    fontSize: 16,
    fontWeight: '500',
  },
  countryCode: {
    fontSize: 14,
    marginTop: 2,
  },
});
