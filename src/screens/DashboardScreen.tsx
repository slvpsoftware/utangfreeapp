import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { NavigationProps, UserProfile } from '../types';
import { Colors, Typography, Spacing } from '../constants';
import { StorageUtils, CalculationUtils, DateUtils } from '../utils';
import { Button } from '../components/Button';
import { KPICard } from '../components/KPICard';

export const DashboardScreen: React.FC<NavigationProps> = ({ navigation }) => {
  const [utangs, setUtangs] = useState<any[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
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
      
      const profile = await StorageUtils.getUserProfile();
      setUserProfile(profile);
      
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

  const handleProfilePress = () => {
    navigation.navigate('Profile');
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

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <Button
          title="View Utang List"
          onPress={handleViewUtangList}
          fullWidth
        />
        
        <Button
          title={userProfile ? "Edit Profile" : "Set Up Profile"}
          onPress={handleProfilePress}
          variant="secondary"
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
    gap: Spacing.md,
  },
  helperText: {
    ...Typography.bodySmall,
    color: Colors.textTertiary,
    marginTop: Spacing.sm,
    textAlign: 'center',
  },
}); 