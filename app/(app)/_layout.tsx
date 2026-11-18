import { Stack } from 'expo-router';
import { useState } from 'react';
import { useColors } from '../../src/design-system/theme/ThemeProvider';
import { RemindersProvider } from '../../src/features/reminders/RemindersProvider';
import { HabitsProvider } from '../../src/features/habits/hooks/useHabits';
import { SupabaseHabitRepository } from '../../src/features/habits/repository/SupabaseHabitRepository';
import { supabase } from '../../src/shared/supabase/client';

// Only mounted while signed in (see the root layout's guards), so habits
// load for the current user and are dropped on sign out.
export default function SignedInLayout() {
  const colors = useColors();
  const [repository] = useState(() => new SupabaseHabitRepository(supabase));
  return (
    <HabitsProvider repository={repository}>
      <RemindersProvider>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.canvas },
          }}
        />
      </RemindersProvider>
    </HabitsProvider>
  );
}
