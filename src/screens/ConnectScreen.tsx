import { useEffect, useRef, useState } from "react";
import {
  Animated, Dimensions, Image, Pressable, StyleSheet, Text, View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "../lib/AuthContext";

const { width: W, height: H } = Dimensions.get("window");

function GoogleIcon() {
  return (
    <View style={{ width: 20, height: 20, flexDirection: "row", flexWrap: "wrap", borderRadius: 10, overflow: "hidden" }}>
      {/* G logo using coloured quadrants */}
      <View style={{ width: 10, height: 10, backgroundColor: "#4285F4" }} />
      <View style={{ width: 10, height: 10, backgroundColor: "#34A853" }} />
      <View style={{ width: 10, height: 10, backgroundColor: "#FBBC05" }} />
      <View style={{ width: 10, height: 10, backgroundColor: "#EA4335" }} />
    </View>
  );
}

function AnimatedRing({ size, opacity, delay }: { size: number; opacity: number; delay: number }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    setTimeout(() => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, { toValue: 1, duration: 3000, useNativeDriver: true }),
          Animated.timing(anim, { toValue: 0, duration: 3000, useNativeDriver: true }),
        ])
      ).start();
    }, delay);
  }, []);
  const animOpacity = anim.interpolate({ inputRange: [0, 1], outputRange: [opacity * 0.6, opacity] });
  const animScale   = anim.interpolate({ inputRange: [0, 1], outputRange: [0.94, 1.04] });
  return (
    <Animated.View style={{
      position: "absolute",
      width: size, height: size,
      borderRadius: size / 2,
      borderWidth: 1,
      borderColor: "rgba(6,182,212,0.18)",
      opacity: animOpacity,
      transform: [{ scale: animScale }],
    }} />
  );
}

export function ConnectScreen({ onConnected }: { onConnected: () => void }) {
  const { login }  = useAuth();
  const [busy,  setBusy]  = useState(false);
  const [error, setError] = useState("");

  // Entrance animations
  const heroOp  = useRef(new Animated.Value(0)).current;
  const heroY   = useRef(new Animated.Value(30)).current;
  const cardOp  = useRef(new Animated.Value(0)).current;
  const cardY   = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(heroOp, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(heroY,  { toValue: 0, duration: 500, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(cardOp, { toValue: 1, duration: 440, useNativeDriver: true }),
        Animated.timing(cardY,  { toValue: 0, duration: 440, useNativeDriver: true }),
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

  return (
    <View style={s.root}>
      {/* Full-screen dark gradient background */}
      <LinearGradient
        colors={["#050509", "#0a0a10", "#040d10"]}
        style={StyleSheet.absoluteFill}
      />

      {/* Animated concentric rings centred in the hero */}
      <View style={s.ringsWrap}>
        <AnimatedRing size={W * 0.52} opacity={1}    delay={0} />
        <AnimatedRing size={W * 0.78} opacity={0.55} delay={400} />
        <AnimatedRing size={W * 1.05} opacity={0.28} delay={800} />
      </View>

      {/* Cyan bloom */}
      <View style={[s.bloom, { top: H * 0.08 }]} />

      {/* ── Hero section ── */}
      <Animated.View style={[s.hero, { opacity: heroOp, transform: [{ translateY: heroY }] }]}>
        {/* Logo with glow ring */}
        <View style={s.logoWrap}>
          <View style={s.logoGlow} />
          <Image
            source={require("../../assets/branding/logo-mark.png")}
            style={s.logoImg}
            resizeMode="contain"
          />
        </View>
        <Text style={s.wordmark}>TEFAMA</Text>
        <Text style={s.tagline}>Trade autonomously on Sui</Text>

        {/* Feature pills */}
        <View style={s.pills}>
          {["zkLogin", "DeepBook v3", "Sui testnet"].map((p) => (
            <View key={p} style={s.pill}>
              <View style={s.pillDot} />
              <Text style={s.pillText}>{p}</Text>
            </View>
          ))}
        </View>
      </Animated.View>

      {/* ── Auth card ── */}
      <Animated.View style={[s.card, { opacity: cardOp, transform: [{ translateY: cardY }] }]}>
        {/* Frosted glass look */}
        <View style={s.cardBg} />

        <Text style={s.cardTitle}>Connect your wallet</Text>
        <Text style={s.cardSub}>No password. No seed phrases.</Text>

        {/* Info row */}
        <View style={s.infoRow}>
          <View style={[s.infoIcon, { backgroundColor: "rgba(6,182,212,0.12)" }]}>
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

        {/* Google sign-in — primary CTA */}
        <Pressable
          onPress={handleGoogle}
          disabled={busy}
          style={({ pressed }) => [s.googleBtn, pressed && { opacity: 0.88 }]}
        >
          <LinearGradient
            colors={["rgba(6,182,212,0.18)", "rgba(6,182,212,0.06)"]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={s.googleBtnInner}
          >
            {busy
              ? <Animated.View style={s.spinner}>
                  <Ionicons name="refresh-outline" size={18} color="#06b6d4" />
                </Animated.View>
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
          <Ionicons name="logo-apple" size={17} color="rgba(250,250,250,0.25)" />
          <Text style={s.appleBtnText}>Continue with Apple</Text>
          <View style={s.soonBadge}>
            <Text style={s.soonText}>Soon</Text>
          </View>
        </Pressable>

        {/* Divider */}
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

  ringsWrap: {
    position: "absolute",
    top: H * 0.04,
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    width: W,
    height: W,
  },
  bloom: {
    position: "absolute",
    alignSelf: "center",
    width: W * 0.7, height: W * 0.7, borderRadius: W * 0.35,
    backgroundColor: "rgba(6,182,212,0.05)",
  },

  // Hero
  hero: {
    alignItems: "center",
    paddingTop: H * 0.10,
    paddingBottom: 32,
    paddingHorizontal: 24,
  },
  logoWrap: { alignItems: "center", justifyContent: "center", marginBottom: 20 },
  logoGlow: {
    position: "absolute",
    width: 120, height: 120, borderRadius: 60,
    backgroundColor: "rgba(6,182,212,0.14)",
  },
  logoImg:  { width: 80, height: 80 },
  wordmark: { color: "#fafafa", fontSize: 28, fontWeight: "800", letterSpacing: 9, marginBottom: 8 },
  tagline:  { color: "#5c5c5c", fontSize: 14, letterSpacing: 0.3, marginBottom: 22 },

  pills:    { flexDirection: "row", gap: 8, flexWrap: "wrap", justifyContent: "center" },
  pill:     { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 11, paddingVertical: 5, borderRadius: 100, backgroundColor: "rgba(255,255,255,0.05)", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" },
  pillDot:  { width: 5, height: 5, borderRadius: 3, backgroundColor: "#06b6d4" },
  pillText: { color: "#8a8a8a", fontSize: 11, fontWeight: "600" },

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
    backgroundColor: "rgba(10,12,18,0.96)",
    borderRadius: 24,
  },
  cardTitle: { color: "#fafafa", fontSize: 20, fontWeight: "700", marginBottom: 6, textAlign: "center" },
  cardSub:   { color: "#5c5c5c", fontSize: 14, textAlign: "center", marginBottom: 20 },

  infoRow:   { flexDirection: "row", alignItems: "flex-start", gap: 10, marginBottom: 18 },
  infoIcon:  { width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  infoText:  { flex: 1, color: "#8a8a8a", fontSize: 12, lineHeight: 18 },

  errBox: { flexDirection: "row", gap: 8, backgroundColor: "rgba(239,68,68,0.10)", borderWidth: 1, borderColor: "rgba(239,68,68,0.2)", borderRadius: 10, padding: 12, marginBottom: 14, alignItems: "flex-start" },
  errText:{ flex: 1, color: "#ef4444", fontSize: 12, lineHeight: 17 },

  // Google button
  googleBtn:      { borderRadius: 14, overflow: "hidden", marginBottom: 10, borderWidth: 1, borderColor: "rgba(6,182,212,0.35)" },
  googleBtnInner: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 18, paddingVertical: 15 },
  googleBtnText:  { flex: 1, color: "#fafafa", fontSize: 15, fontWeight: "600" },
  spinner:        { width: 20, height: 20, alignItems: "center", justifyContent: "center" },

  // Apple button
  appleBtn:      { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 18, paddingVertical: 14, borderRadius: 14, borderWidth: 1, borderColor: "rgba(255,255,255,0.06)", backgroundColor: "rgba(255,255,255,0.03)", marginBottom: 20, opacity: 0.45 },
  appleBtnText:  { flex: 1, color: "rgba(250,250,250,0.3)", fontSize: 15, fontWeight: "600" },
  soonBadge:     { backgroundColor: "rgba(255,255,255,0.06)", paddingHorizontal: 7, paddingVertical: 2, borderRadius: 100 },
  soonText:      { color: "#3d3d3d", fontSize: 10, fontWeight: "700" },

  // Divider
  divider:     { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 16 },
  dividerLine: { flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: "rgba(255,255,255,0.07)" },
  dividerText: { color: "#3d3d3d", fontSize: 10, fontWeight: "500", letterSpacing: 0.5 },

  // Legal
  legal:     { color: "#3d3d3d", fontSize: 11, textAlign: "center", lineHeight: 17 },
  legalLink: { color: "#06b6d4" },
});
