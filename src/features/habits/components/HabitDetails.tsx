import { DeleteHabitConfirmation } from './DeleteHabitConfirmation';
import { HabitFormSheet } from './HabitFormSheet';
import { HabitCalendar } from './HabitCalendar';
import { HabitOptionsModal } from './HabitOptionsModal';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../../design-system/components/Button/Button';
import { MoreIcon } from '../../../design-system/components/Icon/Icons';
import {
  TOP_BAR_CHIP,
  TopBar,
} from '../../../design-system/components/TopBar/TopBar';
import { colors } from '../../../design-system/tokens/colors';
import { controls } from '../../../design-system/tokens/controls';
import { spacing } from '../../../design-system/tokens/spacing';
import {
  fontFamilies,
  typography,
} from '../../../design-system/tokens/typography';
import { formatLocalDate, toLocalDate } from '../../../shared/date/dateUtils';
import { useHabits } from '../hooks/useHabits';
import { useHabitMetrics } from '../hooks/useHabitMetrics';
import type { HabitWithHistory } from '../hooks/useHabits';
import type { LocalDate } from '../../../shared/date/LocalDate';
import { HabitStats } from './HabitStats';

export function HabitDetails({
  id,
  onBack,
}: {
  id: string;
  onBack: () => void;
}) {
  const { habits, today, loading, error, refresh } = useHabits();
  const habit = habits.find((item) => item.id === id);
  return (
    <SafeAreaView style={styles.screen}>
      {habit ? (
        <DetailsContent habit={habit} today={today} onBack={onBack} />
      ) : (
        <View style={styles.content}>
          <Button label="Voltar" variant="secondary" onPress={onBack} />
          <Text
            accessibilityRole={error ? 'alert' : undefined}
            style={styles.body}
          >
            {loading
              ? 'Carregando hábito…'
              : (error ?? 'Hábito não encontrado.')}
          </Text>
          {error && <Button label="Tentar novamente" onPress={refresh} />}
        </View>
      )}
    </SafeAreaView>
  );
}

function DetailsContent({
  habit,
  today,
  onBack,
}: {
  habit: HabitWithHistory;
  today: LocalDate;
  onBack: () => void;
}) {
  const {
    toggleDay,
    completionError,
    recordFeedback,
    updateHabit,
    deleteHabit,
  } = useHabits();
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [editing, setEditing] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const metrics = useHabitMetrics(habit.completedDates, today);
  return (
    <>
      <ScrollView
        contentContainerStyle={styles.content}
        accessibilityElementsHidden={menuOpen || editing || confirmingDelete}
        importantForAccessibility={
          menuOpen || editing || confirmingDelete
            ? 'no-hide-descendants'
            : 'auto'
        }
      >
        <TopBar
          title="Detalhes"
          onBack={onBack}
          right={
            <Pressable
              onPress={() => setMenuOpen(!menuOpen)}
              accessibilityRole="button"
              accessibilityLabel="Opções do hábito"
              hitSlop={(controls.minTouchTarget - TOP_BAR_CHIP) / 2}
              style={({ pressed }) => [styles.chip, pressed && styles.pressed]}
            >
              <MoreIcon size={20} />
            </Pressable>
          }
        />
        <View style={styles.heading}>
          <Text accessibilityRole="header" style={styles.title}>
            {habit.name}
          </Text>
          <Text style={styles.body}>
            Desde{' '}
            {formatLocalDate(toLocalDate(new Date(habit.createdAt)), {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </Text>
        </View>
        <HabitStats
          metrics={metrics}
          completedDates={habit.completedDates}
          createdAt={habit.createdAt}
          today={today}
          recordId={
            recordFeedback?.habitId === habit.id ? recordFeedback.id : undefined
          }
        />
        <Text accessibilityRole="header" style={styles.sectionTitle}>
          Histórico
        </Text>
        <HabitCalendar
          key={habit.id}
          habit={habit}
          today={today}
          onToggleDay={(date) => toggleDay(habit.id, date)}
        />
        {completionError?.habitId === habit.id && (
          <Text
            accessibilityRole="alert"
            accessibilityLiveRegion="polite"
            style={styles.error}
          >
            {completionError.message}
          </Text>
        )}
      </ScrollView>
      {menuOpen && (
        <HabitOptionsModal
          name={habit.name}
          onClose={() => setMenuOpen(false)}
          onEdit={() => {
            setMenuOpen(false);
            setEditing(true);
          }}
          onDelete={() => {
            setMenuOpen(false);
            setConfirmingDelete(true);
          }}
        />
      )}
      {editing && (
        <HabitFormSheet
          mode="edit"
          initialName={habit.name}
          onSave={(name) => updateHabit(habit.id, name)}
          onClose={() => setEditing(false)}
        />
      )}
      {confirmingDelete && (
        <DeleteHabitConfirmation
          name={habit.name}
          onDelete={() => deleteHabit(habit.id)}
          onCancel={() => setConfirmingDelete(false)}
          onDeleted={onBack}
        />
      )}
    </>
  );
}
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.canvas },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xxxl,
    gap: spacing.xl,
  },
  heading: { gap: 2 },
  title: {
    ...typography.title,
    fontFamily: fontFamilies.bold,
    letterSpacing: -0.4,
    color: colors.ink,
  },
  sectionTitle: {
    ...typography.habitName,
    color: colors.ink,
    marginBottom: -spacing.sm,
  },
  chip: {
    width: TOP_BAR_CHIP,
    height: TOP_BAR_CHIP,
    borderRadius: TOP_BAR_CHIP / 2,
    backgroundColor: colors.chip,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: controls.pressedOpacity },
  body: { ...typography.body, color: colors.textSecondary },
  error: { ...typography.caption, color: colors.danger },
});
