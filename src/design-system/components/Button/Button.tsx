import type { ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  Text,
  View,
  type PressableProps,
} from 'react-native';
import { makeStyles, useColors } from '../../theme/ThemeProvider';
import { controls } from '../../tokens/controls';
import { radius } from '../../tokens/radius';
import { spacing } from '../../tokens/spacing';
import { fontFamilies, typography } from '../../tokens/typography';

export type ButtonProps = Pick<
  PressableProps,
  'onPress' | 'accessibilityHint' | 'testID'
> & {
  disabled?: boolean;
  /** Shows a spinner and blocks presses while an action is running. */
  loading?: boolean;
  label: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  shape?: 'rounded' | 'pill';
  /** Decorative leading icon; the label stays the accessible name. */
  icon?: ReactNode;
};

const darkLabelVariants = new Set(['secondary', 'outline']);

export function Button({
  label,
  variant = 'primary',
  shape = 'rounded',
  disabled = false,
  loading = false,
  icon,
  ...props
}: ButtonProps) {
  const styles = useStyles();
  const colors = useColors();
  const blocked = disabled || loading;
  const darkLabel = darkLabelVariants.has(variant);
  return (
    <Pressable
      {...props}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: blocked, busy: loading }}
      disabled={blocked}
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        shape === 'pill' && styles.pill,
        pressed && !blocked && styles.pressed,
        disabled && styles.disabled,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          color={darkLabel ? colors.ink : colors.onAction}
          accessibilityElementsHidden
          importantForAccessibility="no"
        />
      ) : (
        <View style={styles.content}>
          {icon ? (
            <View
              accessibilityElementsHidden
              importantForAccessibility="no-hide-descendants"
            >
              {icon}
            </View>
          ) : null}
          <Text style={[styles.label, darkLabel && styles.darkLabel]}>
            {label}
          </Text>
        </View>
      )}
    </Pressable>
  );
}
const useStyles = makeStyles((colors) => ({
  base: {
    minHeight: controls.minTouchTarget,
    minWidth: controls.minTouchTarget,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.control,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  pill: { minHeight: 56, borderRadius: 28 },
  danger: { backgroundColor: colors.danger },
  primary: { backgroundColor: colors.textPrimary },
  secondary: { backgroundColor: colors.surface },
  outline: {
    backgroundColor: colors.canvas,
    borderWidth: 1.5,
    borderColor: colors.ink,
  },
  label: {
    ...typography.body,
    fontFamily: fontFamilies.semibold,
    color: colors.onAction,
    textAlign: 'center',
  },
  darkLabel: { color: colors.ink },
  pressed: { opacity: controls.pressedOpacity },
  disabled: { opacity: controls.disabledOpacity },
}));
