import { StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { colors } from '../../../design-system/tokens/colors';
import { spacing } from '../../../design-system/tokens/spacing';
import {
  fontFamilies,
  typography,
} from '../../../design-system/tokens/typography';
import { PingoArt } from '../../onboarding/illustrations/PingoArt';

/** First-run state of the home: Pingo invites the user to start small. */
export function EmptyHabits() {
  return (
    <View style={styles.container}>
      <View
        style={styles.bubble}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      >
        <Text style={styles.bubbleText}>Bora começar?</Text>
        <View style={styles.tail} />
      </View>
      <PingoArt pose="cheer" height={190} />
      <Text accessibilityRole="header" style={styles.title}>
        Nenhum hábito ainda
      </Text>
      <Text style={styles.body}>
        Comece com algo pequeno, como beber água ou ler 10 páginas. Toque no
        botão + para criar seu primeiro hábito.
      </Text>
    </View>
  );
}

/** Hand-drawn arrow from the empty state down to the floating + button.
 * Place it absolutely, just above and left of that button. */
export function CreateHabitHint() {
  return (
    <View
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={styles.hint}
    >
      <Text style={styles.hintText}>Comece por aqui</Text>
      <Svg width={92} height={104} viewBox="0 0 92 104">
        <Path
          d="M6 10 C30 2 58 12 54 34 C51 50 30 46 36 34 C44 20 74 30 80 90"
          stroke={colors.ink}
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <Path
          d="M68 80 L80 94 L88 76"
          stroke={colors.ink}
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxxl,
    gap: spacing.sm,
  },
  bubble: {
    borderWidth: 2,
    borderColor: colors.ink,
    borderRadius: 20,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.canvas,
    marginBottom: -spacing.xs,
  },
  bubbleText: {
    ...typography.body,
    fontFamily: fontFamilies.semibold,
    color: colors.ink,
  },
  tail: {
    position: 'absolute',
    bottom: -7,
    left: '50%',
    marginLeft: -6,
    width: 12,
    height: 12,
    backgroundColor: colors.canvas,
    borderRightWidth: 2,
    borderBottomWidth: 2,
    borderColor: colors.ink,
    transform: [{ rotate: '45deg' }],
  },
  title: {
    ...typography.title,
    fontFamily: fontFamilies.bold,
    color: colors.ink,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  body: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: spacing.md,
  },
  hint: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  hintText: {
    ...typography.body,
    fontFamily: fontFamilies.semibold,
    color: colors.ink,
    marginTop: -2,
    marginRight: spacing.xs,
    transform: [{ rotate: '-6deg' }],
  },
});
