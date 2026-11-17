import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { OnboardingScreen } from '../src/features/onboarding/components/OnboardingScreen';
import {
  OnboardingProvider,
  useOnboarding,
} from '../src/features/onboarding/OnboardingProvider';
import { ONBOARDING_PAGES } from '../src/features/onboarding/onboardingPages';

const mockStore = new Map<string, string>();
jest.mock('expo-sqlite/kv-store', () => ({
  __esModule: true,
  default: {
    getItemSync: (key: string) => mockStore.get(key) ?? null,
    setItemSync: (key: string, value: string) => mockStore.set(key, value),
  },
}));

function CompletionProbe() {
  const { completed, complete } = useOnboarding();
  return completed ? null : (
    <OnboardingScreen onCreateAccount={complete} onSignIn={complete} />
  );
}

describe('Onboarding', () => {
  beforeEach(() => mockStore.clear());

  it('shows the first page and both account actions from the start', async () => {
    const onCreateAccount = jest.fn();
    const onSignIn = jest.fn();
    await render(
      <OnboardingScreen
        onCreateAccount={onCreateAccount}
        onSignIn={onSignIn}
      />,
    );

    expect(screen.getByText(ONBOARDING_PAGES[0].title)).toBeTruthy();
    expect(screen.getByLabelText('Página 1 de 3')).toBeTruthy();

    await fireEvent.press(screen.getByRole('button', { name: 'Criar conta' }));
    expect(onCreateAccount).toHaveBeenCalledTimes(1);

    await fireEvent.press(
      screen.getByRole('button', { name: 'Já tenho conta' }),
    );
    expect(onSignIn).toHaveBeenCalledTimes(1);
  });

  it('leaving onboarding marks it as seen and persists it', async () => {
    await render(
      <OnboardingProvider>
        <CompletionProbe />
      </OnboardingProvider>,
    );

    await fireEvent.press(
      screen.getByRole('button', { name: 'Já tenho conta' }),
    );

    expect(screen.queryByText(ONBOARDING_PAGES[0].title)).toBeNull();
    expect([...mockStore.values()]).toEqual(['true']);
  });

  it('does not show again on later launches', async () => {
    mockStore.set('ritmo.onboarding.completed', 'true');
    await act(async () => {
      await render(
        <OnboardingProvider>
          <CompletionProbe />
        </OnboardingProvider>,
      );
    });
    expect(screen.queryByText(ONBOARDING_PAGES[0].title)).toBeNull();
  });
});
