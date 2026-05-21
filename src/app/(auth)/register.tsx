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
  Alert,
} from 'react-native';
import { useRouter, Link } from 'expo-router';
import { useAuth } from '../../context/auth';

export default function RegisterScreen() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { register } = useAuth();
  const router = useRouter();

  const handleRegister = async () => {
    // Input Validations
    if (!username.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      setError('Please fill in all fields');
      return;
    }

    if (username.trim().length < 3) {
      setError('Username must be at least 3 characters');
      return;
    }

    if (!email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      await register(username.trim(), email.trim(), password);
      Alert.alert(
        'Success',
        'Account created successfully! You can now log in.',
        [{ text: 'OK', onPress: () => router.replace('/login') }]
      );
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
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
        {/* Header */}
        <View className="items-center mb-10 mt-8">
          <Text className="text-5xl mb-2 text-emerald-500">🎓</Text>
          <Text className="text-3xl font-extrabold text-white tracking-tight">
            Create <Text className="text-emerald-500">Account</Text>
          </Text>
          <Text className="text-slate-400 text-sm mt-1 text-center font-medium">
            Join House of Edtech and start learning today.
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
        <View className="space-y-4 mb-8">
          <View>
            <Text className="text-slate-300 text-xs font-bold uppercase tracking-wider mb-2">
              Username
            </Text>
            <TextInput
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              placeholder="e.g. janesmith"
              placeholderTextColor="#475569"
              className="bg-slate-900 border border-slate-800 text-white rounded-xl py-3.5 px-4 focus:border-emerald-500 text-sm"
            />
          </View>

          <View className="mt-4">
            <Text className="text-slate-300 text-xs font-bold uppercase tracking-wider mb-2">
              Email Address
            </Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              placeholder="e.g. jane@example.com"
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
                placeholder="Minimum 6 characters"
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

          <View className="mt-4">
            <Text className="text-slate-300 text-xs font-bold uppercase tracking-wider mb-2">
              Confirm Password
            </Text>
            <TextInput
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              placeholder="Re-enter password"
              placeholderTextColor="#475569"
              className="bg-slate-900 border border-slate-800 text-white rounded-xl py-3.5 px-4 focus:border-emerald-500 text-sm"
            />
          </View>
        </View>

        {/* Buttons */}
        <View className="space-y-4">
          <TouchableOpacity
            onPress={handleRegister}
            disabled={isSubmitting}
            className="bg-emerald-500 py-3.5 rounded-xl justify-center items-center shadow-lg active:bg-emerald-600"
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#0f172a" />
            ) : (
              <Text className="text-slate-950 font-bold text-sm tracking-wide">Register</Text>
            )}
          </TouchableOpacity>

          <View className="flex-row justify-center items-center mt-6">
            <Text className="text-slate-400 text-xs font-medium">Already have an account?</Text>
            <Link href="/login" asChild>
              <TouchableOpacity
                onPress={() => {
                  console.log('--- Navigating to /login via Link ---');
                }}
                className="ml-1.5"
              >
                <Text className="text-emerald-400 text-xs font-bold hover:underline">
                  Sign In
                </Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
