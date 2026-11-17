import Storage from 'expo-sqlite/kv-store';

const ONBOARDING_KEY = 'ritmo.onboarding.completed';

// Synchronous so the first frame already knows which stack to show.
// A storage failure falls back to showing onboarding, which is harmless.
export function readOnboardingCompleted(): boolean {
  try {
    return Storage.getItemSync(ONBOARDING_KEY) === 'true';
  } catch {
    return false;
  }
}

export function saveOnboardingCompleted(): void {
  try {
    Storage.setItemSync(ONBOARDING_KEY, 'true');
  } catch {
    // Not persisting only means onboarding shows again on next launch.
  }
}
