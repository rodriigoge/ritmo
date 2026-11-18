import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TopBar } from '../../../design-system/components/TopBar/TopBar';
import {
  makeStyles,
  useTheme,
} from '../../../design-system/theme/ThemeProvider';
import type { ThemePreference } from '../../../design-system/theme/themeStorage';
import {
  darkColors,
  lightColors,
  type ColorPalette,
} from '../../../design-system/tokens/colors';
import { controls } from '../../../design-system/tokens/controls';
import { spacing } from '../../../design-system/tokens/spacing';
import {
  fontFamilies,
  typography,
} from '../../../design-system/tokens/typography';

export const THEME_LABELS: Record<ThemePreference, string> = {
  system: 'Sistema',
  light: 'Claro',
  dark: 'Escuro',
};

const OPTIONS: ThemePreference[] = ['light', 'dark', 'system'];

export function ThemeScreen({ onBack }: { onBack: () => void }) {
  const styles = useStyles();
  const { preference, setPreference } = useTheme();
  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <TopBar title="Temas" onBack={onBack} />
        <View style={styles.intro}>
          <Text accessibilityRole="header" style={styles.title}>
            Como você prefere ver o Ritmo?
          </Text>
          <Text style={styles.body}>
            A escolha fica salva neste celular. Em “Sistema”, o app segue o
            modo claro ou escuro do aparelho.
          </Text>
        </View>
        <View accessibilityRole="radiogroup" style={styles.options}>
          {OPTIONS.map((option) => {
            const selected = preference === option;
            return (
              <Pressable
                key={option}
                onPress={() => setPreference(option)}
                accessibilityRole="radio"
                accessibilityLabel={THEME_LABELS[option]}
                accessibilityState={{ checked: selected }}
                style={({ pressed }) => [
                  styles.option,
                  selected && styles.selected,
                  pressed && styles.pressed,
                ]}
              >
                <ThemePreview option={option} />
                <View style={styles.footer}>
                  <Text style={styles.label}>{THEME_LABELS[option]}</Text>
                  <View style={[styles.radio, selected && styles.radioOn]}>
                    {selected && <View style={styles.radioDot} />}
                  </View>
                </View>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/** Tiny habit card drawn in the palette it represents. "Sistema" shows
 * both, split down the middle. */
function ThemePreview({ option }: { option: ThemePreference }) {
  const styles = useStyles();
  if (option === 'system') {
    return (
      <View style={[styles.preview, styles.split]}>
        <View style={styles.half}>
          <MiniCard palette={lightColors} />
        </View>
        <View style={[styles.half, styles.rightHalf]}>
          <MiniCard palette={darkColors} />
        </View>
      </View>
    );
  }
  return (
    <View style={styles.preview}>
      <MiniCard palette={option === 'dark' ? darkColors : lightColors} />
    </View>
  );
}

function MiniCard({ palette }: { palette: ColorPalette }) {
  const styles = useStyles();
  return (
    <View
      style={[styles.miniScreen, { backgroundColor: palette.canvas }]}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <View
        style={[
          styles.miniCard,
          {
            backgroundColor: palette.habitCard,
            borderColor: palette.cardBorder,
          },
        ]}
      >
        <View style={[styles.miniLine, { backgroundColor: palette.ink }]} />
        <View
          style={[
            styles.miniLine,
            styles.miniShort,
            { backgroundColor: palette.textMuted },
          ]}
        />
        <View style={styles.miniDots}>
          {[true, true, false].map((done, index) => (
            <View
              key={index}
              style={[
                styles.miniDot,
                done
                  ? { backgroundColor: palette.completed }
                  : { borderWidth: 1, borderColor: palette.textMuted },
              ]}
            />
          ))}
        </View>
      </View>
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  screen: { flex: 1, backgroundColor: colors.canvas },
  content: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl,
    gap: spacing.xl,
  },
  intro: { gap: spacing.sm, marginTop: spacing.md },
  title: {
    ...typography.title,
    fontFamily: fontFamilies.bold,
    letterSpacing: -0.4,
    color: colors.ink,
  },
  body: { ...typography.body, color: colors.textSecondary },
  options: { flexDirection: 'row', gap: spacing.sm },
  option: {
    flex: 1,
    minWidth: 0,
    borderWidth: 1.5,
    borderColor: colors.cardBorder,
    borderRadius: 22,
    padding: spacing.sm,
    gap: spacing.md,
  },
  selected: { borderColor: colors.ink, borderWidth: 2, padding: spacing.sm - 0.5 },
  pressed: { opacity: controls.pressedOpacity },
  preview: {
    height: 104,
    borderRadius: 14,
    overflow: 'hidden',
  },
  split: { flexDirection: 'row' },
  half: { flex: 1, overflow: 'hidden' },
  rightHalf: { alignItems: 'flex-end' },
  miniScreen: {
    flex: 1,
    alignSelf: 'stretch',
    justifyContent: 'center',
    padding: spacing.sm,
  },
  miniCard: {
    borderWidth: 1,
    borderRadius: 10,
    padding: spacing.sm,
    gap: 5,
  },
  miniLine: { height: 6, borderRadius: 3, width: '80%' },
  miniShort: { width: '50%', height: 4 },
  miniDots: { flexDirection: 'row', gap: 4, marginTop: 2 },
  miniDot: { width: 10, height: 10, borderRadius: 5 },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xs,
    paddingBottom: spacing.xs,
  },
  label: {
    ...typography.body,
    fontFamily: fontFamilies.semibold,
    color: colors.ink,
    flexShrink: 1,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.textMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOn: { borderColor: colors.ink },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.ink },
}));
