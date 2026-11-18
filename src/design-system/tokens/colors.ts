// Semantic palettes. Components depend on roles, never on raw values, and
// read the active palette through useTheme() / makeStyles().
//
// "ink" is the foreground of the line-art style (strokes, primary buttons,
// filled marks) and "canvas" the page behind it. In the dark palette they
// swap, so illustrations and buttons invert instead of disappearing.

export type ColorPalette = {
  background: string;
  habitCard: string;
  surface: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  border: string;
  accent: string;
  completed: string;
  inactive: string;
  danger: string;
  /** Soft tint behind danger icons. */
  dangerSoft: string;
  /** Soft tint behind accent badges. */
  accentSoft: string;
  /** Content drawn on ink-filled controls (primary button, filled marks). */
  onAction: string;
  floatingAction: string;
  canvas: string;
  ink: string;
  brand: string;
  cardBorder: string;
  chip: string;
  /** Dimmed layer behind floating cards. */
  scrim: string;
  /** Extra confetti color; the rest come from the roles above. */
  confetti: string;
};

export const lightColors: ColorPalette = {
  background: '#F5F5F5',
  habitCard: '#FFFFFF',
  surface: '#F0EFEB',
  textPrimary: '#1B1C19',
  textSecondary: '#595C55',
  textMuted: '#6C7067',
  border: '#DADCD5',
  accent: '#5EA755',
  completed: '#1B1C19',
  inactive: '#D5D8CF',
  danger: '#AC302B',
  dangerSoft: '#FBEDEC',
  accentSoft: '#E7F2E5',
  onAction: '#FFFFFF',
  floatingAction: '#000000',
  canvas: '#FFFFFF',
  ink: '#1B211A',
  brand: '#3368A0',
  cardBorder: '#E6E6E2',
  chip: '#F1F1EE',
  scrim: 'rgba(27, 33, 26, 0.38)',
  confetti: '#F2B33D',
};

// Warm near-black that matches the ink of the light theme. Text keeps at
// least 4.5:1 against canvas, chip and card surfaces.
export const darkColors: ColorPalette = {
  background: '#121512',
  habitCard: '#181C18',
  surface: '#222722',
  textPrimary: '#EEF0EA',
  textSecondary: '#B4B9AE',
  textMuted: '#959B8F',
  border: '#3A413A',
  accent: '#7CC671',
  completed: '#EEF0EA',
  inactive: '#3A403A',
  danger: '#F2877F',
  dangerSoft: '#3A2422',
  accentSoft: '#1F3320',
  onAction: '#121512',
  floatingAction: '#F1F3EE',
  canvas: '#121512',
  ink: '#F1F3EE',
  brand: '#79A8DE',
  cardBorder: '#2A302A',
  chip: '#232823',
  scrim: 'rgba(0, 0, 0, 0.62)',
  confetti: '#F4C25C',
};
