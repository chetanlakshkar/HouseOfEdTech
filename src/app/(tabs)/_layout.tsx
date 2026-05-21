import React from 'react';
import { Tabs } from 'expo-router';
import { Platform, Text } from 'react-native';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#10b981', // Emerald 500
        tabBarInactiveTintColor: '#94a3b8', // Slate 400
        tabBarStyle: {
          backgroundColor: '#0f172a', // Slate 900
          borderTopColor: '#1e293b', // Slate 800
          paddingBottom: Platform.OS === 'ios' ? 24 : 8,
          paddingTop: 8,
          height: Platform.OS === 'ios' ? 88 : 64,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Catalog',
          tabBarLabel: 'Catalog',
          tabBarIcon: ({ focused }) => (
            <Text className="text-xl">{focused ? '📚' : '📖'}</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="bookmarks"
        options={{
          title: 'Bookmarks',
          tabBarLabel: 'Bookmarks',
          tabBarIcon: ({ focused }) => (
            <Text className="text-xl">{focused ? '⭐' : '☆'}</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarLabel: 'Profile',
          tabBarIcon: ({ focused }) => (
            <Text className="text-xl">{focused ? '👤' : '👤'}</Text>
          ),
        }}
      />
    </Tabs>
  );
}
