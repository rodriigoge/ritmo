import type { OnboardingScene } from './illustrations/OnboardingIllustration';

export type OnboardingPage = {
  scene: OnboardingScene;
  title: string;
  description: string;
};

export const ONBOARDING_PAGES: readonly OnboardingPage[] = [
  {
    scene: 'welcome',
    title: 'Prazer, eu sou o Pingo',
    description:
      'Vou te acompanhar na criação de hábitos simples, um dia de cada vez.',
  },
  {
    scene: 'track',
    title: 'Marque em um toque',
    description:
      'Concluiu o hábito? Toque no dia e pronto. Errou? Ajuste o histórico quando quiser.',
  },
  {
    scene: 'rhythm',
    title: 'Encontre seu ritmo',
    description:
      'Veja sua sequência, seu total e seu recorde crescerem. Tudo fica no seu celular.',
  },
];
