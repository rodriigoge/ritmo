import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import {
  Inter_400Regular,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';

import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui';
import {
  ThemeProvider,
  useTheme,
} from '../src/design-system/theme/ThemeProvider';
import { AuthProvider, useAuth } from '../src/features/auth/AuthProvider';
import { supabaseAuthService } from '../src/features/auth/SupabaseAuthService';
import {
  OnboardingProvider,
  useOnboarding,
} from '../src/features/onboarding/OnboardingProvider';
import { removeLegacyLocalHabits } from '../src/shared/removeLegacyLocalHabits';

void SplashScreen.preventAutoHideAsync().catch(() => {});
// Fade from the native splash into the first screen instead of cutting.
SplashScreen.setOptions({ duration: 250, fade: true });
removeLegacyLocalHabits();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  if (fontError) throw fontError;
  if (!fontsLoaded) return null;

  return (
    <ThemeProvider>
      <OnboardingProvider>
        <AuthProvider service={supabaseAuthService}>
          <RootStack />
        </AuthProvider>
      </OnboardingProvider>
    </ThemeProvider>
  );
}

// First launch: onboarding → sign up / sign in → app. Later launches skip
// onboarding; a stored session goes straight to the app. Screens outside
// the guards are email-link landings, reachable in any state.
function RootStack() {
  const { status } = useAuth();
  const { colors, scheme } = useTheme();
  const { completed: onboarded } = useOnboarding();
  const resolved = status !== 'loading';

  useEffect(() => {
    if (resolved) void SplashScreen.hideAsync().catch(() => {});
  }, [resolved]);

  // The native root view shows behind the keyboard and during transitions.
  useEffect(() => {
    void SystemUI.setBackgroundColorAsync(colors.canvas).catch(() => {});
  }, [colors.canvas]);

  if (!resolved) return null;
  const signedIn = status === 'signed-in';

  return (
    <>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          // Paints behind screens during transitions, so there is no flash of
          // the wrong color when the dark theme is on.
          contentStyle: { backgroundColor: colors.canvas },
        }}
      >
        <Stack.Protected guard={signedIn}>
          <Stack.Screen name="(app)" options={{ animation: 'fade' }} />
        </Stack.Protected>
        <Stack.Protected guard={!signedIn && !onboarded}>
          <Stack.Screen name="onboarding" options={{ animation: 'fade' }} />
        </Stack.Protected>
        <Stack.Protected guard={!signedIn}>
          <Stack.Screen name="sign-in" options={{ animation: 'fade' }} />
          <Stack.Screen name="sign-up" options={{ animation: 'fade' }} />
          <Stack.Screen name="forgot-password" />
        </Stack.Protected>
        <Stack.Screen name="auth/callback" options={{ animation: 'fade' }} />
        <Stack.Screen name="reset-password" options={{ animation: 'fade' }} />
      </Stack>
    </>
  );
}
