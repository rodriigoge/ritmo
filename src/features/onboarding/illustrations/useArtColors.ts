import { useMemo } from 'react';
import { useColors } from '../../../design-system/theme/ThemeProvider';

/** Colors of the line-art illustrations (Pingo, onboarding, auth). Ink and
 * paper swap in the dark theme, so the drawings invert instead of vanishing. */
export function useArtColors() {
  const colors = useColors();
  return useMemo(
    () => ({
      INK: colors.ink,
      PAPER: colors.canvas,
      BRAND: colors.brand,
      line: {
        stroke: colors.ink,
        fill: 'none',
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
      } as const,
    }),
    [colors],
  );
}
