import { act, fireEvent, render, screen } from '@testing-library/react-native';
import HomeScreen from '../app/(app)/index';
import {
  dropIndex,
  travel,
} from '../src/design-system/components/ReorderableList/ReorderableList';
import { HabitsProvider } from '../src/features/habits/hooks/useHabits';
import { InMemoryHabitRepository } from './support/InMemoryHabitRepository';
import { TestAuth } from './support/TestAuth';

jest.mock('expo-router', () => ({ useRouter: () => ({ push: jest.fn() }) }));

// Three 100px rows with a 10px gap.
const rows = [
  { y: 0, height: 100 },
  { y: 110, height: 100 },
  { y: 220, height: 100 },
];

describe('drop math', () => {
  it('lands where the dragged middle crosses the other middles', () => {
    expect(dropIndex(rows, 0, 50)).toBe(0);
    expect(dropIndex(rows, 0, 161)).toBe(1);
    expect(dropIndex(rows, 0, 280)).toBe(2);
    expect(dropIndex(rows, 2, 40)).toBe(0);
  });

  it('travels the height and gap of every row it passes', () => {
    expect(travel(rows, 0, 2, 10)).toBe(220);
    expect(travel(rows, 2, 0, 10)).toBe(-220);
    expect(travel(rows, 1, 1, 10)).toBe(0);
  });
});

describe('Reordering habits on the Home', () => {
  let repository: InMemoryHabitRepository;

  beforeEach(async () => {
    repository = new InMemoryHabitRepository();
    for (const name of ['Ler', 'Correr', 'Meditar'])
      await repository.create({ name });
  });

  async function renderHome() {
    await render(
      <TestAuth>
        <HabitsProvider repository={repository}>
          <HomeScreen />
        </HabitsProvider>
      </TestAuth>,
    );
    await screen.findByText('Meditar');
  }

  const order = () =>
    screen
      .getAllByRole('header')
      .map((item) => item.props.children)
      .filter((name) => name !== 'Meus hábitos');

  it('shows a grip on each card with move actions for screen readers', async () => {
    await renderHome();
    const first = screen.getByLabelText('Reordenar Ler');
    expect(first.props.accessibilityActions).toEqual([
      { name: 'moveDown', label: 'Mover para baixo' },
    ]);
    expect(
      screen.getByLabelText('Reordenar Correr').props.accessibilityActions,
    ).toHaveLength(2);
  });

  it('moves a habit at once and saves the new order', async () => {
    await renderHome();
    await act(async () => {
      fireEvent(screen.getByLabelText('Reordenar Ler'), 'accessibilityAction', {
        nativeEvent: { actionName: 'moveDown' },
      });
    });
    expect(order()).toEqual(['Correr', 'Ler', 'Meditar']);
    expect((await repository.findAll()).map((habit) => habit.name)).toEqual([
      'Correr',
      'Ler',
      'Meditar',
    ]);
  });

  it('puts the habit back and explains when saving fails', async () => {
    jest
      .spyOn(InMemoryHabitRepository.prototype, 'reorder')
      .mockRejectedValueOnce(new Error('offline'));
    await renderHome();
    await act(async () => {
      fireEvent(
        screen.getByLabelText('Reordenar Meditar'),
        'accessibilityAction',
        { nativeEvent: { actionName: 'moveUp' } },
      );
    });
    expect(order()).toEqual(['Ler', 'Correr', 'Meditar']);
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Não foi possível salvar a nova ordem. Tente novamente.',
    );
  });

  it('hides the grip when there is a single habit', async () => {
    repository = new InMemoryHabitRepository();
    await repository.create({ name: 'Ler' });
    await render(
      <TestAuth>
        <HabitsProvider repository={repository}>
          <HomeScreen />
        </HabitsProvider>
      </TestAuth>,
    );
    await screen.findByText('Ler');
    expect(screen.queryByLabelText('Reordenar Ler')).toBeNull();
  });
});
