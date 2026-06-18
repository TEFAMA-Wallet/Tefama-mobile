import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useColorTheme } from "../lib/ThemeContext";
import { getTheme } from "../theme";

export type NavTab = "home" | "wallet" | "activity" | "analytics" | "settings";

interface NavItem {
  key:         NavTab;
  label:       string;
  icon:        keyof typeof Ionicons.glyphMap;
  iconActive:  keyof typeof Ionicons.glyphMap;
}

const ITEMS: NavItem[] = [
  { key: "home",      label: "Dashboard", icon: "grid-outline",      iconActive: "grid"           },
  { key: "wallet",    label: "Wallet",    icon: "wallet-outline",    iconActive: "wallet"         },
  { key: "activity",  label: "Activity",  icon: "pulse-outline",     iconActive: "pulse"          },
  { key: "analytics", label: "Analytics", icon: "bar-chart-outline", iconActive: "bar-chart"      },
  { key: "settings",  label: "Settings",  icon: "settings-outline",  iconActive: "settings"       },
];

interface Props {
  value:    NavTab;
  onChange: (key: NavTab) => void;
}

export function BottomNav({ value, onChange }: Props) {
  const { isDark } = useColorTheme();
  const { colors } = getTheme(isDark);

  return (
    <View style={[s.root, { backgroundColor: colors.bg3, borderTopColor: colors.border }]}>
      {ITEMS.map((item) => {
        const active = item.key === value;
        return (
          <Pressable key={item.key} style={s.item} onPress={() => onChange(item.key)}>
            <View style={[s.pill, active && { backgroundColor: colors.accentDim }]}>
              <Ionicons
                name={active ? item.iconActive : item.icon}
                size={21}
                color={active ? colors.accent : colors.text3}
              />
            </View>
            <Text style={[s.label, { color: active ? colors.accent : colors.text3 }]}>
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const s = StyleSheet.create({
  root:  { flexDirection: "row", borderTopWidth: StyleSheet.hairlineWidth, paddingBottom: 24, paddingTop: 8, paddingHorizontal: 4 },
  item:  { flex: 1, alignItems: "center", gap: 3 },
  pill:  { width: 46, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  label: { fontSize: 10, fontWeight: "500", letterSpacing: 0.1 },
});
