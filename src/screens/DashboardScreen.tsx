import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { NavigationProps } from '../types';
import { Colors, Typography, Spacing } from '../constants';
import { StorageUtils, CalculationUtils, DateUtils } from '../utils';
import { Button } from '../components/Button';
import { KPICard } from '../components/KPICard';

export const DashboardScreen: React.FC<NavigationProps> = ({ navigation }) => {
  const [utangs, setUtangs] = useState<any[]>([]);
  const [kpis, setKpis] = useState({
    totalUtang: 0,
    utangImprovement: 0,
    projectedFreeDate: 'Calculating...',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const allUtangs = await StorageUtils.getAllUtangs();
      setUtangs(allUtangs);
      
      const kpiData = CalculationUtils.calculateKPIs(allUtangs);
      setKpis({
        totalUtang: kpiData.totalUtang,
        utangImprovement: kpiData.utangImprovement,
        projectedFreeDate: kpiData.projectedFreeDate,
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const handleViewUtangList = () => {
    navigation.navigate('ViewUtangList');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <Text style={styles.header}>Dashboard</Text>

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

      {/* Action Button */}
      <View style={styles.buttonContainer}>
        <Button
          title="View Utang List"
          onPress={handleViewUtangList}
          fullWidth
        />
        <Text style={styles.helperText}>More features coming soon</Text>
      </View>
    </ScrollView>
  );
};

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
  },
  helperText: {
    ...Typography.bodySmall,
    color: Colors.textTertiary,
    marginTop: Spacing.sm,
    textAlign: 'center',
  },
}); 