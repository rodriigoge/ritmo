import { createContext, useContext, type ReactNode } from 'react';
import type { HabitRepository } from '../repository/HabitRepository';
import { useHabitsState } from './useHabitsState';

export type { HabitWithHistory } from './useHabitsState';
const HabitsContext = createContext<ReturnType<typeof useHabitsState> | null>(
  null,
);

export function HabitsProvider({
  repository,
  children,
}: {
  repository: HabitRepository;
  children: ReactNode;
}) {
  const value = useHabitsState(repository);
  return (
    <HabitsContext.Provider value={value}>{children}</HabitsContext.Provider>
  );
}
export function useHabits() {
  const value = useContext(HabitsContext);
  if (!value) throw new Error('useHabits requires HabitsProvider.');
  return value;
}
