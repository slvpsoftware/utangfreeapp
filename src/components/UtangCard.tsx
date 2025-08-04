import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing } from '../constants';
import { UtangCardProps } from '../types';
import { DateUtils } from '../utils/dateUtils';

export const UtangCard: React.FC<UtangCardProps> = ({
  utang,
  isSelected = false,
  onSelect,
  showCheckbox = false,
}) => {
  const isOverdue = utang.status === 'pending' && DateUtils.isOverdue(utang);
  const isDueSoon = utang.status === 'pending' && DateUtils.getDaysUntilDue(utang) <= 7;

  const getStatusColor = () => {
    if (utang.status === 'paid') return Colors.success;
    if (isOverdue) return Colors.danger;
    if (isDueSoon) return Colors.warning;
    return Colors.textSecondary;
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        isSelected && styles.selected,
        utang.status === 'paid' && styles.paid,
      ]}
      onPress={() => onSelect?.(utang.id)}
      activeOpacity={0.8}
    >
      <View style={styles.content}>
        <View style={styles.leftContent}>
          <Text style={styles.label}>{utang.label}</Text>
          <Text style={[styles.amount, { color: getStatusColor() }]}>
            {DateUtils.formatCurrency(utang.amount)}
          </Text>
          {utang.status === 'pending' && (
            <Text style={styles.dueInfo}>
              Due: {new Date(utang.dueDate).toLocaleDateString()}
            </Text>
          )}
        </View>
        
        {showCheckbox && (
          <View style={styles.checkboxContainer}>
            <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
              {isSelected && <Text style={styles.checkmark}>✓</Text>}
            </View>
          </View>
        )}
      </View>
      
      {utang.status === 'paid' && (
        <Text style={styles.paidLabel}>Paid on {DateUtils.formatDate(utang.paidAt!)}</Text>
      )}
    </TouchableOpacity>
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
  selected: {
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  paid: {
    opacity: 0.6,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftContent: {
    flex: 1,
  },
  label: {
    ...Typography.bodyLarge,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  amount: {
    ...Typography.currency,
    marginBottom: Spacing.xs,
  },
  dueInfo: {
    ...Typography.bodySmall,
    color: Colors.textTertiary,
  },
  checkboxContainer: {
    marginLeft: Spacing.md,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  checkmark: {
    color: Colors.textInverse,
    fontSize: 16,
    fontWeight: 'bold',
  },
  paidLabel: {
    ...Typography.bodySmall,
    color: Colors.success,
    marginTop: Spacing.sm,
    fontStyle: 'italic',
  },
}); 