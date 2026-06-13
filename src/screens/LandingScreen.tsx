import { useEffect, useRef } from "react";
import {
  Animated, Dimensions, Easing,
  Pressable, StyleSheet, Text, View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { BrandLogo } from "../components/BrandLogo";
import { useColorTheme } from "../lib/ThemeContext";

const { width: W } = Dimensions.get("window");
const LOGO_SIZE = Math.round(W * 0.38);

export function LandingScreen({ onGetStarted }: { onGetStarted: () => void }) {
  const { isDark, toggle } = useColorTheme();

  const bg          = isDark ? "#0A0600" : "#FFF8F0";
  const textPrimary = isDark ? "#F5F0E8" : "#1A0A00";
  const textMuted   = isDark ? "rgba(245,240,232,0.42)" : "rgba(26,10,0,0.42)";
  const accent      = isDark ? "#FF8C00" : "#CC5500";
  const accent2     = isDark ? "#CC4400" : "#993000";
  const glowColor   = "rgba(255,140,0,0.26)";

  const logoOp = useRef(new Animated.Value(0)).current;
  const logoSc = useRef(new Animated.Value(0.22)).current;
  const topOp  = useRef(new Animated.Value(0)).current;
  const tagOp  = useRef(new Animated.Value(0)).current;
  const tagY   = useRef(new Animated.Value(20)).current;
  const btnOp  = useRef(new Animated.Value(0)).current;
  const btnSc  = useRef(new Animated.Value(0.93)).current;
  const btnY   = useRef(new Animated.Value(18)).current;
  const floatY = useRef(new Animated.Value(0)).current;
  const glowBr = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(60),
      Animated.parallel([
        Animated.timing(logoOp, { toValue: 1, duration: 55,  useNativeDriver: true }),
        Animated.spring(logoSc, { toValue: 1, friction: 2.8, tension: 160, useNativeDriver: true }),
      ]),
      Animated.timing(topOp, { toValue: 1, duration: 260, useNativeDriver: true }),
      Animated.parallel([
        Animated.timing(tagOp, { toValue: 1, duration: 320, useNativeDriver: true }),
        Animated.timing(tagY,  { toValue: 0, duration: 320, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(btnOp, { toValue: 1, duration: 280, useNativeDriver: true }),
        Animated.spring(btnSc, { toValue: 1, friction: 5,   tension: 65, useNativeDriver: true }),
        Animated.spring(btnY,  { toValue: 0, friction: 6,   tension: 70, useNativeDriver: true }),
      ]),
    ]).start();

    Animated.loop(Animated.sequence([
      Animated.timing(floatY, { toValue: -8, duration: 1600, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      Animated.timing(floatY, { toValue:  0, duration: 1600, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
    ])).start();

    Animated.loop(Animated.sequence([
      Animated.timing(glowBr, { toValue: 0.9, duration: 1200, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      Animated.timing(glowBr, { toValue: 0.3, duration: 1300, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
    ])).start();
  }, []);

  return (
    <View style={[s.root, { backgroundColor: bg }]}>
      <LinearGradient
        colors={isDark
          ? ["#0A0600", "#140A00", "#0A0600"]
          : ["#FFF8F0", "#FFE8CC", "#FFF8F0"]}
        style={StyleSheet.absoluteFill}
      />

      {/* Top bar */}
      <Animated.View style={[s.topbar, { opacity: topOp }]}>
        <Text style={[s.topTitle, { color: textPrimary }]}>Tefama</Text>
        <Pressable onPress={toggle} hitSlop={14} style={s.themeBtn}>
          <Ionicons
            name={isDark ? "sunny-outline" : "moon-outline"}
            size={22}
            color={textMuted}
          />
        </Pressable>
      </Animated.View>

      {/* Body */}
      <View style={s.body}>
        {/* Logo */}
        <Animated.View style={[s.logoArea, { opacity: logoOp, transform: [{ scale: logoSc }, { translateY: floatY }] }]}>
          <Animated.View style={[s.glow, { opacity: glowBr, backgroundColor: glowColor }]} />
          <BrandLogo size={LOGO_SIZE} />
        </Animated.View>

        {/* Tagline */}
        <Animated.View style={[s.tagBlock, { opacity: tagOp, transform: [{ translateY: tagY }] }]}>
          <Text style={[s.tagline,    { color: textPrimary }]}>Your App Name</Text>
          <Text style={[s.taglineSub, { color: textMuted   }]}>Tagline goes here.</Text>
        </Animated.View>

        {/* CTA */}
        <Animated.View style={[s.btnWrap, { opacity: btnOp, transform: [{ scale: btnSc }, { translateY: btnY }] }]}>
          <Pressable
            style={({ pressed }) => [s.btn, pressed && s.btnPressed]}
            onPress={onGetStarted}
          >
            <LinearGradient colors={[accent, accent2]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.btnGrad}>
              <Ionicons name="arrow-forward-outline" size={18} color="#fff" />
              <Text style={s.btnText}>Get started</Text>
            </LinearGradient>
          </Pressable>
        </Animated.View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root: {
    flex: 1,
    paddingTop: 10,
    paddingBottom: 32,
    paddingHorizontal: 24,
  },
  topbar:   { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  topTitle: { fontSize: 17, fontWeight: "800", letterSpacing: 1.2 },
  themeBtn: { padding: 4 },
  body: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 32,
    paddingBottom: 60,
  },
  logoArea: {
    alignItems: "center",
    justifyContent: "center",
    width: LOGO_SIZE,
    height: LOGO_SIZE,
  },
  glow: {
    position: "absolute",
    width: LOGO_SIZE * 1.6,
    height: LOGO_SIZE * 1.6,
    borderRadius: LOGO_SIZE * 0.8,
  },
  tagBlock:   { alignItems: "center" },
  tagline:    { fontSize: 24, fontWeight: "700", letterSpacing: 0.5, lineHeight: 30 },
  taglineSub: { fontSize: 16, fontWeight: "300", letterSpacing: 0.2, lineHeight: 24 },
  btnWrap: { alignSelf: "stretch" },
  btn: {
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#FF8C00",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  },
  btnGrad: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 17,
  },
  btnText:    { color: "#fff", fontSize: 16, fontWeight: "700", letterSpacing: 0.5 },
  btnPressed: { opacity: 0.8, transform: [{ scale: 0.985 }] },
});
