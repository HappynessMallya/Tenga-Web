import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ScrollView,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../providers/ThemeProvider';
import { formatDate, formatTime, getPickupTimeSlots } from '../utils/orderCalculations';

interface DateTimePickerModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (date: Date, timeSlot: string) => void;
  initialDate?: Date;
  initialTimeSlot?: string;
}

export const DateTimePickerModal: React.FC<DateTimePickerModalProps> = ({
  visible,
  onClose,
  onConfirm,
  initialDate = new Date(),
  initialTimeSlot = 'morning',
}) => {
  const { colors } = useTheme();
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(initialTimeSlot);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const timeSlots = getPickupTimeSlots();

  const handleConfirm = () => {
    onConfirm(selectedDate, selectedTimeSlot);
    onClose();
  };

  const handleDateChange = (event: any, date?: Date) => {
    setShowDatePicker(false);
    if (date) {
      setSelectedDate(date);
    }
  };

  const getDateOptions = () => {
    const today = new Date();
    const options = [];
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      let label = '';
      if (i === 0) {
        label = 'Today';
      } else if (i === 1) {
        label = 'Tomorrow';
      } else {
        label = formatDate(date);
      }
      
      options.push({
        date,
        label,
        disabled: i === 0 && today.getHours() >= 21, // Disable today if past 9 PM
      });
    }
    
    return options;
  };

  const dateOptions = getDateOptions();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: colors.card }]}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={[styles.title, { color: colors.text }]}>
              Pickup Date & Time
            </Text>
            <View style={styles.placeholder} />
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Date Selection */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Select Date
              </Text>
              <View style={styles.dateOptions}>
                {dateOptions.map((option, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.dateOption,
                      {
                        backgroundColor: selectedDate.toDateString() === option.date.toDateString()
                          ? colors.primary
                          : colors.background,
                        borderColor: colors.border,
                        opacity: option.disabled ? 0.5 : 1,
                      },
                    ]}
                    onPress={() => !option.disabled && setSelectedDate(option.date)}
                    disabled={option.disabled}
                  >
                    <Text
                      style={[
                        styles.dateOptionText,
                        {
                          color: selectedDate.toDateString() === option.date.toDateString()
                            ? 'white'
                            : colors.text,
                        },
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Time Slot Selection */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Select Time Slot
              </Text>
              <View style={styles.timeSlots}>
                {timeSlots.map((slot, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.timeSlot,
                      {
                        backgroundColor: selectedTimeSlot === slot.value
                          ? colors.primary
                          : colors.background,
                        borderColor: colors.border,
                        opacity: slot.disabled ? 0.5 : 1,
                      },
                    ]}
                    onPress={() => !slot.disabled && setSelectedTimeSlot(slot.value)}
                    disabled={slot.disabled}
                  >
                    <Text
                      style={[
                        styles.timeSlotText,
                        {
                          color: selectedTimeSlot === slot.value
                            ? 'white'
                            : colors.text,
                        },
                      ]}
                    >
                      {slot.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>

          {/* Footer */}
          <View style={[styles.footer, { borderTopColor: colors.border }]}>
            <TouchableOpacity
              style={[styles.confirmButton, { backgroundColor: colors.primary }]}
              onPress={handleConfirm}
            >
              <Text style={styles.confirmButtonText}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
  },
  closeButton: {
    padding: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  placeholder: {
    width: 32,
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  dateOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  dateOption: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    minWidth: 80,
    alignItems: 'center',
  },
  dateOptionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  timeSlots: {
    gap: 8,
  },
  timeSlot: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  timeSlotText: {
    fontSize: 16,
    fontWeight: '500',
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
  },
  confirmButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
