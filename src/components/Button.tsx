import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Colors, Typography, Spacing } from '../constants';
import { ButtonProps } from '../types';

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  disabled = false,
  loading = false,
  variant = 'primary',
  fullWidth = true,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        styles[variant],
        disabled && styles.disabled,
        fullWidth && styles.fullWidth,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? Colors.buttonText : Colors.primary} />
      ) : (
        <Text style={[
          styles.buttonText, 
          variant === 'secondary' && styles.secondaryText,
          disabled && styles.disabledText
        ]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    height: Spacing.buttonHeight,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    shadowColor: Colors.shadowMedium,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  primary: {
    backgroundColor: Colors.buttonPrimary,
  },
  secondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  disabled: {
    backgroundColor: Colors.buttonDisabled,
    shadowOpacity: 0,
    elevation: 0,
  },
  fullWidth: {
    width: '100%',
  },
  buttonText: {
    ...Typography.button,
  },
  secondaryText: {
    color: Colors.primary, // Use app's primary green color for secondary button text
  },
  disabledText: {
    color: Colors.textSecondary,
  },
}); 