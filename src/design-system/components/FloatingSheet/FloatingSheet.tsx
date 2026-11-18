import {
  useEffect,
  useImperativeHandle,
  useRef,
  type ReactNode,
  type Ref,
} from 'react';
import {
  AccessibilityInfo,
  Animated,
  Easing,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useAnimatedValue,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { makeStyles, useColors } from '../../theme/ThemeProvider';
import { controls } from '../../tokens/controls';
import { spacing } from '../../tokens/spacing';
import { fontFamilies, typography } from '../../tokens/typography';

const CLOSE_SIZE = 36;
// Short on purpose: the card should feel instant, with just enough motion
// to show where it came from.
const ENTER_MS = 160;
const EXIT_MS = 120;

export type FloatingSheetHandle = {
  /** Plays the exit animation, then runs `then` (by default, onClose). */
  close: (then?: () => void) => void;
};

/**
 * Card that floats over a dimmed screen, inset from the edges, with a title,
 * a round × button and quick enter/exit motion. Tapping the backdrop, the ×
 * or the system back button closes it, unless `busy`. Pass a `ref` to close
 * it from code (after saving, for example) with the same animation.
 */
export function FloatingSheet({
  title,
  description,
  busy = false,
  onClose,
  onShow,
  children,
  ref,
}: {
  title: string;
  description?: string;
  busy?: boolean;
  onClose: () => void;
  onShow?: () => void;
  children: ReactNode;
  ref?: Ref<FloatingSheetHandle>;
}) {
  const styles = useStyles();
  const colors = useColors();
  const rise = useAnimatedValue(0);
  const reduceMotion = useRef(false);
  const closing = useRef(false);

  useEffect(() => {
    let active = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .catch(() => false)
      .then((reduce) => {
        if (!active) return;
        reduceMotion.current = reduce;
        if (reduce) {
          rise.setValue(1);
          return;
        }
        Animated.timing(rise, {
          toValue: 1,
          duration: ENTER_MS,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }).start();
      });
    return () => {
      active = false;
    };
  }, [rise]);

  function close(then: () => void = onClose) {
    if (closing.current) return;
    closing.current = true;
    if (reduceMotion.current) {
      then();
      return;
    }
    Animated.timing(rise, {
      toValue: 0,
      duration: EXIT_MS,
      easing: Easing.in(Easing.cubic),
      useNativeDriver: true,
    }).start(() => then());
  }
  useImperativeHandle(ref, () => ({ close }));

  const cancel = () => {
    if (!busy) close();
  };

  return (
    <Modal
      transparent
      statusBarTranslucent
      animationType="none"
      visible
      onRequestClose={cancel}
      onShow={onShow}
    >
      <Animated.View style={[styles.backdrop, { opacity: rise }]}>
        <Pressable
          accessible={false}
          importantForAccessibility="no"
          onPress={cancel}
          style={styles.fill}
        />
      </Animated.View>
      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        pointerEvents="box-none"
      >
        <SafeAreaView edges={['bottom']} style={styles.area}>
          <Animated.View
            accessibilityViewIsModal
            onAccessibilityEscape={cancel}
            style={[
              styles.card,
              {
                opacity: rise,
                transform: [
                  {
                    translateY: rise.interpolate({
                      inputRange: [0, 1],
                      outputRange: [32, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <ScrollView
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.content}
              bounces={false}
            >
              <View style={styles.top}>
                <Text accessibilityRole="header" style={styles.title}>
                  {title}
                </Text>
                <Pressable
                  onPress={cancel}
                  disabled={busy}
                  accessibilityRole="button"
                  accessibilityLabel="Cancelar"
                  accessibilityState={{ disabled: busy }}
                  hitSlop={(controls.minTouchTarget - CLOSE_SIZE) / 2}
                  style={({ pressed }) => [
                    styles.close,
                    pressed && styles.pressed,
                    busy && styles.disabled,
                  ]}
                >
                  <Svg width={14} height={14} viewBox="0 0 14 14">
                    <Path
                      d="M2 2 L12 12 M12 2 L2 12"
                      stroke={colors.ink}
                      strokeWidth={2.2}
                      strokeLinecap="round"
                    />
                  </Svg>
                </Pressable>
              </View>
              {description ? (
                <Text style={styles.description}>{description}</Text>
              ) : null}
              {children}
            </ScrollView>
          </Animated.View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const useStyles = makeStyles((colors) => ({
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: colors.scrim,
  },
  fill: { flex: 1 },
  keyboard: { flex: 1, justifyContent: 'flex-end' },
  area: { maxHeight: '100%' },
  card: {
    flexShrink: 1,
    marginBottom: spacing.md,
    marginHorizontal: spacing.md,
    backgroundColor: colors.canvas,
    borderRadius: 36,
    overflow: 'hidden',
  },
  content: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
    gap: spacing.lg,
  },
  top: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    marginBottom: -spacing.sm,
  },
  close: {
    width: CLOSE_SIZE,
    height: CLOSE_SIZE,
    borderRadius: CLOSE_SIZE / 2,
    backgroundColor: colors.chip,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: controls.pressedOpacity },
  disabled: { opacity: controls.disabledOpacity },
  title: {
    flex: 1,
    marginTop: spacing.xs,
    fontFamily: fontFamilies.bold,
    fontSize: 26,
    lineHeight: 32,
    letterSpacing: -0.4,
    color: colors.ink,
  },
  description: { ...typography.body, color: colors.textSecondary },
}));
