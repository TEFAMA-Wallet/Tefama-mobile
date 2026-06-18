import { useState } from "react";
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useColorTheme } from "../lib/ThemeContext";
import { getTheme } from "../theme";
import { useAuth } from "../lib/AuthContext";

function GoogleGlyph() {
  return (
    <View style={{ width: 20, height: 20 }}>
      <Image
        source={{ uri: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBmaWxsPSIjNDI4NUY0IiBkPSJNMjIuNTYgMTIuMjVjMC0uNzgtLjA3LTEuNTMtLjItMi4yNUgxMnY0LjI2aDUuOTJjLS4yNiAxLjM3LTEuMDQgMi41My0yLjIxIDMuMzF2Mi43N2gzLjU3YzIuMDgtMS45MiAzLjI4LTQuNzQgMy4yOC04LjA5eiIvPjxwYXRoIGZpbGw9IiMzNEE4NTMiIGQ9Ik0xMiAyM2MyLjk3IDAgNS40Ni0uOTggNy4yOC0yLjY2bC0zLjU3LTIuNzdjLS45OC42Ni0yLjIzIDEuMDYtMy43MSAxLjA2LTIuODYgMC01LjI5LTEuOTMtNi4xNi00LjUzSDIuMTh2Mi44NEMzLjk5IDIwLjUzIDcuNyAyMyAxMiAyM3oiLz48cGF0aCBmaWxsPSIjRkJCQzA1IiBkPSJNNS44NCAxNC4wOWMtLjIyLS42Ni0uMzUtMS4zNi0uMzUtMi4wOXMuMTMtMS40My4zNS0yLjA5VjcuMDdIMi4xOEMxLjQzIDguNTUgMSAxMC4yMiAxIDEycy40MyAzLjQ1IDEuMTggNC45M2wyLjg1LTIuMjIuODEtLjYyeiIvPjxwYXRoIGZpbGw9IiNFQTQzMzUiIGQ9Ik0xMiA1LjM4YzEuNjIgMCAzLjA2LjU2IDQuMjEgMS42NGwzLjE1LTMuMTVDMTcuNDUgMi4wOSAxNC45NyAxIDEyIDEgNy43IDEgMy45OSAzLjQ3IDIuMTggNy4wN2wzLjY2IDIuODRjLjg3LTIuNiAzLjMtNC41MyA2LjE2LTQuNTN6Ii8+PC9zdmc+" }}
        style={{ width: 20, height: 20 }}
        resizeMode="contain"
      />
    </View>
  );
}

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
    <ScrollView
      contentContainerStyle={[s.root, { backgroundColor: colors.bg }]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {/* Logo + wordmark */}
      <View style={s.logoRow}>
        <Image
          source={require("../../assets/branding/logo-mark.png")}
          style={{ width: 32, height: 32 }}
          resizeMode="contain"
        />
        <Text style={[s.logoWord, { color: colors.text }]}>TEFAMA</Text>
      </View>

      {/* Card */}
      <View style={[s.card, { backgroundColor: colors.bg3, borderColor: colors.border2 }]}>
        <Text style={[s.cardTitle, { color: colors.text }]}>Connect your wallet</Text>
        <Text style={[s.cardSub, { color: colors.text2 }]}>No password. No seed phrases.</Text>

        {/* Info box */}
        <View style={[s.infoBox, { backgroundColor: colors.accentDim, borderColor: colors.accentB }]}>
          <Ionicons name="information-circle-outline" size={18} color={colors.accent} />
          <Text style={[s.infoText, { color: colors.text2 }]}>
            TEFAMA uses zkLogin for secure, privacy-preserving sign-in. Your funds stay in your wallet — we never access your private keys.
          </Text>
        </View>

        {error ? (
          <View style={[s.errBox, { backgroundColor: colors.redDim, borderColor: "rgba(239,68,68,0.25)" }]}>
            <Ionicons name="alert-circle-outline" size={15} color={colors.red} style={{ flexShrink: 0, marginTop: 1 }} />
            <Text style={[s.errText, { color: colors.red }]}>{error}</Text>
          </View>
        ) : null}

        {/* Google button */}
        <Pressable
          style={[s.providerBtn, { backgroundColor: colors.bg4, borderColor: colors.border2 }]}
          onPress={handleGoogle}
          disabled={busy}
        >
          {busy
            ? <ActivityIndicator size={18} color={colors.accent} />
            : <GoogleGlyph />
          }
          <Text style={[s.providerText, { color: colors.text }]}>
            {busy ? "Preparing login…" : "Sign in with Google"}
          </Text>
        </Pressable>

        {/* Apple button (disabled) */}
        <Pressable
          style={[s.providerBtn, { backgroundColor: colors.bg4, borderColor: colors.border2, opacity: 0.4 }]}
          disabled
        >
          <Ionicons name="logo-apple" size={18} color={colors.text} />
          <Text style={[s.providerText, { color: colors.text }]}>
            Sign in with Apple
          </Text>
          <Text style={[s.comingSoon, { color: colors.text4 }]}>coming soon</Text>
        </Pressable>

        <Text style={[s.legal, { color: colors.text3 }]}>
          By continuing you agree to our{" "}
          <Text style={{ color: colors.accent }}>Terms</Text>
          {" "}and{" "}
          <Text style={{ color: colors.accent }}>Privacy Policy</Text>.
        </Text>
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  root:         { flexGrow: 1, alignItems: "center", justifyContent: "center", padding: 24 },

  logoRow:      { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 28 },
  logoWord:     { fontSize: 18, fontWeight: "700", letterSpacing: 1.5 },

  card:         { width: "100%", maxWidth: 400, borderRadius: 18, borderWidth: 1, padding: 28, gap: 0 },
  cardTitle:    { fontSize: 22, fontWeight: "700", textAlign: "center", marginBottom: 6 },
  cardSub:      { fontSize: 14, textAlign: "center", marginBottom: 22 },

  infoBox:      { flexDirection: "row", gap: 10, padding: 14, borderRadius: 12, borderWidth: 1, marginBottom: 18, alignItems: "flex-start" },
  infoText:     { flex: 1, fontSize: 13, lineHeight: 20 },

  errBox:       { flexDirection: "row", gap: 8, padding: 12, borderRadius: 10, borderWidth: 1, marginBottom: 14, alignItems: "flex-start" },
  errText:      { flex: 1, fontSize: 13, lineHeight: 18 },

  providerBtn:  { flexDirection: "row", alignItems: "center", gap: 12, height: 48, borderRadius: 10, borderWidth: 1, paddingHorizontal: 16, marginBottom: 10 },
  providerText: { flex: 1, fontSize: 15, fontWeight: "500" },
  comingSoon:   { fontSize: 11 },

  legal:        { fontSize: 12, textAlign: "center", lineHeight: 18, marginTop: 16 },
});
