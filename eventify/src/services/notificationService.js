import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function requestNotificationPermissions() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  return finalStatus === 'granted';
}

export async function scheduleBookingConfirmation(eventName) {
  const hasPermission = await requestNotificationPermissions();
  if (!hasPermission) {
    console.log(
      'Notification permission not granted. Skipping booking confirmation notification.'
    );
    return;
  }

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Booking Confirmed 🎟️',
      body: `Your ticket for ${eventName} is booked!`,
    },
    trigger: null, // fires immediately
  });
}

export async function scheduleEventReminder(eventName, eventDate) {
  const hasPermission = await requestNotificationPermissions();
  if (!hasPermission) {
    console.log(
      'Notification permission not granted. Skipping event reminder notification.'
    );
    return;
  }

  const triggerDate = new Date(eventDate.getTime() - 12 * 60 * 60 * 1000); // 12 hours before
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Event Reminder',
      body: `${eventName} starts in 12 hours!`,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: triggerDate,
    },
  });
}

export async function scheduleEventReminderDemo(eventName) {
  const hasPermission = await requestNotificationPermissions();
  if (!hasPermission) {
    console.log(
      'Notification permission not granted. Skipping event reminder demo notification.'
    );
    return;
  }

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Event Reminder (Demo) 🔔',
      body: `Your event ${eventName} is starting soon!`,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 10,
    },
  });
}
