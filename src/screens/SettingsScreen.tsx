import { ScrollView, StyleSheet, Switch, Text, View, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AppBar } from "../components/AppBar";
import { Card } from "../components/Card";
import { Badge } from "../components/Badge";
import { SectionHead } from "../components/SectionHead";
import { useColorTheme } from "../lib/ThemeContext";
import { getTheme } from "../theme";

function SettingRow({ icon, title, detail, hasToggle, defaultToggle = false, last = false }: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  detail?: string;
  hasToggle?: boolean;
  defaultToggle?: boolean;
  last?: boolean;
}) {
  const { isDark } = useColorTheme();
  const { colors } = getTheme(isDark);
  return (
    <View style={[s.row, !last && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border }]}>
      <Ionicons name={icon} size={17} color={colors.text2} />
      <Text style={[s.rowTitle, { color: colors.text, flex: 1 }]}>{title}</Text>
      {detail && <Text style={[s.rowDetail, { color: colors.text2 }]}>{detail}</Text>}
      {hasToggle && (
        <Switch
          value={defaultToggle}
          thumbColor="#fff"
          trackColor={{ false: colors.bg4, true: colors.accent }}
        />
      )}
      {!hasToggle && !detail && <Ionicons name="chevron-forward" size={16} color={colors.text3} />}
      {detail && !hasToggle && <Ionicons name="chevron-forward" size={16} color={colors.text3} />}
    </View>
  );
}

export function SettingsScreen() {
  const { isDark } = useColorTheme();
  const { colors } = getTheme(isDark);

  return (
    <View style={[s.root, { backgroundColor: colors.bg }]}>
      <AppBar title="Settings" subtitle="0x9f3a…7c21" />

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* wallet card */}
        <Card style={s.walletCard}>
          <View style={[s.walletAva, { backgroundColor: colors.accentDim }]}>
            <Ionicons name="wallet-outline" size={24} color={colors.accent} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[s.walletTitle, { color: colors.text }]}>zkLogin wallet</Text>
            <Text style={[s.walletAddr,  { color: colors.text2 }]}>0x9f3a…7c21</Text>
          </View>
          <Badge status="Sui Testnet" />
        </Card>

        <SectionHead>Agent defaults</SectionHead>
        <Card style={{ padding: 0, paddingHorizontal: 14 }}>
          <SettingRow icon="logo-usd"     title="Default budget"      detail="500 USDC" />
          <SettingRow icon="time-outline" title="Default time window"  detail="7 days"  last />
        </Card>

        <SectionHead>Notifications</SectionHead>
        <Card style={{ padding: 0, paddingHorizontal: 14 }}>
          <SettingRow icon="notifications-outline" title="Trade confirmations" hasToggle defaultToggle />
          <SettingRow icon="warning-outline"       title="Budget alerts"       hasToggle defaultToggle />
          <SettingRow icon="moon-outline"          title="Dark mode"           hasToggle defaultToggle last />
        </Card>

        <SectionHead>About</SectionHead>
        <Card style={{ padding: 0, paddingHorizontal: 14 }}>
          <SettingRow icon="document-text-outline" title="Documentation"  />
          <SettingRow icon="shield-outline"        title="Privacy policy" />
          <SettingRow icon="information-circle-outline" title="Version" detail="0.9.0 · build 142" last />
        </Card>

        <View style={{ height: 16 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root:       { flex: 1 },
  scroll:     { padding: 14, gap: 12 },
  walletCard: { flexDirection: "row", alignItems: "center", gap: 14, padding: 16 },
  walletAva:  { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  walletTitle:{ fontSize: 15, fontWeight: "700" },
  walletAddr: { fontSize: 12, marginTop: 2 },
  row:        { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 14 },
  rowTitle:   { fontSize: 15 },
  rowDetail:  { fontSize: 14 },
});
