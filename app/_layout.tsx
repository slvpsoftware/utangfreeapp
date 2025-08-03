import React from 'react';
import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import 'react-native-get-random-values'; // Ensure crypto polyfill is loaded early

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <>
      <StatusBar style="auto" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#F9FAFB' },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="add-utang" />
        <Stack.Screen name="dashboard" />
        <Stack.Screen name="view-utang-list" />
        <Stack.Screen name="congratulations" />
      </Stack>
    </>
  );
}
