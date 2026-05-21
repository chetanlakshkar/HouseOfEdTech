import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// 1. Configure standard local notification presentation rules
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// 2. Request Notifications permissions
export async function requestNotificationPermissions(): Promise<boolean> {
  if (Platform.OS === 'web') return false;

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.warn('Notification permissions denied.');
    return false;
  }

  // Configure android channels
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#10b981',
    });
  }

  return true;
}

// 3. Trigger bookmark milestone notification (when bookmarks reaches 5+)
export async function triggerBookmarkNotification(count: number) {
  try {
    const permissionGranted = await requestNotificationPermissions();
    if (!permissionGranted) return;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: '⭐ Bookmark Milestone Achieved!',
        body: `Congratulations! You have bookmarked ${count} courses. Resume your learning modules today!`,
        sound: true,
      },
      trigger: null, // trigger immediately
    });
  } catch (err) {
    console.error('Failed to trigger bookmark milestone notification:', err);
  }
}

// 4. Schedule 24-hour inactivity reminder
// This cancels any existing inactivity notification and schedules a fresh one for exactly 24 hours from now.
export async function scheduleInactivityReminder() {
  try {
    const permissionGranted = await requestNotificationPermissions();
    if (!permissionGranted) return;

    // Cancel all previously scheduled reminders to prevent duplicates
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    const reminderIds = scheduled
      .filter((n) => n.content.title === '📚 Resume Your Learning Journey!')
      .map((n) => n.identifier);

    for (const id of reminderIds) {
      await Notifications.cancelScheduledNotificationAsync(id);
    }

    // Schedule new inactivity reminder for 24 hours (86400 seconds) from now
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '📚 Resume Your Learning Journey!',
        body: "It has been 24 hours since you last opened House of Edtech. Don't break your streak! Continue your courses now.",
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 86400, // 24 hours
        repeats: false,
      },
    });
    console.log('Successfully scheduled inactivity reminder in 24 hours.');
  } catch (err) {
    console.error('Failed to schedule inactivity reminder:', err);
  }
}
