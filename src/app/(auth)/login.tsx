import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useRouter, Link } from 'expo-router';
import { useAuth } from '../../context/auth';

export default function LoginScreen() {
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDemoRegistering, setIsDemoRegistering] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { login, register } = useAuth();
  const router = useRouter();

  const handleLogin = async () => {
    if (!usernameOrEmail.trim() || !password.trim()) {
      setError('Please fill in all fields');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      await login(usernameOrEmail.trim(), password);
      router.replace('/');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Automated Quick Demo Access handler
  const handleQuickDemoAccess = async () => {
    setError(null);
    setIsDemoRegistering(true);

    try {
      // Create a unique random credentials since FreeAPI DB wipes out periodically
      const randNum = Math.floor(1000 + Math.random() * 9000);
      const demoUsername = `demo_user_${randNum}`;
      const demoEmail = `demo_${randNum}@lms.com`;
      const demoPassword = 'Password123!';

      // Register the demo user
      await register(demoUsername, demoEmail, demoPassword);
      
      // Immediately log them in
      await login(demoUsername, demoPassword);
      router.replace('/');
    } catch (err: any) {
      setError(err.message || 'Demo registration failed. Please try again manually.');
    } finally {
      setIsDemoRegistering(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-slate-950"
      style={{ backgroundColor: '#020617', flex: 1 }}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        contentContainerClassName="px-6 py-12 justify-center"
        keyboardShouldPersistTaps="handled"
      >
        {/* Brand Hero */}
        <View className="items-center mb-10 mt-8">
          <Text className="text-5xl mb-2 text-emerald-500">🎓</Text>
          <Text className="text-3xl font-extrabold text-white tracking-tight">
            House of <Text className="text-emerald-500">Edtech</Text>
          </Text>
          <Text className="text-slate-400 text-sm mt-1 text-center font-medium max-w-[280px]">
            Access premium interactive course libraries, progress monitors, and native sync.
          </Text>
        </View>

        {/* Error Notification */}
        {error && (
          <View className="bg-red-500/10 border border-red-500/30 p-3 rounded-lg mb-6">
            <Text className="text-red-400 text-xs font-semibold text-center leading-normal">
              ⚠️ {error}
            </Text>
          </View>
        )}

        {/* Form Inputs */}
        <View className="space-y-4 mb-6">
          <View>
            <Text className="text-slate-300 text-xs font-bold uppercase tracking-wider mb-2">
              Username or Email
            </Text>
            <TextInput
              value={usernameOrEmail}
              onChangeText={setUsernameOrEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              placeholder="e.g. janesmith or jane@example.com"
              placeholderTextColor="#475569"
              className="bg-slate-900 border border-slate-800 text-white rounded-xl py-3.5 px-4 focus:border-emerald-500 text-sm"
            />
          </View>

          <View className="mt-4">
            <Text className="text-slate-300 text-xs font-bold uppercase tracking-wider mb-2">
              Password
            </Text>
            <View className="relative justify-center">
              <TextInput
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                placeholder="Enter your password"
                placeholderTextColor="#475569"
                className="bg-slate-900 border border-slate-800 text-white rounded-xl py-3.5 pl-4 pr-12 focus:border-emerald-500 text-sm"
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                className="absolute right-4"
              >
                <Text className="text-slate-400 text-xs font-semibold uppercase">
                  {showPassword ? 'Hide' : 'Show'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Buttons */}
        <View className="space-y-3.5">
          <TouchableOpacity
            onPress={handleLogin}
            disabled={isSubmitting || isDemoRegistering}
            className="bg-emerald-500 py-3.5 rounded-xl justify-center items-center shadow-lg active:bg-emerald-600"
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#0f172a" />
            ) : (
              <Text className="text-slate-950 font-bold text-sm tracking-wide">Sign In</Text>
            )}
          </TouchableOpacity>

          {/* Quick Demo Access (Bypasses API Wipes) */}
          <TouchableOpacity
            onPress={handleQuickDemoAccess}
            disabled={isSubmitting || isDemoRegistering}
            className="border border-emerald-500/30 bg-emerald-500/5 py-3.5 rounded-xl justify-center items-center active:bg-emerald-500/10 mt-4"
          >
            {isDemoRegistering ? (
              <View className="flex-row items-center">
                <ActivityIndicator size="small" color="#10b981" />
                <Text className="text-emerald-400 font-bold text-sm tracking-wide ml-2">
                  Provisioning Demo User...
                </Text>
              </View>
            ) : (
              <View className="flex-row items-center">
                <Text className="text-sm">⚡</Text>
                <Text className="text-emerald-400 font-bold text-sm tracking-wide ml-1.5">
                  Instant Demo Access
                </Text>
              </View>
            )}
          </TouchableOpacity>

          <View className="flex-row justify-center items-center mt-6">
            <Text className="text-slate-400 text-xs font-medium">New student?</Text>
            <Link href="/register" asChild>
              <TouchableOpacity
                onPress={() => {
                  console.log('--- Navigating to /register via Link ---');
                }}
                className="ml-1.5"
              >
                <Text className="text-emerald-400 text-xs font-bold hover:underline">
                  Create an Account
                </Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
