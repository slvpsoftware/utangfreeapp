import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button } from '../src/components/Button';
import { Chip } from '../src/components/Chip';
import { Input } from '../src/components/Input';
import { DatePicker } from '../src/components/DatePicker';
import { Colors, Spacing, Typography } from '../src/constants';
import { CalculationUtils, DateUtils, StorageUtils } from '../src/utils';

export default function AddUtangPage() {
  const [utangType, setUtangType] = useState<'loan' | 'credit_card' | null>(null);
  const [utangLabel, setUtangLabel] = useState('');
  const [dueDay, setDueDay] = useState(''); // Still used for UI input, converted to dates during creation
  const [finalPaymentDate, setFinalPaymentDate] = useState('');
  const [monthsToPayOff, setMonthsToPayOff] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [amount, setAmount] = useState('');
  const [monthlyPayment, setMonthlyPayment] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const isFirstTime = true; // For now, always show first-time message


  const handleBack = () => {
    router.back();
  };

  // Calculate final payment date from months
  const calculateFinalDateFromMonths = (months: number): string => {
    const finalDate = new Date();
    finalDate.setMonth(finalDate.getMonth() + months);
    return finalDate.toISOString().split('T')[0];
  };

  // Handle months input and update final payment date
  const handleMonthsChange = (months: string) => {
    setMonthsToPayOff(months);
    const monthsNum = parseInt(months);
    if (!isNaN(monthsNum) && monthsNum > 0) {
      const calculatedDate = calculateFinalDateFromMonths(monthsNum);
      setFinalPaymentDate(calculatedDate);
    }
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!utangType) {
      newErrors.type = 'Please select utang type';
    }

    if (!utangLabel.trim()) {
      newErrors.label = 'Please enter utang label';
    }

    const dueDayNum = parseInt(dueDay);
    if (!DateUtils.isValidDueDay(dueDayNum)) {
      newErrors.dueDay = 'Due day must be between 1-31';
    }

    if (utangType === 'loan') {
      if (!finalPaymentDate && !monthsToPayOff) {
        newErrors.finalDate = 'Please set final payment date or number of months';
      } else if (finalPaymentDate && !DateUtils.isValidFinalDate(finalPaymentDate)) {
        newErrors.finalDate = 'Final payment date must be in the future';
      } else if (monthsToPayOff) {
        const months = parseInt(monthsToPayOff);
        if (isNaN(months) || months <= 0 || months > 600) {
          newErrors.months = 'Months must be between 1-600';
        }
      }
    }

    if (utangType === 'credit_card') {
      const interestRateNum = parseFloat(interestRate);
      if (isNaN(interestRateNum) || interestRateNum < 0 || interestRateNum > 100) {
        newErrors.interestRate = 'Interest rate must be between 0-100%';
      }
      
      const monthlyPaymentNum = parseFloat(monthlyPayment);
      if (isNaN(monthlyPaymentNum) || monthlyPaymentNum <= 0) {
        newErrors.monthlyPayment = 'Monthly payment must be greater than 0';
      }
    }

    const amountNum = parseFloat(amount);
    // If utangType is loan use isValidAmortization, otherwise use isValidAmount
    if (utangType === 'loan' && !CalculationUtils.isValidAmortization(amountNum)) {
      newErrors.amount = 'Monthly amortization must be between ₱1 - ₱50,000';
    } else if (!CalculationUtils.isValidAmount(amountNum)) {
      newErrors.amount = 'Total amount must be between ₱1 - ₱500,000';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateEstimatedFinalDate = (totalAmount: number, monthlyPay: number, interestRatePercent: number): string => {
    const monthlyInterestRate = interestRatePercent / 100 / 12;
    const principal = totalAmount;
    let remainingBalance = principal;
    let months = 0;
    
    while (remainingBalance > 0 && months < 600) { // Max 50 years
      const interestPayment = remainingBalance * monthlyInterestRate;
      const principalPayment = Math.max(0, monthlyPay - interestPayment);
      
      if (principalPayment <= 0) {
        return 'Payment too low to cover interest';
      }
      
      remainingBalance -= principalPayment;
      months++;
    }
    
    const finalDate = new Date();
    finalDate.setMonth(finalDate.getMonth() + months);
    return finalDate.toISOString().split('T')[0];
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);

    try {
      if (utangType === 'loan') {
        // For loans: create multiple utang records for each month with specific due dates
        const startDate = new Date();
        const endDate = new Date(finalPaymentDate!);
        const utangsToCreate = [];
        
        // Start from current month, set to the specified due day
        let currentDate = new Date(startDate.getFullYear(), startDate.getMonth(), parseInt(dueDay));
        
        // If the due day for this month has already passed, start from next month
        if (currentDate < startDate) {
          currentDate.setMonth(currentDate.getMonth() + 1);
        }
        
        let monthCounter = 1;
        while (currentDate <= endDate) {
          const utangId = `${Date.now()}_${monthCounter}`;
          const newUtang = {
            id: utangId,
            type: 'loan' as const,
            label: `${utangLabel.trim()} - Month ${monthCounter}`,
            amount: parseFloat(amount),
            dueDate: currentDate.toISOString().split('T')[0], // YYYY-MM-DD format
            finalPaymentDate: finalPaymentDate!,
            status: 'pending' as const,
            createdAt: new Date().toISOString(),
          };
          
          utangsToCreate.push(newUtang);
          
          // Move to next month, same day
          currentDate.setMonth(currentDate.getMonth() + 1);
          monthCounter++;
        }
        
        // Save all loan utangs
        for (const utang of utangsToCreate) {
          await StorageUtils.saveUtang(utang);
        }
      } else {
        // For credit cards: create single utang with next due date
        const estimatedFinalDate = calculateEstimatedFinalDate(
          parseFloat(amount),
          parseFloat(monthlyPayment),
          parseFloat(interestRate)
        );
        
        // Calculate next due date for credit card
        const currentDate = new Date();
        const nextDueDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), parseInt(dueDay));
        
        // If the due day for this month has already passed, set for next month
        if (nextDueDate < currentDate) {
          nextDueDate.setMonth(nextDueDate.getMonth() + 1);
        }
        
        const newUtang = {
          id: Date.now().toString(),
          type: 'credit_card' as const,
          label: utangLabel.trim(),
          amount: parseFloat(amount),
          dueDate: nextDueDate.toISOString().split('T')[0], // YYYY-MM-DD format
          finalPaymentDate: estimatedFinalDate,
          interestRate: parseFloat(interestRate) / 100,
          monthlyPayment: parseFloat(monthlyPayment),
          status: 'pending' as const,
          createdAt: new Date().toISOString(),
        };

        await StorageUtils.saveUtang(newUtang);
      }
      
      // Navigate to dashboard
      router.replace('/dashboard');
    } catch (error) {
      Alert.alert('Error', 'Failed to save utang');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <Text style={styles.header}>
        
        {isFirstTime 
          ? "Let's add an UTANG that you plan to pay off"
          : "Another UTANG that you plan to pay off"
        }
      </Text>

      {/* Utang Type Selection */}
      <View style={styles.typeSelection}>
        <Text style={styles.sectionLabel}>Select Utang Type</Text>
        <View style={styles.chipContainer}>
          <Chip
            title="Loan"
            active={utangType === 'loan'}
            onPress={() => setUtangType('loan')}
          />
          <Chip
            title="Credit Card"
            active={utangType === 'credit_card'}
            onPress={() => setUtangType('credit_card')}
          />
        </View>
        {errors.type && <Text style={styles.errorText}>{errors.type}</Text>}
      </View>

      {/* Form - Only show if type is selected */}
      {utangType && (
        <>
          <Input
            label="Utang Label"
            placeholder="Enter utang label"
            value={utangLabel}
            onChangeText={setUtangLabel}
            helperText="e.g., Credit Card, Gadget Loan, Salary Advance"
            error={errors.label}
            width="full"
          />

          <View style={styles.row}>
          <Input
            label="Due Date"
            placeholder="1-31"
            value={dueDay}
            onChangeText={setDueDay}
            helperText="Day of month your payment is due"
            error={errors.dueDay}
            keyboardType="numeric"
            width="half"
          />

          {utangType === 'loan' && (
            <DatePicker
              label="Final Payment Date"
              value={finalPaymentDate}
              onChange={setFinalPaymentDate}
              helperText="When you plan to finish paying this utang"
              error={errors.finalDate}
              width="half"
            />
          )}

          {utangType === 'credit_card' && (
            <Input
              label="Interest Rate"
              placeholder="0.00"
              value={interestRate}
              onChangeText={setInterestRate}
              helperText="Annual interest rate"
              error={errors.interestRate}
              keyboardType="numeric"
              suffix="%"
              width="half"
            />
          )}
        </View>

        {utangType === 'loan' && (
          <View style={styles.orSection}>
            <Text style={styles.orText}>or</Text>
            <Input
              label="How many months to pay?"
              placeholder="12"
              value={monthsToPayOff}
              onChangeText={handleMonthsChange}
              helperText="Number of months to pay off this loan"
              error={errors.months}
              keyboardType="numeric"
              width="full"
            />
          </View>
        )}

        {utangType === 'credit_card' && (
          <Input
            label="Monthly Payment"
            placeholder="0.00"
            value={monthlyPayment}
            onChangeText={setMonthlyPayment}
            helperText="How much you plan to pay monthly"
            error={errors.monthlyPayment}
            keyboardType="numeric"
            prefix="₱"
            width="full"
          />
        )}


        <Input
          label={utangType === 'loan' ? 'Monthly Amortization' : 'Total Amount Due'}
          placeholder="0.00"
          value={amount}
          onChangeText={setAmount}
          helperText={utangType === 'loan' ? 'Monthly payment amount (₱1 - ₱50,000)' : 'Total outstanding balance (₱1 - ₱50,000)'}
          error={errors.amount}
          keyboardType="numeric"
          prefix="₱"
          width="full"
        />

        {/* Submit Button */}
        <Button
          title="Proceed"
          onPress={handleSubmit}
          loading={loading}
          disabled={!utangType || !utangLabel.trim() || !dueDay || !amount || 
            (utangType === 'loan' && !finalPaymentDate && !monthsToPayOff) ||
            (utangType === 'credit_card' && (!interestRate || !monthlyPayment))}
          fullWidth
        />
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: Spacing.screenPadding,
    paddingTop: Spacing.xl,
  },
  header: {
    ...Typography.headerLarge,
    textAlign: 'center',
    marginBottom: Spacing.xl,
    color: Colors.textPrimary,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  typeSelection: {
    marginBottom: Spacing.lg,
  },
  sectionLabel: {
    ...Typography.bodyMedium,
    marginBottom: Spacing.sm,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  chipContainer: {
    flexDirection: 'row',
    marginBottom: Spacing.xs,
  },
  errorText: {
    ...Typography.bodySmall,
    color: Colors.danger,
    marginTop: Spacing.xs,
  },
  orSection: {
    alignItems: 'center',
    marginVertical: Spacing.md,
  },
  orText: {
    ...Typography.bodyMedium,
    color: Colors.textSecondary,
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.sm,
    marginBottom: Spacing.sm,
  },
}); 