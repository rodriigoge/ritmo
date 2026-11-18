import type { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';
import { makeStyles } from '../../theme/ThemeProvider';
import { controls } from '../../tokens/controls';
import { spacing } from '../../tokens/spacing';
import { fontFamilies } from '../../tokens/typography';
import { ChevronLeftIcon } from '../Icon/Icons';

export const TOP_BAR_CHIP = 44;

/** Screen header: title between two round slots. With align="start" and no
 * back button, the title starts at the left edge (top-level screens). */
export function TopBar({
  title,
  onBack,
  right,
  align = 'center',
}: {
  title: string;
  onBack?: () => void;
  right?: ReactNode;
  align?: 'center' | 'start';
}) {
  const styles = useStyles();
  const start = align === 'start';
  return (
    <View style={styles.bar}>
      <View style={[styles.slot, start && !onBack && styles.collapsed]}>
        {onBack ? (
          <Pressable
            onPress={onBack}
            accessibilityRole="button"
            accessibilityLabel="Voltar"
            hitSlop={(controls.minTouchTarget - TOP_BAR_CHIP) / 2}
            style={({ pressed }) => [styles.chip, pressed && styles.pressed]}
          >
            <ChevronLeftIcon size={20} />
          </Pressable>
        ) : null}
      </View>
      <Text
        accessibilityRole="header"
        numberOfLines={1}
        style={[styles.title, start && styles.titleStart]}
      >
        {title}
      </Text>
      <View style={[styles.slot, styles.end]}>{right}</View>
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  bar: {
    minHeight: controls.minTouchTarget,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  slot: { width: TOP_BAR_CHIP, height: TOP_BAR_CHIP },
  collapsed: { display: 'none' },
  end: { alignItems: 'flex-end' },
  title: {
    flex: 1,
    textAlign: 'center',
    fontFamily: fontFamilies.semibold,
    fontSize: 18,
    lineHeight: 24,
    color: colors.ink,
  },
  titleStart: { textAlign: 'left' },
  chip: {
    width: TOP_BAR_CHIP,
    height: TOP_BAR_CHIP,
    borderRadius: TOP_BAR_CHIP / 2,
    backgroundColor: colors.chip,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: controls.pressedOpacity },
}));
