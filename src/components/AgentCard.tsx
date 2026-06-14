import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Card } from "./Card";
import { Badge } from "./Badge";
import { ProgressBar } from "./ProgressBar";
import type { Agent } from "../lib/data";
import { fmtUSD } from "../lib/data";
import { useColorTheme } from "../lib/ThemeContext";
import { getTheme } from "../theme";

interface Props {
  agent: Agent;
  onPress?: () => void;
}

export function AgentCard({ agent, onPress }: Props) {
  const { isDark } = useColorTheme();
  const { colors } = getTheme(isDark);
  const active = agent.status === "active";
  const pct = (agent.spent / agent.budget) * 100;

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}>
      <Card accent={active}>
        <View style={s.top}>
          <View style={[s.ava, { backgroundColor: active ? colors.accentDim : colors.bg4 }]}>
            <Ionicons name="hardware-chip-outline" size={20} color={active ? colors.accent : colors.text2} />
          </View>
          <View style={s.info}>
            <Text style={[s.name, { color: colors.text }]}>{agent.name}</Text>
            <Text style={[s.meta, { color: colors.text2 }]}>{agent.strategy} · {agent.lastTrade}</Text>
          </View>
          <Badge status={agent.status} />
        </View>
        <View style={s.bar}>
          <ProgressBar
            value={agent.spent}
            max={agent.budget}
            tone={pct > 90 ? "danger" : "brand"}
            valueText={`${fmtUSD(agent.spent)} / ${fmtUSD(agent.budget)} USDC`}
          />
        </View>
      </Card>
    </Pressable>
  );
}

const s = StyleSheet.create({
  top:  { flexDirection: "row", alignItems: "center", gap: 10 },
  ava:  { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center" },
  info: { flex: 1 },
  name: { fontSize: 15, fontWeight: "700" },
  meta: { fontSize: 12, marginTop: 2 },
  bar:  { marginTop: 14 },
});
