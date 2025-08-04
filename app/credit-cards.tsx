import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { Colors, Typography, Spacing } from '../src/constants';
import { StorageUtils, DateUtils } from '../src/utils';
import { Button } from '../src/components/Button';
import { UtangCard } from '../src/components/UtangCard';
import { Utang } from '../src/types';

export default function CreditCardsPage() {
  const [creditCards, setCreditCards] = useState<Utang[]>([]);
  const [selectedCards, setSelectedCards] = useState<string[]>([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCreditCards();
  }, []);

  const loadCreditCards = async () => {
    try {
      const allUtangs = await StorageUtils.getAllUtangs();
      const creditCardUtangs = allUtangs.filter(utang => utang.type === 'credit_card');
      setCreditCards(creditCardUtangs);
    } catch (error) {
      console.error('Error loading credit cards:', error);
    }
  };

  const handleBack = () => {
    router.back();
  };

  const handleAddCreditCard = () => {
    router.push('/add-utang');
  };

  const handleEditMode = () => {
    setIsEditMode(!isEditMode);
    if (!isEditMode) {
      setSelectedCards([]);
    }
  };

  const handleCardSelect = (cardId: string) => {
    if (!isEditMode) return;

    setSelectedCards(prev => {
      if (prev.includes(cardId)) {
        return prev.filter(id => id !== cardId);
      } else {
        return [...prev, cardId];
      }
    });
  };

  const handleDeleteSelected = async () => {
    if (selectedCards.length === 0) return;

    Alert.alert(
      'Delete Credit Cards',
      `Are you sure you want to delete ${selectedCards.length} credit card${selectedCards.length > 1 ? 's' : ''}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await StorageUtils.deleteUtangs(selectedCards);
              await loadCreditCards(); // Reload data from storage
              setSelectedCards([]);
              setIsEditMode(false);
              
              Alert.alert('Success', 'Credit cards deleted successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete credit cards');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const getTotalBalance = (): number => {
    return creditCards
      .filter(card => card.status === 'pending')
      .reduce((total, card) => total + card.amount, 0);
  };

  const getTotalMonthlyPayments = (): number => {
    return creditCards
      .filter(card => card.status === 'pending')
      .reduce((total, card) => total + (card.monthlyPayment || 0), 0);
  };

  const getCardStatus = (card: Utang): 'current' | 'overdue' | 'paid' => {
    if (card.status === 'paid') return 'paid';
    
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    const dueDate = new Date(card.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    
    return dueDate < currentDate ? 'overdue' : 'current';
  };

  const renderCreditCardItem = (card: Utang) => {
    const status = getCardStatus(card);
    const statusColor = status === 'paid' ? Colors.success : 
                       status === 'overdue' ? Colors.danger : Colors.textPrimary;

    return (
      <View key={card.id} style={styles.cardItem}>
        <View style={styles.cardHeader}>
          <View style={styles.cardInfo}>
            <Text style={styles.cardLabel}>{card.label}</Text>
            <Text style={[styles.cardStatus, { color: statusColor }]}>
              {status === 'paid' ? 'Paid' : status === 'overdue' ? 'Payment Due' : 'Current'}
            </Text>
          </View>
          {isEditMode && (
            <TouchableOpacity
              style={[styles.checkbox, selectedCards.includes(card.id) && styles.checkboxSelected]}
              onPress={() => handleCardSelect(card.id)}
            >
              {selectedCards.includes(card.id) && <Text style={styles.checkmark}>✓</Text>}
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.cardDetails}>
          <View style={styles.cardRow}>
            <Text style={styles.cardDetailLabel}>Total Balance:</Text>
            <Text style={styles.cardDetailValue}>₱{card.amount.toLocaleString()}</Text>
          </View>
          
          <View style={styles.cardRow}>
            <Text style={styles.cardDetailLabel}>Monthly Payment:</Text>
            <Text style={styles.cardDetailValue}>₱{(card.monthlyPayment || 0).toLocaleString()}</Text>
          </View>
          
          <View style={styles.cardRow}>
            <Text style={styles.cardDetailLabel}>Interest Rate:</Text>
            <Text style={styles.cardDetailValue}>{((card.interestRate || 0) * 100).toFixed(1)}%</Text>
          </View>
          
          <View style={styles.cardRow}>
            <Text style={styles.cardDetailLabel}>Due Date:</Text>
            <Text style={styles.cardDetailValue}>{new Date(card.dueDate).toLocaleDateString()}</Text>
          </View>
        </View>
      </View>
    );
  };

  const getOrdinalSuffix = (day: number): string => {
    if (day >= 11 && day <= 13) return 'th';
    switch (day % 10) {
      case 1: return 'st';
      case 2: return 'nd'; 
      case 3: return 'rd';
      default: return 'th';
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Credit Cards</Text>
        <TouchableOpacity onPress={handleEditMode} style={styles.editButton}>
          <Text style={styles.editText}>{isEditMode ? 'Done' : 'Edit'}</Text>
        </TouchableOpacity>
      </View>

      {/* Summary */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Total Balance</Text>
              <Text style={styles.summaryAmount}>₱{getTotalBalance().toLocaleString()}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Monthly Payments</Text>
              <Text style={styles.summaryAmount}>₱{getTotalMonthlyPayments().toLocaleString()}</Text>
            </View>
          </View>
          <Text style={styles.summaryCount}>
            {creditCards.length} credit card{creditCards.length !== 1 ? 's' : ''}
          </Text>
        </View>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {creditCards.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No credit cards yet</Text>
            <Text style={styles.emptySubtext}>Add your first credit card to start tracking payments</Text>
          </View>
        ) : (
          creditCards.map(renderCreditCardItem)
        )}
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        {isEditMode && selectedCards.length > 0 ? (
          <Button
            title={`Delete ${selectedCards.length} Selected`}
            onPress={handleDeleteSelected}
            loading={loading}
            fullWidth
          />
        ) : (
          <Button
            title="Add New Credit Card"
            onPress={handleAddCreditCard}
            fullWidth
          />
        )}
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
    justifyContent: 'space-between',
    padding: Spacing.screenPadding,
    paddingTop: Spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    width: 40,
  },
  backArrow: {
    fontSize: 24,
    color: Colors.textPrimary,
  },
  headerTitle: {
    ...Typography.headerMedium,
    color: Colors.textPrimary,
    flex: 1,
    textAlign: 'center',
  },
  editButton: {
    width: 40,
    alignItems: 'flex-end',
  },
  editText: {
    ...Typography.bodyMedium,
    color: Colors.primary,
    fontWeight: '600',
  },
  summaryContainer: {
    padding: Spacing.screenPadding,
  },
  summaryCard: {
    backgroundColor: Colors.cardBackground,
    padding: Spacing.lg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  summaryItem: {
    flex: 1,
  },
  summaryLabel: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  summaryAmount: {
    ...Typography.headerSmall,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  summaryCount: {
    ...Typography.bodySmall,
    color: Colors.textTertiary,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.screenPadding,
  },
  cardItem: {
    backgroundColor: Colors.cardBackground,
    padding: Spacing.md,
    borderRadius: 12,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  cardInfo: {
    flex: 1,
  },
  cardLabel: {
    ...Typography.bodyMedium,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  cardStatus: {
    ...Typography.bodySmall,
    fontWeight: '500',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
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
    fontSize: 14,
    fontWeight: '600',
  },
  cardDetails: {
    gap: Spacing.sm,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardDetailLabel: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  cardDetailValue: {
    ...Typography.bodySmall,
    fontWeight: '600',
    color: Colors.textPrimary,
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