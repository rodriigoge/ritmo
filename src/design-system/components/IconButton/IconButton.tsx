import type { ReactNode } from 'react';
import { Pressable, View, type PressableProps } from 'react-native';
import { makeStyles, useColors } from '../../theme/ThemeProvider';
import { controls } from '../../tokens/controls';
import { radius } from '../../tokens/radius';

export type IconButtonProps = Pick<
  PressableProps,
  'onPress' | 'accessibilityHint' | 'testID'
> & {
  disabled?: boolean;
  variant?: 'default' | 'floating';
  iconAlignment?: 'center' | 'start' | 'end';
  iconSize?: number;
  accessibilityLabel: string;
  renderIcon: (props: { color: string; size: number }) => ReactNode;
};

export function IconButton({
  renderIcon,
  accessibilityLabel,
  disabled = false,
  variant = 'default',
  iconAlignment = 'center',
  iconSize,
  ...props
}: IconButtonProps) {
  const styles = useStyles();
  const colors = useColors();
  return (
    <Pressable
      {...props}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      disabled={disabled}
      accessibilityState={{ disabled }}
      style={({ pressed }) => [
        styles.base,
        iconAlignment === 'start' && styles.alignStart,
        iconAlignment === 'end' && styles.alignEnd,
        variant === 'floating' && styles.floating,
        pressed && !disabled && styles.pressed,
        pressed && !disabled && variant === 'floating' && styles.floating,
        disabled && styles.disabled,
      ]}
    >
      <View
        accessible={false}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        pointerEvents="none"
      >
        {renderIcon({
          color: variant === 'floating' ? colors.onAction : colors.textPrimary,
          size:
            iconSize ??
            (variant === 'floating'
              ? controls.floatingIconSize
              : controls.iconSize),
        })}
      </View>
    </Pressable>
  );
}
const useStyles = makeStyles((colors) => ({
  base: {
    minHeight: controls.minTouchTarget,
    minWidth: controls.minTouchTarget,
    borderRadius: radius.round,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    backgroundColor: colors.surface,
    opacity: controls.pressedOpacity,
  },
  floating: { backgroundColor: colors.floatingAction },
  alignStart: { alignItems: 'flex-start' },
  alignEnd: { alignItems: 'flex-end' },
  disabled: { opacity: controls.disabledOpacity },
}));
