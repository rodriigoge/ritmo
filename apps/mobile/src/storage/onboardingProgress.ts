import * as FileSystem from "expo-file-system/legacy";

const ONBOARDING_PROGRESS_FILE = `${FileSystem.documentDirectory ?? ""}onboarding-progress.json`;

type OnboardingProgress = {
  completed: boolean;
};

export async function hasCompletedOnboarding() {
  if (!FileSystem.documentDirectory) {
    return false;
  }

  try {
    const fileInfo = await FileSystem.getInfoAsync(ONBOARDING_PROGRESS_FILE);

    if (!fileInfo.exists) {
      return false;
    }

    const content = await FileSystem.readAsStringAsync(ONBOARDING_PROGRESS_FILE);
    const progress = JSON.parse(content) as Partial<OnboardingProgress>;

    return progress.completed === true;
  } catch {
    return false;
  }
}

export async function completeOnboarding() {
  if (!FileSystem.documentDirectory) {
    return;
  }

  const progress: OnboardingProgress = { completed: true };

  try {
    await FileSystem.writeAsStringAsync(ONBOARDING_PROGRESS_FILE, JSON.stringify(progress));
  } catch {
    // The onboarding flow should not block if local persistence is unavailable.
  }
}
