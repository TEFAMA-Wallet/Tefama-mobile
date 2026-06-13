import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useColorTheme } from "../lib/ThemeContext";
import { getTheme } from "../theme";
import { HomeScreen } from "./HomeScreen";

export type Tab = "home";

const TABS: { id: Tab; icon: keyof typeof Ionicons.glyphMap; label: string }[] = [
  { id: "home", icon: "home-outline", label: "Home" },
];

export function AppShellScreen({
  tab,
  onChangeTab,
}: {
  tab: Tab;
  onChangeTab: (t: Tab) => void;
}) {
  const { isDark } = useColorTheme();
  const { colors } = getTheme(isDark);

  return (
    <View style={[s.root, { backgroundColor: colors.bg }]}>
      {/* Content */}
      <View style={s.content}>
        {tab === "home" && <HomeScreen />}
      </View>

      {/* Tab bar */}
      <View style={[s.tabBar, { backgroundColor: colors.bg2, borderTopColor: colors.border }]}>
        {TABS.map(({ id, icon, label }) => {
          const active = tab === id;
          return (
            <Pressable key={id} style={s.tabItem} onPress={() => onChangeTab(id)}>
              <Ionicons
                name={active ? (icon.replace("-outline", "") as keyof typeof Ionicons.glyphMap) : icon}
                size={22}
                color={active ? colors.accent : colors.text3}
              />
              <Text style={[s.tabLabel, { color: active ? colors.accent : colors.text3 }]}>
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root:     { flex: 1 },
  content:  { flex: 1 },
  tabBar: {
    flexDirection: "row",
    borderTopWidth: 1,
    paddingBottom: 20,
    paddingTop: 10,
  },
  tabItem:  { flex: 1, alignItems: "center", gap: 3 },
  tabLabel: { fontSize: 10, fontWeight: "600" },
});
