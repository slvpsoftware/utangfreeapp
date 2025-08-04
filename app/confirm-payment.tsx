import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Colors, Typography, Spacing } from '../src/constants';
import { StorageUtils, DateUtils } from '../src/utils';
import { Button } from '../src/components/Button';
import { Input } from '../src/components/Input';
import { Utang, PaymentHistory } from '../src/types';

export default function ConfirmPaymentPage() {
  const { utangIds } = useLocalSearchParams<{ utangIds: string }>();
  const [utangs, setUtangs] = useState<Utang[]>([]);
  const [adjustedPayments, setAdjustedPayments] = useState<{[key: string]: number}>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSelectedUtangs();
  }, []);

  const loadSelectedUtangs = async () => {
    try {
      const allUtangs = await StorageUtils.getAllUtangs();
      const selectedIds = utangIds ? utangIds.split(',') : [];
      const selectedUtangs = allUtangs.filter(utang => selectedIds.includes(utang.id));
      setUtangs(selectedUtangs);
      
      // Initialize adjusted payments for credit cards
      const initialPayments: {[key: string]: number} = {};
      selectedUtangs.forEach(utang => {
        if (utang.type === 'credit_card' && utang.monthlyPayment) {
          initialPayments[utang.id] = utang.monthlyPayment;
        }
      });
      setAdjustedPayments(initialPayments);
    } catch (error) {
      console.error('Error loading selected utangs:', error);
      Alert.alert('Error', 'Failed to load payment details');
      router.back();
    }
  };

  const handleBack = () => {
    router.back();
  };

  const handlePaymentAdjustment = (utangId: string, amount: string) => {
    const numAmount = parseFloat(amount) || 0;
    setAdjustedPayments(prev => ({
      ...prev,
      [utangId]: numAmount
    }));
  };

  const getTotalAmount = (): number => {
    return utangs.reduce((total, utang) => {
      if (utang.type === 'loan') {
        return total + utang.amount;
      } else if (utang.type === 'credit_card') {
        const adjustedAmount = adjustedPayments[utang.id];
        return total + (adjustedAmount !== undefined ? adjustedAmount : utang.monthlyPayment || 0);
      }
      return total;
    }, 0);
  };

  const handleConfirmPayment = async () => {
    if (utangs.length === 0) return;

    // Validate credit card payments
    for (const utang of utangs) {
      if (utang.type === 'credit_card') {
        const adjustedAmount = adjustedPayments[utang.id];
        if (adjustedAmount !== undefined && (adjustedAmount <= 0 || adjustedAmount > utang.amount)) {
          Alert.alert('Invalid Payment', `Payment for ${utang.label} must be between ₱1 and ₱${utang.amount.toLocaleString()}`);
          return;
        }
      }
    }

    setLoading(true);
    try {
      const paymentDate = new Date().toISOString();

      // Create payment history records for each utang
      for (const utang of utangs) {
        const amountPaid = utang.type === 'loan' 
          ? utang.amount 
          : (adjustedPayments[utang.id] !== undefined ? adjustedPayments[utang.id] : utang.monthlyPayment || 0);

        const paymentRecord: PaymentHistory = {
          id: `payment_${Date.now()}_${utang.id}`,
          utangId: utang.id,
          utangLabel: utang.label,
          utangType: utang.type,
          amountPaid,
          paymentDate,
          notes: utang.type === 'credit_card' ? 'Credit card payment' : 'Loan payment',
          createdAt: paymentDate,
        };

        await StorageUtils.savePaymentHistory(paymentRecord);
      }

      // Mark utangs as paid
      await StorageUtils.markUtangsAsPaid(utangs.map(u => u.id));
      
      router.replace('/congratulations');
    } catch (error) {
      console.error('Error processing payment:', error);
      Alert.alert('Error', 'Failed to process payment');
    } finally {
      setLoading(false);
    }
  };

  const renderUtangItem = (utang: Utang) => {
    const isLoan = utang.type === 'loan';
    const displayAmount = isLoan 
      ? utang.amount 
      : (adjustedPayments[utang.id] !== undefined ? adjustedPayments[utang.id] : utang.monthlyPayment || 0);

    return (
      <View key={utang.id} style={styles.utangItem}>
        <View style={styles.utangHeader}>
          <Text style={styles.utangLabel}>{utang.label}</Text>
          <Text style={styles.utangType}>{isLoan ? 'Loan' : 'Credit Card'}</Text>
        </View>
        
        <View style={styles.paymentRow}>
          <Text style={styles.paymentLabel}>
            {isLoan ? 'Monthly Payment:' : 'Payment Amount:'}
          </Text>
          
          {isLoan ? (
            <Text style={styles.paymentAmount}>
              ₱{utang.amount.toLocaleString()}
            </Text>
          ) : (
            <View style={styles.adjustablePayment}>
              <Input
                value={adjustedPayments[utang.id]?.toString() || utang.monthlyPayment?.toString() || '0'}
                onChangeText={(value) => handlePaymentAdjustment(utang.id, value)}
                keyboardType="numeric"
                prefix="₱"
                width="half"
              />
            </View>
          )}
        </View>

        {!isLoan && (
          <Text style={styles.helperText}>
            Total balance: ₱{utang.amount.toLocaleString()}
          </Text>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Confirm Payment</Text>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Summary</Text>
          <Text style={styles.sectionSubtitle}>
            Review your payments before confirming
          </Text>
        </View>

        <View style={styles.utangsList}>
          {utangs.map(renderUtangItem)}
        </View>

        <View style={styles.totalSection}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Payment:</Text>
            <Text style={styles.totalAmount}>₱{getTotalAmount().toLocaleString()}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <Button
          title="Confirm Payment"
          onPress={handleConfirmPayment}
          loading={loading}
          disabled={utangs.length === 0 || getTotalAmount() <= 0}
          fullWidth
        />
        
        <Button
          title="Cancel"
          onPress={handleBack}
          variant="secondary"
          fullWidth
        />
      </View>
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
  content: {
    flex: 1,
    paddingHorizontal: Spacing.screenPadding,
  },
  section: {
    paddingVertical: Spacing.lg,
  },
  sectionTitle: {
    ...Typography.headerMedium,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  sectionSubtitle: {
    ...Typography.bodyMedium,
    color: Colors.textSecondary,
  },
  utangsList: {
    marginBottom: Spacing.lg,
  },
  utangItem: {
    backgroundColor: Colors.cardBackground,
    padding: Spacing.md,
    borderRadius: 12,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  utangHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  utangLabel: {
    ...Typography.bodyMedium,
    fontWeight: '600',
    color: Colors.textPrimary,
    flex: 1,
  },
  utangType: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: 6,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  paymentLabel: {
    ...Typography.bodyMedium,
    color: Colors.textSecondary,
  },
  paymentAmount: {
    ...Typography.bodyMedium,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  adjustablePayment: {
    flex: 1,
    maxWidth: 120,
  },
  helperText: {
    ...Typography.bodySmall,
    color: Colors.textTertiary,
    fontStyle: 'italic',
  },
  totalSection: {
    backgroundColor: Colors.primaryLight,
    padding: Spacing.md,
    borderRadius: 12,
    marginBottom: Spacing.lg,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    ...Typography.headerSmall,
    color: Colors.textPrimary,
  },
  totalAmount: {
    ...Typography.headerMedium,
    fontWeight: '700',
    color: Colors.primary,
  },
  buttonContainer: {
    padding: Spacing.screenPadding,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: Spacing.sm,
  },
});