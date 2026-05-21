import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Image } from 'expo-image';
import { useAuth } from '../../context/auth';
import { Course } from '../../types';

export default function CourseDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEnrolling, setIsEnrolling] = useState(false);

  const { enrolledCourses, bookmarkedCourses, courseProgress, enrollCourse, toggleBookmark } = useAuth();

  const courseId = Number(id);
  const isEnrolled = enrolledCourses.includes(courseId);
  const isBookmarked = bookmarkedCourses.includes(courseId);
  const progress = courseProgress[courseId] || 0;

  // Retrieve course from local AsyncStorage cache for instant offline loading
  useEffect(() => {
    async function loadCourseDetails() {
      try {
        const cached = await AsyncStorage.getItem('coursesCache');
        if (cached) {
          const list: Course[] = JSON.parse(cached);
          const found = list.find((c) => c.id === courseId);
          if (found) {
            setCourse(found);
          }
        }
      } catch (err) {
        console.error('Failed to load course details from cache:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadCourseDetails();
  }, [courseId]);

  const handleEnroll = async () => {
    if (isEnrolled) {
      // Resume Course by navigating to WebView
      router.push(`/webview/${courseId}`);
      return;
    }

    setIsEnrolling(true);
    // Simulate API enrollment latency for visual premium feel
    setTimeout(async () => {
      await enrollCourse(courseId);
      setIsEnrolling(false);
    }, 800);
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-slate-950 justify-center items-center" style={{ backgroundColor: '#020617' }}>
        <ActivityIndicator size="large" color="#10b981" />
      </SafeAreaView>
    );
  }

  if (!course) {
    return (
      <SafeAreaView className="flex-1 bg-slate-950 px-6 justify-center items-center" style={{ backgroundColor: '#020617' }}>
        <Text className="text-red-400 text-sm font-semibold mb-4">Course not found</Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="bg-slate-900 border border-slate-800 px-6 py-2 rounded-xl"
        >
          <Text className="text-white font-bold text-xs">Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-950" style={{ backgroundColor: '#020617' }}>
      {/* Header Bar */}
      <View className="flex-row justify-between items-center px-5 py-4 border-b border-slate-900">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 justify-center items-center"
        >
          <Text className="text-white text-lg font-bold">←</Text>
        </TouchableOpacity>
        <Text className="text-white text-sm font-black uppercase tracking-wider">Course Details</Text>
        <TouchableOpacity
          onPress={async () => await toggleBookmark(course.id)}
          className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 justify-center items-center active:bg-slate-850"
        >
          <Text className="text-emerald-500 text-lg font-bold">
            {isBookmarked ? '★' : '☆'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Cover Thumbnail */}
        <View className="w-full h-64 bg-slate-950 relative">
          <Image
            source={{ uri: course.thumbnail }}
            className="w-full h-full"
            contentFit="cover"
          />
          <View className="absolute top-4 left-4 bg-slate-950/70 backdrop-blur-md px-3 py-1 rounded-full border border-slate-800">
            <Text className="text-[10px] text-emerald-400 font-extrabold uppercase tracking-widest">
              {course.category}
            </Text>
          </View>
        </View>

        {/* Info Block */}
        <View className="px-5 mt-6">
          <Text className="text-white text-2xl font-black leading-8 tracking-tight mb-3">
            {course.title}
          </Text>

          {/* Stats Bar */}
          <View className="flex-row items-center space-x-6 bg-slate-900 border border-slate-800 rounded-2xl p-4 mb-6">
            <View className="flex-1 items-center border-r border-slate-800 pr-4">
              <Text className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">
                Rating
              </Text>
              <Text className="text-amber-400 text-base font-extrabold">⭐ {course.rating.toFixed(1)}</Text>
            </View>
            <View className="flex-1 items-center border-r border-slate-800 px-4">
              <Text className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">
                Lessons
              </Text>
              <Text className="text-white text-base font-extrabold">12 Modules</Text>
            </View>
            <View className="flex-1 items-center pl-4">
              <Text className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">
                Price
              </Text>
              <Text className="text-emerald-400 text-base font-extrabold">${course.price}</Text>
            </View>
          </View>

          {/* Instructor Card */}
          <Text className="text-slate-300 text-xs font-black uppercase tracking-widest mb-3">
            Instructor
          </Text>
          <View className="flex-row items-center bg-slate-900 border border-slate-800 rounded-2xl p-4 mb-6">
            <Image
              source={{ uri: course.instructor.avatar }}
              className="w-12 h-12 rounded-full mr-4 bg-slate-950"
              contentFit="cover"
            />
            <View className="flex-1">
              <Text className="text-white font-extrabold text-sm">{course.instructor.name}</Text>
              <Text className="text-slate-400 text-xs mt-0.5">{course.instructor.email}</Text>
            </View>
            <View className="bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl">
              <Text className="text-emerald-400 text-[10px] font-black uppercase">Verified Pro</Text>
            </View>
          </View>

          {/* Description */}
          <Text className="text-slate-300 text-xs font-black uppercase tracking-widest mb-3">
            Course Overview
          </Text>
          <Text className="text-slate-350 text-sm leading-6 mb-6">
            {course.description}. This comprehensive course is designed specifically to guide you step-by-step from zero to absolute mastery in building production-ready architectures, with robust local practices and clean data management configurations. Get direct feedback, progress checklists, and a certified profile badge upon graduation.
          </Text>

          {/* Progress Tracker for Enrolled Users */}
          {isEnrolled && (
            <View className="bg-slate-900 border border-slate-800 rounded-2xl p-4 mb-6">
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-slate-300 text-xs font-extrabold uppercase">Your Progress</Text>
                <Text className="text-emerald-400 text-xs font-extrabold">{progress}% Complete</Text>
              </View>
              <View className="h-2 bg-slate-950 rounded-full overflow-hidden mb-2">
                <View
                  className="h-full bg-emerald-500 rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </View>
              <Text className="text-slate-400 text-[10px] font-semibold leading-4">
                Enrolled on House of Edtech. Continue the curriculum to increase your stats!
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Persistent Bottom Action Button */}
      <View className="p-5 border-t border-slate-900 bg-slate-950">
        <TouchableOpacity
          onPress={handleEnroll}
          disabled={isEnrolling}
          className={`py-4 rounded-2xl justify-center items-center shadow-lg active:opacity-95 ${
            isEnrolled ? 'bg-emerald-500' : 'bg-slate-900 border border-slate-800'
          }`}
        >
          {isEnrolling ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <Text
              className={`font-black text-sm tracking-wide ${
                isEnrolled ? 'text-slate-950' : 'text-white'
              }`}
            >
              {isEnrolled ? `Resume Course (${progress}%)` : `Enroll Now • $${course.price}`}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
