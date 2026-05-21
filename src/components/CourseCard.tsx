import { Image } from 'expo-image';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../context/auth';
import { Course } from '../types';

interface CourseCardProps {
  course: Course;
  onPress: (courseId: number) => void;
}

export const CourseCard: React.FC<CourseCardProps> = React.memo(({ course, onPress }) => {
  const { bookmarkedCourses, enrolledCourses, courseProgress, toggleBookmark } = useAuth();
  console.log("courses", course)
  const isBookmarked = bookmarkedCourses.includes(course.id);
  const isEnrolled = enrolledCourses.includes(course.id);
  const progress = courseProgress[course.id] || 0;

  const handleBookmarkToggle = async (e: any) => {
    e.stopPropagation(); // Prevent card click trigger
    await toggleBookmark(course.id);
  };

  return (
    <TouchableOpacity
      onPress={() => onPress(course.id)}
      activeOpacity={0.8}
      className="bg-slate-900 border border-slate-800/80 rounded-2xl overflow-hidden mb-4 shadow-md flex-row p-3.5 relative"
    >
      {/* Thumbnail */}
      <View className="relative w-28 h-28 rounded-xl overflow-hidden mr-4 bg-slate-950">
        <Image
          source={{ uri: course.thumbnail }}
          className="w-full h-full"
          contentFit="cover"
          transition={200}
        />
        {/* Category Badge */}
        <View className="absolute bottom-1.5 left-1.5 bg-slate-950/80 backdrop-blur-md px-2 py-0.5 rounded-md">
          <Text className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
            {course.category}
          </Text>
        </View>
      </View>

      {/* Details Container */}
      <View className="flex-1 justify-between py-0.5">
        <View>
          {/* Instructor Block */}
          <View className="flex-row items-center mb-1.5">
            <Image
              source={{ uri: course.instructor.avatar }}
              className="w-4 h-4 rounded-full mr-1.5 bg-slate-800"
              contentFit="cover"
            />
            <Text className="text-[11px] text-slate-400 font-semibold truncate max-w-[150px]">
              {course.instructor.name}
            </Text>
          </View>

          {/* Title */}
          <Text className="text-white text-sm font-bold leading-5 mb-1 truncate" numberOfLines={2}>
            {course.title}
          </Text>

          {/* Short Description */}
          <Text className="text-slate-400 text-xs leading-4 truncate" numberOfLines={2}>
            {course.description}
          </Text>
        </View>

        {/* Footer info: Progress or Price */}
        <View className="flex-row justify-between items-center mt-2">
          {isEnrolled ? (
            <View className="flex-1 mr-6">
              <View className="flex-row justify-between items-center mb-1">
                <Text className="text-[10px] text-emerald-400 font-bold">Enrolled</Text>
                <Text className="text-[10px] text-slate-400 font-bold">{progress}%</Text>
              </View>
              <View className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <View
                  className="h-full bg-emerald-500 rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </View>
            </View>
          ) : (
            <View className="flex-row items-center">
              <Text className="text-white text-sm font-black mr-2">${course.price}</Text>
              {course.rating > 0 && (
                <Text className="text-amber-400 text-xs font-semibold">⭐ {course.rating.toFixed(1)}</Text>
              )}
            </View>
          )}

          {/* Bookmark Button */}
          <TouchableOpacity
            onPress={handleBookmarkToggle}
            className="p-1 rounded-full bg-slate-800/50 justify-center items-center w-7 h-7 active:bg-slate-800"
          >
            <Text className="text-sm font-bold text-emerald-500">
              {isBookmarked ? '★' : '☆'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
});

CourseCard.displayName = 'CourseCard';
