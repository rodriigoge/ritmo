import type { ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { IconButton } from '../../../design-system/components/IconButton/IconButton';
import { Logo } from '../../../design-system/components/Logo/Logo';
import {
  makeStyles,
  useColors,
} from '../../../design-system/theme/ThemeProvider';
import { controls } from '../../../design-system/tokens/controls';
import { spacing } from '../../../design-system/tokens/spacing';
import {
  fontFamilies,
  typography,
} from '../../../design-system/tokens/typography';
import { AuthIllustration, type AuthScene } from './AuthIllustration';

export function AuthScaffold({
  scene,
  title,
  subtitle,
  onBack,
  children,
  footer,
}: {
  scene: AuthScene;
  title: string;
  subtitle?: string;
  onBack?: () => void;
  children: ReactNode;
  footer?: ReactNode;
}) {
  const styles = useStyles();
  const colors = useColors();
  const { height } = useWindowDimensions();
  return (
    <SafeAreaView style={styles.screen}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            {onBack ? (
              <IconButton
                accessibilityLabel="Voltar"
                onPress={onBack}
                iconAlignment="start"
                renderIcon={({ size }) => (
                  <Svg width={size} height={size} viewBox="0 0 24 24">
                    <Path
                      d="M15 5 L8 12 L15 19"
                      stroke={colors.ink}
                      strokeWidth={2.5}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="none"
                    />
                  </Svg>
                )}
              />
            ) : (
              <Logo height={24} />
            )}
          </View>
          <View style={styles.hero}>
            <AuthIllustration
              scene={scene}
              height={Math.min(150, height * 0.18)}
            />
            <Text accessibilityRole="header" style={styles.title}>
              {title}
            </Text>
            {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
          </View>
          <View style={styles.body}>{children}</View>
          {footer ? <View style={styles.footer}>{footer}</View> : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export function OrDivider() {
  const styles = useStyles();
  return (
    <View
      style={styles.divider}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <View style={styles.rule} />
      <Text style={styles.dividerLabel}>ou</Text>
      <View style={styles.rule} />
    </View>
  );
}

export function TextLink({
  label,
  onPress,
  disabled,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  const styles = useStyles();
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="link"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      hitSlop={spacing.md}
      style={({ pressed }) => pressed && styles.pressed}
    >
      <Text style={styles.link}>{label}</Text>
    </Pressable>
  );
}

export function FooterPrompt({
  prompt,
  action,
  onPress,
}: {
  prompt: string;
  action: string;
  onPress: () => void;
}) {
  const styles = useStyles();
  return (
    <View style={styles.prompt}>
      <Text style={styles.promptText}>{prompt}</Text>
      <TextLink label={action} onPress={onPress} />
    </View>
  );
}

export function FormMessage({
  message,
  tone = 'error',
}: {
  message?: string;
  tone?: 'error' | 'info';
}) {
  const styles = useStyles();
  if (!message) return null;
  return (
    <Text
      accessibilityRole={tone === 'error' ? 'alert' : undefined}
      accessibilityLiveRegion="polite"
      style={[styles.message, tone === 'info' && styles.info]}
    >
      {message}
    </Text>
  );
}

const useStyles = makeStyles((colors) => ({
  screen: { flex: 1, backgroundColor: colors.canvas },
  flex: { flex: 1 },
  content: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
  },
  header: {
    height: controls.minTouchTarget,
    flexDirection: 'row',
    alignItems: 'center',
  },
  hero: {
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.title,
    fontFamily: fontFamilies.bold,
    color: colors.ink,
    textAlign: 'center',
    letterSpacing: -0.4,
    marginTop: spacing.lg,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  body: { gap: spacing.lg },
  footer: {
    flexGrow: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingTop: spacing.xl,
  },
  divider: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  rule: { flex: 1, height: 1, backgroundColor: colors.border },
  dividerLabel: { ...typography.label, color: colors.textMuted },
  link: {
    ...typography.body,
    fontFamily: fontFamilies.semibold,
    color: colors.ink,
    textDecorationLine: 'underline',
  },
  pressed: { opacity: controls.pressedOpacity },
  prompt: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  promptText: { ...typography.body, color: colors.textSecondary },
  message: {
    ...typography.body,
    color: colors.danger,
    textAlign: 'center',
  },
  info: { color: colors.textSecondary },
}));
