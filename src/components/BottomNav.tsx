import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useColorTheme } from "../lib/ThemeContext";
import { getTheme } from "../theme";

export type NavTab = "home" | "agents" | "activity" | "settings";

interface NavItem {
  key: NavTab | "create";
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconActive?: keyof typeof Ionicons.glyphMap;
  fab?: boolean;
}

const ITEMS: NavItem[] = [
  { key: "home",     label: "Dashboard", icon: "home-outline",         iconActive: "home"              },
  { key: "agents",   label: "Agents",    icon: "hardware-chip-outline", iconActive: "hardware-chip"     },
  { key: "create",   label: "Create",    icon: "add",                   fab: true                      },
  { key: "activity", label: "Activity",  icon: "pulse-outline",         iconActive: "pulse"             },
  { key: "settings", label: "Settings",  icon: "settings-outline",      iconActive: "settings"          },
];

interface Props {
  value: NavTab;
  onChange: (key: NavTab | "create") => void;
}

export function BottomNav({ value, onChange }: Props) {
  const { isDark } = useColorTheme();
  const { colors } = getTheme(isDark);

  return (
    <View style={[s.root, { backgroundColor: colors.bg2, borderTopColor: colors.border }]}>
      {ITEMS.map((item) => {
        const active = item.key === value;

        if (item.fab) {
          return (
            <Pressable key={item.key} style={s.fabWrap} onPress={() => onChange("create")}>
              <LinearGradient colors={[colors.accent, colors.accent2]} style={s.fab}>
                <Ionicons name="add" size={28} color="#fff" />
              </LinearGradient>
              <Text style={[s.fabLabel, { color: colors.text2 }]}>Create</Text>
            </Pressable>
          );
        }

        return (
          <Pressable key={item.key} style={s.item} onPress={() => onChange(item.key as NavTab)}>
            <Ionicons
              name={active && item.iconActive ? item.iconActive : item.icon}
              size={22}
              color={active ? colors.accent : colors.text3}
            />
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
  root:     { flexDirection: "row", borderTopWidth: StyleSheet.hairlineWidth, paddingBottom: 20, paddingTop: 8 },
  item:     { flex: 1, alignItems: "center", gap: 3 },
  label:    { fontSize: 10, fontWeight: "600" },
  fabWrap:  { flex: 1, alignItems: "center", gap: 3 },
  fab: {
    width: 50, height: 50, borderRadius: 25,
    alignItems: "center", justifyContent: "center",
    marginTop: -18,
    shadowColor: "#FF8C00", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5, shadowRadius: 12, elevation: 10,
  },
  fabLabel: { fontSize: 10, fontWeight: "600" },
});
