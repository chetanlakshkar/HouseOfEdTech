export interface UserAvatar {
  url: string;
  localPath: string;
  _id: string;
}

export interface User {
  _id: string;
  username: string;
  email: string;
  role: string;
  loginType: string;
  isEmailVerified: boolean;
  avatar: UserAvatar;
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

export interface AuthData {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface APIResponse<T> {
  statusCode: number;
  data: T;
  message: string;
  success: boolean;
  errors?: any[];
}

export interface RandomUserResponse {
  gender: string;
  name: {
    title: string;
    first: string;
    last: string;
  };
  email: string;
  picture: {
    large: string;
    medium: string;
    thumbnail: string;
  };
  id: number;
}

export interface RandomProductResponse {
  id: number;
  title: string;
  description: string;
  price: number;
  discountPercentage: number;
  rating: number;
  stock: number;
  brand: string;
  category: string;
  thumbnail: string;
  images: string[];
}

export interface Instructor {
  name: string;
  avatar: string;
  email: string;
}

export interface Course {
  id: number;
  title: string;
  description: string;
  price: number;
  rating: number;
  category: string;
  thumbnail: string;
  images: string[];
  instructor: Instructor;
  enrolled: boolean;
  bookmarked: boolean;
  progress: number; // 0 to 100
}

export interface UserPreferences {
  theme: 'dark' | 'light';
  notificationsEnabled: boolean;
}
