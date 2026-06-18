// Matches globals.css exactly — brand is soft cyan (#06b6d4 / #22d3ee)

const darkColors = {
  bg:         "#0a0a0a",   // --surface-base / --neutral-950
  bg2:        "#101010",   // --neutral-900
  bg3:        "#141414",   // --surface-card / --neutral-875
  bg4:        "#181818",   // --surface-raised / --neutral-850
  bg5:        "#1f1f1f",   // --surface-elevated / --neutral-800
  border:     "rgba(255,255,255,0.06)",   // --border-subtle
  border2:    "rgba(255,255,255,0.12)",   // --border-default
  border3:    "rgba(255,255,255,0.18)",   // --border-strong
  text:       "#fafafa",   // --text-primary
  text2:      "#8a8a8a",   // --text-secondary
  text3:      "#5c5c5c",   // --text-tertiary
  text4:      "#3d3d3d",   // --text-disabled
  accent:     "#06b6d4",   // --orange-500 (brand cyan)
  accent2:    "#22d3ee",   // --orange-400
  accentDim:  "rgba(6,182,212,0.12)",   // --brand-tint
  accentB:    "rgba(6,182,212,0.22)",   // --brand-tint-strong
  accentA40:  "rgba(6,182,212,0.42)",
  red:        "#ef4444",   // --ember-500
  redDim:     "rgba(239,68,68,0.14)",   // --status-revoked-tint
  green:      "#06b6d4",   // confirmed = brand color
  bgCard:     "#141414",
  bgCardAlt:  "#181818",
  bgSoft:     "rgba(255,255,255,0.04)",  // --white-a04 / --ink-a04
  bgSoft2:    "rgba(255,255,255,0.06)",  // --ink-a06
  bgSoft3:    "rgba(255,255,255,0.08)",  // --ink-a08
  danger:     "#ef4444",
  warning:    "#f59e0b",
  ink04:      "rgba(255,255,255,0.04)",
  ink08:      "rgba(255,255,255,0.08)",
  ink12:      "rgba(255,255,255,0.12)",
};

const lightColors = {
  bg:         "#f5f6fb",
  bg2:        "#eceef6",
  bg3:        "#ffffff",
  bg4:        "#ffffff",
  bg5:        "#ffffff",
  border:     "rgba(0,0,0,0.07)",
  border2:    "rgba(0,0,0,0.12)",
  border3:    "rgba(0,0,0,0.18)",
  text:       "#14161d",
  text2:      "#565d6e",
  text3:      "#868d9e",
  text4:      "#aeb4c2",
  accent:     "#0e7490",
  accent2:    "#06b6d4",
  accentDim:  "rgba(14,116,144,0.10)",
  accentB:    "rgba(14,116,144,0.20)",
  accentA40:  "rgba(14,116,144,0.40)",
  red:        "#dc2626",
  redDim:     "rgba(220,38,38,0.12)",
  green:      "#0e7490",
  bgCard:     "#ffffff",
  bgCardAlt:  "#f5f6fb",
  bgSoft:     "rgba(0,0,0,0.03)",
  bgSoft2:    "rgba(0,0,0,0.05)",
  bgSoft3:    "rgba(0,0,0,0.07)",
  danger:     "#dc2626",
  warning:    "#d97706",
  ink04:      "rgba(0,0,0,0.04)",
  ink08:      "rgba(0,0,0,0.07)",
  ink12:      "rgba(0,0,0,0.12)",
};

const shape = {
  radius: { xs: 6, sm: 10, md: 14, lg: 18, xl: 24, xxl: 30 },
  space:  { xs: 4, sm: 8, md: 14, lg: 20, xl: 28 },
};

export function getTheme(isDark: boolean) {
  return { colors: isDark ? darkColors : lightColors, ...shape };
}

export const theme = getTheme(true);
