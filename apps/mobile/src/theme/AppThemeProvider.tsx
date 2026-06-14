import { DarkTheme, DefaultTheme, type Theme as NavigationTheme } from "@react-navigation/native";
import { createContext, type PropsWithChildren, useContext, useMemo } from "react";
import { useColorScheme } from "react-native";

import { darkColors, lightColors } from "./colors";
import { spacing } from "./spacing";
import { typography } from "./typography";

type AppTheme = {
  colors: typeof lightColors;
  spacing: typeof spacing;
  typography: typeof typography;
};

type AppThemeContextValue = {
  colorScheme: "light" | "dark";
  theme: AppTheme;
  navigationTheme: NavigationTheme;
};

const AppThemeContext = createContext<AppThemeContextValue | null>(null);

export function AppThemeProvider({ children }: PropsWithChildren) {
  const systemColorScheme = useColorScheme();
  const colorScheme = systemColorScheme === "dark" ? "dark" : "light";
  const colors = colorScheme === "dark" ? darkColors : lightColors;

  const value = useMemo<AppThemeContextValue>(() => {
    const baseNavigationTheme = colorScheme === "dark" ? DarkTheme : DefaultTheme;

    return {
      colorScheme,
      theme: {
        colors,
        spacing,
        typography
      },
      navigationTheme: {
        ...baseNavigationTheme,
        dark: colorScheme === "dark",
        colors: {
          ...baseNavigationTheme.colors,
          primary: colors.primary,
          background: colors.background,
          card: colors.surface,
          text: colors.text,
          border: colors.border,
          notification: colors.primary
        },
        fonts: {
          regular: { fontFamily: typography.fontFamily.regular, fontWeight: "400" },
          medium: { fontFamily: typography.fontFamily.medium, fontWeight: "600" },
          bold: { fontFamily: typography.fontFamily.bold, fontWeight: "700" },
          heavy: { fontFamily: typography.fontFamily.bold, fontWeight: "700" }
        }
      }
    };
  }, [colorScheme, colors]);

  return <AppThemeContext.Provider value={value}>{children}</AppThemeContext.Provider>;
}

export function useAppTheme() {
  const context = useContext(AppThemeContext);

  if (!context) {
    throw new Error("useAppTheme must be used inside AppThemeProvider");
  }

  return context;
}
