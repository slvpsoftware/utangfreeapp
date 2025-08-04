import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Colors, Typography, Spacing } from '../src/constants';
import { StorageUtils, CalculationUtils, DateUtils } from '../src/utils';
import { Button } from '../src/components/Button';
import { KPICard } from '../src/components/KPICard';
import { UserProfile } from '../src/types';

export default function DashboardPage() {
  const [utangs, setUtangs] = useState<any[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [kpis, setKpis] = useState({
    totalUtang: 0,
    utangImprovement: 0,
    projectedFreeDate: 'Calculating...',
    debtToIncomeRatio: undefined as number | undefined,
  });
  const [encryptionStatus, setEncryptionStatus] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  // Reload data when screen comes into focus (e.g., returning from profile page)
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    try {
      const allUtangs = await StorageUtils.getAllUtangs();
      setUtangs(allUtangs);
      
      const profile = await StorageUtils.getUserProfile();
      setUserProfile(profile);
      
      const kpiData = CalculationUtils.calculateKPIs(allUtangs, profile);
      setKpis({
        totalUtang: kpiData.totalUtang,
        utangImprovement: kpiData.utangImprovement,
        projectedFreeDate: kpiData.projectedFreeDate,
        debtToIncomeRatio: kpiData.debtToIncomeRatio,
      });

      // Load encryption status
      const encStatus = await StorageUtils.getEncryptionInfo();
      setEncryptionStatus(encStatus);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const handleViewUtangList = () => {
    router.push('/view-utang-list');
  };

  const handleProfilePress = () => {
    router.push('/profile');
  };

  const handlePaymentHistoryPress = () => {
    router.push('/payment-history');
  };

  const handleCreditCardsPress = () => {
    router.push('/credit-cards');
  };


  // Helper function to determine debt-to-income ratio color
  const getDebtToIncomeColor = (ratio: number): string => {
    if (ratio <= 20) return Colors.success;      // Excellent (0-20%)
    if (ratio <= 35) return Colors.warning;     // Good (21-35%)
    if (ratio <= 50) return Colors.danger;      // Concerning (36-50%)
    return Colors.danger;                       // Critical (50%+)
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <Text style={styles.header}>
        {userProfile ? `Hello, ${userProfile.name}!` : 'Dashboard'}
      </Text>

      {/* KPI Cards */}
      <KPICard
        label="Total Utang"
        value={`${DateUtils.formatCurrency(kpis.totalUtang)}`}
      />

      <KPICard
        label="Utang Improvement"
        value={`${kpis.utangImprovement}%`}
        helperText="vs. last 7 days"
        color={kpis.utangImprovement > 0 ? Colors.success : Colors.textPrimary}
      />

      <KPICard
        label="Utang Free by Approx."
        value={kpis.projectedFreeDate}
        color={kpis.projectedFreeDate === 'Debt Free!' ? Colors.success : Colors.textPrimary}
      />

      {kpis.debtToIncomeRatio !== undefined ? (
        <KPICard
          label="Debt-to-Income Ratio"
          value={`${kpis.debtToIncomeRatio}%`}
          helperText={`This month: ${CalculationUtils.getDebtToIncomeRecommendation(kpis.debtToIncomeRatio)}`}
          color={getDebtToIncomeColor(kpis.debtToIncomeRatio)}
        />
      ) : userProfile && !userProfile.income && (
        <View style={styles.incomePrompt}>
          <Text style={styles.incomePromptTitle}>💡 Set Your Income</Text>
          <Text style={styles.incomePromptText}>
            Add your monthly income to see your debt-to-income ratio and get personalized financial insights.
          </Text>
        </View>
      )}

      {/* Encryption Status */}
      {encryptionStatus && (
        <View style={styles.encryptionStatus}>
          <Text style={styles.encryptionTitle}>🔒 Security Status</Text>
          <Text style={styles.encryptionText}>
            {encryptionStatus.hardwareSecurityLevel}
          </Text>
          <Text style={styles.encryptionText}>
            Active Keys: {encryptionStatus.keyTypes?.length || 0}
          </Text>
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <Button
          title="View Utang List"
          onPress={handleViewUtangList}
          fullWidth
        />
        
        <Button
          title="View Payment History"
          onPress={handlePaymentHistoryPress}
          variant="secondary"
          fullWidth
        />
        
        <Button
          title="Manage Credit Cards"
          onPress={handleCreditCardsPress}
          variant="secondary"
          fullWidth
        />
        
        <Button
          title={userProfile ? "Edit Profile" : "Set Up Profile"}
          onPress={handleProfilePress}
          variant="secondary"
          fullWidth
        />
        
        <Text style={styles.helperText}>Credit management & analytics</Text>
      </View>
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
  buttonContainer: {
    marginTop: Spacing.xl,
    alignItems: 'center',
    gap: Spacing.md,
  },
  helperText: {
    ...Typography.bodySmall,
    color: Colors.textTertiary,
    marginTop: Spacing.sm,
    textAlign: 'center',
  },
  incomePrompt: {
    backgroundColor: Colors.primaryLight,
    padding: Spacing.md,
    borderRadius: 12,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  incomePromptTitle: {
    ...Typography.bodyMedium,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  incomePromptText: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  encryptionStatus: {
    backgroundColor: Colors.success + '20',
    padding: Spacing.md,
    borderRadius: 12,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.success + '40',
  },
  encryptionTitle: {
    ...Typography.bodyMedium,
    fontWeight: '600',
    color: Colors.success,
    marginBottom: Spacing.xs,
  },
  encryptionText: {
    ...Typography.bodySmall,
    color: Colors.success,
    lineHeight: 16,
  },
}); 