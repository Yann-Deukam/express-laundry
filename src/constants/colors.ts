
export const lightColors = {
  primary: "#1765D1",
  primaryDark: "#0847A9",
  primaryLight: "#EAF2FF",

  background: "#EEF2F7",
  surface: "#FFFFFF",
  input: "#F3F4F6",

  text: "#17191F",
  textSecondary: "#777F8D",
  border: "#E7E9EE",

  coral: "#E87558",
  mint: "#70D5B0",
  yellow: "#F4D77D",

  info: "#2563EB",
  success: "#16A34A",
  warning: "#D97706",
  danger: "#DC4545",

  warningBackground: "#FFF4E5",
  warningText: "#92400E",
  iconBackground: "#EAF2FF",

  statusReceived: "#64748B",
  statusAwaitingValidation: "#D97706",
  statusConfirmed: "#2563EB",
  statusWashing: "#0D9488",
  statusIroning: "#7C3AED",
  statusReady: "#16A34A",
  statusDelivered: "#64748B",

  white: "#FFFFFF",
  black: "#111111",
};

export const darkColors = {
  primary: "#5B9BFF",
  primaryDark: "#3578DB",
  primaryLight: "#253D60",

  background: "#111827",
  surface: "#1C2636",
  input: "#263346",

  text: "#F3F4F6",
  textSecondary: "#A0AABA",
  border: "#303D50",

  coral: "#F08B72",
  mint: "#70D5B0",
  yellow: "#F4D77D",

  info: "#60A5FA",
  success: "#4ADE80",
  warning: "#FBBF24",
  danger: "#F87171",

  warningBackground: "#3B3020",
  warningText: "#FCD68A",
  iconBackground: "#253D60",

  statusReceived: "#94A3B8",
  statusAwaitingValidation: "#FBBF24",
  statusConfirmed: "#60A5FA",
  statusWashing: "#2DD4BF",
  statusIroning: "#A78BFA",
  statusReady: "#4ADE80",
  statusDelivered: "#94A3B8",

  white: "#FFFFFF",
  black: "#000000",
};

export type AppColors = typeof lightColors;

// Backwards compatibility for screens not yet using the theme provider.
// New or updated screens should use useTheme().colors instead.
export const Colors = lightColors;
