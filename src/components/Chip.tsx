import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing } from '../constants';
import { ChipProps } from '../types';

export const Chip: React.FC<ChipProps> = ({
  title,
  active,
  onPress,
}) => {
  return (
    <TouchableOpacity
      style={[styles.container, active && styles.active]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={[styles.text, active && styles.activeText]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    height: Spacing.chipHeight,
    paddingHorizontal: Spacing.md,
    borderRadius: Spacing.chipHeight / 2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: Spacing.sm,
  },
  active: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  text: {
    ...Typography.chip,
    color: Colors.textSecondary,
  },
  activeText: {
    color: Colors.textInverse,
  },
}); 