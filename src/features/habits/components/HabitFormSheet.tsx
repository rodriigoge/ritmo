import { useEffect, useRef, useState } from 'react';
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
  TextInput,
  View,
  useAnimatedValue,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { Button } from '../../../design-system/components/Button/Button';
import { TextField } from '../../../design-system/components/TextField/TextField';
import { colors } from '../../../design-system/tokens/colors';
import { controls } from '../../../design-system/tokens/controls';
import { spacing } from '../../../design-system/tokens/spacing';
import {
  fontFamilies,
  typography,
} from '../../../design-system/tokens/typography';
import {
  MAX_HABIT_NAME_LENGTH,
  normalizeHabitName,
} from '../domain/HabitInput';

const COPY = {
  create: {
    title: 'Novo hábito',
    description:
      'Dê um nome curto ao que você quer repetir. Depois é só marcar cada dia com um toque.',
    action: 'Criar hábito',
    busy: 'Criando…',
    failure: 'Não foi possível criar o hábito. Tente novamente.',
  },
  edit: {
    title: 'Editar hábito',
    description: 'Mude o nome quando quiser. Seu histórico continua o mesmo.',
    action: 'Salvar',
    busy: 'Salvando…',
    failure: 'Não foi possível salvar o hábito. Tente novamente.',
  },
} as const;

const CLOSE_SIZE = 36;
// Short on purpose: the card should feel instant, with just enough motion
// to show where it came from.
const ENTER_MS = 160;
const EXIT_MS = 120;

/** Floating card over a dimmed screen, used to create or rename a habit. */
export function HabitFormSheet({
  onSave,
  mode = 'create',
  initialName = '',
  onClose,
}: {
  mode?: 'create' | 'edit';
  initialName?: string;
  onSave: (name: string) => Promise<void>;
  onClose: () => void;
}) {
  const copy = COPY[mode];
  const [name, setName] = useState(initialName);
  const [error, setError] = useState<string>();
  const [submitting, setSubmitting] = useState(false);
  const sending = useRef(false);
  const input = useRef<TextInput>(null);
  const rise = useAnimatedValue(0);
  const reduceMotion = useRef(false);
  const closing = useRef(false);
  const valid =
    name.trim().length > 0 && name.trim().length <= MAX_HABIT_NAME_LENGTH;

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

  /** Plays the quick exit, then hands control back to the screen. */
  function dismiss() {
    if (closing.current) return;
    closing.current = true;
    if (reduceMotion.current) {
      onClose();
      return;
    }
    Animated.timing(rise, {
      toValue: 0,
      duration: EXIT_MS,
      easing: Easing.in(Easing.cubic),
      useNativeDriver: true,
    }).start(() => onClose());
  }

  async function submit() {
    if (!valid || sending.current) return;
    sending.current = true;
    setSubmitting(true);
    setError(undefined);
    try {
      await onSave(normalizeHabitName(name));
      dismiss();
    } catch {
      setError(copy.failure);
    } finally {
      sending.current = false;
      setSubmitting(false);
    }
  }

  function close() {
    if (!sending.current) dismiss();
  }

  return (
    <Modal
      transparent
      statusBarTranslucent
      animationType="none"
      visible
      onRequestClose={close}
      onShow={() => input.current?.focus()}
    >
      <Animated.View style={[styles.backdrop, { opacity: rise }]}>
        <Pressable
          accessible={false}
          importantForAccessibility="no"
          onPress={close}
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
            onAccessibilityEscape={close}
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
                  {copy.title}
                </Text>
                <Pressable
                  onPress={close}
                  disabled={submitting}
                  accessibilityRole="button"
                  accessibilityLabel="Cancelar"
                  accessibilityState={{ disabled: submitting }}
                  hitSlop={(controls.minTouchTarget - CLOSE_SIZE) / 2}
                  style={({ pressed }) => [
                    styles.close,
                    pressed && styles.pressed,
                    submitting && styles.disabled,
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

              <Text style={styles.description}>{copy.description}</Text>

              <TextField
                ref={input}
                accessibilityLabel="Nome do hábito"
                placeholder="Ex.: Beber 2 litros de água"
                value={name}
                onChangeText={(value) => {
                  setName(value);
                  setError(undefined);
                }}
                autoFocus
                maxLength={MAX_HABIT_NAME_LENGTH}
                returnKeyType="done"
                onSubmitEditing={() => {
                  void submit();
                }}
                disabled={submitting}
                error={error}
              />
              <Button
                label={submitting ? copy.busy : copy.action}
                disabled={!valid || submitting}
                onPress={() => {
                  void submit();
                }}
              />
            </ScrollView>
          </Animated.View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(27, 33, 26, 0.38)',
  },
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
  fill: { flex: 1 },
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
});
