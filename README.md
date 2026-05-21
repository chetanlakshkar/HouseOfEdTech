# House of Edtech — Mini LMS Mobile App

A highly-optimized, premium, offline-resilient **Mini LMS Mobile App** built using **React Native Expo**, **TypeScript**, **Expo Router**, **NativeWind (Tailwind CSS)**, and **SecureStore**. 

This application demonstrates sophisticated full-stack architecture, high-performance scroll rendering, native permission triggers, and secure bidirectional WebView communication.

---

## 🚀 Core Features & Architectural Deliverables

### 1. Secure Authentication & Session Lifecycle
* **Dual-Token Storage**: Access and refresh tokens are securely encrypted using **Expo SecureStore**.
* **Startup Session Auto-Login**: The app automatically re-authenticates on launch by validating credentials against `/users/current-user`.
* **Token Refresh Interceptor**: Integrates Axios request/response interceptors to catch `401 Unauthorized` responses, perform automatic refresh calls to `/users/refresh-token`, update stored keys, and seamlessly retry the original request.
* **Instant Demo Access**: The `https://api.freeapi.app` database wipes out periodically. To simplify grading, we implemented an **"Instant Demo Access"** helper on the Login page that automatically generates a unique user, registers them, and logs them in immediately.

### 2. High-Performance Catalog & Offline Caching
* **LegendList Rendering**: Replaced standard React Native `FlatList`/`FlashList` with **`LegendList`** (`@legendapp/list`) for ultra-optimized virtualized scrolling, combining memoized components and jank-free Pull-to-Refresh.
* **Merged Catalog Model**: Merges the FreeAPI product inventory `/public/randomproducts` with random users `/public/randomusers` to map products as active interactive courses and users as verified course instructors.
* **Offline-First Resilience**: Automatically caches the combined courses catalog in local **AsyncStorage**. If network requests fail or connection drops, the app switches to cache reading and allows searching, filtering, and detail navigation without interruption.

### 3. Bidirectional WebView Bridge
* **Interactive Player**: Renders a local, beautifully styled responsive HTML slide deck inside `react-native-webview` showing course modules.
* **Bidirectional progress updates**: Checks off elements in the HTML slides, computes progress, and posts messages (`window.ReactNativeWebView.postMessage`) back to React Native.
* **Dynamic Persistence**: The native wrapper captures messages, updates progress states in global context, and saves them in local storage.

### 4. Native Hardware Features
* **Permission Requests**: Requests local notifications permissions elegantly on launch.
* **Milestone Notifications**: Immediately alerts students with a local notification when they cross the 5-bookmarks threshold.
* **Daily Inactivity Reminder**: Automatically schedules a recurring local notification to prompt inactive users if they have not opened the app for 24 hours (resetting the timer on each app open).
* **Avatar Picker & Multi-part Upload**: Combines `expo-image-picker` with `PATCH /users/avatar` multipart form-data requests to allow changing student profile pictures in real time.
* **Connection Monitoring**: Employs `@react-native-community/netinfo` to monitor Wi-Fi/cellular connection and shows a gorgeous floating alert banner if offline.

---

## 🛠️ Technology Stack

* **Framework**: Expo (SDK 55, React Native 0.83, React 19)
* **Language**: Strict TypeScript
* **Navigation**: Expo Router (FileSystem directory navigation)
* **Styling**: NativeWind (Tailwind CSS for React Native)
* **Data Storage**: Expo SecureStore (sensitive keys) & AsyncStorage (app data & caches)
* **List Component**: `@legendapp/list` (LegendList)
* **Image Caching**: `expo-image`
* **HTTP Client**: Axios with Interceptors & Exponential Retry

---

## 📂 Project Organization

```text
/src
 ├── /app
 │    ├── /(auth)
 │    │    ├── login.tsx            # Sign in & automated demo provisioner
 │    │    └── register.tsx         # Account registration
 │    ├── /(tabs)
 │    │    ├── _layout.tsx          # Bottom tabs navigation structure
 │    │    ├── index.tsx            # Catalog Explore & Search
 │    │    ├── bookmarks.tsx        # Saved Bookmarked Lessons
 │    │    └── profile.tsx          # Profile details, Stats & Avatar picker
 │    ├── /course
 │    │    └── [id].tsx             # Overview details & enrollment CTA
 │    ├── /webview
 │    │    └── [id].tsx             # Interactive lesson player & progress bridge
 │    └── _layout.tsx               # Root layouts, context wrappers & offline indicator
 ├── /components
 │    └── CourseCard.tsx            # Memoized high-performance catalog card
 ├── /context
 │    ├── auth.tsx                  # Global session, storage, progress context
 │    └── network.tsx               # NetInfo monitoring connection context
 ├── /services
 │    ├── api.ts                    # Axios interceptors & retry manager
 │    └── notifications.ts          # Expo Notifications scheduler & milestones
 ├── /types
 │    └── index.ts                  # Strong TypeScript definitions
 └── global.css                     # Tailwind stylesheet directives
```

---

## 💻 Developer Installation & Setup

### Prerequisites
* **Node.js**: `v20.x` or higher (verified compatible up to `v24.x`)
* **npm**: `v10.x` or higher

### Steps
1. **Clone and Navigate**:
   ```bash
   cd scratch
   ```
2. **Install Dependencies**:
   ```bash
   npm install
   ```
3. **Environment Setup**:
   The application communicates directly with `https://api.freeapi.app`. No `.env` is required as a fallback is pre-configured, but you can set up standard Expo environment variables in root if needed:
   ```text
   EXPO_PUBLIC_API_URL=https://api.freeapi.app/api/v1
   ```
4. **Compile TypeScript**:
   ```bash
   npx tsc --noEmit
   ```
5. **Start Dev Server**:
   ```bash
   npm run ios     # launch iOS Simulator
   # or
   npm run android # launch Android Emulator
   # or
   npm run start   # launch Expo interactive terminal
   ```
