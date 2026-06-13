const darkColors = {
  bg:         "#0A0600",
  bg2:        "#100900",
  bg3:        "#160C00",
  bg4:        "#1E1000",
  border:     "rgba(255,140,0,0.10)",
  border2:    "rgba(255,140,0,0.18)",
  text:       "#F5F0E8",
  text2:      "rgba(245,240,232,0.55)",
  text3:      "rgba(245,240,232,0.28)",
  accent:     "#FF8C00",
  accent2:    "#FFB300",
  accentDim:  "rgba(255,140,0,0.12)",
  accentB:    "rgba(255,140,0,0.28)",
  mint:       "#FFD060",
  mintDim:    "rgba(255,208,96,0.12)",
  gold:       "#FFB300",
  goldDim:    "rgba(255,179,0,0.12)",
  red:        "#D44B2A",
  redDim:     "rgba(212,75,42,0.12)",
  green:      "#7EC86A",
  bgSoft:     "#100900",
  bgCard:     "#100900",
  bgCardAlt:  "#160C00",
  textSoft:   "rgba(245,240,232,0.55)",
  textMuted:  "rgba(245,240,232,0.28)",
  danger:     "#D44B2A",
  warning:    "#FFB300",
};

const lightColors = {
  bg:         "#FFF8F0",
  bg2:        "#FFFFFF",
  bg3:        "#FFEEDD",
  bg4:        "#FFE4C4",
  border:     "rgba(180,80,0,0.10)",
  border2:    "rgba(180,80,0,0.18)",
  text:       "#1A0A00",
  text2:      "rgba(26,10,0,0.55)",
  text3:      "rgba(26,10,0,0.35)",
  accent:     "#CC5500",
  accent2:    "#FF7000",
  accentDim:  "rgba(204,85,0,0.10)",
  accentB:    "rgba(204,85,0,0.22)",
  mint:       "#CC8800",
  mintDim:    "rgba(204,136,0,0.10)",
  gold:       "#AA6600",
  goldDim:    "rgba(170,102,0,0.10)",
  red:        "#B03010",
  redDim:     "rgba(176,48,16,0.10)",
  green:      "#4A8A3A",
  bgSoft:     "#FFEEDD",
  bgCard:     "#FFFFFF",
  bgCardAlt:  "#FFF8F0",
  textSoft:   "rgba(26,10,0,0.55)",
  textMuted:  "rgba(26,10,0,0.35)",
  danger:     "#B03010",
  warning:    "#AA6600",
};

const shape = {
  radius: { sm: 8, md: 12, lg: 16, xl: 20, xxl: 24 },
  space:  { xs: 4, sm: 8, md: 14, lg: 20, xl: 28 },
};

export function getTheme(isDark: boolean) {
  return { colors: isDark ? darkColors : lightColors, ...shape };
}

export const theme = getTheme(true);
