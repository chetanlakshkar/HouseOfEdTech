import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  ActivityIndicator,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LegendList } from '@legendapp/list';
import { useAuth } from '../../context/auth';
import { useNetwork } from '../../context/network';
import { api, requestWithRetry } from '../../services/api';
import { CourseCard } from '../../components/CourseCard';
import { Course, RandomProductResponse, RandomUserResponse, APIResponse } from '../../types';

export default function ExploreScreen() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { isOffline } = useNetwork();
  const { user } = useAuth();
  const router = useRouter();

  // Load courses (either via API or Cache)
  const fetchCourses = async (showLoadingIndicator = true) => {
    if (showLoadingIndicator) setIsLoading(true);
    setErrorMsg(null);

    try {
      if (isOffline) {
        // Load from Cache if offline
        const cached = await AsyncStorage.getItem('coursesCache');
        if (cached) {
          setCourses(JSON.parse(cached));
        } else {
          setErrorMsg('No internet connection. Connect to the web to load courses.');
        }
        setIsLoading(false);
        setIsRefreshing(false);
        return;
      }

      // Fetch products and users in parallel for maximum speed
      const [productsRes, usersRes] = await Promise.all([
        requestWithRetry(() =>
          api.get<APIResponse<{ data: RandomProductResponse[] }>>('/public/randomproducts?page=1&limit=40')
        ),
        requestWithRetry(() =>
          api.get<APIResponse<{ data: RandomUserResponse[] }>>('/public/randomusers?page=1&limit=40')
        ),
      ]);

      const products = productsRes.data?.data?.data || [];
      const users = usersRes.data?.data?.data || [];

      // Combine products and users to represent Courses and Instructors
      const combined: Course[] = products.map((prod, index) => {
        // Safely pick a user (instructor) using modulo
        const instructorUser = users[index % users.length] || {
          name: { title: 'Mr', first: 'Edu', last: 'Mentor' },
          picture: { medium: 'https://via.placeholder.com/150' },
          email: 'instructor@edtech.com',
        };

        return {
          id: prod.id,
          title: prod.title,
          description: prod.description,
          price: prod.price,
          rating: prod.rating,
          category: prod.category,
          thumbnail: prod.thumbnail,
          images: prod.images,
          instructor: {
            name: `${instructorUser.name.title} ${instructorUser.name.first} ${instructorUser.name.last}`,
            avatar: instructorUser.picture.medium,
            email: instructorUser.email,
          },
          enrolled: false,
          bookmarked: false,
          progress: 0,
        };
      });

      setCourses(combined);
      // Update local storage cache
      await AsyncStorage.setItem('coursesCache', JSON.stringify(combined));
    } catch (err: any) {
      console.error('Failed to fetch courses catalog:', err);
      // Fallback to cache on hard API failure
      const cached = await AsyncStorage.getItem('coursesCache');
      if (cached) {
        setCourses(JSON.parse(cached));
      } else {
        setErrorMsg('Failed to load courses from catalog. Please tap retry.');
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCourses(true);
  }, [isOffline]);

  // Pull-to-refresh handler
  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchCourses(false);
  }, [isOffline]);

  // Handle click navigation to details page
  const handleCoursePress = useCallback(
    (courseId: number) => {
      router.push(`/course/${courseId}`);
    },
    [router]
  );

  // Search Filter computation
  const filteredCourses = useMemo(() => {
    if (!searchQuery.trim()) return courses;
    const query = searchQuery.toLowerCase().trim();
    return courses.filter(
      (c) =>
        c.title.toLowerCase().includes(query) ||
        c.description.toLowerCase().includes(query) ||
        c.category.toLowerCase().includes(query) ||
        c.instructor.name.toLowerCase().includes(query)
    );
  }, [courses, searchQuery]);

  // Simulated AI Smart Recommendation Picker
  const aiRecommendedCourse = useMemo(() => {
    if (courses.length === 0) return null;
    // Highlight a high-rated premium course as an AI pick
    const topRated = [...courses].sort((a, b) => b.rating - a.rating);
    return topRated[0] || null;
  }, [courses]);

  // Memoized RenderItem function for LegendList
  const renderItem = useCallback(
    ({ item }: { item: Course }) => <CourseCard course={item} onPress={handleCoursePress} />,
    [handleCoursePress]
  );

  return (
    <SafeAreaView className="flex-1 bg-slate-950" style={{ backgroundColor: '#020617', flex: 1 }}>
      <StatusBar barStyle="light-content" />
      <View className="flex-1 px-5 pt-8">
        {/* Welcome Header */}
        <View className="flex-row justify-between items-center mb-6">
          <View>
            <Text className="text-slate-400 text-xs font-semibold tracking-widest uppercase">
              Welcome back
            </Text>
            <Text className="text-white text-2xl font-black tracking-tight">
              Hey, {user?.username || 'Student'} 👋
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push('/profile')}
            className="w-10 h-10 rounded-full border border-emerald-500/20 overflow-hidden bg-slate-900 justify-center items-center"
          >
            {user?.avatar?.url ? (
              <Image
                source={{ uri: user.avatar.url }}
                className="w-full h-full"
                contentFit="cover"
              />
            ) : (
              <Text className="text-emerald-500 text-sm font-bold">👤</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View className="bg-slate-900 border border-slate-800 rounded-2xl flex-row items-center px-4 py-3 mb-6 focus-within:border-emerald-500">
          <Text className="text-slate-400 mr-2.5 text-base">🔍</Text>
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search courses, instructors, subjects..."
            placeholderTextColor="#64748b"
            className="flex-1 text-white text-sm"
            autoCapitalize="none"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} className="p-0.5">
              <Text className="text-slate-500 font-bold text-xs">✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* AI Recommendations Panel (Bonus Option implemented elegantly) */}
        {!searchQuery && aiRecommendedCourse && (
          <TouchableOpacity
            onPress={() => handleCoursePress(aiRecommendedCourse.id)}
            activeOpacity={0.9}
            className="bg-emerald-950/20 border border-emerald-500/20 rounded-2xl p-4 mb-6"
          >
            <View className="flex-row items-center mb-1.5">
              <Text className="text-emerald-400 text-xs font-bold tracking-wider uppercase mr-2">
                🤖 AI Smart Recommendation
              </Text>
              <View className="bg-emerald-500 px-1.5 py-0.5 rounded">
                <Text className="text-slate-950 text-[8px] font-black uppercase">HOT</Text>
              </View>
            </View>
            <Text className="text-white text-sm font-extrabold mb-1">
              {aiRecommendedCourse.title}
            </Text>
            <Text className="text-emerald-300/80 text-[11px] leading-4 truncate" numberOfLines={2}>
              Based on top industry trends and active tech profiles, we highly recommend enrolling in this premium masterclass. Learn with instructor {aiRecommendedCourse.instructor.name}.
            </Text>
          </TouchableOpacity>
        )}

        {/* Main Content Area */}
        <View className="flex-grow flex-1" style={{ flex: 1 }}>
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-white text-lg font-extrabold">All Courses</Text>
            {isOffline && (
              <Text className="text-amber-500 text-[10px] font-black uppercase">Cached Mode</Text>
            )}
          </View>

          {isLoading ? (
            <View className="flex-1 justify-center items-center">
              <ActivityIndicator size="large" color="#10b981" />
              <Text className="text-slate-400 mt-4 text-xs font-medium">
                Fetching fresh lessons...
              </Text>
            </View>
          ) : errorMsg ? (
            <View className="flex-1 justify-center items-center px-6">
              <Text className="text-red-400 text-sm font-semibold text-center mb-4 leading-normal">
                ⚠️ {errorMsg}
              </Text>
              <TouchableOpacity
                onPress={() => fetchCourses(true)}
                className="bg-slate-900 border border-slate-800 px-6 py-2.5 rounded-xl active:bg-slate-850"
              >
                <Text className="text-white font-bold text-xs tracking-wider uppercase">Retry</Text>
              </TouchableOpacity>
            </View>
          ) : filteredCourses.length === 0 ? (
            <View className="flex-1 justify-center items-center">
              <Text className="text-slate-400 text-sm font-medium">No courses found matching search</Text>
            </View>
          ) : (
            <LegendList
              data={filteredCourses}
              renderItem={renderItem}
              keyExtractor={(item: Course) => item.id.toString()}
              estimatedItemSize={142}
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              recycleItems={true}
              contentContainerStyle={{ paddingBottom: 24 }}
            />
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}
