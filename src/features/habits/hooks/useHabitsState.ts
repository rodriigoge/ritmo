import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, LayoutAnimation } from 'react-native';
import * as Haptics from 'expo-haptics';
import { getToday, toLocalDate } from '../../../shared/date/dateUtils';
import type { LocalDate } from '../../../shared/date/LocalDate';
import type { Habit } from '../domain/Habit';
import { normalizeHabitName } from '../domain/HabitInput';
import { validateCompletionDate } from '../domain/validateCompletionDate';
import type {
  HabitRepository,
  ImportHabitInput,
} from '../repository/HabitRepository';
import { calculateHabitMetrics } from '../domain/calculateHabitMetrics';

export type HabitWithHistory = Habit & { completedDates: LocalDate[] };
type PendingDay = {
  habitId: string;
  settled?: Promise<void>;
  confirmed: boolean;
  desired: boolean;
  revision: number;
};

function animateHabitListChange() {
  LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
}

export function useHabitsState(repository: HabitRepository) {
  const [habits, setHabits] = useState<HabitWithHistory[]>([]);
  const history = useRef<HabitWithHistory[]>([]);
  const deleting = useRef(new Set<string>());
  const pending = useRef(new Map<string, PendingDay>());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [completionError, setCompletionError] = useState<{
    habitId: string;
    message: string;
  }>();
  const [recordFeedback, setRecordFeedback] = useState<{
    habitId: string;
    id: number;
  }>();
  const recordId = useRef(0);
  const [orderError, setOrderError] = useState<string>();
  const orderRevision = useRef(0);
  const orderWrites = useRef<Promise<void>>(Promise.resolve());
  // Last order the server accepted in this session (undefined: as loaded).
  const savedOrder = useRef<string[] | undefined>(undefined);
  const recordTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [today, setToday] = useState(getToday);
  const [attempt, setAttempt] = useState(0);

  // Event callbacks need the latest optimistic history even before React renders.
  const updateHabits = useCallback(
    (update: (current: HabitWithHistory[]) => HabitWithHistory[]) => {
      history.current = update(history.current);
      setHabits(history.current);
    },
    [],
  );

  const refresh = useCallback(() => {
    setLoading(true);
    setError(undefined);
    setAttempt((value) => value + 1);
  }, []);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const result = await repository.findAllWithCompletedDates();
        if (active) updateHabits(() => result);
      } catch {
        if (active)
          setError('Não foi possível carregar seus hábitos. Tente novamente.');
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    return () => {
      active = false;
    };
  }, [repository, attempt, updateHabits]);

  useEffect(
    () => () => {
      if (recordTimer.current) clearTimeout(recordTimer.current);
    },
    [],
  );

  useEffect(() => {
    const updateDay = () => setToday(getToday());
    const interval = setInterval(updateDay, 60_000);
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') updateDay();
    });
    return () => {
      clearInterval(interval);
      subscription.remove();
    };
  }, []);

  async function createHabit(name: string) {
    const habit = await repository.create({ name: normalizeHabitName(name) });
    animateHabitListChange();
    updateHabits((current) => [...current, { ...habit, completedDates: [] }]);
  }

  /** Moves a habit on the Home right away, then saves the whole order.
   * Saves run one at a time; if the latest one fails, the list goes back
   * to the last order the server accepted. */
  function moveHabit(from: number, to: number) {
    const current = history.current;
    if (
      from === to ||
      from < 0 ||
      to < 0 ||
      from >= current.length ||
      to >= current.length
    )
      return;
    const previousIds = current.map((habit) => habit.id);
    const next = [...current];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    updateHabits(() => next);
    setOrderError(undefined);

    const ids = next.map((habit) => habit.id);
    const revision = ++orderRevision.current;
    orderWrites.current = orderWrites.current
      .catch(() => {})
      .then(async () => {
        try {
          await repository.reorder(ids);
          savedOrder.current = ids;
        } catch {
          if (revision !== orderRevision.current) return;
          const restore = savedOrder.current ?? previousIds;
          const rank = new Map(restore.map((id, index) => [id, index]));
          updateHabits((list) =>
            [...list].sort(
              (a, b) =>
                (rank.get(a.id) ?? Number.MAX_SAFE_INTEGER) -
                (rank.get(b.id) ?? Number.MAX_SAFE_INTEGER),
            ),
          );
          setOrderError(
            'Não foi possível salvar a nova ordem. Tente novamente.',
          );
        }
      });
  }

  async function updateHabit(id: string, name: string) {
    const updated = await repository.update(id, {
      name: normalizeHabitName(name),
    });
    updateHabits((current) =>
      current.map((habit) =>
        habit.id === id ? { ...habit, ...updated } : habit,
      ),
    );
  }

  async function deleteHabit(id: string) {
    if (deleting.current.has(id)) return;
    deleting.current.add(id);
    try {
      // Finish this habit's queued toggles before deleting; the database cascades.
      await Promise.all(
        [...pending.current.values()]
          .filter((item) => item.habitId === id)
          .map((item) => item.settled),
      );
      await repository.delete(id);
      animateHabitListChange();
      updateHabits((current) => current.filter((habit) => habit.id !== id));
      setCompletionError((current) =>
        current?.habitId === id ? undefined : current,
      );
    } finally {
      deleting.current.delete(id);
    }
  }

  function setDay(habitId: string, date: LocalDate, completed: boolean) {
    updateHabits((current) =>
      current.map((habit) => {
        if (habit.id !== habitId) return habit;
        const dates = habit.completedDates.filter((item) => item !== date);
        return {
          ...habit,
          completedDates: completed ? [...dates, date] : dates,
        };
      }),
    );
  }

  function announceRecord(habitId: string) {
    if (recordTimer.current) clearTimeout(recordTimer.current);
    setRecordFeedback({ habitId, id: ++recordId.current });
    void Haptics.notificationAsync(
      Haptics.NotificationFeedbackType.Success,
    ).catch(() => {});
    recordTimer.current = setTimeout(() => {
      setRecordFeedback(undefined);
      recordTimer.current = null;
    }, 850);
  }

  function toggleDay(habitId: string, date: LocalDate) {
    const habit = history.current.find((item) => item.id === habitId);
    if (!habit || deleting.current.has(habitId)) return;
    const currentDay = getToday();
    setToday(currentDay);
    try {
      validateCompletionDate(
        date,
        toLocalDate(new Date(habit.createdAt)),
        currentDay,
      );
    } catch {
      setCompletionError({
        habitId,
        message: 'Essa data não está disponível para conclusão.',
      });
      return;
    }
    setCompletionError(undefined);
    const previousBest = calculateHabitMetrics(
      habit.completedDates,
      currentDay,
    ).bestStreak;
    const completed = habit.completedDates.includes(date);
    setDay(habitId, date, !completed);
    // Celebrate on the tap, from the optimistic history, instead of waiting
    // for the server round trip; a failed write still rolls the day back.
    if (!completed) {
      const updated = history.current.find((item) => item.id === habitId);
      const nextBest = updated
        ? calculateHabitMetrics(updated.completedDates, currentDay).bestStreak
        : previousBest;
      if (nextBest > previousBest) announceRecord(habitId);
    }
    const key = JSON.stringify([habitId, date]);
    const existing = pending.current.get(key);
    if (existing) {
      existing.desired = !completed;
      existing.revision += 1;
      return;
    }
    const operation: PendingDay = {
      habitId,
      confirmed: completed,
      desired: !completed,
      revision: 0,
    };
    pending.current.set(key, operation);

    async function persist() {
      try {
        // One write per date at a time. Further taps change the desired state
        // immediately; redundant intermediate states do not need extra writes.
        while (operation.desired !== operation.confirmed) {
          const revision = operation.revision;
          operation.confirmed = await repository.toggleCompletion(
            habitId,
            date,
          );
          if (operation.revision === revision)
            operation.desired = operation.confirmed;
        }
        setDay(habitId, date, operation.confirmed);
      } catch {
        // Restore only this date, preserving concurrent edits on other dates.
        setDay(habitId, date, operation.confirmed);
        setCompletionError({
          habitId,
          message: 'Não foi possível salvar a conclusão. Tente novamente.',
        });
      } finally {
        pending.current.delete(key);
      }
    }
    operation.settled = persist();
  }

  /** Imports habits from a file, then reloads the list from the server. */
  async function importHabits(items: readonly ImportHabitInput[]) {
    const result = await repository.importHabits(items);
    refresh();
    return result;
  }

  return {
    moveHabit,
    orderError,
    importHabits,
    habits,
    loading,
    error,
    completionError,
    recordFeedback,
    today,
    refresh,
    createHabit,
    updateHabit,
    deleteHabit,
    toggleDay,
  };
}
