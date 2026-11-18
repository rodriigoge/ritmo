import Storage from 'expo-sqlite/kv-store';

export type ThemePreference = 'system' | 'light' | 'dark';

const THEME_KEY = 'ritmo.theme';
const VALID = new Set<ThemePreference>(['system', 'light', 'dark']);

// Synchronous so the first frame already uses the chosen theme. Kept on the
// device: it also applies before signing in and to every account on it.
export function readThemePreference(): ThemePreference {
  try {
    const value = Storage.getItemSync(THEME_KEY);
    return value && VALID.has(value as ThemePreference)
      ? (value as ThemePreference)
      : 'system';
  } catch {
    return 'system';
  }
}

export function saveThemePreference(preference: ThemePreference): void {
  try {
    Storage.setItemSync(THEME_KEY, preference);
  } catch {
    // Not persisting only means the app falls back to the system theme.
  }
}
