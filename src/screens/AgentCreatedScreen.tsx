import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "../components/Button";
import { AGENTS } from "../lib/data";
import type { Agent } from "../lib/data";
import { useColorTheme } from "../lib/ThemeContext";
import { getTheme } from "../theme";

interface Props {
  onViewAgent: (agent: Agent) => void;
  onHome: () => void;
}

export function AgentCreatedScreen({ onViewAgent, onHome }: Props) {
  const { isDark } = useColorTheme();
  const { colors } = getTheme(isDark);

  return (
    <View style={[s.root, { backgroundColor: colors.bg }]}>
      <View style={s.body}>
        <View style={[s.ring, { borderColor: "#4CAF50", backgroundColor: "rgba(76,175,80,0.12)" }]}>
          <Ionicons name="checkmark" size={44} color="#4CAF50" />
        </View>
        <Text style={[s.title, { color: colors.text }]}>Agent created</Text>
        <Text style={[s.sub,   { color: colors.text2 }]}>SUI Accumulator is live and executing on Sui Testnet.</Text>
        <View style={[s.idRow, { backgroundColor: colors.bg3 }]}>
          <Text style={[s.idText, { color: colors.text2 }]}>agt_8f3a…2c91</Text>
          <Ionicons name="open-outline" size={14} color={colors.text3} />
        </View>
        <View style={[s.ach, { backgroundColor: colors.accentDim, borderColor: colors.accentB }]}>
          <Ionicons name="ribbon-outline" size={15} color={colors.accent} />
          <Text style={[s.achText, { color: colors.accent }]}>Achievement unlocked · First agent</Text>
        </View>
      </View>

      <View style={s.foot}>
        <Button variant="primary" size="lg" block onPress={() => onViewAgent(AGENTS[0])}>View agent</Button>
        <Button variant="ghost"   size="md" block onPress={onHome}>Back to dashboard</Button>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, paddingHorizontal: 24, paddingBottom: 32 },
  body: { flex: 1, justifyContent: "center", alignItems: "center", gap: 18 },
  ring: { width: 96, height: 96, borderRadius: 48, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  title:   { fontSize: 28, fontWeight: "800", letterSpacing: -0.4 },
  sub:     { fontSize: 15, textAlign: "center", lineHeight: 22 },
  idRow:   { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 100 },
  idText:  { fontSize: 13, fontWeight: "600" },
  ach:     { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 100, borderWidth: 1 },
  achText: { fontSize: 13, fontWeight: "600" },
  foot:    { gap: 12 },
});
