import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Colors, Typography, Spacing } from '../src/constants';
import { Button } from '../src/components/Button';

export default function CongratulationsPage() {
  const handleGoToDashboard = () => {
    router.replace('/dashboard');
  };

  return (
    <View style={styles.container}>
      {/* Celebration Icon */}
      <View style={styles.iconContainer}>
        <Text style={styles.celebrationIcon}>🎉</Text>
      </View>

      {/* Title */}
      <Text style={styles.title}>Congratulations!</Text>

      {/* Subtitle */}
      <Text style={styles.subtitle}>Let's keep it going!</Text>

      {/* Action Button */}
      <View style={styles.buttonContainer}>
        <Button
          title="Go to Dashboard"
          onPress={handleGoToDashboard}
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
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.screenPadding,
  },
  iconContainer: {
    marginBottom: Spacing.xl,
  },
  celebrationIcon: {
    fontSize: 120,
    textAlign: 'center',
  },
  title: {
    ...Typography.displayMedium,
    color: Colors.primary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  subtitle: {
    ...Typography.bodyLarge,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.xxl,
  },
  buttonContainer: {
    width: '100%',
  },
}); 