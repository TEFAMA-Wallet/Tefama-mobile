import { useEffect, useRef } from "react";
import { Animated, Dimensions, Image, StyleSheet, Text } from "react-native";

const { width: W } = Dimensions.get("window");
const LOGO = Math.round(W * 0.26);

export function SplashScreen({ onDone }: { onDone: () => void }) {
  const screenOp = useRef(new Animated.Value(1)).current;
  const logoOp   = useRef(new Animated.Value(0)).current;
  const scale    = useRef(new Animated.Value(0.72)).current;
  const nameOp   = useRef(new Animated.Value(0)).current;
  const nameY    = useRef(new Animated.Value(10)).current;
  const glowOp   = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(logoOp, { toValue: 1,   duration: 280, useNativeDriver: true }),
        Animated.timing(glowOp, { toValue: 1,   duration: 600, useNativeDriver: true }),
        Animated.spring(scale,  { toValue: 1,   friction: 6, tension: 80, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(nameOp, { toValue: 1, duration: 320, useNativeDriver: true }),
        Animated.timing(nameY,  { toValue: 0, duration: 320, useNativeDriver: true }),
      ]),
      Animated.delay(900),
      Animated.timing(screenOp, { toValue: 0, duration: 380, useNativeDriver: true }),
    ]).start(({ finished }) => { if (finished) onDone(); });
  }, []);

  return (
    <Animated.View style={[s.root, { opacity: screenOp }]}>
      <Animated.View style={[s.glow, { opacity: glowOp }]} />
      <Animated.View style={{ opacity: logoOp, transform: [{ scale }] }}>
        <Image
          source={require("../../assets/branding/logo-mark.png")}
          style={{ width: LOGO, height: LOGO }}
          resizeMode="contain"
        />
      </Animated.View>
      <Animated.View style={{ opacity: nameOp, transform: [{ translateY: nameY }], marginTop: 20, alignItems: "center" }}>
        <Text style={s.name}>TEFAMA</Text>
        <Text style={s.tag}>Autonomous trading agents</Text>
      </Animated.View>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#0a0a0a",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 999,
  },
  glow: {
    position: "absolute",
    width: W * 0.65, height: W * 0.65, borderRadius: W * 0.325,
    backgroundColor: "rgba(6,182,212,0.09)",
  },
  name: { color: "#fafafa", fontSize: 24, fontWeight: "800", letterSpacing: 7, textAlign: "center" },
  tag:  { color: "#5c5c5c", fontSize: 13, textAlign: "center", marginTop: 6, letterSpacing: 0.3 },
});
