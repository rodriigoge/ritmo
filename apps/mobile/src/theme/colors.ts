export const productColors = {
  white: "#F0EFF4",
  brown: "#EEDBD1",
  black: "#1E1E1E"
};

export const lightColors = {
  background: productColors.white,
  surface: "#FFFFFF",
  primary: productColors.black,
  secondary: productColors.brown,
  text: productColors.black,
  muted: "#746D69",
  border: "#D9D2D0",
  success: "#47785B",
  danger: "#B84A4A"
};

export const darkColors = {
  background: productColors.black,
  surface: "#2B2929",
  primary: productColors.brown,
  secondary: "#3B3432",
  text: productColors.white,
  muted: "#BBB2AE",
  border: "#4B4441",
  success: "#86C69E",
  danger: "#E68A8A"
};

export type AppColorName = keyof typeof lightColors;
