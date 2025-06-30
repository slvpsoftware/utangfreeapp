import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { Colors, Typography, Spacing } from '../src/constants';
import { StorageUtils, DateUtils, CalculationUtils } from '../src/utils';
import { Button } from '../src/components/Button';
import { Input } from '../src/components/Input';

export default function AddUtangPage() {
  const [utangLabel, setUtangLabel] = useState('');
  const [dueDay, setDueDay] = useState('');
  const [finalPaymentDate, setFinalPaymentDate] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const isFirstTime = true; // For now, always show first-time message

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!utangLabel.trim()) {
      newErrors.label = 'Please enter utang label';
    }

    const dueDayNum = parseInt(dueDay);
    if (!DateUtils.isValidDueDay(dueDayNum)) {
      newErrors.dueDay = 'Due day must be between 1-31';
    }

    if (!DateUtils.isValidFinalDate(finalPaymentDate)) {
      newErrors.finalDate = 'Final payment date must be in the future';
    }

    const amountNum = parseFloat(amount);
    if (!CalculationUtils.isValidAmount(amountNum)) {
      newErrors.amount = 'Amount must be between ₱1 - ₱50,000';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);

    try {
      // Create new utang
      const newUtang = {
        id: Date.now().toString(),
        label: utangLabel.trim(),
        amount: parseFloat(amount),
        dueDay: parseInt(dueDay),
        finalPaymentDate,
        status: 'pending' as const,
        createdAt: new Date().toISOString(),
      };

      await StorageUtils.saveUtang(newUtang);
      
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

      {/* Form */}
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

        <Input
          label="Final Payment Date"
          placeholder="Select date"
          value={finalPaymentDate}
          onChangeText={setFinalPaymentDate}
          helperText="When you plan to finish paying this utang"
          error={errors.finalDate}
          width="half"
        />
      </View>

      <Input
        label="Amount"
        placeholder="0.00"
        value={amount}
        onChangeText={setAmount}
        helperText="₱1 - ₱50,000"
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
        disabled={!utangLabel.trim() || !dueDay || !finalPaymentDate || !amount}
        fullWidth
      />
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
}); 