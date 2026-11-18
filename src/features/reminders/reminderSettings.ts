import Storage from 'expo-sqlite/kv-store';

/** The one reminder Ritmo has: on/off and a time of day. */
export type ReminderSettings = {
  enabled: boolean;
  hour: number;
  minute: number;
};

export const DEFAULT_REMINDER: ReminderSettings = {
  enabled: false,
  hour: 20,
  minute: 0,
};

const REMINDER_KEY = 'ritmo.reminder';

const isClock = (value: unknown, max: number): value is number =>
  Number.isInteger(value) && (value as number) >= 0 && (value as number) <= max;

// Kept on the device, like the notification it schedules.
export function readReminderSettings(): ReminderSettings {
  try {
    const raw = Storage.getItemSync(REMINDER_KEY);
    if (!raw) return DEFAULT_REMINDER;
    const value = JSON.parse(raw) as Partial<ReminderSettings>;
    return {
      enabled: value.enabled === true,
      hour: isClock(value.hour, 23) ? value.hour : DEFAULT_REMINDER.hour,
      minute: isClock(value.minute, 59)
        ? value.minute
        : DEFAULT_REMINDER.minute,
    };
  } catch {
    return DEFAULT_REMINDER;
  }
}

export function saveReminderSettings(settings: ReminderSettings): void {
  try {
    Storage.setItemSync(REMINDER_KEY, JSON.stringify(settings));
  } catch {
    // Not persisting only means the reminder is off on the next launch.
  }
}

export function formatReminderTime({ hour, minute }: ReminderSettings): string {
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}
