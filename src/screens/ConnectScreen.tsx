import { useEffect, useRef, useState } from "react";
import {
  Animated, Dimensions, Image, Pressable, StyleSheet, Text, View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "../lib/AuthContext";

const { width: W, height: H } = Dimensions.get("window");
const LOGO_SIZE = Math.round(W * 0.38);

function GoogleIcon() {
  return (
    <View style={{ width: 20, height: 20, flexDirection: "row", flexWrap: "wrap", borderRadius: 10, overflow: "hidden" }}>
      <View style={{ width: 10, height: 10, backgroundColor: "#4285F4" }} />
      <View style={{ width: 10, height: 10, backgroundColor: "#34A853" }} />
      <View style={{ width: 10, height: 10, backgroundColor: "#FBBC05" }} />
      <View style={{ width: 10, height: 10, backgroundColor: "#EA4335" }} />
    </View>
  );
}

export function ConnectScreen({ onConnected }: { onConnected: () => void }) {
  const { login }  = useAuth();
  const [busy,  setBusy]  = useState(false);
  const [error, setError] = useState("");

  const heroOp  = useRef(new Animated.Value(0)).current;
  const heroY   = useRef(new Animated.Value(24)).current;
  const cardOp  = useRef(new Animated.Value(0)).current;
  const cardY   = useRef(new Animated.Value(32)).current;
  const glowAnim= useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Glow breathe loop
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: 2200, useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 0, duration: 2200, useNativeDriver: true }),
      ])
    ).start();

    // Entrance
    Animated.sequence([
      Animated.parallel([
        Animated.timing(heroOp, { toValue: 1, duration: 480, useNativeDriver: true }),
        Animated.timing(heroY,  { toValue: 0, duration: 480, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(cardOp, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(cardY,  { toValue: 0, duration: 400, useNativeDriver: true }),
      ]),
    ]).start();
  }, []);

  async function handleGoogle() {
    setBusy(true);
    setError("");
    try {
      await login();
      onConnected();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Sign-in failed — please try again");
      setBusy(false);
    }
  }

  const glowOpacity = glowAnim.interpolate({ inputRange: [0, 1], outputRange: [0.55, 1] });
  const glowScale   = glowAnim.interpolate({ inputRange: [0, 1], outputRange: [0.96, 1.04] });

  return (
    <View style={s.root}>
      <LinearGradient colors={["#050509", "#060c10"]} style={StyleSheet.absoluteFill} />

      {/* ── Hero ── */}
      <Animated.View style={[s.hero, { opacity: heroOp, transform: [{ translateY: heroY }] }]}>
        {/* Logo inside a filled glowing circle */}
        <View style={s.logoWrap}>
          {/* Outer soft glow layer — breathes */}
          <Animated.View style={[s.glowOuter, { opacity: glowOpacity, transform: [{ scale: glowScale }] }]} />
          {/* Mid filled circle */}
          <View style={s.glowMid} />
          {/* Inner circle — the "filled" look */}
          <View style={s.glowInner} />
          {/* Logo sits on top */}
          <Image
            source={require("../../assets/branding/logo-mark.png")}
            style={s.logoImg}
            resizeMode="contain"
          />
        </View>

        <Text style={s.wordmark}>TEFAMA</Text>
        <Text style={s.tagline}>Trade autonomously on Sui</Text>
      </Animated.View>

      {/* ── Auth card ── */}
      <Animated.View style={[s.card, { opacity: cardOp, transform: [{ translateY: cardY }] }]}>
        <View style={s.cardBg} />

        <Text style={s.cardTitle}>Connect your wallet</Text>
        <Text style={s.cardSub}>No password. No seed phrases.</Text>

        <View style={s.infoRow}>
          <View style={s.infoIcon}>
            <Ionicons name="shield-checkmark-outline" size={15} color="#06b6d4" />
          </View>
          <Text style={s.infoText}>
            Powered by zkLogin — your private keys never leave your wallet
          </Text>
        </View>

        {error ? (
          <View style={s.errBox}>
            <Ionicons name="alert-circle-outline" size={14} color="#ef4444" />
            <Text style={s.errText}>{error}</Text>
          </View>
        ) : null}

        {/* Google CTA */}
        <Pressable
          onPress={handleGoogle}
          disabled={busy}
          style={({ pressed }) => [s.googleBtn, pressed && { opacity: 0.86 }]}
        >
          <LinearGradient
            colors={["rgba(6,182,212,0.20)", "rgba(6,182,212,0.07)"]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={s.googleBtnInner}
          >
            {busy
              ? <Ionicons name="refresh-outline" size={18} color="#06b6d4" />
              : <GoogleIcon />
            }
            <Text style={s.googleBtnText}>
              {busy ? "Opening sign-in…" : "Continue with Google"}
            </Text>
            {!busy && <Ionicons name="arrow-forward" size={16} color="#06b6d4" />}
          </LinearGradient>
        </Pressable>

        {/* Apple — coming soon */}
        <Pressable style={s.appleBtn} disabled>
          <Ionicons name="logo-apple" size={17} color="rgba(250,250,250,0.22)" />
          <Text style={s.appleBtnText}>Continue with Apple</Text>
          <View style={s.soonBadge}><Text style={s.soonText}>Soon</Text></View>
        </Pressable>

        <View style={s.divider}>
          <View style={s.dividerLine} />
          <Text style={s.dividerText}>secure · private · on-chain</Text>
          <View style={s.dividerLine} />
        </View>

        <Text style={s.legal}>
          By continuing you agree to our{" "}
          <Text style={s.legalLink}>Terms</Text> and{" "}
          <Text style={s.legalLink}>Privacy Policy</Text>
        </Text>
      </Animated.View>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#050509" },

  // Hero
  hero: {
    alignItems: "center",
    paddingTop: H * 0.09,
    paddingBottom: 28,
  },

  // Logo layers — outer→inner creates depth
  logoWrap: {
    width:  LOGO_SIZE + 56,
    height: LOGO_SIZE + 56,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 28,
  },
  glowOuter: {
    position: "absolute",
    width:  LOGO_SIZE + 56,
    height: LOGO_SIZE + 56,
    borderRadius: (LOGO_SIZE + 56) / 2,
    backgroundColor: "rgba(6,182,212,0.10)",
  },
  glowMid: {
    position: "absolute",
    width:  LOGO_SIZE + 28,
    height: LOGO_SIZE + 28,
    borderRadius: (LOGO_SIZE + 28) / 2,
    backgroundColor: "rgba(6,182,212,0.15)",
  },
  glowInner: {
    position: "absolute",
    width:  LOGO_SIZE + 8,
    height: LOGO_SIZE + 8,
    borderRadius: (LOGO_SIZE + 8) / 2,
    backgroundColor: "rgba(6,182,212,0.22)",
  },
  logoImg: { width: LOGO_SIZE, height: LOGO_SIZE },

  wordmark: { color: "#fafafa", fontSize: 28, fontWeight: "800", letterSpacing: 9, marginBottom: 8 },
  tagline:  { color: "#4a4a4a", fontSize: 14, letterSpacing: 0.3 },

  // Card
  card: {
    marginHorizontal: 16,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(6,182,212,0.18)",
    padding: 24,
    overflow: "hidden",
  },
  cardBg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(8,11,16,0.97)",
    borderRadius: 24,
  },
  cardTitle: { color: "#fafafa", fontSize: 20, fontWeight: "700", marginBottom: 6, textAlign: "center" },
  cardSub:   { color: "#5c5c5c", fontSize: 14, textAlign: "center", marginBottom: 20 },

  infoRow:  { flexDirection: "row", alignItems: "flex-start", gap: 10, marginBottom: 18 },
  infoIcon: { width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center", flexShrink: 0, backgroundColor: "rgba(6,182,212,0.12)" },
  infoText: { flex: 1, color: "#8a8a8a", fontSize: 12, lineHeight: 18 },

  errBox: { flexDirection: "row", gap: 8, backgroundColor: "rgba(239,68,68,0.10)", borderWidth: 1, borderColor: "rgba(239,68,68,0.2)", borderRadius: 10, padding: 12, marginBottom: 14, alignItems: "flex-start" },
  errText:{ flex: 1, color: "#ef4444", fontSize: 12, lineHeight: 17 },

  googleBtn:      { borderRadius: 14, overflow: "hidden", marginBottom: 10, borderWidth: 1, borderColor: "rgba(6,182,212,0.38)" },
  googleBtnInner: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 18, paddingVertical: 15 },
  googleBtnText:  { flex: 1, color: "#fafafa", fontSize: 15, fontWeight: "600" },

  appleBtn:     { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 18, paddingVertical: 14, borderRadius: 14, borderWidth: 1, borderColor: "rgba(255,255,255,0.06)", backgroundColor: "rgba(255,255,255,0.02)", marginBottom: 20, opacity: 0.4 },
  appleBtnText: { flex: 1, color: "rgba(250,250,250,0.3)", fontSize: 15, fontWeight: "600" },
  soonBadge:    { backgroundColor: "rgba(255,255,255,0.05)", paddingHorizontal: 7, paddingVertical: 2, borderRadius: 100 },
  soonText:     { color: "#3d3d3d", fontSize: 10, fontWeight: "700" },

  divider:     { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 16 },
  dividerLine: { flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: "rgba(255,255,255,0.07)" },
  dividerText: { color: "#3d3d3d", fontSize: 10, fontWeight: "500", letterSpacing: 0.5 },

  legal:     { color: "#3d3d3d", fontSize: 11, textAlign: "center", lineHeight: 17 },
  legalLink: { color: "#06b6d4" },
});
