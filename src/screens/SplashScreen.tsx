import { useEffect, useRef } from "react";
import { Animated, Dimensions, StyleSheet, Text } from "react-native";
import { BrandLogo } from "../components/BrandLogo";

const { width: W } = Dimensions.get("window");
const LOGO  = Math.round(W * 0.46);
const GLOW1 = LOGO * 2.2;
const GLOW2 = LOGO * 1.4;

export function SplashScreen({ onDone }: { onDone: () => void }) {
  const screenOp = useRef(new Animated.Value(1)).current;
  const scale    = useRef(new Animated.Value(0.04)).current;
  const logoOp   = useRef(new Animated.Value(0)).current;
  const glowOp   = useRef(new Animated.Value(0)).current;
  const nameOp   = useRef(new Animated.Value(0)).current;
  const nameY    = useRef(new Animated.Value(12)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(logoOp, { toValue: 1,   duration: 160, useNativeDriver: true }),
        Animated.timing(glowOp, { toValue: 0.5, duration: 500, useNativeDriver: true }),
        Animated.spring(scale,  { toValue: 0.3, friction: 7, tension: 100, useNativeDriver: true }),
      ]),
      Animated.spring(scale, { toValue: 0.65, friction: 5, tension: 50, useNativeDriver: true }),
      Animated.parallel([
        Animated.spring(scale,  { toValue: 1,   friction: 3, tension: 65, useNativeDriver: true }),
        Animated.timing(glowOp, { toValue: 1,   duration: 500, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(nameOp, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(nameY,  { toValue: 0, duration: 300, useNativeDriver: true }),
      ]),
      Animated.delay(800),
      Animated.timing(screenOp, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start(({ finished }) => { if (finished) onDone(); });
  }, []);

  return (
    <Animated.View style={[s.root, { opacity: screenOp }]}>
      <Animated.View style={[s.glow1, { opacity: glowOp, transform: [{ scale }] }]} />
      <Animated.View style={[s.glow2, { opacity: glowOp, transform: [{ scale }] }]} />
      <Animated.View style={{ opacity: logoOp, transform: [{ scale }] }}>
        <BrandLogo size={LOGO} />
      </Animated.View>
      <Animated.View style={{ opacity: nameOp, transform: [{ translateY: nameY }], marginTop: 24 }}>
        <Text style={s.name}>TEFAMA</Text>
      </Animated.View>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#0A0600",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 999,
  },
  glow1: {
    position: "absolute",
    width: GLOW1, height: GLOW1, borderRadius: GLOW1 / 2,
    backgroundColor: "rgba(255,140,0,0.13)",
  },
  glow2: {
    position: "absolute",
    width: GLOW2, height: GLOW2, borderRadius: GLOW2 / 2,
    backgroundColor: "rgba(255,140,0,0.22)",
  },
  name: {
    color: "#F5F0E8",
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: 6,
  },
});
