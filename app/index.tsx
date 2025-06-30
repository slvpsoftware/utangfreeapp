import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { Colors, Typography, Spacing } from '../src/constants';
import { StorageUtils } from '../src/utils';

export default function Index() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkFirstTimeUser();
  }, []);

  const checkFirstTimeUser = async () => {
    try {
      const isFirstTime = await StorageUtils.isFirstTimeUser();
      
      // Navigate based on first-time status
      if (isFirstTime) {
        router.replace('/add-utang');
      } else {
        router.replace('/dashboard');
      }
    } catch (error) {
      console.error('Error checking first time user:', error);
      // Default to add utang screen on error
      router.replace('/add-utang');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Utang Free</Text>
        <ActivityIndicator size="large" color={Colors.primary} style={styles.loader} />
        <Text style={styles.subtitle}>Loading...</Text>
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    ...Typography.displayLarge,
    color: Colors.primary,
    marginBottom: Spacing.xl,
  },
  subtitle: {
    ...Typography.bodyLarge,
    color: Colors.textSecondary,
    marginTop: Spacing.lg,
  },
  loader: {
    marginVertical: Spacing.lg,
  },
}); 