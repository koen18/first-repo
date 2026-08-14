import * as Notifications from 'expo-notifications';

const DAILY_REMINDER_ID = 'daily-study-reminder';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function requestNotificationPermission(): Promise<boolean> {
  const existing = await Notifications.getPermissionsAsync();
  if (existing.granted) return true;
  const result = await Notifications.requestPermissionsAsync();
  return result.granted;
}

export async function scheduleDailyReminder(time: string): Promise<boolean> {
  const granted = await requestNotificationPermission();
  if (!granted) return false;

  const [hour, minute] = time.split(':').map(Number);
  await Notifications.cancelScheduledNotificationAsync(DAILY_REMINDER_ID).catch(() => {});
  await Notifications.scheduleNotificationAsync({
    identifier: DAILY_REMINDER_ID,
    content: {
      title: '📚 Study time',
      body: "Check today's tasks and study sessions in your planner.",
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
      hour: Number.isFinite(hour) ? hour : 16,
      minute: Number.isFinite(minute) ? minute : 0,
      repeats: true,
    },
  });
  return true;
}

export async function cancelDailyReminder(): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(DAILY_REMINDER_ID).catch(() => {});
}
