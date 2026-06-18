import { useState } from "react";
import { ActivityIndicator, Dimensions, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Button } from "../components/Button";
import { BrandLogo } from "../components/BrandLogo";
import { useColorTheme } from "../lib/ThemeContext";
import { getTheme } from "../theme";
import { useAuth } from "../lib/AuthContext";

const { height: H } = Dimensions.get("window");

function GoogleG() {
  return (
    <View style={{ width: 18, height: 18, alignItems: "center", justifyContent: "center" }}>
      <Text style={{ fontSize: 13, fontWeight: "900", color: "#4285F4" }}>G</Text>
    </View>
  );
}

const FEATURES = [
  { icon: "hardware-chip-outline" as const, text: "Agents trade on your behalf, 24/7" },
  { icon: "shield-checkmark-outline" as const, text: "Hard on-chain budget cap — never exceeded" },
  { icon: "flash-off-outline" as const, text: "One-tap revoke, funds back instantly" },
];

export function ConnectScreen({ onConnected }: { onConnected: () => void }) {
  const { isDark } = useColorTheme();
  const { colors } = getTheme(isDark);
  const { login }  = useAuth();
  const [busy,  setBusy]  = useState(false);
  const [error, setError] = useState("");

  async function handleGoogle() {
    setBusy(true);
    setError("");
    try {
      await login();
      onConnected();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Sign-in failed — please try again");
    } finally {
      setBusy(false);
    }
  }

  return (
    <View style={[s.root, { backgroundColor: colors.bg }]}>

      {/* Top ambient gradient */}
      <LinearGradient
        colors={["rgba(255,140,0,0.12)", "transparent"]}
        style={s.topGlow}
        pointerEvents="none"
      />

      {/* Logo section */}
      <View style={s.logoSection}>
        <BrandLogo size={80} />
        <Text style={[s.brand, { color: colors.text }]}>TEFAMA</Text>
        <Text style={[s.tagline, { color: colors.text2 }]}>Autonomous trading agents</Text>
      </View>

      {/* Feature pills */}
      <View style={s.features}>
        {FEATURES.map(({ icon, text }) => (
          <View key={text} style={[s.featureRow, { backgroundColor: colors.accentDim, borderColor: colors.accentB }]}>
            <View style={[s.featureIco, { backgroundColor: colors.accent }]}>
              <Ionicons name={icon} size={13} color="#fff" />
            </View>
            <Text style={[s.featureText, { color: colors.text }]}>{text}</Text>
          </View>
        ))}
      </View>

      {/* Auth section */}
      <View style={s.authSection}>
        {error ? (
          <View style={[s.errBox, { backgroundColor: "rgba(212,75,42,0.10)", borderColor: "rgba(212,75,42,0.25)" }]}>
            <Ionicons name="alert-circle-outline" size={14} color="#D44B2A" />
            <Text style={[s.errText, { color: "#D44B2A" }]}>{error}</Text>
          </View>
        ) : null}

        <Button
          variant="primary" size="lg" block
          onPress={handleGoogle}
          icon={busy ? <ActivityIndicator size={16} color="#fff" /> : <GoogleG />}
        >
          {busy ? "Connecting…" : "Continue with Google"}
        </Button>

        <Button
          variant="secondary" size="lg" block
          onPress={() => {}}
          icon={<Ionicons name="logo-apple" size={18} color={isDark ? "#fff" : "#000"} />}
        >
          Continue with Apple  ·  coming soon
        </Button>

        <View style={s.zkRow}>
          <Ionicons name="lock-closed-outline" size={12} color={colors.text3} />
          <Text style={[s.zkText, { color: colors.text3 }]}>
            Secured by <Text style={{ color: colors.text2 }}>zkLogin</Text> · no seed phrases · self-custodial
          </Text>
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root:        { flex: 1, paddingHorizontal: 24 },

  topGlow: { position: "absolute", top: 0, left: 0, right: 0, height: H * 0.35 },

  logoSection: { flex: 1, alignItems: "center", justifyContent: "center", gap: 10, marginTop: 24 },
  brand:       { fontSize: 32, fontWeight: "900", letterSpacing: 6 },
  tagline:     { fontSize: 15, fontWeight: "400" },

  features:    { gap: 8, marginBottom: 28 },
  featureRow:  { flexDirection: "row", alignItems: "center", gap: 12, padding: 13, borderRadius: 14, borderWidth: 1 },
  featureIco:  { width: 26, height: 26, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  featureText: { fontSize: 14, fontWeight: "500", flex: 1 },

  authSection: { gap: 10, paddingBottom: 36 },
  errBox:      { flexDirection: "row", gap: 8, padding: 12, borderRadius: 12, borderWidth: 1, alignItems: "flex-start" },
  errText:     { flex: 1, fontSize: 13, lineHeight: 18 },

  zkRow:   { flexDirection: "row", alignItems: "center", gap: 5, justifyContent: "center", paddingTop: 4 },
  zkText:  { fontSize: 12, textAlign: "center", lineHeight: 17 },
});
