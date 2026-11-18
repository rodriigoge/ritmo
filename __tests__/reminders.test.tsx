import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';
import { NotificationsScreen } from '../src/features/reminders/NotificationsScreen';
import {
  RemindersProvider,
  useReminders,
  type ReminderScheduler,
} from '../src/features/reminders/RemindersProvider';
import { formatReminderTime } from '../src/features/reminders/reminderSettings';

const mockStore = new Map<string, string>();
jest.mock('expo-sqlite/kv-store', () => ({
  __esModule: true,
  default: {
    getItemSync: (key: string) => mockStore.get(key) ?? null,
    setItemSync: (key: string, value: string) => mockStore.set(key, value),
  },
}));

function fakeScheduler(
  overrides: Partial<jest.Mocked<ReminderScheduler>> = {},
): jest.Mocked<ReminderScheduler> {
  return {
    configureNotifications: jest.fn(),
    requestPermission: jest.fn(async () => 'granted' as const),
    hasPermission: jest.fn(async () => true),
    scheduleDailyReminder: jest.fn(
      async (_hour: number, _minute: number) => {},
    ),
    cancelDailyReminder: jest.fn(async () => {}),
    ...overrides,
  };
}

function TimeProbe() {
  const { settings, setTime } = useReminders();
  return (
    <Text onPress={() => void setTime(7, 5)}>
      probe:{formatReminderTime(settings)}
    </Text>
  );
}

async function renderScreen(service: ReminderScheduler) {
  await render(
    <RemindersProvider service={service}>
      <NotificationsScreen onBack={jest.fn()} />
      <TimeProbe />
    </RemindersProvider>,
  );
  await act(async () => {});
}

describe('Daily reminder', () => {
  beforeEach(() => mockStore.clear());

  it('starts off at 20:00 and schedules after permission is granted', async () => {
    const service = fakeScheduler();
    await renderScreen(service);
    const toggle = screen.getByLabelText('Lembrete diário');
    expect(toggle.props.value).toBe(false);
    expect(
      screen.getByRole('button', { name: 'Horário, 20:00' }),
    ).toBeDisabled();

    await fireEvent(toggle, 'valueChange', true);
    expect(service.requestPermission).toHaveBeenCalled();
    expect(service.scheduleDailyReminder).toHaveBeenCalledWith(20, 0);
    expect(screen.getByLabelText('Lembrete diário').props.value).toBe(true);
    expect(JSON.parse(mockStore.get('ritmo.reminder')!)).toEqual({
      enabled: true,
      hour: 20,
      minute: 0,
    });
  });

  it('moves the reminder when the time changes', async () => {
    mockStore.set(
      'ritmo.reminder',
      JSON.stringify({ enabled: true, hour: 20, minute: 0 }),
    );
    const service = fakeScheduler();
    await renderScreen(service);
    // The saved reminder is restored on start.
    expect(service.scheduleDailyReminder).toHaveBeenCalledWith(20, 0);

    await fireEvent.press(screen.getByText('probe:20:00'));
    expect(service.scheduleDailyReminder).toHaveBeenLastCalledWith(7, 5);
    expect(
      screen.getByRole('button', { name: 'Horário, 07:05' }),
    ).toBeOnTheScreen();
  });

  it('stays off and explains how to unblock when permission is denied', async () => {
    const service = fakeScheduler({
      requestPermission: jest.fn(async () => 'denied' as const),
    });
    await renderScreen(service);
    await fireEvent(
      screen.getByLabelText('Lembrete diário'),
      'valueChange',
      true,
    );
    expect(service.scheduleDailyReminder).not.toHaveBeenCalled();
    expect(screen.getByLabelText('Lembrete diário').props.value).toBe(false);
    expect(screen.getByRole('alert')).toHaveTextContent(/bloqueadas/);
    expect(
      screen.getByRole('button', { name: 'Abrir configurações' }),
    ).toBeOnTheScreen();
  });

  it('cancels the reminder when turned off and on sign out', async () => {
    mockStore.set(
      'ritmo.reminder',
      JSON.stringify({ enabled: true, hour: 9, minute: 30 }),
    );
    const service = fakeScheduler();
    await renderScreen(service);
    await fireEvent(
      screen.getByLabelText('Lembrete diário'),
      'valueChange',
      false,
    );
    expect(service.cancelDailyReminder).toHaveBeenCalledTimes(1);

    await screen.unmount();
    expect(service.cancelDailyReminder).toHaveBeenCalledTimes(2);
  });

  it('ignores a corrupted saved setting', async () => {
    mockStore.set('ritmo.reminder', '{"enabled": true, "hour": 99}');
    await renderScreen(fakeScheduler());
    expect(screen.getByText('probe:20:00')).toBeOnTheScreen();
  });
});
