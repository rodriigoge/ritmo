import { act, render, screen } from '@testing-library/react-native';
import { AccessibilityInfo } from 'react-native';
import { DayStatus } from '../src/features/habits/components/DayStatus';

const TODAY = '2026-11-17';

function Day(props: { completed: boolean; date?: string; recordId?: number }) {
  return (
    <DayStatus
      date={props.date ?? TODAY}
      today={TODAY}
      habitName="Ler"
      completed={props.completed}
      recordId={props.recordId}
      onPress={() => {}}
    />
  );
}

const burst = () =>
  screen.queryByTestId('completion-burst', { includeHiddenElements: true });

describe('Completion feedback', () => {
  afterEach(() => jest.restoreAllMocks());

  it('bursts confetti when today is checked, not on first render', async () => {
    await render(<Day completed />);
    expect(burst()).toBeNull();

    await screen.rerender(<Day completed={false} />);
    expect(burst()).toBeNull();
    await screen.rerender(<Day completed />);
    expect(burst()).toBeOnTheScreen();
  });

  it('keeps past days calm', async () => {
    await render(<Day completed={false} date="2026-11-15" />);
    await screen.rerender(<Day completed date="2026-11-15" />);
    expect(burst()).toBeNull();
  });

  it('celebrates a new record even on an already checked day', async () => {
    await render(<Day completed />);
    await screen.rerender(<Day completed recordId={1} />);
    expect(burst()).toBeOnTheScreen();
  });

  it('skips confetti when the system asks for reduced motion', async () => {
    jest
      .spyOn(AccessibilityInfo, 'isReduceMotionEnabled')
      .mockResolvedValue(true);
    await render(<Day completed={false} />);
    await act(async () => {});
    await screen.rerender(<Day completed />);
    expect(burst()).toBeNull();
    expect(screen.getByRole('checkbox')).toBeChecked();
  });
});
