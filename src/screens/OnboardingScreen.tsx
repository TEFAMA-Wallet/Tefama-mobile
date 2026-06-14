import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "../components/Button";
import { BrandLogo } from "../components/BrandLogo";
import { useColorTheme } from "../lib/ThemeContext";
import { getTheme } from "../theme";

const SLIDES = [
  { icon: "hardware-chip-outline" as const, title: "Agents that trade for you",  body: "Spin up an autonomous agent that executes your strategy on-chain — no manual orders." },
  { icon: "shield-checkmark-outline" as const, title: "Hard budget caps",            body: "Every agent runs inside an on-chain spend ceiling and a time limit. It can never exceed them." },
  { icon: "flash-off-outline" as const, title: "Revoke in one tap",            body: "Kill any agent instantly with an on-chain revocation. You stay in control at all times." },
];

export function OnboardingScreen({ onDone }: { onDone: () => void }) {
  const [i, setI] = useState(0);
  const { isDark } = useColorTheme();
  const { colors } = getTheme(isDark);
  const slide = SLIDES[i];
  const last  = i === SLIDES.length - 1;

  return (
    <View style={[s.root, { backgroundColor: colors.bg }]}>

      {/* top bar */}
      <View style={s.topbar}>
        <BrandLogo size={32} />
        <Pressable onPress={onDone} hitSlop={12}>
          <Text style={[s.skip, { color: colors.text2 }]}>Skip</Text>
        </Pressable>
      </View>

      {/* slide body */}
      <View style={s.body}>
        <View style={[s.iconWrap, { backgroundColor: colors.accentDim }]}>
          <Ionicons name={slide.icon} size={40} color={colors.accent} />
        </View>
        <Text style={[s.title, { color: colors.text }]}>{slide.title}</Text>
        <Text style={[s.text,  { color: colors.text2 }]}>{slide.body}</Text>
      </View>

      {/* footer */}
      <View style={s.foot}>
        <View style={s.dots}>
          {SLIDES.map((_, k) => (
            <View key={k} style={[s.dot, { backgroundColor: k === i ? colors.accent : colors.bg4, width: k === i ? 20 : 6 }]} />
          ))}
        </View>
        <Button
          variant="primary"
          size="lg"
          block
          onPress={() => (last ? onDone() : setI(i + 1))}
          iconRight={!last ? <Ionicons name="arrow-forward" size={18} color="#fff" /> : undefined}
        >
          {last ? "Get started" : "Continue"}
        </Button>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root:    { flex: 1, paddingHorizontal: 24, paddingVertical: 16 },
  topbar:  { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  skip:    { fontSize: 15, fontWeight: "600" },
  body:    { flex: 1, justifyContent: "center", alignItems: "center", gap: 20, paddingHorizontal: 8 },
  iconWrap:{ width: 88, height: 88, borderRadius: 28, alignItems: "center", justifyContent: "center" },
  title:   { fontSize: 26, fontWeight: "800", textAlign: "center", letterSpacing: -0.4 },
  text:    { fontSize: 16, lineHeight: 24, textAlign: "center" },
  foot:    { gap: 20, paddingBottom: 16 },
  dots:    { flexDirection: "row", justifyContent: "center", gap: 6 },
  dot:     { height: 6, borderRadius: 3 },
});
