import type { SupabaseClient } from '@supabase/supabase-js';
import type { LocalDate } from '../../../shared/date/LocalDate';
import {
  addDays,
  differenceInCalendarDays,
} from '../../../shared/date/dateUtils';
import type { Database } from '../../../shared/supabase/database.types';
import type { Habit } from '../domain/Habit';
import type { HabitCompletion } from '../domain/HabitCompletion';
import {
  normalizeHabitName,
  type CreateHabitInput,
  type UpdateHabitInput,
} from '../domain/HabitInput';
import type {
  HabitRepository,
  HabitWithCompletedDates,
  ImportHabitInput,
  ImportResult,
} from './HabitRepository';

// Keeps each request well under PostgREST's payload limits.
const IMPORT_CHUNK = 500;

function chunks<T>(items: readonly T[], size: number): T[][] {
  const result: T[][] = [];
  for (let index = 0; index < items.length; index += size)
    result.push(items.slice(index, index + size));
  return result;
}

export const habitNameKey = (name: string) =>
  name.trim().toLocaleLowerCase('pt-BR');

type HabitRow = Pick<
  Database['public']['Tables']['habits']['Row'],
  'id' | 'name' | 'created_at' | 'updated_at'
>;
type CompletionRow = Pick<
  Database['public']['Tables']['habit_completions']['Row'],
  'id' | 'habit_id' | 'date' | 'created_at'
>;

const HABIT_COLUMNS = 'id, name, created_at, updated_at';
const COMPLETION_COLUMNS = 'id, habit_id, date, created_at';

function toHabit(row: HabitRow): Habit {
  return {
    id: row.id,
    name: row.name,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toCompletion(row: CompletionRow): HabitCompletion {
  return {
    id: row.id,
    habitId: row.habit_id,
    date: row.date,
    createdAt: row.created_at,
  };
}

// PostgREST errors are plain objects; rethrow as Error for callers and logs.
function fail(error: { message: string }): never {
  throw new Error(error.message);
}

/** Habits stored in Supabase Postgres. Row level security scopes every
 * query to the signed-in user, so no user id is passed around here. */
export class SupabaseHabitRepository implements HabitRepository {
  constructor(private readonly client: SupabaseClient<Database>) {}

  async findAll(): Promise<Habit[]> {
    const { data, error } = await this.client
      .from('habits')
      .select(HABIT_COLUMNS)
      .order('position')
      .order('created_at')
      .order('id');
    if (error) fail(error);
    return data.map(toHabit);
  }

  async findAllWithCompletedDates(): Promise<HabitWithCompletedDates[]> {
    const { data, error } = await this.client
      .from('habits')
      .select(`${HABIT_COLUMNS}, habit_completions(date)`)
      .order('position')
      .order('created_at')
      .order('id')
      .order('date', { referencedTable: 'habit_completions' });
    if (error) fail(error);
    return data.map(({ habit_completions, ...row }) => ({
      ...toHabit(row),
      completedDates: habit_completions.map((item) => item.date),
    }));
  }

  async findById(id: string): Promise<Habit | null> {
    const { data, error } = await this.client
      .from('habits')
      .select(HABIT_COLUMNS)
      .eq('id', id)
      .maybeSingle();
    if (error) fail(error);
    return data ? toHabit(data) : null;
  }

  async create(input: CreateHabitInput): Promise<Habit> {
    const { data, error } = await this.client
      .from('habits')
      .insert({ name: normalizeHabitName(input.name) })
      .select(HABIT_COLUMNS)
      .single();
    if (error) fail(error);
    return toHabit(data);
  }

  async update(id: string, input: UpdateHabitInput): Promise<Habit> {
    const { data, error } = await this.client
      .from('habits')
      .update({ name: normalizeHabitName(input.name) })
      .eq('id', id)
      .select(HABIT_COLUMNS)
      .maybeSingle();
    if (error) fail(error);
    if (!data) throw new Error('Habit not found.');
    return toHabit(data);
  }

  // Deleting an absent habit is an idempotent no-op; completions cascade.
  async delete(id: string): Promise<void> {
    const { error } = await this.client.from('habits').delete().eq('id', id);
    if (error) fail(error);
  }

  async getCompletions(habitId: string): Promise<HabitCompletion[]> {
    const { data, error } = await this.client
      .from('habit_completions')
      .select(COMPLETION_COLUMNS)
      .eq('habit_id', habitId)
      .order('date');
    if (error) fail(error);
    return data.map(toCompletion);
  }

  async getCompletionsBetween(
    habitId: string,
    startDate: LocalDate,
    endDate: LocalDate,
  ): Promise<HabitCompletion[]> {
    if (differenceInCalendarDays(startDate, endDate) > 0) {
      throw new RangeError('Start date cannot be after end date.');
    }
    const { data, error } = await this.client
      .from('habit_completions')
      .select(COMPLETION_COLUMNS)
      .eq('habit_id', habitId)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date');
    if (error) fail(error);
    return data.map(toCompletion);
  }

  async toggleCompletion(habitId: string, date: LocalDate): Promise<boolean> {
    addDays(date, 0); // Rejects malformed dates before any request.
    const { data, error } = await this.client.rpc('toggle_habit_completion', {
      p_habit_id: habitId,
      p_date: date,
    });
    if (error) fail(error);
    return data;
  }

  async reorder(ids: readonly string[]): Promise<void> {
    const { error } = await this.client.rpc('reorder_habits', {
      p_ids: [...ids],
    });
    if (error) fail(error);
  }

  async importHabits(
    habits: readonly ImportHabitInput[],
  ): Promise<ImportResult> {
    const existing = new Map(
      (await this.findAll()).map((habit) => [
        habitNameKey(habit.name),
        habit.id,
      ]),
    );
    const fresh = habits.filter(
      (habit) => !existing.has(habitNameKey(habit.name)),
    );
    const ids = new Map(existing);
    for (const part of chunks(fresh, IMPORT_CHUNK)) {
      const { data, error } = await this.client
        .from('habits')
        .insert(
          part.map((habit) => ({
            name: normalizeHabitName(habit.name),
            ...(habit.createdAt ? { created_at: habit.createdAt } : {}),
          })),
        )
        .select('id, name');
      if (error) fail(error);
      for (const row of data) ids.set(habitNameKey(row.name), row.id);
    }

    const completions = habits.flatMap((habit) => {
      const habitId = ids.get(habitNameKey(habit.name));
      return habitId
        ? habit.completedDates.map((date) => ({ habit_id: habitId, date }))
        : [];
    });
    let addedDays = 0;
    for (const part of chunks(completions, IMPORT_CHUNK)) {
      // Days already marked are skipped instead of failing the import.
      const { data, error } = await this.client
        .from('habit_completions')
        .upsert(part, { onConflict: 'habit_id,date', ignoreDuplicates: true })
        .select('id');
      if (error) fail(error);
      addedDays += data.length;
    }
    return {
      createdHabits: fresh.length,
      mergedHabits: habits.length - fresh.length,
      addedDays,
    };
  }
}
