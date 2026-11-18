import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Local notifications only: scheduled on the device, no server or push
// token involved, and they keep firing with the app closed.

const REMINDER_ID = 'ritmo-daily-reminder';
const CHANNEL_ID = 'daily-reminder';

let configured = false;

/** Shows reminders as banners even while the app is open. */
export function configureNotifications(): void {
  if (configured) return;
  configured = true;
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
}

async function ensureChannel(): Promise<void> {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
    name: 'Lembrete diário',
    description: 'Um lembrete por dia para marcar seus hábitos.',
    importance: Notifications.AndroidImportance.DEFAULT,
  });
}

export type PermissionResult = 'granted' | 'denied';

/** Asks only when needed; resolves "denied" if the user said no before. */
export async function requestPermission(): Promise<PermissionResult> {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return 'granted';
  if (!current.canAskAgain) return 'denied';
  const asked = await Notifications.requestPermissionsAsync();
  return asked.granted ? 'granted' : 'denied';
}

export async function hasPermission(): Promise<boolean> {
  return (await Notifications.getPermissionsAsync()).granted;
}

/** Replaces any previous reminder with one at hour:minute every day. */
export async function scheduleDailyReminder(
  hour: number,
  minute: number,
): Promise<void> {
  await ensureChannel();
  await cancelDailyReminder();
  await Notifications.scheduleNotificationAsync({
    identifier: REMINDER_ID,
    content: {
      title: 'Hora de marcar seus hábitos',
      body: 'O Pingo está de olho no seu ritmo. Marque o que você já fez hoje.',
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
      channelId: CHANNEL_ID,
    },
  });
}

export async function cancelDailyReminder(): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(REMINDER_ID).catch(
    () => {},
  );
}
