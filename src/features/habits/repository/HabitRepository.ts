import type { LocalDate } from '../../../shared/date/LocalDate';
import type { Habit } from '../domain/Habit';
import type { HabitCompletion } from '../domain/HabitCompletion';
import type { CreateHabitInput, UpdateHabitInput } from '../domain/HabitInput';

export type HabitWithCompletedDates = Habit & { completedDates: LocalDate[] };

export type ImportHabitInput = {
  name: string;
  /** Kept for new habits; null means "now". */
  createdAt: string | null;
  completedDates: readonly LocalDate[];
};

export type ImportResult = {
  createdHabits: number;
  /** Habits that already existed (same name) and only gained days. */
  mergedHabits: number;
  /** Days actually added; days already marked are not counted. */
  addedDays: number;
};

export interface HabitRepository {
  findAll(): Promise<Habit[]>;
  /** All habits with their completed dates, ascending, in one request. */
  findAllWithCompletedDates(): Promise<HabitWithCompletedDates[]>;
  findById(id: string): Promise<Habit | null>;
  create(input: CreateHabitInput): Promise<Habit>;
  update(id: string, input: UpdateHabitInput): Promise<Habit>;
  delete(id: string): Promise<void>;
  getCompletions(habitId: string): Promise<HabitCompletion[]>;
  getCompletionsBetween(
    habitId: string,
    startDate: LocalDate,
    endDate: LocalDate,
  ): Promise<HabitCompletion[]>;
  toggleCompletion(habitId: string, date: LocalDate): Promise<boolean>;
  /** Adds habits from an import. A habit whose name matches an existing
   * one (ignoring case) is merged into it instead of duplicated. */
  importHabits(habits: readonly ImportHabitInput[]): Promise<ImportResult>;
}
