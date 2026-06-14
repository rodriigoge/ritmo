export const productColors = {
  white: "#F0EFF4",
  brown: "#EEDBD1",
  black: "#1E1E1E"
};

export const lightColors = {
  background: productColors.white,
  surface: "#FFFFFF",
  surfaceMuted: "#F8F6F8",
  surfaceElevated: "#FFFFFF",
  primary: productColors.black,
  onPrimary: "#FFFFFF",
  secondary: productColors.brown,
  onSecondary: productColors.black,
  text: productColors.black,
  muted: "#746D69",
  subtle: "#A89F9A",
  border: "#D9D2D0",
  input: "#FFFFFF",
  inputText: productColors.black,
  overlay: "rgba(30, 30, 30, 0.08)",
  shadow: "rgba(30, 30, 30, 0.12)",
  success: "#47785B",
  danger: "#B84A4A"
};

export const darkColors = {
  background: productColors.black,
  surface: "#2B2929",
  surfaceMuted: "#242120",
  surfaceElevated: "#332F2D",
  primary: productColors.brown,
  onPrimary: productColors.black,
  secondary: "#3B3432",
  onSecondary: productColors.white,
  text: productColors.white,
  muted: "#BBB2AE",
  subtle: "#817672",
  border: "#4B4441",
  input: "#332F2D",
  inputText: productColors.white,
  overlay: "rgba(240, 239, 244, 0.08)",
  shadow: "rgba(0, 0, 0, 0.32)",
  success: "#86C69E",
  danger: "#E68A8A"
};

export type AppColorName = keyof typeof lightColors;
