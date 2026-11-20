import { useEffect } from 'react';
import {
  Animated,
  Easing,
  View,
  useAnimatedValue,
  type DimensionValue,
} from 'react-native';
import { makeStyles } from '../../../design-system/theme/ThemeProvider';
import { spacing } from '../../../design-system/tokens/spacing';
import { useReduceMotion } from '../../../shared/useReduceMotion';
import type { HomeLayout } from '../homeLayout/HomeLayoutProvider';

const CARDS = 3;
const DAYS = 6;

/**
 * Placeholder cards with the shape of the real ones (for the chosen Home
 * layout) while habits load. Everything pulses together; with reduced
 * motion it stays still.
 */
export function HabitListSkeleton({ layout }: { layout: HomeLayout }) {
  const styles = useStyles();
  const pulse = useAnimatedValue(1);
  const reduceMotion = useReduceMotion();

  useEffect(() => {
    if (reduceMotion) {
      pulse.setValue(1);
      return;
    }
    const step = (toValue: number) =>
      Animated.timing(pulse, {
        toValue,
        duration: 700,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      });
    const loop = Animated.loop(Animated.sequence([step(0.45), step(1)]));
    loop.start();
    return () => loop.stop();
  }, [pulse, reduceMotion]);

  return (
    <Animated.View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel="Carregando hábitos…"
      accessibilityLiveRegion="polite"
      style={[styles.list, { opacity: pulse }]}
    >
      {Array.from({ length: CARDS }, (_, index) =>
        layout === 'minimal' ? (
          <MinimalCard key={index} />
        ) : (
          <DefaultCard key={index} />
        ),
      )}
    </Animated.View>
  );
}

function Bar({
  width,
  height = 12,
  round = false,
  onChip = false,
}: {
  width: DimensionValue;
  height?: number;
  round?: boolean;
  /** Inside the grey day strip the bar needs a darker shade to show. */
  onChip?: boolean;
}) {
  const styles = useStyles();
  return (
    <View
      style={[
        styles.bar,
        onChip && styles.barOnChip,
        { width, height, borderRadius: round ? height / 2 : 6 },
      ]}
    />
  );
}

function DayStrip({ dense }: { dense: boolean }) {
  const styles = useStyles();
  return (
    <View style={[styles.strip, dense && styles.stripDense]}>
      {Array.from({ length: DAYS }, (_, index) => (
        <View key={index} style={[styles.day, dense && styles.dayDense]}>
          <Bar width={dense ? 30 : 22} height={10} onChip />
          {!dense && <Bar width={18} height={14} onChip />}
          <View style={styles.circle} />
        </View>
      ))}
    </View>
  );
}

function DefaultCard() {
  const styles = useStyles();
  return (
    <View style={styles.card}>
      <Bar width="38%" height={12} />
      <Bar width="62%" height={22} />
      <DayStrip dense={false} />
      <View style={styles.footer}>
        <Bar width="28%" height={12} />
        <Bar width={40} height={40} round />
      </View>
    </View>
  );
}

function MinimalCard() {
  const styles = useStyles();
  return (
    <View style={[styles.card, styles.cardMinimal]}>
      <View style={styles.minimalTop}>
        <View style={styles.flex}>
          <Bar width="70%" height={22} />
        </View>
        <Bar width={34} height={16} />
        <Bar width={34} height={16} />
      </View>
      <DayStrip dense />
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  list: { gap: spacing.md },
  card: {
    backgroundColor: colors.habitCard,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 24,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  cardMinimal: {
    paddingTop: spacing.md,
    gap: spacing.sm,
  },
  bar: { backgroundColor: colors.chip },
  barOnChip: { backgroundColor: colors.cardBorder },
  strip: {
    flexDirection: 'row',
    backgroundColor: colors.chip,
    borderRadius: 18,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.sm,
  },
  stripDense: { paddingVertical: 6 },
  day: { flex: 1, alignItems: 'center', gap: spacing.xs },
  dayDense: { gap: 6 },
  circle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.cardBorder,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  minimalTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: 32,
  },
  flex: { flex: 1 },
}));
