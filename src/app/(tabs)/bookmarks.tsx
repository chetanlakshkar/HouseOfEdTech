import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LegendList } from '@legendapp/list';
import { useAuth } from '../../context/auth';
import { CourseCard } from '../../components/CourseCard';
import { Course } from '../../types';

export default function BookmarksScreen() {
  const [cachedCourses, setCachedCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { bookmarkedCourses } = useAuth();
  const router = useRouter();

  // Load course details from cache
  const loadCachedCourses = async () => {
    try {
      const cached = await AsyncStorage.getItem('coursesCache');
      if (cached) {
        setCachedCourses(JSON.parse(cached));
      }
    } catch (err) {
      console.error('Failed to load courses cache in bookmarks:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCachedCourses();
  }, [bookmarkedCourses]);

  // Filter cached courses to show only bookmarked ones
  const bookmarkedList = React.useMemo(() => {
    return cachedCourses.filter((course) => bookmarkedCourses.includes(course.id));
  }, [cachedCourses, bookmarkedCourses]);

  const handleCoursePress = (courseId: number) => {
    router.push(`/course/${courseId}`);
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-950" style={{ backgroundColor: '#020617', flex: 1 }}>
      <StatusBar barStyle="light-content" />
      <View className="flex-1 px-5 pt-8">
        {/* Header Title */}
        <View className="mb-6">
          <Text className="text-slate-400 text-xs font-semibold tracking-widest uppercase">
            Your saved lessons
          </Text>
          <Text className="text-white text-2xl font-black tracking-tight">
            Bookmarked Courses
          </Text>
        </View>

        {/* Content Area */}
        <View className="flex-grow flex-1" style={{ flex: 1 }}>
          {isLoading ? (
            <View className="flex-1 justify-center items-center">
              <ActivityIndicator size="large" color="#10b981" />
            </View>
          ) : bookmarkedList.length === 0 ? (
            <View className="flex-1 justify-center items-center px-8">
              <Text className="text-5xl mb-4">⭐</Text>
              <Text className="text-white font-extrabold text-base mb-2">No Bookmarks Yet</Text>
              <Text className="text-slate-400 text-xs text-center mb-6 leading-normal">
                Bookmark courses from the catalog list to save them here for offline access and quick reference.
              </Text>
              <TouchableOpacity
                onPress={() => router.push('/')}
                className="bg-emerald-500 px-6 py-3 rounded-xl active:bg-emerald-600 shadow-md"
              >
                <Text className="text-slate-950 font-bold text-xs tracking-wider uppercase">
                  Explore Catalog
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <LegendList
              data={bookmarkedList}
              renderItem={({ item }) => (
                <CourseCard course={item} onPress={handleCoursePress} />
              )}
              keyExtractor={(item: Course) => item.id.toString()}
              estimatedItemSize={142}
              recycleItems={true}
              contentContainerStyle={{ paddingBottom: 24 }}
            />
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}
