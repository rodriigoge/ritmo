import {
  fireEvent,
  render,
  screen,
  within,
} from '@testing-library/react-native';
import HomeScreen from '../app/(app)/index';
import {
  HomeLayoutProvider,
  useHomeLayout,
} from '../src/features/habits/homeLayout/HomeLayoutProvider';
import { HabitsProvider } from '../src/features/habits/hooks/useHabits';
import { HomeLayoutScreen } from '../src/features/profile/components/HomeLayoutScreen';
import { InMemoryHabitRepository } from './support/InMemoryHabitRepository';
import { TestAuth } from './support/TestAuth';
import { Text } from 'react-native';

jest.mock('expo-router', () => ({ useRouter: () => ({ push: jest.fn() }) }));

const mockStore = new Map<string, string>();
jest.mock('expo-sqlite/kv-store', () => ({
  __esModule: true,
  default: {
    getItemSync: (key: string) => mockStore.get(key) ?? null,
    setItemSync: (key: string, value: string) => mockStore.set(key, value),
  },
}));

function LayoutProbe() {
  return <Text testID="layout">{useHomeLayout().layout}</Text>;
}

describe('Home layout', () => {
  beforeEach(() => {
    mockStore.clear();
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2026, 10, 20, 12));
  });
  afterEach(() => jest.useRealTimers());

  it('switches to Minimalista and keeps it on the next launch', async () => {
    await render(
      <HomeLayoutProvider>
        <HomeLayoutScreen onBack={jest.fn()} />
        <LayoutProbe />
      </HomeLayoutProvider>,
    );
    expect(screen.getByRole('radio', { name: 'Padrão' })).toBeChecked();
    await fireEvent.press(screen.getByRole('radio', { name: 'Minimalista' }));
    expect(screen.getByRole('radio', { name: 'Minimalista' })).toBeChecked();
    expect(mockStore.get('ritmo.homeLayout')).toBe('minimal');

    await screen.unmount();
    await render(
      <HomeLayoutProvider>
        <LayoutProbe />
      </HomeLayoutProvider>,
    );
    expect(screen.getByTestId('layout')).toHaveTextContent('minimal');
  });

  it('shows streak and total as icons on the name line, and days stay tappable', async () => {
    mockStore.set('ritmo.homeLayout', 'minimal');
    const repository = new InMemoryHabitRepository();
    const habit = await repository.create({ name: 'Ler' });
    await repository.toggleCompletion(habit.id, '2026-11-19');
    await render(
      <TestAuth>
        <HabitsProvider repository={repository}>
          <HomeLayoutProvider>
            <HomeScreen />
          </HomeLayoutProvider>
        </HabitsProvider>
      </TestAuth>,
    );
    const card = within(await screen.findByTestId(`habit-${habit.id}`));
    expect(card.getByLabelText('1 dia seguido')).toBeOnTheScreen();
    expect(card.getByLabelText('1 conclusão')).toBeOnTheScreen();
    // No words, only the numbers next to the icons.
    expect(card.queryByText(/dia seguido|conclus/)).toBeNull();

    const days = card.getAllByRole('checkbox');
    expect(days).toHaveLength(6);
    await fireEvent.press(days[5]);
    expect(
      card.getByLabelText('2 dias seguidos, novo recorde'),
    ).toBeOnTheScreen();
    expect(await repository.getCompletions(habit.id)).toHaveLength(2);
  });
});
