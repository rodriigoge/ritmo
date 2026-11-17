import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import {
  Inter_400Regular,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';

import { AuthProvider, useAuth } from '../src/features/auth/AuthProvider';
import { supabaseAuthService } from '../src/features/auth/SupabaseAuthService';
import {
  OnboardingProvider,
  useOnboarding,
} from '../src/features/onboarding/OnboardingProvider';
import { removeLegacyLocalHabits } from '../src/shared/removeLegacyLocalHabits';

void SplashScreen.preventAutoHideAsync().catch(() => {});
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
    <OnboardingProvider>
      <AuthProvider service={supabaseAuthService}>
        <RootStack />
      </AuthProvider>
    </OnboardingProvider>
  );
}

// First launch: onboarding → sign up / sign in → app. Later launches skip
// onboarding; a stored session goes straight to the app. Screens outside
// the guards are email-link landings, reachable in any state.
function RootStack() {
  const { status } = useAuth();
  const { completed: onboarded } = useOnboarding();
  const resolved = status !== 'loading';

  useEffect(() => {
    if (resolved) void SplashScreen.hideAsync().catch(() => {});
  }, [resolved]);

  if (!resolved) return null;
  const signedIn = status === 'signed-in';

  return (
    <Stack screenOptions={{ headerShown: false }}>
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
  );
}
