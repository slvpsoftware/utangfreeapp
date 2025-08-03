import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
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
  const [selectedDate, setSelectedDate] = useState<Date>(
    value ? new Date(value) : new Date()
  );

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
        onPress={() => setShowPicker(true)}
      >
        <Text style={[
          styles.inputText,
          !value && styles.placeholderText
        ]}>
          {formatDisplayDate(value)}
        </Text>
      </TouchableOpacity>

      {helperText && !error && (
        <Text style={styles.helperText}>{helperText}</Text>
      )}
      
      {error && <Text style={styles.errorText}>{error}</Text>}

      {showPicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleDateChange}
          minimumDate={minimumDate || new Date()}
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
    paddingVertical: Spacing.sm,
    minHeight: 48,
    justifyContent: 'center',
  },
  inputError: {
    borderColor: Colors.danger,
  },
  inputText: {
    ...Typography.bodyMedium,
    color: Colors.textPrimary,
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
});