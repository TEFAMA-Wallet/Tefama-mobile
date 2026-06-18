import { Alert, Pressable, ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useColorTheme } from "../lib/ThemeContext";
import { getTheme } from "../theme";
import { useAuth } from "../lib/AuthContext";

function shortAddr(addr: string) {
  return addr.length > 16 ? `${addr.slice(0, 10)}…${addr.slice(-6)}` : addr;
}

function initials(name: string) {
  const parts = name.split(" ");
  return parts.length >= 2
    ? (parts[0][0] + parts[1][0]).toUpperCase()
    : name.slice(0, 2).toUpperCase();
}

interface RowProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string;
  toggle?: boolean;
  defaultToggle?: boolean;
  danger?: boolean;
  last?: boolean;
  onPress?: () => void;
}

function Row({ icon, label, value, toggle, defaultToggle, danger, last, onPress }: RowProps) {
  const { isDark } = useColorTheme();
  const { colors } = getTheme(isDark);
  const color = danger ? "#D44B2A" : colors.text;
  const iconColor = danger ? "#D44B2A" : colors.text3;

  return (
    <Pressable onPress={onPress}
      style={[s.row, !last && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border }]}>
      <View style={[s.rowIcon, { backgroundColor: danger ? "rgba(212,75,42,0.10)" : colors.accentDim }]}>
        <Ionicons name={icon} size={16} color={danger ? "#D44B2A" : colors.accent} />
      </View>
      <Text style={[s.rowLabel, { color, flex: 1 }]}>{label}</Text>
      {value && <Text style={[s.rowValue, { color: colors.text2 }]}>{value}</Text>}
      {toggle && <Switch value={defaultToggle} thumbColor="#fff" trackColor={{ false: colors.bg4, true: colors.accent }} />}
      {!toggle && <Ionicons name="chevron-forward" size={14} color={colors.text3} />}
    </Pressable>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const { isDark } = useColorTheme();
  const { colors } = getTheme(isDark);
  return (
    <View style={s.section}>
      <Text style={[s.sectionLabel, { color: colors.text2 }]}>{title}</Text>
      <View style={[s.sectionCard, { backgroundColor: colors.bg2, borderColor: colors.border }]}>
        {children}
      </View>
    </View>
  );
}

export function SettingsScreen() {
  const { isDark } = useColorTheme();
  const { colors } = getTheme(isDark);
  const { session, logout } = useAuth();

  const name     = session?.name    ?? "Guest";
  const email    = session?.email   ?? "Not signed in";
  const address  = session?.address ?? "";

  function handleLogout() {
    Alert.alert("Sign out", "You'll be returned to the sign-in screen.", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign out", style: "destructive", onPress: logout },
    ]);
  }

  return (
    <View style={[s.root, { backgroundColor: colors.bg }]}>
      {/* Header */}
      <View style={s.header}>
        <Text style={[s.headerTitle, { color: colors.text }]}>Profile</Text>
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* Profile card */}
        <LinearGradient
          colors={["#1A0900", "#0A0600"]}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={[s.profileCard, { borderColor: "rgba(255,140,0,0.22)" }]}
        >
          {/* Avatar */}
          <View style={s.avatarWrap}>
            <LinearGradient colors={[colors.accent, colors.accent2]} style={s.avatar}>
              <Text style={s.avatarText}>{initials(name)}</Text>
            </LinearGradient>
            <View style={[s.onlineDot, { borderColor: colors.bg2 }]} />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={s.profileName}>{name}</Text>
            <Text style={s.profileEmail}>{email}</Text>
            {address ? (
              <View style={s.addressRow}>
                <Ionicons name="wallet-outline" size={11} color="rgba(245,240,232,0.4)" />
                <Text style={s.profileAddress}>{shortAddr(address)}</Text>
              </View>
            ) : null}
          </View>

          <View style={[s.networkBadge]}>
            <View style={s.networkDot} />
            <Text style={s.networkText}>Testnet</Text>
          </View>
        </LinearGradient>

        <Section title="AGENT">
          <Row icon="flash-outline"    label="DCA clip size"     value="0.3 SUI / trade" last />
        </Section>

        <Section title="NOTIFICATIONS">
          <Row icon="notifications-outline" label="Trade alerts"    toggle defaultToggle />
          <Row icon="warning-outline"       label="Budget warnings" toggle defaultToggle last />
        </Section>

        <Section title="APPEARANCE">
          <Row icon="moon-outline" label="Dark mode" toggle defaultToggle last />
        </Section>

        <Section title="NETWORK">
          <Row icon="wifi-outline"    label="Network" value="Sui Testnet" />
          <Row icon="server-outline"  label="RPC"     value="DeepBook" last />
        </Section>

        <Section title="ABOUT">
          <Row icon="document-text-outline"      label="Terms of service"  />
          <Row icon="shield-outline"             label="Privacy policy"    />
          <Row icon="information-circle-outline" label="Version" value="1.0.0" last />
        </Section>

        {session ? (
          <Section title="ACCOUNT">
            <Row icon="log-out-outline" label="Sign out" danger last onPress={handleLogout} />
          </Section>
        ) : null}

        <View style={{ height: 24 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root:   { flex: 1 },
  scroll: { padding: 16, gap: 0 },

  header:      { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingTop: 10, paddingBottom: 6 },
  headerTitle: { fontSize: 22, fontWeight: "800", letterSpacing: -0.5 },

  profileCard: { borderRadius: 20, borderWidth: 1, padding: 18, flexDirection: "row", alignItems: "center", gap: 14, marginBottom: 20 },
  avatarWrap:  { position: "relative" },
  avatar:      { width: 52, height: 52, borderRadius: 26, alignItems: "center", justifyContent: "center" },
  avatarText:  { color: "#fff", fontSize: 18, fontWeight: "800" },
  onlineDot:   { position: "absolute", bottom: 0, right: 0, width: 14, height: 14, borderRadius: 7, backgroundColor: "#4CAF50", borderWidth: 2 },
  profileName: { color: "rgba(245,240,232,0.90)", fontSize: 16, fontWeight: "800" },
  profileEmail:{ color: "rgba(245,240,232,0.45)", fontSize: 12, marginTop: 2 },
  addressRow:  { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 },
  profileAddress: { color: "rgba(245,240,232,0.35)", fontSize: 11, fontFamily: "monospace" },
  networkBadge:{ flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 100, backgroundColor: "rgba(76,175,80,0.14)", alignSelf: "flex-start" },
  networkDot:  { width: 6, height: 6, borderRadius: 3, backgroundColor: "#4CAF50" },
  networkText: { color: "#4CAF50", fontSize: 11, fontWeight: "700" },

  section:      { marginBottom: 16 },
  sectionLabel: { fontSize: 11, fontWeight: "700", letterSpacing: 0.8, marginBottom: 6, marginLeft: 4 },
  sectionCard:  { borderRadius: 16, borderWidth: 1, overflow: "hidden" },

  row:       { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 14, paddingVertical: 14 },
  rowIcon:   { width: 30, height: 30, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  rowLabel:  { fontSize: 15 },
  rowValue:  { fontSize: 14 },
});
