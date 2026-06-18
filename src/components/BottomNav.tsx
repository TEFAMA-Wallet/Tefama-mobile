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
  { key: "home",     label: "Home",     icon: "home-outline",          iconActive: "home"              },
  { key: "agents",   label: "Agent",    icon: "hardware-chip-outline", iconActive: "hardware-chip"     },
  { key: "create",   label: "Run",      icon: "flash-outline",         fab: true                      },
  { key: "activity", label: "Activity", icon: "receipt-outline",       iconActive: "receipt"           },
  { key: "settings", label: "Profile",  icon: "person-circle-outline", iconActive: "person-circle"     },
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
              <LinearGradient
                colors={[colors.accent, colors.accent2]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={s.fab}
              >
                <Ionicons name="flash" size={24} color="#fff" />
              </LinearGradient>
            </Pressable>
          );
        }

        return (
          <Pressable key={item.key} style={s.item} onPress={() => onChange(item.key as NavTab)}>
            <View style={[s.iconWrap, active && { backgroundColor: colors.accentDim }]}>
              <Ionicons
                name={active && item.iconActive ? item.iconActive : item.icon}
                size={22}
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
  root:     { flexDirection: "row", borderTopWidth: StyleSheet.hairlineWidth, paddingBottom: 24, paddingTop: 10, paddingHorizontal: 8 },
  item:     { flex: 1, alignItems: "center", gap: 4 },
  iconWrap: { width: 44, height: 30, borderRadius: 15, alignItems: "center", justifyContent: "center" },
  label:    { fontSize: 10, fontWeight: "600", letterSpacing: 0.2 },
  fabWrap:  { flex: 1, alignItems: "center", justifyContent: "center" },
  fab: {
    width: 52, height: 52, borderRadius: 26,
    alignItems: "center", justifyContent: "center",
    marginTop: -22,
    shadowColor: "#FF8C00", shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.55, shadowRadius: 14, elevation: 12,
  },
});
