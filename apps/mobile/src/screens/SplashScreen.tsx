import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useCallback, useEffect } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import type { RootStackParamList } from "../navigation/routes";
import { hasCompletedOnboarding } from "../storage/onboardingProgress";
import { useAppTheme } from "../theme";

type SplashScreenProps = NativeStackScreenProps<RootStackParamList, "Splash">;

const SPLASH_DURATION_MS = 1800;

export function SplashScreen({ navigation }: SplashScreenProps) {
  const { theme } = useAppTheme();

  const continueToApp = useCallback(() => {
    void hasCompletedOnboarding().then((completedOnboarding) => {
      navigation.replace(completedOnboarding ? "Login" : "Onboarding");
    });
  }, [navigation]);

  useEffect(() => {
    const timer = setTimeout(continueToApp, SPLASH_DURATION_MS);

    return () => clearTimeout(timer);
  }, [continueToApp]);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      <Pressable accessibilityRole="button" onPress={continueToApp} style={styles.container}>
        <View style={styles.brandArea}>
          <View style={styles.mark} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
            <View style={[styles.bar, styles.shortBar, { backgroundColor: theme.colors.primary }]} />
            <View style={[styles.bar, styles.tallBar, { backgroundColor: theme.colors.primary }]} />
            <View style={[styles.bar, styles.shortBar, { backgroundColor: theme.colors.primary }]} />
          </View>
          <Text style={[styles.title, { color: theme.colors.text, fontFamily: theme.typography.fontFamily.bold }]}>Ritmo</Text>
        </View>

        <Text style={[styles.footer, { color: theme.colors.muted, fontFamily: theme.typography.fontFamily.regular }]}>
          encontre seu ritmo
        </Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 28
  },
  brandArea: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  mark: {
    height: 32,
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 3,
    marginBottom: 10
  },
  bar: {
    width: 4,
    borderRadius: 2
  },
  shortBar: {
    height: 12
  },
  tallBar: {
    height: 24
  },
  title: {
    fontSize: 32,
    lineHeight: 38,
    textAlign: "center"
  },
  footer: {
    fontSize: 13,
    lineHeight: 18,
    textAlign: "center"
  }
});
