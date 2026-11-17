import type { LocalDate } from '../../src/shared/date/LocalDate';
import {
  addDays,
  differenceInCalendarDays,
  getToday,
  toLocalDate,
} from '../../src/shared/date/dateUtils';
import type { Habit } from '../../src/features/habits/domain/Habit';
import type { HabitCompletion } from '../../src/features/habits/domain/HabitCompletion';
import {
  normalizeHabitName,
  type CreateHabitInput,
  type UpdateHabitInput,
} from '../../src/features/habits/domain/HabitInput';
import { validateCompletionDate } from '../../src/features/habits/domain/validateCompletionDate';
import type {
  HabitRepository,
  HabitWithCompletedDates,
} from '../../src/features/habits/repository/HabitRepository';

/** Test double with the same contract as the Supabase repository and its
 * SQL (cascade delete, one completion per day, no future dates). */
export class InMemoryHabitRepository implements HabitRepository {
  private habits: Habit[] = [];
  private completions: HabitCompletion[] = [];
  private sequence = 0;

  private nextId(): string {
    this.sequence += 1;
    return `id-${this.sequence}`;
  }

  private requireHabit(id: string): Habit {
    const habit = this.habits.find((item) => item.id === id);
    if (!habit) throw new Error('Habit not found.');
    return habit;
  }

  private byDate(habitId: string): HabitCompletion[] {
    return this.completions
      .filter((item) => item.habitId === habitId)
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((item) => ({ ...item }));
  }

  async findAll(): Promise<Habit[]> {
    return this.habits.map((habit) => ({ ...habit }));
  }

  async findAllWithCompletedDates(): Promise<HabitWithCompletedDates[]> {
    const habits = await this.findAll();
    return habits.map((habit) => ({
      ...habit,
      completedDates: this.byDate(habit.id).map((item) => item.date),
    }));
  }

  async findById(id: string): Promise<Habit | null> {
    const habit = this.habits.find((item) => item.id === id);
    return habit ? { ...habit } : null;
  }

  async create(input: CreateHabitInput): Promise<Habit> {
    const timestamp = new Date().toISOString();
    const habit = {
      id: this.nextId(),
      name: normalizeHabitName(input.name),
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    this.habits.push(habit);
    return { ...habit };
  }

  async update(id: string, input: UpdateHabitInput): Promise<Habit> {
    const name = normalizeHabitName(input.name);
    const habit = this.requireHabit(id);
    habit.name = name;
    habit.updatedAt = new Date().toISOString();
    return { ...habit };
  }

  async delete(id: string): Promise<void> {
    this.habits = this.habits.filter((habit) => habit.id !== id);
    this.completions = this.completions.filter((item) => item.habitId !== id);
  }

  async getCompletions(habitId: string): Promise<HabitCompletion[]> {
    return this.byDate(habitId);
  }

  async getCompletionsBetween(
    habitId: string,
    startDate: LocalDate,
    endDate: LocalDate,
  ): Promise<HabitCompletion[]> {
    if (differenceInCalendarDays(startDate, endDate) > 0) {
      throw new RangeError('Start date cannot be after end date.');
    }
    return this.byDate(habitId).filter(
      (item) => item.date >= startDate && item.date <= endDate,
    );
  }

  async toggleCompletion(habitId: string, date: LocalDate): Promise<boolean> {
    addDays(date, 0);
    const habit = this.requireHabit(habitId);
    const existing = this.completions.findIndex(
      (item) => item.habitId === habitId && item.date === date,
    );
    if (existing >= 0) {
      this.completions.splice(existing, 1);
      return false;
    }
    validateCompletionDate(
      date,
      toLocalDate(new Date(habit.createdAt)),
      getToday(),
    );
    this.completions.push({
      id: this.nextId(),
      habitId,
      date,
      createdAt: new Date().toISOString(),
    });
    return true;
  }
}
