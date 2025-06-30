import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing } from '../constants';
import { KPICardProps } from '../types';

export const KPICard: React.FC<KPICardProps> = ({
  label,
  value,
  helperText,
  color = Colors.textPrimary,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.label}>{label}</Text>
        <Text style={[styles.value, { color }]}>{value}</Text>
      </View>
      {helperText && <Text style={styles.helperText}>{helperText}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    shadowColor: Colors.shadowMedium,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    ...Typography.bodyMedium,
    color: Colors.textSecondary,
  },
  value: {
    ...Typography.kpiValue,
  },
  helperText: {
    ...Typography.bodySmall,
    color: Colors.textTertiary,
    marginTop: Spacing.xs,
  },
}); 