/**
 * ============================================================================
 * FILE: src/app/_layout.tsx
 * PURPOSE: Root Expo Router Layout for LG Nature's Water Mobile App.
 * ============================================================================
 */

import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      />
    </SafeAreaProvider>
  );
}
