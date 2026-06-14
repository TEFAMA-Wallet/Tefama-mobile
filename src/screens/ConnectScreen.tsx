import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "../components/Button";
import { BrandLogo } from "../components/BrandLogo";
import { useColorTheme } from "../lib/ThemeContext";
import { getTheme } from "../theme";

export function ConnectScreen({ onConnected }: { onConnected: () => void }) {
  const { isDark } = useColorTheme();
  const { colors } = getTheme(isDark);

  return (
    <View style={[s.root, { backgroundColor: colors.bg }]}>

      {/* hero */}
      <View style={s.body}>
        <BrandLogo size={120} />
        <Text style={[s.title, { color: colors.text }]}>No wallet needed</Text>
        <Text style={[s.sub,   { color: colors.text2 }]}>
          Sign in to create and watch your agents.{"\n"}No seed phrases, no extensions.
        </Text>
      </View>

      {/* auth buttons */}
      <View style={s.foot}>
        <Button variant="primary" size="lg" block onPress={onConnected}
          icon={<GoogleMark />}>
          Continue with Google
        </Button>
        <Button variant="secondary" size="lg" block onPress={onConnected}
          icon={<AppleMark color={isDark ? "#fff" : "#000"} />}>
          Continue with Apple
        </Button>

        {/* zkLogin note */}
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

function GoogleMark() {
  return (
    <View style={{ width: 18, height: 18 }}>
      <Text style={{ fontSize: 14 }}>G</Text>
    </View>
  );
}

function AppleMark({ color }: { color: string }) {
  return <Ionicons name="logo-apple" size={18} color={color} />;
}

const s = StyleSheet.create({
  root: { flex: 1, paddingHorizontal: 24, paddingBottom: 32 },
  body: { flex: 1, justifyContent: "center", alignItems: "center", gap: 18 },
  title: { fontSize: 26, fontWeight: "800", letterSpacing: -0.4 },
  sub:   { fontSize: 16, textAlign: "center", lineHeight: 24 },
  foot:  { gap: 12 },
  note:  { flexDirection: "row", gap: 10, padding: 14, borderRadius: 14, borderWidth: 1, alignItems: "flex-start" },
  noteText: { flex: 1, fontSize: 13, lineHeight: 19 },
});
