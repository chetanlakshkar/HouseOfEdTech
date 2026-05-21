import React, { createContext, useState, useEffect, useContext } from 'react';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../services/api';
import { User, AuthData, APIResponse } from '../types';
import { triggerBookmarkNotification } from '../services/notifications';


interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  enrolledCourses: number[];
  bookmarkedCourses: number[];
  courseProgress: Record<number, number>;
  login: (usernameOrEmail: string, password: string) => Promise<User>;
  register: (username: string, email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  updateAvatar: (imageUri: string) => Promise<User>;
  enrollCourse: (courseId: number) => Promise<void>;
  toggleBookmark: (courseId: number) => Promise<boolean>;
  updateCourseProgress: (courseId: number, progress: number) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [enrolledCourses, setEnrolledCourses] = useState<number[]>([]);
  const [bookmarkedCourses, setBookmarkedCourses] = useState<number[]>([]);
  const [courseProgress, setCourseProgress] = useState<Record<number, number>>({});

  const isAuthenticated = !!user;

  // Load state on startup
  useEffect(() => {
    async function loadStoredSession() {
      try {
        const storedUser = await SecureStore.getItemAsync('userSession');
        const token = await SecureStore.getItemAsync('accessToken');

        if (storedUser && token) {
          setUser(JSON.parse(storedUser));
          // Verify session is still valid by fetching current user
          try {
            const response = await api.get<APIResponse<User>>('/users/current-user');
            if (response.data && response.data.success) {
              setUser(response.data.data);
              await SecureStore.setItemAsync('userSession', JSON.stringify(response.data.data));
            }
          } catch (apiErr) {
            console.warn('Auto-login session validation failed, keeping cached profile', apiErr);
          }
        }

        // Load courses data from AsyncStorage
        const storedEnrolled = await AsyncStorage.getItem('enrolledCourses');
        const storedBookmarked = await AsyncStorage.getItem('bookmarkedCourses');
        const storedProgress = await AsyncStorage.getItem('courseProgress');

        if (storedEnrolled) setEnrolledCourses(JSON.parse(storedEnrolled));
        if (storedBookmarked) setBookmarkedCourses(JSON.parse(storedBookmarked));
        if (storedProgress) setCourseProgress(JSON.parse(storedProgress));
      } catch (err) {
        console.error('Failed to load stored session or app state:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadStoredSession();
  }, []);

  // Sync enrolled courses to AsyncStorage
  const enrollCourse = async (courseId: number) => {
    try {
      if (enrolledCourses.includes(courseId)) return;
      const updated = [...enrolledCourses, courseId];
      setEnrolledCourses(updated);
      await AsyncStorage.setItem('enrolledCourses', JSON.stringify(updated));

      // Set initial progress
      const updatedProgress = { ...courseProgress, [courseId]: 0 };
      setCourseProgress(updatedProgress);
      await AsyncStorage.setItem('courseProgress', JSON.stringify(updatedProgress));
    } catch (err) {
      console.error('Failed to enroll in course:', err);
    }
  };

  // Sync bookmarks to AsyncStorage
  const toggleBookmark = async (courseId: number): Promise<boolean> => {
    try {
      let updated: number[];
      let isBookmarkedNow = false;

      if (bookmarkedCourses.includes(courseId)) {
        updated = bookmarkedCourses.filter((id) => id !== courseId);
      } else {
        updated = [...bookmarkedCourses, courseId];
        isBookmarkedNow = true;
      }

      setBookmarkedCourses(updated);
      await AsyncStorage.setItem('bookmarkedCourses', JSON.stringify(updated));

      // Trigger local notification when bookmark count reaches 5+
      if (isBookmarkedNow && updated.length >= 5) {
        setTimeout(() => {
          triggerBookmarkNotification(updated.length);
        }, 100);
      }

      return isBookmarkedNow;
    } catch (err) {
      console.error('Failed to toggle bookmark:', err);
      return false;
    }
  };

  // Sync progress
  const updateCourseProgress = async (courseId: number, progress: number) => {
    try {
      const updatedProgress = { ...courseProgress, [courseId]: Math.min(100, Math.max(0, progress)) };
      setCourseProgress(updatedProgress);
      await AsyncStorage.setItem('courseProgress', JSON.stringify(updatedProgress));
    } catch (err) {
      console.error('Failed to update course progress:', err);
    }
  };

  // Login
  const login = async (usernameOrEmail: string, password: string): Promise<User> => {
    try {
      // FreeAPI login works with email or username parameter
      const body = usernameOrEmail.includes('@')
        ? { email: usernameOrEmail, password }
        : { username: usernameOrEmail, password };

      const response = await api.post<APIResponse<AuthData>>('/users/login', body);

      if (response.data && response.data.success) {
        const { user: userData, accessToken, refreshToken } = response.data.data;

        await SecureStore.setItemAsync('accessToken', accessToken);
        await SecureStore.setItemAsync('refreshToken', refreshToken);
        await SecureStore.setItemAsync('userSession', JSON.stringify(userData));

        setUser(userData);
        return userData;
      } else {
        throw new Error(response.data.message || 'Login failed');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Invalid credentials';
      throw new Error(msg);
    }
  };

  // Register
  const register = async (username: string, email: string, password: string): Promise<User> => {
    try {
      const response = await api.post<APIResponse<{ user: User }>>('/users/register', {
        username,
        email,
        password,
      });

      if (response.data && response.data.success) {
        return response.data.data.user;
      } else {
        throw new Error(response.data.message || 'Registration failed');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Registration failed';
      throw new Error(msg);
    }
  };

  // Logout
  const logout = async () => {
    setIsLoading(true);
    try {
      await api.post('/users/logout');
    } catch (err) {
      console.warn('Logout API call failed, removing local session anyway', err);
    } finally {
      await SecureStore.deleteItemAsync('accessToken');
      await SecureStore.deleteItemAsync('refreshToken');
      await SecureStore.deleteItemAsync('userSession');
      setUser(null);
      setIsLoading(false);
    }
  };

  // Update Profile Avatar
  const updateAvatar = async (imageUri: string): Promise<User> => {
    try {
      const formData = new FormData();
      
      const fileUri = Platform.OS === 'ios' && !imageUri.startsWith('file://') 
        ? `file://${imageUri}` 
        : imageUri;
        
      const filename = imageUri.split('/').pop() || 'avatar.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';

      formData.append('avatar', {
        uri: fileUri,
        name: filename,
        type,
      } as any);

      const response = await api.patch<APIResponse<User>>('/users/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data && response.data.success) {
        const updatedUser = response.data.data;
        await SecureStore.setItemAsync('userSession', JSON.stringify(updatedUser));
        setUser(updatedUser);
        return updatedUser;
      } else {
        throw new Error(response.data.message || 'Avatar upload failed');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to update avatar image';
      throw new Error(msg);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        enrolledCourses,
        bookmarkedCourses,
        courseProgress,
        login,
        register,
        logout,
        updateAvatar,
        enrollCourse,
        toggleBookmark,
        updateCourseProgress,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
