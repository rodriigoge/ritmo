import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  readOnboardingCompleted,
  saveOnboardingCompleted,
} from './onboardingStorage';

type OnboardingState = { completed: boolean; complete: () => void };

const OnboardingContext = createContext<OnboardingState | null>(null);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [completed, setCompleted] = useState(readOnboardingCompleted);
  const complete = useCallback(() => {
    saveOnboardingCompleted();
    setCompleted(true);
  }, []);
  const value = useMemo(() => ({ completed, complete }), [completed, complete]);
  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding(): OnboardingState {
  const value = useContext(OnboardingContext);
  if (!value) {
    throw new Error('useOnboarding must be used inside OnboardingProvider.');
  }
  return value;
}
