import { Pressable, Text, View } from 'react-native';
import { ArrowRightIcon } from '../../../design-system/components/Icon/Icons';
import { makeStyles } from '../../../design-system/theme/ThemeProvider';
import { controls } from '../../../design-system/tokens/controls';
import { spacing } from '../../../design-system/tokens/spacing';
import { typography } from '../../../design-system/tokens/typography';
import { useRecentActivity } from '../hooks/useRecentActivity';
import { useHabitMetrics } from '../hooks/useHabitMetrics';
import type { HabitWithHistory } from '../hooks/useHabits';
import type { LocalDate } from '../../../shared/date/LocalDate';
import { DayStatus } from './DayStatus';
import { StreakIndicator } from './StreakIndicator';
import { MetricValue } from './MetricValue';

export function HabitCard({
  habit,
  today,
  onToggleDay,
  onPress,
  error,
  recordId,
}: {
  habit: HabitWithHistory;
  today: LocalDate;
  onPress?: () => void;
  onToggleDay?: (date: LocalDate) => void;
  error?: string;
  recordId?: number;
}) {
  const styles = useStyles();
  const metrics = useHabitMetrics(habit.completedDates, today);
  const days = useRecentActivity(habit.completedDates, habit.createdAt, today);
  return (
    <View style={styles.container} testID={`habit-${habit.id}`}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Ver detalhes de ${habit.name}`}
        onPress={onPress}
        style={({ pressed }) => [styles.heading, pressed && styles.pressed]}
      >
        <StreakIndicator
          inline
          value={metrics.currentStreak}
          recordId={recordId}
        />
        <Text accessibilityRole="header" style={styles.name}>
          {habit.name}
        </Text>
      </Pressable>
      <View style={styles.days}>
        {days.map(({ date, completed, disabled }) => (
          <DayStatus
            key={date}
            date={date}
            today={today}
            habitName={habit.name}
            completed={completed}
            disabled={disabled}
            recordId={date === today ? recordId : undefined}
            onPress={onToggleDay ? () => onToggleDay(date) : undefined}
          />
        ))}
      </View>
      <View style={styles.footer}>
        <MetricValue
          value={metrics.totalCompletions}
          suffix={metrics.totalCompletions === 1 ? 'conclusão' : 'conclusões'}
          style={styles.total}
        />
        {/* Same action as the heading, which already names it for screen
            readers; this is the round "open" chip of the card. */}
        <Pressable
          accessible={false}
          importantForAccessibility="no-hide-descendants"
          onPress={onPress}
          hitSlop={spacing.sm}
          style={({ pressed }) => [styles.open, pressed && styles.pressed]}
        >
          <ArrowRightIcon size={18} />
        </Pressable>
      </View>
      {error && (
        <Text
          accessibilityRole="alert"
          accessibilityLiveRegion="polite"
          style={styles.error}
        >
          {error}
        </Text>
      )}
    </View>
  );
}
const useStyles = makeStyles((colors) => ({
  container: {
    backgroundColor: colors.habitCard,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 24,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  heading: { gap: spacing.xs, alignSelf: 'stretch' },
  name: {
    ...typography.habitName,
    color: colors.ink,
  },
  days: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.chip,
    borderRadius: 18,
    paddingHorizontal: spacing.xs,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  total: { ...typography.label, color: colors.textSecondary },
  open: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.chip,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: controls.pressedOpacity },
  error: { ...typography.caption, color: colors.danger },
}));
