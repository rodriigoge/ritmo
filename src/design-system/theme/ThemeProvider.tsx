import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { StyleSheet, useColorScheme } from 'react-native';
import {
  darkColors,
  lightColors,
  type ColorPalette,
} from '../tokens/colors';
import {
  readThemePreference,
  saveThemePreference,
  type ThemePreference,
} from './themeStorage';

export type ColorScheme = 'light' | 'dark';

export type Theme = {
  colors: ColorPalette;
  scheme: ColorScheme;
  preference: ThemePreference;
  setPreference: (preference: ThemePreference) => void;
};

// Without a provider (tests, isolated previews) everything renders light.
const ThemeContext = createContext<Theme>({
  colors: lightColors,
  scheme: 'light',
  preference: 'system',
  setPreference: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const system = useColorScheme();
  const [preference, setStoredPreference] =
    useState<ThemePreference>(readThemePreference);

  const setPreference = useCallback((next: ThemePreference) => {
    setStoredPreference(next);
    saveThemePreference(next);
  }, []);

  const scheme: ColorScheme =
    preference === 'system'
      ? system === 'dark'
        ? 'dark'
        : 'light'
      : preference;

  const value = useMemo<Theme>(
    () => ({
      colors: scheme === 'dark' ? darkColors : lightColors,
      scheme,
      preference,
      setPreference,
    }),
    [scheme, preference, setPreference],
  );
  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme(): Theme {
  return useContext(ThemeContext);
}

/** Shortcut for components that only need the palette. */
export function useColors(): ColorPalette {
  return useContext(ThemeContext).colors;
}

/**
 * Themed replacement for StyleSheet.create. The factory runs once per
 * palette and the result is shared by every component that uses it:
 *
 *   const useStyles = makeStyles((colors) => ({ title: { color: colors.ink } }));
 *   const styles = useStyles(); // inside the component
 */
export function makeStyles<
  T extends StyleSheet.NamedStyles<T> | StyleSheet.NamedStyles<any>,
>(factory: (colors: ColorPalette) => T & StyleSheet.NamedStyles<any>) {
  const cache = new Map<ColorPalette, T>();
  return function useStyles(): T {
    const colors = useColors();
    let styles = cache.get(colors);
    if (!styles) {
      styles = StyleSheet.create(factory(colors));
      cache.set(colors, styles);
    }
    return styles;
  };
}
