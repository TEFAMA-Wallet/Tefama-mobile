import { useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "../components/Button";
import { BrandLogo } from "../components/BrandLogo";
import { useColorTheme } from "../lib/ThemeContext";
import { getTheme } from "../theme";
import { useAuth } from "../lib/AuthContext";

function GoogleGlyph() {
  return (
    <View style={g.wrap}>
      <Text style={g.blue}>G</Text><Text style={g.red}>o</Text>
      <Text style={g.yellow}>o</Text><Text style={g.blue2}>g</Text>
      <Text style={g.green}>l</Text><Text style={g.red}>e</Text>
    </View>
  );
}
const g = StyleSheet.create({
  wrap:   { flexDirection: "row" },
  blue:   { color: "#4285F4", fontWeight: "700", fontSize: 14 },
  red:    { color: "#EA4335", fontWeight: "700", fontSize: 14 },
  yellow: { color: "#FBBC05", fontWeight: "700", fontSize: 14 },
  blue2:  { color: "#4285F4", fontWeight: "700", fontSize: 14 },
  green:  { color: "#34A853", fontWeight: "700", fontSize: 14 },
});

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
      setError(e instanceof Error ? e.message : "Sign-in failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <View style={[s.root, { backgroundColor: colors.bg }]}>

      <View style={s.body}>
        <BrandLogo size={120} />
        <Text style={[s.title, { color: colors.text }]}>No wallet needed</Text>
        <Text style={[s.sub, { color: colors.text2 }]}>
          Sign in to create and watch your agents.{"\n"}No seed phrases, no extensions.
        </Text>
      </View>

      <View style={s.foot}>
        {error ? (
          <View style={[s.errBox, { backgroundColor: "rgba(212,75,42,0.12)", borderColor: "rgba(212,75,42,0.3)" }]}>
            <Ionicons name="alert-circle-outline" size={15} color="#D44B2A" />
            <Text style={[s.errText, { color: "#D44B2A" }]}>{error}</Text>
          </View>
        ) : null}

        <Button
          variant="primary" size="lg" block
          onPress={handleGoogle}
          icon={busy ? <ActivityIndicator size={16} color="#fff" /> : <GoogleGlyph />}
        >
          {busy ? "Connecting…" : "Continue with Google"}
        </Button>

        <Button variant="secondary" size="lg" block
          icon={<Ionicons name="logo-apple" size={18} color={isDark ? "#fff" : "#000"} />}
          onPress={() => {}}
        >
          Continue with Apple
          <Text style={{ fontSize: 11, opacity: 0.5 }}> (coming soon)</Text>
        </Button>

        <View style={[s.note, { backgroundColor: colors.accentDim, borderColor: colors.accentB }]}>
          <Ionicons name="shield-checkmark-outline" size={15} color={colors.accent} />
          <Text style={[s.noteText, { color: colors.text2 }]}>
            TEFAMA uses <Text style={{ color: colors.text, fontWeight: "700" }}>zkLogin</Text>. Your trading is autonomous and your funds stay self-custodial.
          </Text>
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root:     { flex: 1, paddingHorizontal: 24, paddingBottom: 32 },
  body:     { flex: 1, justifyContent: "center", alignItems: "center", gap: 18 },
  title:    { fontSize: 26, fontWeight: "800", letterSpacing: -0.4 },
  sub:      { fontSize: 16, textAlign: "center", lineHeight: 24 },
  foot:     { gap: 12 },
  errBox:   { flexDirection: "row", gap: 8, padding: 12, borderRadius: 10, borderWidth: 1, alignItems: "flex-start" },
  errText:  { flex: 1, fontSize: 13, lineHeight: 18 },
  note:     { flexDirection: "row", gap: 10, padding: 14, borderRadius: 14, borderWidth: 1, alignItems: "flex-start" },
  noteText: { flex: 1, fontSize: 13, lineHeight: 19 },
});
