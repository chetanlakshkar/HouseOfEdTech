import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../context/auth';

export default function ProfileScreen() {
  const { user, enrolledCourses, bookmarkedCourses, courseProgress, logout, updateAvatar } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Pick an image from the photo library and call updateAvatar
  const handleSelectAvatar = async () => {
    try {
      // Request media library permission
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert(
          'Permissions Required',
          'Media library permission is required to change your profile picture.'
        );
        return;
      }

      // Launch Image Picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        setIsUploading(true);
        await updateAvatar(imageUri);
        Alert.alert('Success', 'Profile picture updated successfully!');
      }
    } catch (err: any) {
      console.error('Avatar upload exception:', err);
      Alert.alert('Upload Failed', err.message || 'Could not save profile picture. Try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert('Sign Out', 'Are you sure you want to log out of your session?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          setIsLoggingOut(true);
          try {
            await logout();
          } catch (err) {
            console.error('Failed to log out:', err);
          } finally {
            setIsLoggingOut(false);
          }
        },
      },
    ]);
  };

  // Compute average course progress
  const averageProgress = useMemo(() => {
    if (enrolledCourses.length === 0) return 0;
    let sum = 0;
    enrolledCourses.forEach((id) => {
      sum += courseProgress[id] || 0;
    });
    return Math.round(sum / enrolledCourses.length);
  }, [enrolledCourses, courseProgress]);

  // Format date readable
  const joinDate = useMemo(() => {
    if (!user?.createdAt) return 'Recent Student';
    try {
      const date = new Date(user.createdAt);
      return date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
    } catch {
      return 'Recent Student';
    }
  }, [user]);

  return (
    <SafeAreaView className="flex-1 bg-slate-950" style={{ backgroundColor: '#020617', flex: 1 }}>
      <ScrollView className="flex-1 px-5 pt-8" contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Title */}
        <View className="mb-8">
          <Text className="text-slate-400 text-xs font-semibold tracking-widest uppercase">
            Syllabus student hub
          </Text>
          <Text className="text-white text-2xl font-black tracking-tight">
            My Student Profile
          </Text>
        </View>

        {/* User Card */}
        <View className="bg-slate-900 border border-slate-800 rounded-3xl p-6 items-center mb-8 shadow-lg">
          <TouchableOpacity
            onPress={handleSelectAvatar}
            disabled={isUploading}
            activeOpacity={0.85}
            className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-emerald-500 bg-slate-950 justify-center items-center mb-4"
          >
            {user?.avatar?.url ? (
              <Image
                source={{ uri: user.avatar.url }}
                className="w-full h-full bg-slate-950"
                contentFit="cover"
              />
            ) : (
              <Text className="text-emerald-500 text-3xl font-black">👤</Text>
            )}

            {/* Upload Spinner Overlay */}
            {isUploading && (
              <View className="absolute inset-0 bg-slate-950/70 justify-center items-center">
                <ActivityIndicator size="small" color="#10b981" />
              </View>
            )}

            {/* Quick edit badge */}
            <View className="absolute bottom-0 right-0 bg-emerald-500 rounded-full w-6 h-6 justify-center items-center border border-slate-900">
              <Text className="text-[10px] text-slate-950">📷</Text>
            </View>
          </TouchableOpacity>

          <Text className="text-white text-xl font-black tracking-tight">{user?.username || 'Student User'}</Text>
          <Text className="text-slate-400 text-xs font-semibold mt-1">{user?.email || 'student@edtech.com'}</Text>
          <Text className="text-slate-500 text-[10px] font-bold uppercase mt-3 tracking-widest">
            Enrolled {joinDate}
          </Text>
        </View>

        {/* Stats Grid */}
        <Text className="text-slate-300 text-xs font-black uppercase tracking-widest mb-4">
          Learning Statistics
        </Text>
        <View className="flex-row flex-wrap justify-between mb-8">
          {/* Stat 1 */}
          <View className="w-[47%] bg-slate-900 border border-slate-800 rounded-2xl p-4 mb-4">
            <Text className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">
              Courses
            </Text>
            <Text className="text-white text-2xl font-black mb-1">{enrolledCourses.length}</Text>
            <Text className="text-emerald-400 text-[9px] font-semibold leading-normal">
              Active Enrollments
            </Text>
          </View>

          {/* Stat 2 */}
          <View className="w-[47%] bg-slate-900 border border-slate-800 rounded-2xl p-4 mb-4">
            <Text className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">
              Bookmarks
            </Text>
            <Text className="text-white text-2xl font-black mb-1">{bookmarkedCourses.length}</Text>
            <Text className="text-emerald-400 text-[9px] font-semibold leading-normal">
              Saved lessons count
            </Text>
          </View>

          {/* Stat 3 */}
          <View className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <View className="flex-row justify-between items-center mb-1.5">
              <Text className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                Average Progress
              </Text>
              <Text className="text-emerald-400 text-sm font-black">{averageProgress}%</Text>
            </View>
            <View className="h-2 bg-slate-950 rounded-full overflow-hidden mb-2">
              <View
                className="h-full bg-emerald-500 rounded-full"
                style={{ width: `${averageProgress}%` }}
              />
            </View>
            <Text className="text-slate-400 text-[10px] font-semibold leading-4">
              A comprehensive average across all of your enrolled lecture modules. Keep up the high stats!
            </Text>
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          onPress={handleLogout}
          disabled={isLoggingOut}
          className="bg-red-500/10 border border-red-500/30 py-4 rounded-2xl justify-center items-center active:bg-red-500/20"
        >
          {isLoggingOut ? (
            <ActivityIndicator size="small" color="#ef4444" />
          ) : (
            <Text className="text-red-400 font-bold text-sm tracking-wide">Sign Out Account</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
