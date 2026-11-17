import { useRouter } from 'expo-router';
import { OnboardingScreen } from '../src/features/onboarding/components/OnboardingScreen';
import { useOnboarding } from '../src/features/onboarding/OnboardingProvider';

// Shown once, on the very first launch. Leaving it marks it as seen, which
// also removes it from the stack through the root layout's guard.
export default function OnboardingRoute() {
  const router = useRouter();
  const { complete } = useOnboarding();
  const leaveTo = (href: '/sign-up' | '/sign-in') => {
    router.replace(href);
    complete();
  };
  return (
    <OnboardingScreen
      onCreateAccount={() => leaveTo('/sign-up')}
      onSignIn={() => leaveTo('/sign-in')}
    />
  );
}
