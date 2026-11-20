import type { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';
import {
  ArrowRightIcon,
  CheckCircleIcon,
  FlameIcon,
} from '../../../design-system/components/Icon/Icons';
import {
  makeStyles,
  useColors,
} from '../../../design-system/theme/ThemeProvider';
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
  dragHandle,
  variant = 'default',
}: {
  /** "minimal": name, streak and total on one line, and a shorter days row. */
  variant?: 'default' | 'minimal';
  habit: HabitWithHistory;
  /** Grip shown at the top right while the list can be reordered. */
  dragHandle?: ReactNode;
  today: LocalDate;
  onPress?: () => void;
  onToggleDay?: (date: LocalDate) => void;
  error?: string;
  recordId?: number;
}) {
  const styles = useStyles();
  const colors = useColors();
  const metrics = useHabitMetrics(habit.completedDates, today);
  const days = useRecentActivity(habit.completedDates, habit.createdAt, today);
  const dayRow = (
    <View style={styles.days}>
      {days.map(({ date, completed, disabled }) => (
        <DayStatus
          key={date}
          date={date}
          today={today}
          habitName={habit.name}
          completed={completed}
          disabled={disabled}
          dense={variant === 'minimal'}
          recordId={date === today ? recordId : undefined}
          onPress={onToggleDay ? () => onToggleDay(date) : undefined}
        />
      ))}
    </View>
  );
  const errorText = error ? (
    <Text
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
      style={styles.error}
    >
      {error}
    </Text>
  ) : null;

  if (variant === 'minimal') {
    const streakLabel =
      metrics.currentStreak === 1 ? 'dia seguido' : 'dias seguidos';
    const totalLabel =
      metrics.totalCompletions === 1 ? 'conclusão' : 'conclusões';
    const record = recordId !== undefined;
    return (
      <View
        style={[styles.container, styles.minimalContainer]}
        testID={`habit-${habit.id}`}
      >
        <View style={styles.minimalTop}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Ver detalhes de ${habit.name}`}
            onPress={onPress}
            style={({ pressed }) => [
              styles.minimalHeading,
              pressed && styles.pressed,
            ]}
          >
            <Text
              accessibilityRole="header"
              numberOfLines={1}
              style={styles.name}
            >
              {habit.name}
            </Text>
          </Pressable>
          <View style={styles.stats}>
            <View
              accessible
              accessibilityLabel={`${metrics.currentStreak} ${streakLabel}${record ? ', novo recorde' : ''}`}
              accessibilityLiveRegion={record ? 'polite' : undefined}
              style={styles.stat}
            >
              <FlameIcon
                size={16}
                color={
                  record
                    ? colors.accent
                    : metrics.currentStreak > 0
                      ? colors.ink
                      : colors.textMuted
                }
              />
              <Text style={[styles.statValue, record && styles.recordValue]}>
                {metrics.currentStreak}
              </Text>
            </View>
            <View
              accessible
              accessibilityLabel={`${metrics.totalCompletions} ${totalLabel}`}
              style={styles.stat}
            >
              <CheckCircleIcon size={16} />
              <Text style={styles.statValue}>{metrics.totalCompletions}</Text>
            </View>
          </View>
          {dragHandle ? (
            <View style={styles.minimalHandle}>{dragHandle}</View>
          ) : null}
        </View>
        {dayRow}
        {errorText}
      </View>
    );
  }

  return (
    <View style={styles.container} testID={`habit-${habit.id}`}>
      <View style={styles.top}>
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
        {dragHandle ? <View style={styles.handle}>{dragHandle}</View> : null}
      </View>
      {dayRow}
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
      {errorText}
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
  top: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  heading: { flex: 1, gap: spacing.xs },
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
  // The grip's 40px touch area overhangs the card padding a little.
  handle: { marginTop: -8, marginRight: -8 },
  minimalContainer: {
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    gap: spacing.sm,
  },
  minimalTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: 32,
  },
  minimalHeading: { flex: 1, minWidth: 0 },
  minimalHandle: { marginVertical: -4, marginRight: -8, marginLeft: -4 },
  stats: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  stat: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statValue: {
    ...typography.label,
    fontSize: 15,
    color: colors.ink,
    fontVariant: ['tabular-nums'],
  },
  recordValue: { color: colors.accent },
  error: { ...typography.caption, color: colors.danger },
}));
