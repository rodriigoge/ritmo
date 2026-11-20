import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TopBar } from '../../../design-system/components/TopBar/TopBar';
import { makeStyles } from '../../../design-system/theme/ThemeProvider';
import { controls } from '../../../design-system/tokens/controls';
import { spacing } from '../../../design-system/tokens/spacing';
import {
  fontFamilies,
  typography,
} from '../../../design-system/tokens/typography';
import {
  HOME_LAYOUT_LABELS,
  useHomeLayout,
  type HomeLayout,
} from '../../habits/homeLayout/HomeLayoutProvider';

const OPTIONS: { value: HomeLayout; hint: string }[] = [
  { value: 'default', hint: 'Sequência e conclusões por extenso' },
  { value: 'minimal', hint: 'Cards mais baixos, só com ícones' },
];

export function HomeLayoutScreen({ onBack }: { onBack: () => void }) {
  const styles = useStyles();
  const { layout, setLayout } = useHomeLayout();
  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <TopBar title="Layout da Home" onBack={onBack} />
        <View style={styles.intro}>
          <Text accessibilityRole="header" style={styles.title}>
            Como os hábitos aparecem?
          </Text>
          <Text style={styles.body}>
            No Minimalista, cada card ocupa menos espaço e cabem mais hábitos na
            tela. A escolha fica salva neste celular.
          </Text>
        </View>
        <View accessibilityRole="radiogroup" style={styles.options}>
          {OPTIONS.map(({ value, hint }) => {
            const selected = layout === value;
            return (
              <Pressable
                key={value}
                onPress={() => setLayout(value)}
                accessibilityRole="radio"
                accessibilityLabel={HOME_LAYOUT_LABELS[value]}
                accessibilityHint={hint}
                accessibilityState={{ checked: selected }}
                style={({ pressed }) => [
                  styles.option,
                  selected && styles.selected,
                  pressed && styles.pressed,
                ]}
              >
                <View
                  style={styles.preview}
                  accessibilityElementsHidden
                  importantForAccessibility="no-hide-descendants"
                >
                  {value === 'default' ? (
                    <DefaultPreview />
                  ) : (
                    <MinimalPreview />
                  )}
                  {value === 'default' ? null : <MinimalPreview />}
                </View>
                <View style={styles.footer}>
                  <View style={styles.texts}>
                    <Text style={styles.label}>
                      {HOME_LAYOUT_LABELS[value]}
                    </Text>
                    <Text style={styles.hint}>{hint}</Text>
                  </View>
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

function Dots({ big }: { big: boolean }) {
  const styles = useStyles();
  return (
    <View
      style={[styles.dayStrip, big ? styles.dayStripBig : styles.dayStripSmall]}
    >
      {[true, true, false, true].map((done, index) => (
        <View key={index} style={styles.dayColumn}>
          {big && <View style={styles.tinyLine} />}
          <View style={[styles.dot, done ? styles.dotDone : styles.dotOpen]} />
        </View>
      ))}
    </View>
  );
}

function DefaultPreview() {
  const styles = useStyles();
  return (
    <View style={styles.miniCard}>
      <View style={[styles.line, styles.lineMeta]} />
      <View style={[styles.line, styles.lineName]} />
      <Dots big />
      <View style={[styles.line, styles.lineMeta]} />
    </View>
  );
}

function MinimalPreview() {
  const styles = useStyles();
  return (
    <View style={[styles.miniCard, styles.miniCardMinimal]}>
      <View style={styles.minimalTop}>
        <View style={[styles.line, styles.lineNameShort]} />
        <View style={styles.badges}>
          <View style={styles.badge} />
          <View style={styles.badge} />
        </View>
      </View>
      <Dots big={false} />
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
  selected: {
    borderColor: colors.ink,
    borderWidth: 2,
    padding: spacing.sm - 0.5,
  },
  pressed: { opacity: controls.pressedOpacity },
  preview: {
    height: 150,
    borderRadius: 14,
    backgroundColor: colors.chip,
    padding: spacing.sm,
    gap: spacing.sm,
    justifyContent: 'center',
  },
  miniCard: {
    backgroundColor: colors.habitCard,
    borderColor: colors.cardBorder,
    borderWidth: 1,
    borderRadius: 10,
    padding: spacing.sm,
    gap: 6,
  },
  miniCardMinimal: { gap: 5, paddingVertical: 6 },
  line: { height: 5, borderRadius: 3, backgroundColor: colors.textMuted },
  lineMeta: { width: '40%', opacity: 0.6 },
  lineName: { width: '70%', height: 7, backgroundColor: colors.ink },
  lineNameShort: { flex: 1, height: 7, backgroundColor: colors.ink },
  minimalTop: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  badges: { flexDirection: 'row', gap: 3 },
  badge: {
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: colors.ink,
  },
  dayStrip: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: colors.chip,
    borderRadius: 6,
  },
  dayStripBig: { paddingVertical: 5 },
  dayStripSmall: { paddingVertical: 3 },
  dayColumn: { alignItems: 'center', gap: 3 },
  tinyLine: {
    width: 8,
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.textMuted,
  },
  dot: { width: 9, height: 9, borderRadius: 5 },
  dotDone: { backgroundColor: colors.completed },
  dotOpen: { borderWidth: 1, borderColor: colors.textMuted },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.xs,
    paddingHorizontal: spacing.xs,
    paddingBottom: spacing.xs,
  },
  texts: { flex: 1, gap: 2 },
  label: {
    ...typography.body,
    fontFamily: fontFamilies.semibold,
    color: colors.ink,
  },
  hint: { ...typography.caption, color: colors.textSecondary },
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
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.ink,
  },
}));
