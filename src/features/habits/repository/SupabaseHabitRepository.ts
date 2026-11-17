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
} from './HabitRepository';

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
      .order('created_at')
      .order('id');
    if (error) fail(error);
    return data.map(toHabit);
  }

  async findAllWithCompletedDates(): Promise<HabitWithCompletedDates[]> {
    const { data, error } = await this.client
      .from('habits')
      .select(`${HABIT_COLUMNS}, habit_completions(date)`)
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
}
