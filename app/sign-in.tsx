import { useRouter } from 'expo-router';
import { SignInScreen } from '../src/features/auth/components/SignInScreen';

export default function SignInRoute() {
  const router = useRouter();
  return (
    <SignInScreen
      onCreateAccount={() => router.replace('/sign-up')}
      onForgotPassword={() => router.push('/forgot-password')}
    />
  );
}
