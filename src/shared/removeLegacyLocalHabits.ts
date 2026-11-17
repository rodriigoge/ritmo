import { deleteDatabaseAsync } from 'expo-sqlite';

// Habits used to live in this on-device SQLite file. They now live in
// Supabase and the old data is intentionally discarded, not migrated.
const LEGACY_DATABASE = 'habitual.db';

export function removeLegacyLocalHabits(): void {
  // Rejects when the file does not exist, which is the normal case.
  deleteDatabaseAsync(LEGACY_DATABASE).catch(() => {});
}
