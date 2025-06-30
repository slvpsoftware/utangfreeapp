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
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [loading, setLoading] = useState(false);

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

  const handleSelectUtang = () => {
    setIsSelectionMode(!isSelectionMode);
    if (!isSelectionMode) {
      setSelectedUtangs([]);
    }
  };

  const handleUtangSelect = (utangId: string) => {
    if (!isSelectionMode) return;

    setSelectedUtangs(prev => {
      if (prev.includes(utangId)) {
        return prev.filter(id => id !== utangId);
      } else {
        return [...prev, utangId];
      }
    });
  };

  const handleMarkAsPaid = async () => {
    if (selectedUtangs.length === 0) return;

    setLoading(true);
    try {
      await StorageUtils.markUtangsAsPaid(selectedUtangs);
      setSelectedUtangs([]);
      setIsSelectionMode(false);
      await loadUtangs();
      router.push('/congratulations');
    } catch (error) {
      console.error('Error marking utangs as paid:', error);
    } finally {
      setLoading(false);
    }
  };

  const groupedUtangs = CalculationUtils.groupUtangsByMonth(utangs);

  const getButtonText = () => {
    if (!isSelectionMode) return 'Select Utang to Proceed';
    return selectedUtangs.length > 0 ? 'Mark as Paid' : 'Select Utang to Proceed';
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

      {/* Chips */}
      <View style={styles.chipsContainer}>
        <Chip
          title="Add Utang"
          active={false}
          onPress={handleAddUtang}
        />
        <Chip
          title="Select Utang"
          active={isSelectionMode}
          onPress={handleSelectUtang}
        />
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {Object.keys(groupedUtangs).length === 0 ? (
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
                  showCheckbox={isSelectionMode}
                />
              ))}
            </View>
          ))
        )}
      </ScrollView>

      {/* Action Button */}
      <View style={styles.buttonContainer}>
        <Button
          title={getButtonText()}
          onPress={isSelectionMode ? handleMarkAsPaid : () => {}}
          disabled={!isSelectionMode || selectedUtangs.length === 0}
          loading={loading}
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
  },
}); 