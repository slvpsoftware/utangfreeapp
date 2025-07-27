import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { Colors, Spacing, Typography } from '../constants';
import { InputProps } from '../types';

export const Input: React.FC<InputProps> = ({
  label,
  placeholder,
  value,
  onChangeText,
  helperText,
  error,
  keyboardType = 'default',
  width = 'full',
  prefix,
  suffix,
}) => {
  return (
    <View style={[styles.container, width === 'half' && styles.halfWidth]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.inputContainer, error && styles.inputError]}>
        {prefix && <Text style={styles.prefix}>{prefix}</Text>}
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          placeholderTextColor={Colors.textTertiary}
        />
        {suffix && <Text style={styles.suffix}>{suffix}</Text>}
      </View>
      {helperText && <Text style={styles.helperText}>{helperText}</Text>}
      {error && <Text style={styles.errorText}>{error}</Text>}
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
    marginBottom: Spacing.xs,
    color: Colors.textPrimary,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: Spacing.inputHeight,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.cardBackground,
  },
  inputError: {
    borderColor: Colors.danger,
  },
  prefix: {
    ...Typography.bodyLarge,
    color: Colors.textSecondary,
    marginRight: Spacing.xs,
  },
  suffix: {
    ...Typography.bodyLarge,
    color: Colors.textSecondary,
    marginLeft: Spacing.xs,
  },
  input: {
    flex: 1,
    ...Typography.bodyLarge,
    color: Colors.textPrimary,
  },
  helperText: {
    ...Typography.bodySmall,
    marginTop: Spacing.xs,
    color: Colors.textTertiary,
  },
  errorText: {
    ...Typography.bodySmall,
    marginTop: Spacing.xs,
    color: Colors.danger,
  },
}); 