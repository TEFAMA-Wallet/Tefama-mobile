import { Alert, Image, Linking, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useColorTheme } from "../lib/ThemeContext";
import { getTheme } from "../theme";
import { useAuth } from "../lib/AuthContext";
import type { Vault } from "../lib/useOnchain";
import { useState } from "react";

interface Props { vault: Vault | null }

function Toggle({ on }: { on: boolean }) {
  const { isDark } = useColorTheme();
  const { colors } = getTheme(isDark);
  return (
    <View style={[tog.track, { backgroundColor: on ? colors.accent : colors.bg5 }]}>
      <View style={[tog.thumb, { left: on ? 22 : 3 }]} />
    </View>
  );
}

function SettingRow({ label, desc, right }: { label: string; desc?: string; right: React.ReactNode }) {
  const { isDark } = useColorTheme();
  const { colors } = getTheme(isDark);
  return (
    <View style={[sr.row, { borderBottomColor: colors.border }]}>
      <View style={{ flex: 1, paddingRight: 12 }}>
        <Text style={[sr.label, { color: colors.text }]}>{label}</Text>
        {desc ? <Text style={[sr.desc, { color: colors.text3 }]}>{desc}</Text> : null}
      </View>
      {right}
    </View>
  );
}

function InfoRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  const { isDark } = useColorTheme();
  const { colors } = getTheme(isDark);
  return (
    <View style={[ir.row, { borderBottomColor: colors.border }]}>
      <Text style={[ir.label, { color: colors.text3 }]}>{label}</Text>
      <Text style={[ir.value, { color: colors.text, fontFamily: mono ? "monospace" : undefined }]}>{value}</Text>
    </View>
  );
}

function SectionHead({ icon, title }: { icon: React.ReactNode; title: string }) {
  const { isDark } = useColorTheme();
  const { colors } = getTheme(isDark);
  return (
    <View style={[sh.wrap, { borderBottomColor: colors.border }]}>
      <View style={{ color: colors.accent } as any}>{icon}</View>
      <Text style={[sh.title, { color: colors.text }]}>{title}</Text>
    </View>
  );
}

export function SettingsScreen({ vault }: Props) {
  const { isDark, toggle } = useColorTheme();
  const { colors } = getTheme(isDark);
  const { session, logout } = useAuth();
  // Note: notification and security toggles are UI-only for now
  const [notifs, setNotifs] = useState({ budget: true, trade: true, weekly: false });
  const [security, setSecurity] = useState({ biometric: true, lock: false });

  const name  = session?.name    ?? "—";
  const email = session?.email   ?? "—";
  const pic   = session?.picture ?? "";
  const addr  = session?.address ?? "";
  const shortAddr = addr ? `${addr.slice(0, 10)}…${addr.slice(-8)}` : "—";
  const vaultStatus = !vault ? "No vault" : vault.paused ? "Paused" : "Active";

  function handleLogout() {
    Alert.alert("Disconnect", "You will be returned to the sign-in screen.", [
      { text: "Cancel", style: "cancel" },
      { text: "Disconnect", style: "destructive", onPress: logout },
    ]);
  }

  function openExplorer() {
    if (addr) {
      Linking.openURL(`https://suiexplorer.com/address/${addr}?network=testnet`);
    }
  }

  return (
    <View style={[s.root, { backgroundColor: colors.bg }]}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* Profile hero */}
        <View style={[s.profileCard, { backgroundColor: colors.bg3, borderColor: colors.border2 }]}>
          <View style={s.profileRow}>
            {pic ? (
              <Image source={{ uri: pic }} style={s.avatar} />
            ) : (
              <View style={[s.avatarPlaceholder, { backgroundColor: colors.accentDim, borderColor: colors.accentB }]}>
                <Ionicons name="person" size={26} color={colors.accent} />
              </View>
            )}
            <View style={{ flex: 1 }}>
              <Text style={[s.profileName, { color: colors.text }]}>{name}</Text>
              <Text style={[s.profileEmail, { color: colors.text2 }]}>{email}</Text>
              <View style={s.badgeRow}>
                <View style={[s.zkBadge, { backgroundColor: colors.bgSoft3, borderColor: colors.border }]}>
                  <Text style={[s.zkText, { color: colors.text3 }]}>zkLogin</Text>
                </View>
                <View style={[s.zkBadge, { backgroundColor: colors.bgSoft3, borderColor: colors.border }]}>
                  <Text style={[s.zkText, { color: colors.text3 }]}>Sui Testnet</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Wallet section */}
        <View style={[s.section, { backgroundColor: colors.bg3, borderColor: colors.border }]}>
          <SectionHead icon={<Ionicons name="wallet-outline" size={18} color={colors.accent} />} title="Wallet" />
          <InfoRow label="Address"      value={shortAddr}  mono />
          <InfoRow label="Vault status" value={vaultStatus}      />
          <Pressable style={s.explorerLink} onPress={openExplorer}>
            <Text style={[s.explorerText, { color: colors.accent }]}>View on Explorer</Text>
            <Ionicons name="open-outline" size={13} color={colors.accent} />
          </Pressable>
        </View>

        {/* Appearance */}
        <View style={[s.section, { backgroundColor: colors.bg3, borderColor: colors.border }]}>
          <SectionHead icon={<Ionicons name="color-palette-outline" size={18} color={colors.accent} />} title="Appearance" />
          <SettingRow
            label={isDark ? "Dark mode" : "Light mode"}
            desc={isDark ? "Switch to light mode" : "Switch to dark mode"}
            right={
              <Pressable onPress={toggle}>
                <View style={[tog.track, { backgroundColor: isDark ? colors.accent : colors.bg5 }]}>
                  <View style={[tog.thumb, { left: isDark ? 22 : 3 }]} />
                </View>
              </Pressable>
            }
          />
        </View>

        {/* Notifications */}
        <View style={[s.section, { backgroundColor: colors.bg3, borderColor: colors.border }]}>
          <SectionHead icon={<Ionicons name="notifications-outline" size={18} color={colors.accent} />} title="Notifications" />
          <SettingRow
            label="Budget warning"
            desc="Alert when vault budget reaches 80%"
            right={<Pressable onPress={() => setNotifs(n => ({ ...n, budget: !n.budget }))}><Toggle on={notifs.budget} /></Pressable>}
          />
          <SettingRow
            label="Trade execution"
            desc="Notify on each on-chain trade"
            right={<Pressable onPress={() => setNotifs(n => ({ ...n, trade: !n.trade }))}><Toggle on={notifs.trade} /></Pressable>}
          />
          <SettingRow
            label="Weekly report"
            desc="Summary every Sunday"
            right={<Pressable onPress={() => setNotifs(n => ({ ...n, weekly: !n.weekly }))}><Toggle on={notifs.weekly} /></Pressable>}
          />
        </View>

        {/* Security */}
        <View style={[s.section, { backgroundColor: colors.bg3, borderColor: colors.border }]}>
          <SectionHead icon={<Ionicons name="shield-outline" size={18} color={colors.accent} />} title="Security" />
          <SettingRow
            label="Biometric unlock"
            desc="Use Face ID or fingerprint"
            right={<Pressable onPress={() => setSecurity(sc => ({ ...sc, biometric: !sc.biometric }))}><Toggle on={security.biometric} /></Pressable>}
          />
          <SettingRow
            label="Session lock"
            desc="Auto-lock after 5 minutes"
            right={<Pressable onPress={() => setSecurity(sc => ({ ...sc, lock: !sc.lock }))}><Toggle on={security.lock} /></Pressable>}
          />
        </View>

        {/* Disconnect */}
        <Pressable
          style={[s.disconnectBtn, { backgroundColor: colors.redDim, borderColor: "rgba(239,68,68,0.25)" }]}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={17} color={colors.red} />
          <Text style={[s.disconnectText, { color: colors.red }]}>Disconnect</Text>
        </Pressable>

        <View style={{ height: 24 }} />
      </ScrollView>
    </View>
  );
}

const tog = StyleSheet.create({
  track: { width: 44, height: 24, borderRadius: 12, position: "relative" },
  thumb: { position: "absolute", top: 3, width: 18, height: 18, borderRadius: 9, backgroundColor: "#fff" },
});

const sr = StyleSheet.create({
  row:   { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 13, borderBottomWidth: StyleSheet.hairlineWidth },
  label: { fontSize: 14, fontWeight: "500" },
  desc:  { fontSize: 12, marginTop: 2, lineHeight: 17 },
});

const ir = StyleSheet.create({
  row:   { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth },
  label: { fontSize: 13 },
  value: { fontSize: 13 },
});

const sh = StyleSheet.create({
  wrap:  { flexDirection: "row", alignItems: "center", gap: 10, paddingBottom: 14, borderBottomWidth: 1, marginBottom: 4 },
  title: { fontSize: 15, fontWeight: "600" },
});

const s = StyleSheet.create({
  root:   { flex: 1 },
  scroll: { padding: 16, gap: 14 },

  profileCard: { borderRadius: 16, borderWidth: 1, padding: 20 },
  profileRow:  { flexDirection: "row", alignItems: "center", gap: 14 },
  avatar:      { width: 56, height: 56, borderRadius: 28, borderWidth: 2, borderColor: "#22d3ee" },
  avatarPlaceholder: { width: 56, height: 56, borderRadius: 28, alignItems: "center", justifyContent: "center", borderWidth: 2 },
  profileName: { fontSize: 17, fontWeight: "700", marginBottom: 2 },
  profileEmail:{ fontSize: 13, marginBottom: 6 },
  badgeRow:    { flexDirection: "row", gap: 6, flexWrap: "wrap", marginTop: 6 },
  zkBadge:     { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 100, borderWidth: 1 },
  zkText:      { fontSize: 11, fontWeight: "600" },

  section:       { borderRadius: 14, borderWidth: 1, padding: 16 },
  explorerLink:  { flexDirection: "row", alignItems: "center", gap: 5, paddingTop: 14 },
  explorerText:  { fontSize: 14, fontWeight: "500" },

  disconnectBtn:  { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, height: 44, borderRadius: 10, borderWidth: 1 },
  disconnectText: { fontSize: 14, fontWeight: "600" },
});
