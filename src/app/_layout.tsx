import React, { useEffect } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { Slot, useRouter, useSegments } from 'expo-router';
import { AuthProvider, useAuth } from '../context/auth';
import { NetworkProvider, useNetwork } from '../context/network';
import { requestNotificationPermissions, scheduleInactivityReminder } from '../services/notifications';
import '../global.css';


// Sub-component to manage reactive auth navigation redirection
function InitialLayout() {
  const { isAuthenticated, isLoading } = useAuth();
  const { isOffline } = useNetwork();
  const segments = useSegments();
  const router = useRouter();

  // Request notification permissions and schedule inactive reminder on launch
  useEffect(() => {
    async function initNotifications() {
      try {
        await requestNotificationPermissions();
        await scheduleInactivityReminder();
      } catch (err) {
        console.warn('Failed to register notifications on startup:', err);
      }
    }
    initNotifications();
  }, []);

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!isAuthenticated && !inAuthGroup) {
      // Redirect to login if not authenticated and trying to access main app
      router.replace('/login');
    } else if (isAuthenticated && inAuthGroup) {
      // Redirect to main tabs if authenticated and in auth screen
      router.replace('/');
    }
  }, [isAuthenticated, isLoading, segments]);

  if (isLoading) {
    return (
      <View className="flex-1 bg-slate-900 justify-center items-center">
        <ActivityIndicator size="large" color="#10b981" />
        <Text className="text-slate-400 mt-4 text-sm font-medium">Initializing Mini LMS...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-slate-900" style={{ backgroundColor: '#020617' }}>
      {/* Floating Offline Banner */}
      {isOffline && (
        <View className="bg-red-500 py-2 px-4 flex-row justify-center items-center absolute top-12 left-0 right-0 z-50 rounded-b-lg shadow-lg">
          <Text className="text-white font-semibold text-center text-xs tracking-wider">
            📶 Offline Mode: Displaying Cached Content
          </Text>
        </View>
      )}
      <Slot />
    </View>
  );
}

export default function RootLayout() {
  return (
    <NetworkProvider>
      <AuthProvider>
        <InitialLayout />
      </AuthProvider>
    </NetworkProvider>
  );
}
