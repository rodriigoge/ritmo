import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import * as scheduler from './reminderScheduler';
import {
  DEFAULT_REMINDER,
  readReminderSettings,
  saveReminderSettings,
  type ReminderSettings,
} from './reminderSettings';

export type ReminderScheduler = Pick<
  typeof scheduler,
  | 'configureNotifications'
  | 'requestPermission'
  | 'hasPermission'
  | 'scheduleDailyReminder'
  | 'cancelDailyReminder'
>;

type Reminders = {
  settings: ReminderSettings;
  /** Resolves "denied" (and stays off) when notifications are blocked. */
  setEnabled: (enabled: boolean) => Promise<'ok' | 'denied'>;
  setTime: (hour: number, minute: number) => Promise<void>;
};

const RemindersContext = createContext<Reminders>({
  settings: DEFAULT_REMINDER,
  setEnabled: async () => 'ok',
  setTime: async () => {},
});

/**
 * Owns the daily reminder while someone is signed in: it re-schedules the
 * saved reminder on start (after a reinstall or an OS reset) and cancels it
 * on sign out, so a signed-out phone gets no nudges. The setting itself
 * stays saved on the device.
 */
export function RemindersProvider({
  children,
  service = scheduler,
}: {
  children: ReactNode;
  service?: ReminderScheduler;
}) {
  const [settings, setSettings] = useState(readReminderSettings);
  const latest = useRef(settings);

  useEffect(() => {
    service.configureNotifications();
    const saved = latest.current;
    void (async () => {
      if (saved.enabled && (await service.hasPermission()))
        await service.scheduleDailyReminder(saved.hour, saved.minute);
    })().catch(() => {});
    return () => {
      void service.cancelDailyReminder();
    };
  }, [service]);

  const value = useMemo<Reminders>(() => {
    function store(next: ReminderSettings) {
      latest.current = next;
      setSettings(next);
      saveReminderSettings(next);
    }
    return {
      settings,
      async setEnabled(enabled) {
        const current = latest.current;
        if (!enabled) {
          store({ ...current, enabled: false });
          await service.cancelDailyReminder();
          return 'ok';
        }
        if ((await service.requestPermission()) === 'denied') return 'denied';
        await service.scheduleDailyReminder(current.hour, current.minute);
        store({ ...current, enabled: true });
        return 'ok';
      },
      async setTime(hour, minute) {
        const next = { ...latest.current, hour, minute };
        store(next);
        if (next.enabled) await service.scheduleDailyReminder(hour, minute);
      },
    };
  }, [settings, service]);

  return (
    <RemindersContext.Provider value={value}>
      {children}
    </RemindersContext.Provider>
  );
}

export function useReminders(): Reminders {
  return useContext(RemindersContext);
}
