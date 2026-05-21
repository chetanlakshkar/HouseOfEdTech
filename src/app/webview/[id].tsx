import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { WebView } from 'react-native-webview';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../../context/auth';
import { Course } from '../../types';

export default function CourseWebViewScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [webViewLoading, setWebViewLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const { courseProgress, updateCourseProgress } = useAuth();
  const webViewRef = useRef<WebView>(null);

  const courseId = Number(id);
  const progress = courseProgress[courseId] || 0;

  useEffect(() => {
    async function loadCourse() {
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
        console.error('Failed to load course for webview:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadCourse();
  }, [courseId]);

  // Handle messages sent from the WebView
  const handleMessage = async (event: any) => {
    try {
      const message = JSON.parse(event.nativeEvent.data);
      if (message.type === 'PROGRESS_UPDATE') {
        const newProgress = Number(message.progress);
        await updateCourseProgress(courseId, newProgress);
      }
    } catch (err) {
      console.warn('Failed to parse message from WebView:', err);
    }
  };

  const handleRetry = () => {
    setHasError(false);
    setWebViewLoading(true);
    webViewRef.current?.reload();
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
      <SafeAreaView className="flex-1 bg-slate-950 justify-center items-center px-6" style={{ backgroundColor: '#020617' }}>
        <Text className="text-red-400 font-semibold mb-4 text-sm">Course not found</Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="bg-slate-900 border border-slate-800 px-6 py-2.5 rounded-xl"
        >
          <Text className="text-white font-bold text-xs">Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // Beautiful, rich local HTML slide player that runs locally in WebView!
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      <title>${course.title}</title>
      <style>
        body {
          background-color: #0f172a;
          color: #f8fafc;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          margin: 0;
          padding: 24px;
          padding-bottom: 60px;
          box-sizing: border-box;
        }
        .header {
          margin-bottom: 24px;
          border-bottom: 1px solid #1e293b;
          padding-bottom: 16px;
        }
        .title {
          font-size: 22px;
          font-weight: 800;
          line-height: 1.3;
          color: #ffffff;
          margin: 0 0 8px 0;
        }
        .subtitle {
          font-size: 13px;
          color: #94a3b8;
          margin: 0;
          display: flex;
          align-items: center;
        }
        .badge {
          background-color: rgba(16, 185, 129, 0.1);
          color: #10b981;
          border: 1px solid rgba(16, 185, 129, 0.2);
          padding: 3px 8px;
          border-radius: 6px;
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          margin-right: 10px;
        }
        .progress-box {
          background: #1e293b;
          border: 1px solid rgba(148, 163, 184, 0.1);
          padding: 16px;
          border-radius: 16px;
          margin-bottom: 28px;
        }
        .progress-bar {
          height: 8px;
          background-color: #0f172a;
          border-radius: 4px;
          overflow: hidden;
          margin-top: 8px;
        }
        .progress-fill {
          height: 100%;
          background-color: #10b981;
          width: ${progress}%;
          transition: width 0.3s ease;
        }
        .progress-text {
          font-size: 12px;
          font-weight: 700;
          display: flex;
          justify-content: space-between;
          color: #e2e8f0;
        }
        .module-list {
          margin-top: 10px;
        }
        .module-card {
          background-color: #1e293b;
          border: 1px solid rgba(148, 163, 184, 0.05);
          border-radius: 16px;
          padding: 16px;
          margin-bottom: 14px;
          display: flex;
          align-items: flex-start;
          transition: border-color 0.2s ease;
        }
        .module-card:active {
          border-color: rgba(16, 185, 129, 0.4);
        }
        .checkbox-container {
          margin-right: 14px;
          margin-top: 2px;
        }
        .checkbox-input {
          appearance: none;
          -webkit-appearance: none;
          width: 22px;
          height: 22px;
          border: 2px solid #475569;
          border-radius: 6px;
          background-color: #0f172a;
          cursor: pointer;
          display: inline-block;
          position: relative;
          outline: none;
          transition: all 0.2s ease;
        }
        .checkbox-input:checked {
          background-color: #10b981;
          border-color: #10b981;
        }
        .checkbox-input:checked:after {
          content: '✓';
          font-size: 14px;
          font-weight: 900;
          color: #0f172a;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }
        .module-details {
          flex: 1;
        }
        .module-title {
          font-size: 15px;
          font-weight: 700;
          color: #ffffff;
          margin: 0 0 4px 0;
        }
        .module-description {
          font-size: 12px;
          color: #94a3b8;
          line-height: 1.5;
          margin: 0;
        }
        .footer-note {
          text-align: center;
          color: #64748b;
          font-size: 11px;
          margin-top: 40px;
          line-height: 1.6;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1 class="title">${course.title}</h1>
        <p class="subtitle">
          <span class="badge">${course.category}</span>
          Instructor: ${course.instructor.name}
        </p>
      </div>

      <div class="progress-box">
        <div class="progress-text">
          <span>Course Syllabus</span>
          <span id="progress-percent">${progress}%</span>
        </div>
        <div class="progress-bar">
          <div id="progress-indicator" class="progress-fill"></div>
        </div>
      </div>

      <div class="module-list">
        <!-- Slide 1 -->
        <div class="module-card">
          <div class="checkbox-container">
            <input type="checkbox" id="mod1" class="checkbox-input" onclick="updateProgress()" ${progress >= 20 ? 'checked' : ''} />
          </div>
          <div class="module-details">
            <h3 class="module-title">1. Course Introduction</h3>
            <p class="module-description">Understand curriculum foundations, operations scope, and tool setups for full-stack mobile systems.</p>
          </div>
        </div>

        <!-- Slide 2 -->
        <div class="module-card">
          <div class="checkbox-container">
            <input type="checkbox" id="mod2" class="checkbox-input" onclick="updateProgress()" ${progress >= 40 ? 'checked' : ''} />
          </div>
          <div class="module-details">
            <h3 class="module-title">2. State Modeling & Persistence</h3>
            <p class="module-description">Deep dive into local data stores like SecureStore, state managers, and dynamic layout caching.</p>
          </div>
        </div>

        <!-- Slide 3 -->
        <div class="module-card">
          <div class="checkbox-container">
            <input type="checkbox" id="mod3" class="checkbox-input" onclick="updateProgress()" ${progress >= 60 ? 'checked' : ''} />
          </div>
          <div class="module-details">
            <h3 class="module-title">3. Web Bridges & WebView Communication</h3>
            <p class="module-description">Build highly optimized bidirectional script injectors and postMessage schemas between native and web clients.</p>
          </div>
        </div>

        <!-- Slide 4 -->
        <div class="module-card">
          <div class="checkbox-container">
            <input type="checkbox" id="mod4" class="checkbox-input" onclick="updateProgress()" ${progress >= 80 ? 'checked' : ''} />
          </div>
          <div class="module-details">
            <h3 class="module-title">4. Native Feats & Device Integration</h3>
            <p class="module-description">Implement system notification permission alerts, networking listeners, and secure hardware configurations.</p>
          </div>
        </div>

        <!-- Slide 5 -->
        <div class="module-card">
          <div class="checkbox-container">
            <input type="checkbox" id="mod5" class="checkbox-input" onclick="updateProgress()" ${progress >= 100 ? 'checked' : ''} />
          </div>
          <div class="module-details">
            <h3 class="module-title">5. Production Release Scaling</h3>
            <p class="module-description">Assemble optimized production bundles, environment variables mapping, and complete setup documentation audits.</p>
          </div>
        </div>
      </div>

      <p class="footer-note">
        Interactive Courseware • House of Edtech<br/>
        Check off completed topics to update your Native student stats.
      </p>

      <script>
        function updateProgress() {
          const boxes = ['mod1', 'mod2', 'mod3', 'mod4', 'mod5'];
          let checkedCount = 0;
          
          boxes.forEach(id => {
            if (document.getElementById(id).checked) {
              checkedCount++;
            }
          });

          const computedProgress = Math.round((checkedCount / boxes.length) * 100);
          
          // Update local UI state
          document.getElementById('progress-percent').innerText = computedProgress + '%';
          document.getElementById('progress-indicator').style.width = computedProgress + '%';

          // Send message to React Native
          if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'PROGRESS_UPDATE',
              progress: computedProgress
            }));
          }
        }
      </script>
    </body>
    </html>
  `;

  return (
    <SafeAreaView className="flex-1 bg-slate-950" style={{ backgroundColor: '#020617', flex: 1 }}>
      <View className="flex-row justify-between items-center px-5 py-4 border-b border-slate-900 bg-slate-950">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 justify-center items-center"
        >
          <Text className="text-white text-lg font-bold">←</Text>
        </TouchableOpacity>
        <Text className="text-white text-sm font-black uppercase tracking-wider">Lesson Player</Text>
        <View className="w-10 h-10" />
      </View>

      <View className="flex-grow flex-1 relative bg-slate-950">
        {hasError ? (
          <View className="flex-1 justify-center items-center px-6 bg-slate-950">
            <Text className="text-4xl mb-4">⚠️</Text>
            <Text className="text-white font-extrabold text-lg mb-2">Lesson Player Failed to Load</Text>
            <Text className="text-slate-400 text-xs text-center mb-6 leading-normal">
              An error occurred while loading this module. Please check your system settings or reload.
            </Text>
            <TouchableOpacity
              onPress={handleRetry}
              className="bg-emerald-500 px-6 py-3 rounded-xl active:bg-emerald-600 shadow-md"
            >
              <Text className="text-slate-950 font-bold text-xs tracking-wider uppercase">
                Reload Lesson
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <WebView
            ref={webViewRef}
            source={{ html: htmlContent }}
            onMessage={handleMessage}
            onLoadStart={() => setWebViewLoading(true)}
            onLoadEnd={() => setWebViewLoading(false)}
            onError={() => setHasError(true)}
            onHttpError={() => setHasError(true)}
            className="flex-1"
            style={{ backgroundColor: '#0f172a' }}
            javaScriptEnabled={true}
            domStorageEnabled={true}
          />
        )}

        {webViewLoading && !hasError ? (
          <View className="absolute inset-0 bg-slate-950 justify-center items-center">
            <ActivityIndicator size="large" color="#10b981" />
            <Text className="text-slate-400 mt-4 text-xs font-semibold">Opening syllabus...</Text>
          </View>
        ) : null}
      </View>
    </SafeAreaView>
  );
}
