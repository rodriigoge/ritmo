import { useRouter } from 'expo-router';
import { ForgotPasswordScreen } from '../src/features/auth/components/ForgotPasswordScreen';

export default function ForgotPasswordRoute() {
  const router = useRouter();
  return (
    <ForgotPasswordScreen
      onBack={() => {
        if (router.canGoBack()) router.back();
        else router.replace('/sign-in');
      }}
    />
  );
}
