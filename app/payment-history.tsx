import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { Colors, Typography, Spacing } from '../src/constants';
import { StorageUtils, DateUtils } from '../src/utils';
import { Button } from '../src/components/Button';
import { PaymentHistory } from '../src/types';

export default function PaymentHistoryPage() {
  const [payments, setPayments] = useState<PaymentHistory[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadPaymentHistory();
  }, []);

  const loadPaymentHistory = async () => {
    try {
      const paymentHistory = await StorageUtils.getAllPaymentHistory();
      // Sort by payment date (newest first)
      const sortedPayments = paymentHistory.sort((a, b) => 
        new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime()
      );
      setPayments(sortedPayments);
    } catch (error) {
      console.error('Error loading payment history:', error);
    }
  };

  const handleBack = () => {
    router.back();
  };

  const handleDeletePayment = async (paymentId: string, utangLabel: string) => {
    Alert.alert(
      'Delete Payment Record',
      `Are you sure you want to delete the payment record for "${utangLabel}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await StorageUtils.deletePaymentHistory(paymentId);
              await loadPaymentHistory();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete payment record');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const getTotalPaid = (): number => {
    return payments.reduce((total, payment) => total + payment.amountPaid, 0);
  };

  const groupPaymentsByDate = () => {
    const grouped: { [key: string]: PaymentHistory[] } = {};
    
    payments.forEach(payment => {
      const dateKey = new Date(payment.paymentDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(payment);
    });
    
    return grouped;
  };

  const renderPaymentItem = (payment: PaymentHistory) => {
    return (
      <View key={payment.id} style={styles.paymentItem}>
        <View style={styles.paymentHeader}>
          <View style={styles.paymentInfo}>
            <Text style={styles.paymentLabel}>{payment.utangLabel}</Text>
            <Text style={styles.paymentType}>
              {payment.utangType === 'loan' ? 'Loan' : 'Credit Card'}
            </Text>
          </View>
          <View style={styles.paymentActions}>
            <Text style={styles.paymentAmount}>₱{payment.amountPaid.toLocaleString()}</Text>
            <TouchableOpacity
              onPress={() => handleDeletePayment(payment.id, payment.utangLabel)}
              style={styles.deleteButton}
            >
              <Text style={styles.deleteText}>✕</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {payment.notes && (
          <Text style={styles.paymentNotes}>{payment.notes}</Text>
        )}
        
        <Text style={styles.paymentTime}>
          {new Date(payment.paymentDate).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
      </View>
    );
  };

  const groupedPayments = groupPaymentsByDate();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment History</Text>
      </View>

      {/* Summary */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Total Payments Made</Text>
          <Text style={styles.summaryAmount}>₱{getTotalPaid().toLocaleString()}</Text>
          <Text style={styles.summaryCount}>{payments.length} payment{payments.length !== 1 ? 's' : ''}</Text>
        </View>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {Object.keys(groupedPayments).length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No payments yet</Text>
            <Text style={styles.emptySubtext}>Your payment history will appear here once you start making payments</Text>
          </View>
        ) : (
          Object.entries(groupedPayments).map(([date, datePayments]) => (
            <View key={date} style={styles.dateGroup}>
              <Text style={styles.dateLabel}>{date}</Text>
              {datePayments.map(renderPaymentItem)}
            </View>
          ))
        )}
      </ScrollView>

      {/* Action Button */}
      {payments.length > 0 && (
        <View style={styles.buttonContainer}>
          <Button
            title="Back to Dashboard"
            onPress={handleBack}
            variant="secondary"
            fullWidth
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.screenPadding,
    paddingTop: Spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    marginRight: Spacing.md,
  },
  backArrow: {
    fontSize: 24,
    color: Colors.textPrimary,
  },
  headerTitle: {
    ...Typography.headerMedium,
    color: Colors.textPrimary,
  },
  summaryContainer: {
    padding: Spacing.screenPadding,
  },
  summaryCard: {
    backgroundColor: Colors.primaryLight,
    padding: Spacing.lg,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  summaryLabel: {
    ...Typography.bodyMedium,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  summaryAmount: {
    ...Typography.headerLarge,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: Spacing.xs,
  },
  summaryCount: {
    ...Typography.bodySmall,
    color: Colors.textTertiary,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.screenPadding,
  },
  dateGroup: {
    marginBottom: Spacing.lg,
  },
  dateLabel: {
    ...Typography.headerSmall,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
    paddingLeft: Spacing.xs,
  },
  paymentItem: {
    backgroundColor: Colors.cardBackground,
    padding: Spacing.md,
    borderRadius: 12,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.xs,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentLabel: {
    ...Typography.bodyMedium,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  paymentType: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  paymentActions: {
    alignItems: 'flex-end',
  },
  paymentAmount: {
    ...Typography.bodyMedium,
    fontWeight: '700',
    color: Colors.success,
    marginBottom: Spacing.xs,
  },
  deleteButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.danger,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteText: {
    color: Colors.textInverse,
    fontSize: 12,
    fontWeight: '600',
  },
  paymentNotes: {
    ...Typography.bodySmall,
    color: Colors.textTertiary,
    marginBottom: Spacing.xs,
    fontStyle: 'italic',
  },
  paymentTime: {
    ...Typography.bodySmall,
    color: Colors.textTertiary,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
  },
  emptyText: {
    ...Typography.headerMedium,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  emptySubtext: {
    ...Typography.bodyMedium,
    color: Colors.textTertiary,
    textAlign: 'center',
    maxWidth: 250,
    lineHeight: 20,
  },
  buttonContainer: {
    padding: Spacing.screenPadding,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
});