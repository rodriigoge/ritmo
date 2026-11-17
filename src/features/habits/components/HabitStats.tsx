import { useEffect, useRef, type ReactNode } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  View,
  useAnimatedValue,
} from 'react-native';
import { FlameIcon } from '../../../design-system/components/Icon/Icons';
import { colors } from '../../../design-system/tokens/colors';
import { spacing } from '../../../design-system/tokens/spacing';
import {
  fontFamilies,
  typography,
} from '../../../design-system/tokens/typography';
import {
  differenceInCalendarDays,
  toLocalDate,
} from '../../../shared/date/dateUtils';
import type { LocalDate } from '../../../shared/date/LocalDate';
import { useReduceMotion } from '../../../shared/useReduceMotion';
import type { HabitMetrics } from '../domain/HabitMetrics';
import { CompletionBurst } from './CompletionBurst';

const days = (value: number) => (value === 1 ? 'dia' : 'dias');

/** Share of days completed, 0–100, from the start of the habit through
 * today (both ends included). The calendar lets people mark days before
 * the habit was created, so the start is whichever comes first: the
 * creation day or the earliest completion. */
export function completionRate(
  completedDates: readonly LocalDate[],
  createdAt: string,
  today: LocalDate,
): number {
  if (completedDates.length === 0) return 0;
  let start = toLocalDate(new Date(createdAt));
  for (const date of completedDates) {
    if (differenceInCalendarDays(date, start) < 0) start = date;
  }
  const span = differenceInCalendarDays(today, start) + 1;
  if (span <= 0) return 0;
  const done = new Set(completedDates).size;
  return Math.min(100, Math.round((done / span) * 100));
}

/** The three numbers at the top of the habit details. */
export function HabitStats({
  metrics,
  completedDates,
  createdAt,
  today,
  recordId,
}: {
  metrics: HabitMetrics;
  completedDates: readonly LocalDate[];
  createdAt: string;
  today: LocalDate;
  recordId?: number;
}) {
  const rate = completionRate(completedDates, createdAt, today);
  const reduceMotion = useReduceMotion();
  // Each new best streak gets a fresh, growing id, which restarts the
  // confetti on the "Concluídos" card.
  const celebration = reduceMotion ? 0 : (recordId ?? 0);
  const streakLabel =
    metrics.currentStreak === 1 ? 'dia seguido' : 'dias seguidos';
  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <StatCard
          value={metrics.totalCompletions}
          unit={days(metrics.totalCompletions)}
          label="Concluídos"
          accessibilityLabel={`${metrics.totalCompletions} ${days(metrics.totalCompletions)} concluídos`}
          overlay={<CompletionBurst trigger={celebration} big />}
        />
        <StatCard
          value={metrics.currentStreak}
          unit={days(metrics.currentStreak)}
          label="Em sequência"
          accessibilityLabel={`${metrics.currentStreak} ${streakLabel}`}
          icon={
            <FlameIcon
              size={16}
              color={metrics.currentStreak > 0 ? colors.ink : colors.textMuted}
            />
          }
        />
        <StatCard
          value={rate}
          unit="%"
          label="De conclusão"
          accessibilityLabel={`${rate}% dos dias concluídos desde o início`}
        />
      </View>
      <Text
        accessibilityLabel={`Melhor sequência: ${metrics.bestStreak} ${days(metrics.bestStreak)}`}
        style={styles.best}
      >
        Melhor sequência: {metrics.bestStreak} {days(metrics.bestStreak)}
      </Text>
    </View>
  );
}

function StatCard({
  value,
  unit,
  label,
  accessibilityLabel,
  icon,
  overlay,
}: {
  value: number;
  unit: string;
  label: string;
  accessibilityLabel: string;
  icon?: ReactNode;
  overlay?: ReactNode;
}) {
  const opacity = useAnimatedValue(1);
  const previous = useRef(value);
  useEffect(() => {
    if (previous.current === value) return;
    previous.current = value;
    Animated.sequence([
      Animated.timing(opacity, {
        toValue: 0.55,
        duration: 70,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 160,
        useNativeDriver: true,
      }),
    ]).start();
  }, [value, opacity]);

  return (
    <View
      accessible
      accessibilityLabel={accessibilityLabel}
      style={styles.card}
    >
      <Animated.View style={[styles.valueRow, { opacity }]}>
        <Text style={styles.value}>{value}</Text>
        <Text style={[styles.unit, unit === '%' && styles.percent]}>
          {unit}
        </Text>
      </Animated.View>
      <View style={styles.labelRow}>
        {icon}
        <Text numberOfLines={1} style={styles.label}>
          {label}
        </Text>
      </View>
      {overlay}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.md },
  row: { flexDirection: 'row', gap: spacing.sm },
  card: {
    flex: 1,
    minWidth: 0,
    backgroundColor: colors.chip,
    borderRadius: 20,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    gap: spacing.xs,
  },
  valueRow: { flexDirection: 'row', alignItems: 'baseline', gap: 3 },
  value: {
    fontFamily: fontFamilies.bold,
    fontSize: 28,
    lineHeight: 34,
    letterSpacing: -0.6,
    color: colors.ink,
    fontVariant: ['tabular-nums'],
  },
  unit: {
    ...typography.label,
    fontSize: 14,
    color: colors.ink,
  },
  percent: { fontFamily: fontFamilies.bold, fontSize: 18 },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  label: { ...typography.caption, color: colors.textSecondary, flexShrink: 1 },
  best: { ...typography.body, color: colors.textSecondary },
});
