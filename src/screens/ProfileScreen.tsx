import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView } from 'react-native';
import { NavigationProps, UserProfile } from '../types';
import { Colors, Typography, Spacing } from '../constants';
import { StorageUtils } from '../utils';
import { Button } from '../components/Button';
import { Input } from '../components/Input';

export const ProfileScreen: React.FC<NavigationProps> = ({ navigation }) => {
  const [name, setName] = useState('');
  const [income, setIncome] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);

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

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }

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
    navigation.goBack();
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
          width="full"
        />

        <Input
          label="Monthly Income (Optional)"
          placeholder="0.00"
          value={income}
          onChangeText={setIncome}
          helperText="Used to calculate debt-to-income ratio"
          keyboardType="numeric"
          prefix="₱"
          width="full"
        />
      </View>

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
};

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
  buttonContainer: {
    gap: Spacing.md,
  },
  loadingText: {
    ...Typography.bodyMedium,
    color: Colors.textSecondary,
  },
});