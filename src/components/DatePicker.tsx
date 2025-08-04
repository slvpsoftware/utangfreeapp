import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Modal } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Colors, Typography, Spacing } from '../constants';

interface DatePickerProps {
  label?: string;
  value: string;
  onChange: (date: string) => void;
  helperText?: string;
  error?: string;
  width?: 'full' | 'half';
  minimumDate?: Date;
  placeholder?: string;
}

export const DatePicker: React.FC<DatePickerProps> = ({
  label,
  value,
  onChange,
  helperText,
  error,
  width = 'full',
  minimumDate,
  placeholder = 'Select date',
}) => {
  const [showPicker, setShowPicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    if (value) {
      return new Date(value);
    }
    return minimumDate || new Date();
  });

  // Update selected date when value prop changes
  useEffect(() => {
    if (value) {
      setSelectedDate(new Date(value));
    } else {
      setSelectedDate(minimumDate || new Date());
    }
  }, [value, minimumDate]);

  const handleDateChange = (event: any, date?: Date) => {
    setShowPicker(Platform.OS === 'ios');
    
    if (date) {
      setSelectedDate(date);
      const isoString = date.toISOString().split('T')[0]; // YYYY-MM-DD format
      onChange(isoString);
    }
  };

  const formatDisplayDate = (dateString: string): string => {
    if (!dateString) return placeholder;
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <View style={[styles.container, width === 'half' && styles.halfWidth]}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <TouchableOpacity
        style={[styles.input, error && styles.inputError]}
        onPress={() => {
          // Ensure selectedDate is in sync when opening picker
          if (value) {
            setSelectedDate(new Date(value));
          }
          setShowPicker(true);
        }}
        activeOpacity={0.7}
      >
        <View style={styles.inputContent}>
          <Text style={[
            styles.inputText,
            !value && styles.placeholderText
          ]}>
            {formatDisplayDate(value)}
          </Text>
          {value && (
            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation(); // Prevent opening date picker
                onChange(''); // Clear the value - useEffect will handle selectedDate update
              }}
              style={styles.clearButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.clearIcon}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>

      {helperText && !error && (
        <Text style={styles.helperText}>{helperText}</Text>
      )}
      
      {error && <Text style={styles.errorText}>{error}</Text>}

      {showPicker && Platform.OS === 'ios' && (
        <Modal
          transparent
          animationType="slide"
          visible={showPicker}
          onRequestClose={() => setShowPicker(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <TouchableOpacity
                  onPress={() => setShowPicker(false)}
                  style={styles.modalButton}
                >
                  <Text style={styles.modalButtonText}>Cancel</Text>
                </TouchableOpacity>
                <Text style={styles.modalTitle}>Select Date</Text>
                <TouchableOpacity
                  onPress={() => {
                    setShowPicker(false);
                    const isoString = selectedDate.toISOString().split('T')[0];
                    onChange(isoString);
                  }}
                  style={styles.modalButton}
                >
                  <Text style={[styles.modalButtonText, { color: Colors.primary }]}>Done</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={selectedDate}
                mode="date"
                display="spinner"
                onChange={(event, date) => {
                  if (date) setSelectedDate(date);
                }}
                minimumDate={minimumDate}
                maximumDate={new Date(new Date().getFullYear() + 10, 11, 31)}
                themeVariant="light"
                textColor={Colors.textPrimary}
                accentColor={Colors.primary}
                style={styles.datePicker}
              />
            </View>
          </View>
        </Modal>
      )}

      {showPicker && Platform.OS === 'android' && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="default"
          onChange={handleDateChange}
          minimumDate={minimumDate}
          maximumDate={new Date(new Date().getFullYear() + 10, 11, 31)}
          textColor={Colors.textPrimary}
          accentColor={Colors.primary}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },
  halfWidth: {
    width: '48%',
  },
  label: {
    ...Typography.bodyMedium,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
    fontWeight: '600',
  },
  input: {
    backgroundColor: Colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    minHeight: 56, // Increased height for better touch target
    justifyContent: 'center',
  },
  inputError: {
    borderColor: Colors.danger,
  },
  inputContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  inputText: {
    ...Typography.bodyMedium,
    color: Colors.textPrimary,
    flex: 1,
  },
  clearButton: {
    padding: Spacing.xs,
    borderRadius: 12,
    backgroundColor: Colors.danger + '20', // Light red background
    marginLeft: Spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 24,
    minHeight: 24,
  },
  clearIcon: {
    fontSize: 14,
    color: Colors.danger,
    fontWeight: 'bold',
    lineHeight: 14,
  },
  placeholderText: {
    color: Colors.textSecondary,
  },
  helperText: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  errorText: {
    ...Typography.bodySmall,
    color: Colors.danger,
    marginTop: Spacing.xs,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 34, // Safe area bottom
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    ...Typography.headerMedium,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  modalButton: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  modalButtonText: {
    ...Typography.bodyMedium,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  datePicker: {
    backgroundColor: Colors.surface,
    marginHorizontal: Spacing.lg,
    height: 200,
  },
});