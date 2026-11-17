import { useLocalSearchParams, useRouter } from 'expo-router';
import { ResetPasswordScreen } from '../src/features/auth/components/EmailLinkScreens';

// Opened by the password reset email: ritmo://reset-password?code=…
export default function ResetPasswordRoute() {
  const router = useRouter();
  const { code, error_description } = useLocalSearchParams<{
    code?: string;
    error_description?: string;
  }>();
  return (
    <ResetPasswordScreen
      code={code}
      linkError={error_description}
      onDone={() => router.replace('/')}
      onRequestNewLink={() => router.replace('/forgot-password')}
    />
  );
}
