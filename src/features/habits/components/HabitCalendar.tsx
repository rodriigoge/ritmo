import { useEffect, useRef, useState, type ReactNode } from 'react';
import {
  Animated,
  Pressable,
  Text,
  View,
  useAnimatedValue,
} from 'react-native';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
} from '../../../design-system/components/Icon/Icons';
import { makeStyles } from '../../../design-system/theme/ThemeProvider';
import { controls } from '../../../design-system/tokens/controls';
import { spacing } from '../../../design-system/tokens/spacing';
import {
  fontFamilies,
  typography,
} from '../../../design-system/tokens/typography';
import {
  differenceInCalendarDays,
  formatLocalDate,
  getMonthWeeks,
  shiftMonth,
  startOfMonth,
  startOfYear,
  toLocalDate,
} from '../../../shared/date/dateUtils';
import type { LocalDate } from '../../../shared/date/LocalDate';
import { validateCompletionDate } from '../domain/validateCompletionDate';
import type { HabitWithHistory } from '../hooks/useHabits';
import { DayStatus } from './DayStatus';

const weekdays = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];
const NAV_SIZE = 36;

export function HabitCalendar({
  habit,
  today,
  onToggleDay,
}: {
  habit: HabitWithHistory;
  today: LocalDate;
  onToggleDay?: (date: LocalDate) => void;
}) {
  const styles = useStyles();
  const [selectedMonth, setSelectedMonth] = useState(() => startOfMonth(today));
  const createdDate = toLocalDate(new Date(habit.createdAt));
  const firstMonth: LocalDate = '0000-01-01';
  const lastMonth = shiftMonth(startOfYear(today), 11);
  const month =
    differenceInCalendarDays(selectedMonth, lastMonth) > 0
      ? lastMonth
      : differenceInCalendarDays(selectedMonth, firstMonth) < 0
        ? firstMonth
        : selectedMonth;
  const previousDisabled = differenceInCalendarDays(month, firstMonth) <= 0;
  const nextDisabled = differenceInCalendarDays(month, lastMonth) >= 0;
  const gridOpacity = useAnimatedValue(1);
  const previousMonth = useRef(month);
  useEffect(() => {
    if (previousMonth.current === month) return;
    previousMonth.current = month;
    Animated.sequence([
      Animated.timing(gridOpacity, {
        toValue: 0.7,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.timing(gridOpacity, {
        toValue: 1,
        duration: 130,
        useNativeDriver: true,
      }),
    ]).start();
  }, [gridOpacity, month]);

  const monthLabel = formatLocalDate(month, { month: 'long', year: 'numeric' });
  return (
    <View style={styles.calendar}>
      <View style={styles.navigation}>
        <Text
          accessibilityRole="header"
          accessibilityLabel={monthLabel}
          accessibilityLiveRegion="polite"
          style={styles.title}
        >
          {/* "novembro de 2026" → "Novembro de 2026": only the first letter. */}
          {monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1)}
        </Text>
        <View style={styles.arrows}>
          <MonthButton
            label="Mês anterior"
            disabled={previousDisabled}
            onPress={() => setSelectedMonth(shiftMonth(month, -1))}
          >
            <ChevronLeftIcon size={16} />
          </MonthButton>
          <MonthButton
            label="Mês seguinte"
            disabled={nextDisabled}
            onPress={() => setSelectedMonth(shiftMonth(month, 1))}
          >
            <ChevronRightIcon size={16} />
          </MonthButton>
        </View>
      </View>
      <Animated.View style={[styles.weeks, { opacity: gridOpacity }]}>
        <View style={styles.row}>
          {weekdays.map((day) => (
            <Text key={day} style={styles.weekday}>
              {day}
            </Text>
          ))}
        </View>
        {getMonthWeeks(month).map((week, index) => (
          <View key={index} style={styles.row}>
            {week.map((date, column) => {
              if (!date) return <View key={column} style={styles.empty} />;
              let disabled = false;
              try {
                validateCompletionDate(date, createdDate, today);
              } catch {
                disabled = true;
              }
              return (
                <DayStatus
                  key={date}
                  date={date}
                  today={today}
                  habitName={habit.name}
                  completed={habit.completedDates.includes(date)}
                  disabled={disabled}
                  compact
                  onPress={onToggleDay ? () => onToggleDay(date) : undefined}
                />
              );
            })}
          </View>
        ))}
      </Animated.View>
    </View>
  );
}
function MonthButton({
  label,
  disabled,
  onPress,
  children,
}: {
  label: string;
  disabled: boolean;
  onPress: () => void;
  children: ReactNode;
}) {
  const styles = useStyles();
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      hitSlop={(controls.minTouchTarget - NAV_SIZE) / 2}
      style={({ pressed }) => [
        styles.navButton,
        pressed && styles.pressed,
        disabled && styles.navDisabled,
      ]}
    >
      {children}
    </Pressable>
  );
}

const useStyles = makeStyles((colors) => ({
  calendar: {
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 24,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    gap: spacing.md,
  },
  navigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xs,
  },
  title: {
    ...typography.habitName,
    fontSize: 18,
    flexShrink: 1,
    color: colors.ink,
  },
  arrows: { flexDirection: 'row', gap: spacing.sm },
  navButton: {
    width: NAV_SIZE,
    height: NAV_SIZE,
    borderRadius: NAV_SIZE / 2,
    backgroundColor: colors.chip,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navDisabled: { opacity: 0.35 },
  pressed: { opacity: controls.pressedOpacity },
  weeks: { alignSelf: 'stretch', gap: 2 },
  row: { flexDirection: 'row' },
  weekday: {
    ...typography.caption,
    fontFamily: fontFamilies.semibold,
    fontSize: 11,
    letterSpacing: 0.4,
    color: colors.textMuted,
    textAlign: 'center',
    flex: 1,
    minWidth: 0,
    paddingBottom: spacing.xs,
  },
  empty: { flex: 1, minWidth: 0 },
}));
