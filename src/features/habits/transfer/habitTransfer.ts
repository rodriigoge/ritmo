import { addDays, isFuture } from '../../../shared/date/dateUtils';
import type { LocalDate } from '../../../shared/date/LocalDate';
import { MAX_HABIT_NAME_LENGTH } from '../domain/HabitInput';

// Export and import formats for a user's habits.
//
// JSON keeps everything in one document:
//   { "app": "ritmo", "version": 1, "exportedAt": "…",
//     "habits": [{ "name": "Ler", "createdAt": "…", "completedDates": ["2026-11-17"] }] }
//
// CSV has one row per completed day, plus one row with an empty date for a
// habit with no days yet, so spreadsheets can open and edit it:
//   habit,created_at,date
//   Ler,2026-11-01T12:00:00.000Z,2026-11-17

export type TransferFormat = 'json' | 'csv';

export type TransferHabit = {
  name: string;
  /** ISO timestamp, or null when the file has none (import uses "now"). */
  createdAt: string | null;
  completedDates: LocalDate[];
};

export type ParsedTransfer = {
  habits: TransferHabit[];
  /** Days left out: future dates, invalid dates or invalid names. */
  skipped: number;
};

/** Error whose message can be shown to the user as is. */
export class TransferError extends Error {}

const CSV_HEADER = ['habit', 'created_at', 'date'];
const MAX_HABITS = 500;

type ExportableHabit = {
  name: string;
  createdAt: string;
  completedDates: readonly LocalDate[];
};

export function toJson(habits: readonly ExportableHabit[], exportedAt: Date) {
  return JSON.stringify(
    {
      app: 'ritmo',
      version: 1,
      exportedAt: exportedAt.toISOString(),
      habits: habits.map((habit) => ({
        name: habit.name,
        createdAt: habit.createdAt,
        completedDates: [...habit.completedDates].sort(),
      })),
    },
    null,
    2,
  );
}

export function toCsv(habits: readonly ExportableHabit[]): string {
  const rows = [CSV_HEADER];
  for (const habit of habits) {
    const dates = [...habit.completedDates].sort();
    if (dates.length === 0) rows.push([habit.name, habit.createdAt, '']);
    for (const date of dates) rows.push([habit.name, habit.createdAt, date]);
  }
  return rows.map((row) => row.map(csvField).join(',')).join('\r\n') + '\r\n';
}

function csvField(value: string): string {
  // Quote anything a spreadsheet could misread; a leading = + - @ would
  // otherwise run as a formula when the file is opened.
  const guarded = /^[=+\-@]/.test(value) ? `'${value}` : value;
  return /[",\r\n]/.test(guarded) || guarded !== value
    ? `"${guarded.replace(/"/g, '""')}"`
    : guarded;
}

/** Reads a Ritmo export, telling JSON and CSV apart by content. */
export function parseTransfer(text: string, today: LocalDate): ParsedTransfer {
  const content = text.replace(/^﻿/, '').trim();
  if (!content) throw new TransferError('O arquivo está vazio.');
  const raw = content.startsWith('{')
    ? readJson(content)
    : content.startsWith('[')
      ? invalid()
      : readCsv(content);
  return collect(raw, today);
}

type RawHabit = { name: unknown; createdAt: unknown; dates: unknown[] };

function invalid(): never {
  throw new TransferError(
    'Este arquivo não parece uma exportação do Ritmo (JSON ou CSV).',
  );
}

function readJson(content: string): RawHabit[] {
  let data: unknown;
  try {
    data = JSON.parse(content);
  } catch {
    invalid();
  }
  if (
    typeof data !== 'object' ||
    data === null ||
    !Array.isArray((data as { habits?: unknown }).habits)
  ) {
    invalid();
  }
  return (data as { habits: unknown[] }).habits.map((item) => {
    const habit = (typeof item === 'object' && item) || {};
    const dates = (habit as { completedDates?: unknown }).completedDates;
    return {
      name: (habit as { name?: unknown }).name,
      createdAt: (habit as { createdAt?: unknown }).createdAt,
      dates: Array.isArray(dates) ? dates : [],
    };
  });
}

function readCsv(content: string): RawHabit[] {
  const rows = parseCsvRows(content);
  const header = rows.shift()?.map((cell) => cell.trim().toLowerCase());
  const nameAt = header?.indexOf('habit') ?? -1;
  if (!header || nameAt < 0) invalid();
  const createdAt = header.indexOf('created_at');
  const dateAt = header.indexOf('date');
  return rows
    .filter((row) => row.some((cell) => cell.trim()))
    .map((row) => ({
      name: unguard(row[nameAt] ?? ''),
      createdAt: createdAt >= 0 ? row[createdAt] : undefined,
      dates: dateAt >= 0 && row[dateAt]?.trim() ? [row[dateAt].trim()] : [],
    }));
}

// Undo the formula guard added on export.
function unguard(value: string): string {
  return /^'[=+\-@]/.test(value) ? value.slice(1) : value;
}

/** RFC 4180 rows: quoted fields may hold commas, quotes and line breaks. */
export function parseCsvRows(content: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let quoted = false;
  for (let index = 0; index < content.length; index += 1) {
    const char = content[index];
    if (quoted) {
      if (char === '"' && content[index + 1] === '"') {
        field += '"';
        index += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        field += char;
      }
    } else if (char === '"') {
      quoted = true;
    } else if (char === ',') {
      row.push(field);
      field = '';
    } else if (char === '\n' || char === '\r') {
      if (char === '\r' && content[index + 1] === '\n') index += 1;
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else {
      field += char;
    }
  }
  if (field || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

function validDate(value: unknown, today: LocalDate): value is LocalDate {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value))
    return false;
  try {
    addDays(value, 0);
  } catch {
    return false;
  }
  return !isFuture(value, today);
}

function validTimestamp(value: unknown): string | null {
  if (typeof value !== 'string' || !value.trim()) return null;
  const time = Date.parse(value);
  return Number.isNaN(time) ? null : new Date(time).toISOString();
}

// Merges rows of the same habit (by name, ignoring case and spaces) and
// drops what cannot be imported, counting it.
function collect(raw: RawHabit[], today: LocalDate): ParsedTransfer {
  const byName = new Map<string, TransferHabit & { dates: Set<LocalDate> }>();
  let skipped = 0;
  for (const item of raw) {
    const name = typeof item.name === 'string' ? item.name.trim() : '';
    if (!name || name.length > MAX_HABIT_NAME_LENGTH) {
      skipped += Math.max(1, item.dates.length);
      continue;
    }
    const key = name.toLocaleLowerCase('pt-BR');
    let habit = byName.get(key);
    if (!habit) {
      habit = {
        name,
        createdAt: validTimestamp(item.createdAt),
        completedDates: [],
        dates: new Set(),
      };
      byName.set(key, habit);
    }
    for (const date of item.dates) {
      if (validDate(date, today)) habit.dates.add(date);
      else skipped += 1;
    }
  }
  if (byName.size === 0) {
    throw new TransferError('Nenhum hábito válido foi encontrado no arquivo.');
  }
  if (byName.size > MAX_HABITS) {
    throw new TransferError(
      `O arquivo tem mais de ${MAX_HABITS} hábitos. Divida-o em partes menores.`,
    );
  }
  const habits = [...byName.values()].map(({ dates, ...habit }) => ({
    ...habit,
    completedDates: [...dates].sort(),
  }));
  return { habits, skipped };
}
