import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "../components/Button";
import type { RootStackParamList } from "../navigation/routes";
import { completeOnboarding } from "../storage/onboardingProgress";
import { productColors, useAppTheme } from "../theme";

type OnboardingScreenProps = NativeStackScreenProps<RootStackParamList, "Onboarding">;

type OnboardingStep = {
  title: string;
  description: string;
};

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    title: "Organize seus hábitos",
    description: "Todas as suas tarefas recorrentes, em um só lugar."
  },
  {
    title: "Acompanhe seu ritmo",
    description: "Veja o que precisa ser feito hoje e mantenha seus ciclos em dia."
  },
  {
    title: "Comece sem complicar",
    description: "Crie sua rotina e ajuste tudo conforme o seu tempo."
  }
];

export function OnboardingScreen({ navigation }: OnboardingScreenProps) {
  const { theme } = useAppTheme();
  const [currentStep, setCurrentStep] = useState(0);
  const step = ONBOARDING_STEPS[currentStep];
  const isLastStep = currentStep === ONBOARDING_STEPS.length - 1;

  const dots = useMemo(
    () =>
      ONBOARDING_STEPS.map((item, index) => (
        <View
          key={item.title}
          accessibilityElementsHidden
          importantForAccessibility="no"
          style={[
            styles.dot,
            {
              backgroundColor: index === currentStep ? theme.colors.primary : theme.colors.secondary
            }
          ]}
        />
      )),
    [currentStep, theme.colors.primary, theme.colors.secondary]
  );

  async function finishOnboarding() {
    await completeOnboarding();
    navigation.replace("Login");
  }

  function handleContinue() {
    if (isLastStep) {
      void finishOnboarding();
      return;
    }

    setCurrentStep((stepIndex) => stepIndex + 1);
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      <View style={styles.container}>
        <View style={styles.skipRow}>
          <Pressable accessibilityRole="button" onPress={finishOnboarding} hitSlop={12} style={styles.skipButton}>
            <Text style={[styles.skipText, { color: theme.colors.muted, fontFamily: theme.typography.fontFamily.bold }]}>Pular</Text>
          </Pressable>
        </View>

        <View style={styles.content}>
          <View style={styles.illustration} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
            <View style={[styles.backShape, { backgroundColor: theme.colors.overlay }]} />
            <View style={[styles.frontShape, { backgroundColor: productColors.brown }]} />
            <View style={styles.gridMark}>
              <View style={[styles.gridCell, styles.gridCellTop, { backgroundColor: theme.colors.primary }]} />
              <View style={[styles.gridCell, styles.gridCellTop, { backgroundColor: theme.colors.primary }]} />
              <View style={[styles.gridCell, { backgroundColor: theme.colors.primary }]} />
              <View style={[styles.gridCell, { backgroundColor: theme.colors.primary }]} />
            </View>
          </View>

          <View style={styles.copy}>
            <Text style={[styles.title, { color: theme.colors.text, fontFamily: theme.typography.fontFamily.bold }]}>{step.title}</Text>
            <Text style={[styles.description, { color: theme.colors.muted, fontFamily: theme.typography.fontFamily.regular }]}>
              {step.description}
            </Text>
          </View>
        </View>

        <View style={styles.footer}>
          <View accessibilityLabel={`Etapa ${currentStep + 1} de ${ONBOARDING_STEPS.length}`} style={styles.dots}>
            {dots}
          </View>
          <Button title={isLastStep ? "Começar" : "Continuar"} onPress={handleContinue} style={styles.cta} />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1
  },
  container: {
    flex: 1,
    paddingHorizontal: 32,
    paddingTop: 26,
    paddingBottom: 16
  },
  skipRow: {
    minHeight: 34,
    alignItems: "flex-end",
    justifyContent: "center"
  },
  skipButton: {
    minHeight: 34,
    justifyContent: "center"
  },
  skipText: {
    fontSize: 14,
    lineHeight: 18
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 34
  },
  illustration: {
    width: 222,
    height: 222,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 38
  },
  backShape: {
    position: "absolute",
    width: 184,
    height: 184,
    borderRadius: 42,
    transform: [{ rotate: "-7deg" }]
  },
  frontShape: {
    position: "absolute",
    width: 188,
    height: 188,
    borderRadius: 34,
    opacity: 0.78,
    transform: [{ rotate: "12deg" }]
  },
  gridMark: {
    width: 88,
    height: 92,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between"
  },
  gridCell: {
    width: 40,
    height: 40,
    borderRadius: 10
  },
  gridCellTop: {
    marginBottom: 8
  },
  copy: {
    width: "100%",
    alignItems: "center"
  },
  title: {
    fontSize: 29,
    lineHeight: 35,
    textAlign: "center"
  },
  description: {
    maxWidth: 322,
    fontSize: 16,
    lineHeight: 28,
    textAlign: "center",
    marginTop: 14
  },
  footer: {
    alignItems: "stretch"
  },
  dots: {
    minHeight: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center"
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 4
  },
  cta: {
    minHeight: 60,
    borderRadius: 14,
    marginTop: 28
  }
});
