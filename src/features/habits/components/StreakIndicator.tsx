import { useEffect } from 'react';
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

export function StreakIndicator({
  value,
  recordId,
  inline = false,
}: {
  value: number;
  recordId?: number;
  inline?: boolean;
}) {
  const label = value === 1 ? 'dia seguido' : 'dias seguidos';
  const opacity = useAnimatedValue(1);
  const showRecord = recordId !== undefined;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(opacity, {
        toValue: 0.65,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 160,
        useNativeDriver: true,
      }),
    ]).start();
  }, [opacity, value]);

  if (inline) {
    // Card meta row: flame, count and a "record" badge, left aligned.
    return (
      <View style={styles.inlineRow}>
        <View
          accessible
          accessibilityLabel={value + ' ' + label}
          style={styles.inlineMetric}
        >
          <FlameIcon
            size={18}
            color={value > 0 ? colors.ink : colors.textMuted}
          />
          <Animated.Text style={[styles.inline, { opacity }]}>
            {value} {label}
          </Animated.Text>
        </View>
        {showRecord && (
          <Text
            accessibilityLiveRegion="polite"
            style={[styles.record, styles.badge]}
          >
            NOVO RECORDE
          </Text>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View
        accessible
        accessibilityLabel={value + ' ' + label}
        style={styles.metric}
      >
        <Animated.Text style={[styles.value, { opacity }]}>
          {value}
        </Animated.Text>
        <Text style={styles.label}>{label}</Text>
      </View>
      {showRecord && (
        <Text accessibilityLiveRegion="polite" style={styles.record}>
          NOVO RECORDE
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'flex-end' },
  metric: { alignItems: 'flex-end' },
  inlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  inlineMetric: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  inline: {
    ...typography.label,
    color: colors.textSecondary,
  },
  badge: {
    paddingHorizontal: spacing.sm,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#E7F2E5',
  },
  value: {
    ...typography.metric,
    lineHeight: typography.metric.fontSize,
    includeFontPadding: false,
    color: colors.textPrimary,
  },
  label: {
    ...typography.caption,
    includeFontPadding: false,
    color: colors.textSecondary,
  },
  record: {
    ...typography.caption,
    fontFamily: fontFamilies.bold,
    color: colors.accent,
  },
});
