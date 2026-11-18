import {
  parseCsvRows,
  parseTransfer,
  toCsv,
  toJson,
  TransferError,
} from '../src/features/habits/transfer/habitTransfer';
import { importSummary } from '../src/features/habits/transfer/useHabitTransfer';
import { InMemoryHabitRepository } from './support/InMemoryHabitRepository';

const TODAY = '2026-11-17';
const habits = [
  {
    name: 'Ler, com café',
    createdAt: '2026-11-01T12:00:00.000Z',
    completedDates: ['2026-11-03', '2026-11-02'],
  },
  {
    name: 'Correr "leve"',
    createdAt: '2026-11-10T12:00:00.000Z',
    completedDates: [],
  },
];

describe('export formats', () => {
  it('round-trips through JSON', () => {
    const json = toJson(habits, new Date('2026-11-17T10:00:00Z'));
    expect(JSON.parse(json)).toMatchObject({ app: 'ritmo', version: 1 });
    expect(parseTransfer(json, TODAY)).toEqual({
      habits: [
        { ...habits[0], completedDates: ['2026-11-02', '2026-11-03'] },
        habits[1],
      ],
      skipped: 0,
    });
  });

  it('round-trips through CSV, quoting commas and quotes', () => {
    const csv = toCsv(habits);
    expect(csv.split('\r\n')[0]).toBe('habit,created_at,date');
    expect(csv).toContain(
      '"Ler, com café",2026-11-01T12:00:00.000Z,2026-11-02',
    );
    expect(csv).toContain('"Correr ""leve""",2026-11-10T12:00:00.000Z,');
    expect(parseTransfer(csv, TODAY).habits).toEqual([
      { ...habits[0], completedDates: ['2026-11-02', '2026-11-03'] },
      habits[1],
    ]);
  });

  it('keeps spreadsheet formulas from running and restores the name', () => {
    const csv = toCsv([
      { name: '=SOMA(1)', createdAt: habits[0].createdAt, completedDates: [] },
    ]);
    expect(csv).toContain(`"'=SOMA(1)"`);
    expect(parseTransfer(csv, TODAY).habits[0].name).toBe('=SOMA(1)');
  });
});

describe('parseTransfer', () => {
  it('merges rows of the same habit and skips what cannot be imported', () => {
    const csv = [
      'habit,created_at,date',
      'Ler,,2026-11-01',
      'ler ,,2026-11-01',
      'LER,,2026-11-02',
      'Ler,,2026-11-30',
      'Ler,,2026-02-30',
      ',,2026-11-01',
    ].join('\n');
    expect(parseTransfer(csv, TODAY)).toEqual({
      habits: [
        {
          name: 'Ler',
          createdAt: null,
          completedDates: ['2026-11-01', '2026-11-02'],
        },
      ],
      skipped: 3,
    });
  });

  it.each([
    ['', 'O arquivo está vazio.'],
    ['{"foo": 1}', /não parece uma exportação/],
    ['nome,data\nLer,2026-11-01', /não parece uma exportação/],
    [
      '{"habits": [{"name": ""}]}',
      'Nenhum hábito válido foi encontrado no arquivo.',
    ],
  ])('rejects %j with a readable message', (text, message) => {
    expect(() => parseTransfer(text, TODAY)).toThrow(TransferError);
    expect(() => parseTransfer(text, TODAY)).toThrow(message);
  });

  it('reads quoted line breaks in CSV', () => {
    expect(parseCsvRows('a,"b\nc"\r\nd,e')).toEqual([
      ['a', 'b\nc'],
      ['d', 'e'],
    ]);
  });
});

describe('importing', () => {
  it('merges by name, never duplicates days and reports what changed', async () => {
    const repository = new InMemoryHabitRepository();
    const existing = await repository.create({ name: 'Ler' });
    await repository.importHabits([
      { name: 'ler', createdAt: null, completedDates: ['2026-11-01'] },
    ]);
    const result = await repository.importHabits([
      {
        name: 'LER',
        createdAt: null,
        completedDates: ['2026-11-01', '2026-11-02'],
      },
      {
        name: 'Correr',
        createdAt: '2026-10-01T12:00:00.000Z',
        completedDates: ['2026-10-02'],
      },
    ]);
    expect(result).toEqual({ createdHabits: 1, mergedHabits: 1, addedDays: 2 });
    expect(
      (await repository.getCompletions(existing.id)).map((c) => c.date),
    ).toEqual(['2026-11-01', '2026-11-02']);
    const habits = await repository.findAll();
    expect(habits.map((habit) => habit.name)).toEqual(['Ler', 'Correr']);
    expect(habits[1].createdAt).toBe('2026-10-01T12:00:00.000Z');
    expect(importSummary(result)).toBe(
      'Importação concluída: 1 hábito criado, 1 hábito combinado, 2 dias adicionados.',
    );
  });
});
