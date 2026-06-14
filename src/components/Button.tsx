import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useColorTheme } from "../lib/ThemeContext";
import { getTheme } from "../theme";

type Variant = "primary" | "secondary" | "danger" | "ghost";
type Size    = "sm" | "md" | "lg";

interface Props {
  children: React.ReactNode;
  variant?: Variant;
  size?: Size;
  block?: boolean;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
  onPress?: () => void;
}

export function Button({ children, variant = "primary", size = "md", block, disabled, loading, icon, iconRight, onPress }: Props) {
  const { isDark } = useColorTheme();
  const { colors } = getTheme(isDark);

  const pad = size === "sm" ? { paddingVertical: 9, paddingHorizontal: 16 }
            : size === "lg" ? { paddingVertical: 16, paddingHorizontal: 24 }
            : { paddingVertical: 13, paddingHorizontal: 20 };

  const fs = size === "sm" ? 13 : size === "lg" ? 16 : 15;

  const isDisabled = disabled || loading;

  if (variant === "primary") {
    return (
      <Pressable
        onPress={onPress}
        disabled={isDisabled}
        style={({ pressed }) => [block && s.block, { opacity: isDisabled ? 0.45 : pressed ? 0.82 : 1 }]}
      >
        <LinearGradient colors={[colors.accent, colors.accent2]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
          style={[s.inner, pad, { borderRadius: 14 }, block && s.block]}>
          {loading ? <ActivityIndicator color="#fff" size="small" /> : (
            <>
              {icon}
              <Text style={[s.primaryText, { fontSize: fs }]}>{children}</Text>
              {iconRight}
            </>
          )}
        </LinearGradient>
      </Pressable>
    );
  }

  const bgMap: Record<Variant, string> = {
    secondary: colors.bg3,
    danger:    "rgba(212,75,42,0.15)",
    ghost:     "transparent",
    primary:   colors.accent,
  };
  const textMap: Record<Variant, string> = {
    secondary: colors.text,
    danger:    "#D44B2A",
    ghost:     colors.text2,
    primary:   "#fff",
  };
  const borderMap: Record<Variant, string | undefined> = {
    secondary: colors.border2,
    danger:    "rgba(212,75,42,0.3)",
    ghost:     undefined,
    primary:   undefined,
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        s.inner, pad, { borderRadius: 14, backgroundColor: bgMap[variant] },
        borderMap[variant] && { borderWidth: 1, borderColor: borderMap[variant] },
        block && s.block,
        { opacity: isDisabled ? 0.45 : pressed ? 0.75 : 1 },
      ]}
    >
      {loading ? <ActivityIndicator color={textMap[variant]} size="small" /> : (
        <>
          {icon}
          <Text style={[s.text, { color: textMap[variant], fontSize: fs }]}>{children}</Text>
          {iconRight}
        </>
      )}
    </Pressable>
  );
}

export function IconButton({ children, onPress, size = "md" }: { children: React.ReactNode; onPress?: () => void; size?: Size }) {
  const { isDark } = useColorTheme();
  const { colors } = getTheme(isDark);
  const dim = size === "sm" ? 34 : 40;
  return (
    <Pressable onPress={onPress} hitSlop={8}
      style={({ pressed }) => [s.iconBtn, { width: dim, height: dim, borderRadius: dim / 2, backgroundColor: colors.bg3, opacity: pressed ? 0.7 : 1 }]}>
      {children}
    </Pressable>
  );
}

const s = StyleSheet.create({
  inner:       { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  block:       { alignSelf: "stretch" },
  text:        { fontWeight: "600", letterSpacing: -0.2 },
  primaryText: { color: "#fff", fontWeight: "700", letterSpacing: -0.2 },
  iconBtn:     { alignItems: "center", justifyContent: "center" },
});
