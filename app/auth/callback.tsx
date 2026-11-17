import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback } from 'react';
import { EmailConfirmationScreen } from '../../src/features/auth/components/EmailLinkScreens';

// Opened by the sign-up confirmation email: ritmo://auth/callback?code=…
export default function AuthCallbackRoute() {
  const router = useRouter();
  const { code, error_description } = useLocalSearchParams<{
    code?: string;
    error_description?: string;
  }>();
  const goHome = useCallback(() => router.replace('/'), [router]);
  return (
    <EmailConfirmationScreen
      code={code}
      linkError={error_description}
      onConfirmed={goHome}
      onSignIn={() => router.replace('/sign-in')}
    />
  );
}
