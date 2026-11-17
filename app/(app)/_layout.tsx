import { Stack } from 'expo-router';
import { useState } from 'react';
import { HabitsProvider } from '../../src/features/habits/hooks/useHabits';
import { SupabaseHabitRepository } from '../../src/features/habits/repository/SupabaseHabitRepository';
import { supabase } from '../../src/shared/supabase/client';

// Only mounted while signed in (see the root layout's guards), so habits
// load for the current user and are dropped on sign out.
export default function SignedInLayout() {
  const [repository] = useState(() => new SupabaseHabitRepository(supabase));
  return (
    <HabitsProvider repository={repository}>
      <Stack screenOptions={{ headerShown: false }} />
    </HabitsProvider>
  );
}
