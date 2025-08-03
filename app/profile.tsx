import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { UserProfile } from '../src/types';
import { Colors, Typography, Spacing } from '../src/constants';
import { StorageUtils } from '../src/utils';
import { Button } from '../src/components/Button';
import { Input } from '../src/components/Input';

export default function ProfilePage() {
  const [name, setName] = useState('');
  const [income, setIncome] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const userProfile = await StorageUtils.getUserProfile();
      if (userProfile) {
        setProfile(userProfile);
        setName(userProfile.name);
        setIncome(userProfile.income?.toString() || '');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!name.trim()) {
      newErrors.name = 'Please enter your name';
    }

    if (income) {
      const incomeValue = parseFloat(income);
      if (isNaN(incomeValue) || incomeValue < 0) {
        newErrors.income = 'Income must be a valid positive number';
      } else if (incomeValue > 10000000) {
        newErrors.income = 'Income cannot exceed ₱10,000,000';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setSaving(true);
    try {
      const incomeValue = income ? parseFloat(income) : undefined;
      const now = new Date().toISOString();

      if (profile) {
        // Update existing profile
        await StorageUtils.updateUserProfile({
          name: name.trim(),
          income: incomeValue,
        });
      } else {
        // Create new profile
        const newProfile: UserProfile = {
          name: name.trim(),
          income: incomeValue,
          createdAt: now,
          updatedAt: now,
        };
        await StorageUtils.saveUserProfile(newProfile);
      }

      Alert.alert('Success', 'Profile saved successfully!');
      loadProfile(); // Reload to update state
    } catch (error) {
      Alert.alert('Error', 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.header}>Profile Settings</Text>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Personal Information</Text>
        
        <Input
          label="Your Name"
          placeholder="Enter your name"
          value={name}
          onChangeText={setName}
          helperText="This will be displayed throughout the app"
          error={errors.name}
          width="full"
        />

        <Input
          label="Monthly Income (Optional)"
          placeholder="0.00"
          value={income}
          onChangeText={setIncome}
          helperText="Used to calculate debt-to-income ratio and financial insights"
          error={errors.income}
          keyboardType="numeric"
          prefix="₱"
          width="full"
        />
      </View>

      {income && parseFloat(income) > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Income Information</Text>
          <Text style={styles.infoText}>
            Monthly Income: ₱{parseFloat(income).toLocaleString()}
          </Text>
          <Text style={styles.helperTextLarge}>
            💡 With your income set, you'll see your debt-to-income ratio on the dashboard. 
            Financial experts recommend keeping this below 35% for healthy finances.
          </Text>
        </View>
      )}

      {profile && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile Information</Text>
          <Text style={styles.infoText}>
            Created: {new Date(profile.createdAt).toLocaleDateString()}
          </Text>
          {profile.updatedAt !== profile.createdAt && (
            <Text style={styles.infoText}>
              Last updated: {new Date(profile.updatedAt).toLocaleDateString()}
            </Text>
          )}
        </View>
      )}

      <View style={styles.buttonContainer}>
        <Button
          title="Save Profile"
          onPress={handleSave}
          loading={saving}
          disabled={!name.trim()}
          fullWidth
        />
        
        <Button
          title="Back"
          onPress={handleBack}
          variant="secondary"
          fullWidth
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
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
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    ...Typography.headerMedium,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  infoText: {
    ...Typography.bodyMedium,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  helperTextLarge: {
    ...Typography.bodyMedium,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
    padding: Spacing.md,
    backgroundColor: Colors.primaryLight,
    borderRadius: 8,
    lineHeight: 20,
  },
  buttonContainer: {
    gap: Spacing.md,
  },
  loadingText: {
    ...Typography.bodyMedium,
    color: Colors.textSecondary,
  },
});