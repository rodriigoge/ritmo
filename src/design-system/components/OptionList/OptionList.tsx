import { Children, Fragment, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../tokens/colors';
import { controls } from '../../tokens/controls';
import { spacing } from '../../tokens/spacing';
import { fontFamilies, typography } from '../../tokens/typography';
import { ChevronRightIcon } from '../Icon/Icons';

/** Bordered group of option rows, separated by hairlines. */
export function OptionList({ children }: { children: ReactNode }) {
  const rows = Children.toArray(children);
  return (
    <View style={styles.card}>
      {rows.map((row, index) => (
        <Fragment key={index}>
          {index > 0 && <View style={styles.rule} />}
          {row}
        </Fragment>
      ))}
    </View>
  );
}

/** One tappable row: icon chip, label and a chevron. */
export function OptionRow({
  label,
  icon,
  onPress,
  tone = 'default',
}: {
  label: string;
  icon: ReactNode;
  onPress: () => void;
  tone?: 'default' | 'danger';
}) {
  const danger = tone === 'danger';
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <View
        style={[styles.iconChip, danger && styles.dangerChip]}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      >
        {icon}
      </View>
      <Text style={[styles.label, danger && styles.danger]}>{label}</Text>
      <ChevronRightIcon
        size={18}
        color={danger ? colors.danger : colors.textMuted}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 24,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
  },
  row: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  iconChip: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.chip,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dangerChip: { backgroundColor: '#FBEDEC' },
  label: {
    flex: 1,
    ...typography.body,
    fontFamily: fontFamilies.semibold,
    color: colors.ink,
  },
  danger: { color: colors.danger },
  rule: { height: 1, backgroundColor: colors.cardBorder, marginLeft: 52 },
  pressed: { opacity: controls.pressedOpacity },
});
