import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useColorTheme } from "../lib/ThemeContext";
import { getTheme } from "../theme";

interface Props {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  actions?: React.ReactNode;
  leading?: React.ReactNode;
}

export function AppBar({ title, subtitle, onBack, actions, leading }: Props) {
  const { isDark } = useColorTheme();
  const { colors } = getTheme(isDark);

  return (
    <View style={[s.root, { borderBottomColor: colors.border }]}>
      <View style={s.left}>
        {leading}
        {onBack && (
          <Pressable onPress={onBack} hitSlop={12} style={s.backBtn}>
            <Ionicons name="chevron-back" size={22} color={colors.accent} />
          </Pressable>
        )}
        <View>
          <Text style={[s.title, { color: colors.text }]} numberOfLines={1}>{title}</Text>
          {subtitle ? <Text style={[s.sub, { color: colors.text2 }]} numberOfLines={1}>{subtitle}</Text> : null}
        </View>
      </View>
      {actions ? <View style={s.actions}>{actions}</View> : null}
    </View>
  );
}

const s = StyleSheet.create({
  root: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  left:    { flexDirection: "row", alignItems: "center", gap: 8, flex: 1, minWidth: 0 },
  backBtn: { marginRight: 2 },
  title:   { fontSize: 17, fontWeight: "700", letterSpacing: -0.3 },
  sub:     { fontSize: 12, marginTop: 1 },
  actions: { flexDirection: "row", alignItems: "center", gap: 6, marginLeft: 8 },
});
