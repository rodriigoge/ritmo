import { useRouter } from 'expo-router';
import { SignUpScreen } from '../src/features/auth/components/SignUpScreen';

export default function SignUpRoute() {
  const router = useRouter();
  return <SignUpScreen onSignIn={() => router.replace('/sign-in')} />;
}
