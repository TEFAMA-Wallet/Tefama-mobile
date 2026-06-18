import { useEffect, useRef } from "react";
import { Animated, Dimensions, Image, StyleSheet } from "react-native";

const { width: W, height: H } = Dimensions.get("window");
const LOGO = Math.round(W * 0.30);

export function SplashScreen({ onDone }: { onDone: () => void }) {
  const screenOp  = useRef(new Animated.Value(1)).current;
  const logoOp    = useRef(new Animated.Value(0)).current;
  const scale     = useRef(new Animated.Value(0.6)).current;
  const nameOp    = useRef(new Animated.Value(0)).current;
  const nameY     = useRef(new Animated.Value(14)).current;
  const ring1Op   = useRef(new Animated.Value(0)).current;
  const ring1S    = useRef(new Animated.Value(0.4)).current;
  const ring2Op   = useRef(new Animated.Value(0)).current;
  const ring2S    = useRef(new Animated.Value(0.4)).current;
  const ring3Op   = useRef(new Animated.Value(0)).current;
  const ring3S    = useRef(new Animated.Value(0.4)).current;
  const glowOp    = useRef(new Animated.Value(0)).current;
  const breathe   = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Staggered rings expand
    const rings = Animated.stagger(120, [
      Animated.parallel([
        Animated.timing(ring1Op, { toValue: 1,    duration: 500, useNativeDriver: true }),
        Animated.spring (ring1S, { toValue: 1,    friction: 7, tension: 50, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(ring2Op, { toValue: 0.5, duration: 500, useNativeDriver: true }),
        Animated.spring (ring2S, { toValue: 1,   friction: 7, tension: 40, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(ring3Op, { toValue: 0.25, duration: 500, useNativeDriver: true }),
        Animated.spring (ring3S, { toValue: 1,    friction: 7, tension: 30, useNativeDriver: true }),
      ]),
    ]);

    // Logo springs in
    const logo = Animated.parallel([
      Animated.timing(logoOp, { toValue: 1, duration: 260, useNativeDriver: true }),
      Animated.timing(glowOp, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.spring (scale,  { toValue: 1, friction: 5, tension: 90, useNativeDriver: true }),
    ]);

    // Wordmark slides up
    const words = Animated.parallel([
      Animated.timing(nameOp, { toValue: 1, duration: 350, useNativeDriver: true }),
      Animated.timing(nameY,  { toValue: 0, duration: 350, useNativeDriver: true }),
    ]);

    // Subtle breathe after reveal
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(breathe, { toValue: 1.04, duration: 1400, useNativeDriver: true }),
        Animated.timing(breathe, { toValue: 1,    duration: 1400, useNativeDriver: true }),
      ])
    );

    Animated.sequence([
      rings,
      logo,
      words,
      Animated.delay(700),
      Animated.timing(screenOp, { toValue: 0, duration: 420, useNativeDriver: true }),
    ]).start(({ finished }) => { if (finished) onDone(); });

    pulse.start();

    return () => { pulse.stop(); };
  }, []);

  const RING = W * 0.72;

  return (
    <Animated.View style={[s.root, { opacity: screenOp }]}>
      {/* Layered rings */}
      <Animated.View style={[
        s.ring, { width: RING, height: RING, borderRadius: RING / 2 },
        { opacity: ring1Op, transform: [{ scale: ring1S }] },
      ]} />
      <Animated.View style={[
        s.ring, { width: RING * 1.4, height: RING * 1.4, borderRadius: RING * 0.7 },
        { opacity: ring2Op, transform: [{ scale: ring2S }] },
      ]} />
      <Animated.View style={[
        s.ring, { width: RING * 1.9, height: RING * 1.9, borderRadius: RING * 0.95 },
        { opacity: ring3Op, transform: [{ scale: ring3S }] },
      ]} />

      {/* Cyan radial glow */}
      <Animated.View style={[s.glow, { opacity: glowOp }]} />

      {/* Logo */}
      <Animated.View style={{ opacity: logoOp, transform: [{ scale: Animated.multiply(scale, breathe) }], alignItems: "center" }}>
        <Image
          source={require("../../assets/branding/logo-mark.png")}
          style={{ width: LOGO, height: LOGO }}
          resizeMode="contain"
        />
      </Animated.View>

      {/* Wordmark */}
      <Animated.View style={{ opacity: nameOp, transform: [{ translateY: nameY }], marginTop: 28, alignItems: "center" }}>
        <Animated.Text style={s.name}>TEFAMA</Animated.Text>
        <Animated.Text style={s.tag}>Autonomous trading agents</Animated.Text>
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
  ring: {
    position: "absolute",
    borderWidth: 1,
    borderColor: "rgba(6,182,212,0.14)",
  },
  glow: {
    position: "absolute",
    width: W * 0.7, height: W * 0.7, borderRadius: W * 0.35,
    backgroundColor: "rgba(6,182,212,0.07)",
  },
  name: {
    color: "#fafafa",
    fontSize: 26,
    fontWeight: "800",
    letterSpacing: 9,
    textAlign: "center",
  },
  tag: {
    color: "#4a4a4a",
    fontSize: 13,
    textAlign: "center",
    marginTop: 8,
    letterSpacing: 0.4,
  },
});
