import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Pressable,
  Text,
  View,
  useAnimatedValue,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import {
  makeStyles,
  useColors,
} from '../../../design-system/theme/ThemeProvider';
import { controls } from '../../../design-system/tokens/controls';
import { radius } from '../../../design-system/tokens/radius';
import { spacing } from '../../../design-system/tokens/spacing';
import {
  fontFamilies,
  typography,
} from '../../../design-system/tokens/typography';
import { formatLocalDate } from '../../../shared/date/dateUtils';
import type { LocalDate } from '../../../shared/date/LocalDate';
import { useReduceMotion } from '../../../shared/useReduceMotion';
import { CompletionBurst } from './CompletionBurst';

const AnimatedPath = Animated.createAnimatedComponent(Path);
// "M7 12.5 L10.5 16 L17 9" is about 14.2 units long.
const CHECK_PATH = 'M7 12.5 L10.5 16 L17 9';
const CHECK_LENGTH = 15;
const CELL_SIZE = 40;

type DayStatusProps = {
  date: LocalDate;
  today: LocalDate;
  completed: boolean;
  habitName: string;
  compact?: boolean;
  /** Shorter Home row: weekday and day on one line above the mark. The
   * whole column stays the touch target, at least 52 tall. */
  dense?: boolean;
  disabled?: boolean;
  /** Changes when this completion set a new streak record. */
  recordId?: number;
  onPress?: () => void;
};

export function DayStatus({
  date,
  today,
  completed,
  habitName,
  compact = false,
  dense = false,
  disabled = false,
  recordId,
  onPress,
}: DayStatusProps) {
  const styles = useStyles();
  const colors = useColors();
  const press = useAnimatedValue(1);
  const pop = useAnimatedValue(1);
  const draw = useAnimatedValue(completed ? 1 : 0);
  const reduceMotion = useReduceMotion();
  const [burst, setBurst] = useState({ count: 0, big: false });
  const previous = useRef({ completed, recordId });
  const unavailable = disabled || !onPress;
  const isToday = date === today;
  const description = formatLocalDate(date, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  // Animate only real changes, never the first render.
  useEffect(() => {
    const before = previous.current;
    previous.current = { completed, recordId };
    const newRecord =
      recordId !== undefined && recordId !== before.recordId && completed;
    const justCompleted = completed && !before.completed;

    if (completed !== before.completed) {
      if (reduceMotion) {
        draw.setValue(completed ? 1 : 0);
      } else if (completed) {
        draw.setValue(0);
        Animated.timing(draw, {
          toValue: 1,
          duration: 150,
          easing: Easing.out(Easing.quad),
          useNativeDriver: false,
        }).start();
        pop.setValue(0.8);
        Animated.spring(pop, {
          toValue: 1,
          friction: 4,
          tension: 220,
          useNativeDriver: true,
        }).start();
      } else {
        Animated.timing(draw, {
          toValue: 0,
          duration: 100,
          useNativeDriver: false,
        }).start();
      }
    }

    if (reduceMotion) return;
    if (newRecord) {
      setBurst((current) => ({ count: current.count + 1, big: true }));
    } else if (justCompleted && isToday) {
      setBurst((current) => ({ count: current.count + 1, big: false }));
    }
  }, [completed, recordId, isToday, reduceMotion, draw, pop]);

  return (
    <Pressable
      accessible
      accessibilityRole="checkbox"
      accessibilityState={{ checked: completed, disabled: unavailable }}
      accessibilityLabel={`${habitName}, ${description}${isToday ? ', hoje' : ''}, ${completed ? 'concluído' : 'não concluído'}`}
      disabled={unavailable}
      onPress={(event) => {
        event?.stopPropagation();
        onPress?.();
        if (!completed)
          void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(
            () => {},
          );
      }}
      onPressIn={() =>
        Animated.timing(press, {
          toValue: 0.88,
          duration: 80,
          useNativeDriver: true,
        }).start()
      }
      onPressOut={() =>
        Animated.timing(press, {
          toValue: 1,
          duration: 80,
          useNativeDriver: true,
        }).start()
      }
      style={[
        styles.container,
        compact && styles.compactContainer,
        dense && styles.denseContainer,
        disabled && styles.disabled,
      ]}
    >
      {compact ? (
        // Calendar cell: the day number sits inside the circle.
        <View>
          <Animated.View style={{ transform: [{ scale: press }] }}>
            <Animated.View
              style={[
                styles.cell,
                isToday && !completed && styles.todayCell,
                completed && styles.completed,
                { transform: [{ scale: pop }] },
              ]}
            >
              <Text
                style={[
                  styles.cellText,
                  isToday && styles.todayLabel,
                  completed && styles.completedText,
                ]}
              >
                {formatLocalDate(date, { day: 'numeric' })}
              </Text>
            </Animated.View>
          </Animated.View>
          <CompletionBurst trigger={burst.count} big={burst.big} />
        </View>
      ) : (
        <>
          {dense ? (
            <Text numberOfLines={1} style={styles.denseLabel}>
              {formatLocalDate(date, { weekday: 'short' }).replace('.', '')}{' '}
              <Text style={[styles.denseDay, isToday && styles.todayLabel]}>
                {formatLocalDate(date, { day: '2-digit' })}
              </Text>
            </Text>
          ) : (
            <>
              <Text style={styles.weekday}>
                {formatLocalDate(date, { weekday: 'short' })}
              </Text>
              <Text style={[styles.day, isToday && styles.todayLabel]}>
                {formatLocalDate(date, { day: '2-digit' })}
              </Text>
            </>
          )}
          <View>
            <Animated.View style={{ transform: [{ scale: press }] }}>
              <Animated.View
                style={[
                  styles.mark,
                  completed && styles.completed,
                  { transform: [{ scale: pop }] },
                ]}
              >
                {completed && (
                  <Svg
                    width={controls.iconSize}
                    height={controls.iconSize}
                    viewBox="0 0 24 24"
                    style={styles.check}
                  >
                    <AnimatedPath
                      d={CHECK_PATH}
                      stroke={colors.onAction}
                      strokeWidth={2.6}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="none"
                      strokeDasharray={CHECK_LENGTH}
                      strokeDashoffset={draw.interpolate({
                        inputRange: [0, 1],
                        outputRange: [CHECK_LENGTH, 0],
                      })}
                    />
                  </Svg>
                )}
                {isToday && (
                  <View pointerEvents="none" style={styles.todayRing} />
                )}
              </Animated.View>
            </Animated.View>
            <CompletionBurst trigger={burst.count} big={burst.big} />
          </View>
        </>
      )}
    </Pressable>
  );
}
const useStyles = makeStyles((colors) => ({
  container: {
    flex: 1,
    minWidth: 0,
    minHeight: controls.minTouchTarget,
    alignItems: 'center',
    paddingVertical: spacing.sm,
    gap: spacing.xs,
  },
  compactContainer: { paddingVertical: 3, minHeight: CELL_SIZE + 6 },
  denseContainer: { paddingVertical: 6, gap: 6 },
  denseLabel: { ...typography.caption, color: colors.textSecondary },
  denseDay: { color: colors.textPrimary },
  disabled: { opacity: controls.disabledOpacity },
  weekday: { ...typography.caption, color: colors.textSecondary },
  day: {
    ...typography.body,
    color: colors.textPrimary,
    alignSelf: 'stretch',
    textAlign: 'center',
  },
  todayLabel: { fontFamily: fontFamilies.bold },
  mark: {
    width: controls.iconSize,
    height: controls.iconSize,
    borderRadius: radius.round,
    borderWidth: 1.5,
    borderColor: colors.textMuted,
  },
  completed: {
    backgroundColor: colors.completed,
    borderColor: colors.completed,
  },
  cell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    borderRadius: CELL_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  todayCell: {
    backgroundColor: colors.chip,
    borderWidth: 1.5,
    borderColor: colors.ink,
  },
  cellText: {
    ...typography.body,
    color: colors.textPrimary,
    fontVariant: ['tabular-nums'],
  },
  completedText: { color: colors.onAction, fontFamily: fontFamilies.semibold },
  // The border takes 1.5 units, so pull the full-size check back onto it.
  check: { position: 'absolute', top: -1.5, left: -1.5 },
  todayRing: {
    position: 'absolute',
    inset: -spacing.xs - 1.5,
    borderRadius: radius.round,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.textSecondary,
  },
}));
