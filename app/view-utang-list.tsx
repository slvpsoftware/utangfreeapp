import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Colors, Typography, Spacing } from '../src/constants';
import { StorageUtils, CalculationUtils } from '../src/utils';
import { Button } from '../src/components/Button';
import { UtangCard } from '../src/components/UtangCard';
import { Chip } from '../src/components/Chip';

export default function ViewUtangListPage() {
  const [utangs, setUtangs] = useState<any[]>([]);
  const [selectedUtangs, setSelectedUtangs] = useState<string[]>([]);
  const [paymentMode, setPaymentMode] = useState<'current_month' | 'other_months' | null>('current_month');

  useEffect(() => {
    loadUtangs();
  }, []);

  const loadUtangs = async () => {
    try {
      const allUtangs = await StorageUtils.getAllUtangs();
      setUtangs(allUtangs);
    } catch (error) {
      console.error('Error loading utangs:', error);
    }
  };

  const handleBack = () => {
    router.back();
  };

  const handleAddUtang = () => {
    router.push('/add-utang');
  };

  const handlePayCurrentMonth = () => {
    setPaymentMode(paymentMode === 'current_month' ? null : 'current_month');
    setSelectedUtangs([]);
  };

  const handlePayOtherMonths = () => {
    setPaymentMode(paymentMode === 'other_months' ? null : 'other_months');
    setSelectedUtangs([]);
  };

  const handleUtangSelect = (utangId: string) => {
    if (!paymentMode) return;

    setSelectedUtangs(prev => {
      if (prev.includes(utangId)) {
        return prev.filter(id => id !== utangId);
      } else {
        return [...prev, utangId];
      }
    });
  };

  const handleProceedToConfirmation = () => {
    if (selectedUtangs.length === 0) return;

    // Navigate to confirmation screen with selected utang IDs
    const utangIdsParam = selectedUtangs.join(',');
    router.push(`/confirm-payment?utangIds=${utangIdsParam}`);
  };

  const groupedUtangs = CalculationUtils.groupUtangsByMonth(utangs);
  
  // Get current month utangs (due from today until end of current month)
  const getCurrentMonthUtangs = () => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    // Get the first and last day of the current month
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
    
    return utangs.filter(utang => {
      if (utang.status !== 'pending') return false;
      
      // Parse the actual due date
      const dueDate = new Date(utang.dueDate);
      
      // Reset time to start of day for proper comparison
      dueDate.setHours(0, 0, 0, 0);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      firstDayOfMonth.setHours(0, 0, 0, 0);
      lastDayOfMonth.setHours(23, 59, 59, 999);
      
      // Include utangs due from today until the end of the current month only
      return dueDate >= today && 
             dueDate >= firstDayOfMonth && 
             dueDate <= lastDayOfMonth;
    });
  };

  const currentMonthUtangs = getCurrentMonthUtangs();

  const getButtonText = () => {
    if (!paymentMode) {
      return 'Select payment option above';
    }
    
    if (selectedUtangs.length === 0) {
      return paymentMode === 'current_month' ? 'Select utangs to pay this month' : 'Select utangs to pay';
    }
    
    return 'Proceed to Payment Confirmation';
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Utang List</Text>
      </View>

      {/* Payment Mode Selection */}
      <View style={styles.chipsContainer}>
        <Chip
          title="Pay This Month"
          active={paymentMode === 'current_month'}
          onPress={handlePayCurrentMonth}
        />
        <Chip
          title="Pay Other Months"
          active={paymentMode === 'other_months'}
          onPress={handlePayOtherMonths}
        />
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {paymentMode === 'current_month' ? (
          // Show only current month utangs
          currentMonthUtangs.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No payments due from today onwards</Text>
              <Text style={styles.emptySubtext}>All caught up for the rest of this month! 🎉</Text>
            </View>
          ) : (
            <View style={styles.monthGroup}>
              <Text style={styles.monthLabel}>Due This Month (From Today)</Text>
              {currentMonthUtangs.map(utang => (
                <UtangCard
                  key={utang.id}
                  utang={utang}
                  isSelected={selectedUtangs.includes(utang.id)}
                  onSelect={handleUtangSelect}
                  showCheckbox={paymentMode !== null}
                />
              ))}
            </View>
          )
        ) : paymentMode === 'other_months' ? (
          // Show all utangs grouped by month
          Object.keys(groupedUtangs).length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No utangs yet</Text>
              <Text style={styles.emptySubtext}>Add your first utang to get started</Text>
            </View>
          ) : (
            Object.entries(groupedUtangs).map(([monthYear, monthUtangs]) => (
              <View key={monthYear} style={styles.monthGroup}>
                <Text style={styles.monthLabel}>{monthYear}</Text>
                {monthUtangs.map(utang => (
                  <UtangCard
                    key={utang.id}
                    utang={utang}
                    isSelected={selectedUtangs.includes(utang.id)}
                    onSelect={handleUtangSelect}
                    showCheckbox={paymentMode !== null}
                  />
                ))}
              </View>
            ))
          )
        ) : (
          // No payment mode selected - show instruction
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Select Payment Option</Text>
            <Text style={styles.emptySubtext}>Choose "Pay This Month" for current dues or "Pay Other Months" to see all utangs</Text>
          </View>
        )}
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <Button
          title={getButtonText()}
          onPress={paymentMode && selectedUtangs.length > 0 ? handleProceedToConfirmation : () => {}}
          disabled={!paymentMode || selectedUtangs.length === 0}
          fullWidth
        />
        
        <Button
          title="Add New Utang"
          onPress={handleAddUtang}
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
  chipsContainer: {
    flexDirection: 'row',
    padding: Spacing.screenPadding,
    paddingBottom: Spacing.md,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.screenPadding,
  },
  monthGroup: {
    marginBottom: Spacing.lg,
  },
  monthLabel: {
    ...Typography.headerSmall,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
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
  },
  buttonContainer: {
    padding: Spacing.screenPadding,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: Spacing.sm,
  },
}); 