import { render, screen } from '@testing-library/react-native';
import {
  completionRate,
  HabitStats,
} from '../src/features/habits/components/HabitStats';

// Noon local time, so the creation day is the same in any timezone.
const created = new Date(2026, 10, 8, 12).toISOString();
const TODAY = '2026-11-17';
const burst = () =>
  screen.queryByTestId('completion-burst', { includeHiddenElements: true });

describe('completionRate', () => {
  it('counts the creation day and today', () => {
    // 10 days from 8 to 17 of November, 5 of them done.
    expect(
      completionRate(
        ['2026-11-08', '2026-11-10', '2026-11-12', '2026-11-15', '2026-11-17'],
        created,
        TODAY,
      ),
    ).toBe(50);
    expect(completionRate(['2026-11-08'], created, '2026-11-08')).toBe(100);
    expect(completionRate([], created, TODAY)).toBe(0);
  });

  it('starts from the earliest completion when days before creation were marked', () => {
    // Created on the 8th, but marked from the 1st: 17 days, 9 done.
    const dates = [
      '2026-11-01',
      '2026-11-02',
      '2026-11-03',
      '2026-11-04',
      '2026-11-05',
      '2026-11-06',
      '2026-11-07',
      '2026-11-08',
      '2026-11-17',
    ];
    expect(completionRate(dates, created, TODAY)).toBe(53);
  });
});

describe('HabitStats', () => {
  const metrics = { totalCompletions: 5, currentStreak: 1, bestStreak: 3 };
  const dates = [
    '2026-11-08',
    '2026-11-10',
    '2026-11-12',
    '2026-11-15',
    '2026-11-17',
  ];

  it('shows completed days, the current streak and the rate', async () => {
    await render(
      <HabitStats
        metrics={metrics}
        completedDates={dates}
        createdAt={created}
        today={TODAY}
      />,
    );
    expect(screen.getByLabelText('5 dias concluídos')).toBeOnTheScreen();
    expect(screen.getByLabelText('1 dia seguido')).toBeOnTheScreen();
    expect(
      screen.getByLabelText('50% dos dias concluídos desde o início'),
    ).toBeOnTheScreen();
    expect(screen.getByLabelText('Melhor sequência: 3 dias')).toBeOnTheScreen();
  });

  it('celebrates a new record with confetti instead of a badge', async () => {
    const props = {
      metrics,
      completedDates: dates,
      createdAt: created,
      today: TODAY,
    };
    await render(<HabitStats {...props} />);
    expect(burst()).toBeNull();
    await screen.rerender(<HabitStats {...props} recordId={1} />);
    expect(burst()).toBeOnTheScreen();
    expect(screen.queryByText('NOVO RECORDE')).toBeNull();
  });
});
