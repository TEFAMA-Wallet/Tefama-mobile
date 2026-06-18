import { useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AppBar } from "../components/AppBar";
import { Card } from "../components/Card";
import { Badge } from "../components/Badge";
import { ProgressBar } from "../components/ProgressBar";
import { Button, IconButton } from "../components/Button";
import type { Agent } from "../lib/data";
import { useColorTheme } from "../lib/ThemeContext";
import { getTheme } from "../theme";

type Filter = "All" | "Active" | "Paused" | "Revoked";
const FILTERS: Filter[] = ["All", "Active", "Paused", "Revoked"];

interface Props {
  liveAgent:     Agent;
  onViewAgent:   () => void;
  onCreateAgent: () => void;
}

export function AgentsScreen({ liveAgent, onViewAgent, onCreateAgent }: Props) {
  const [filter, setFilter] = useState<Filter>("All");
  const { isDark } = useColorTheme();
  const { colors } = getTheme(isDark);

  const matchesFilter = filter === "All" || liveAgent.status === filter.toLowerCase();
  const pct = (liveAgent.spent / (liveAgent.budget || 1)) * 100;

  return (
    <View style={[s.root, { backgroundColor: colors.bg }]}>
      <AppBar
        title="My agents"
        subtitle="1 on-chain agent"
        actions={
          <IconButton size="sm">
            <Ionicons name="options-outline" size={18} color={colors.text2} />
          </IconButton>
        }
      />

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        <View style={[s.seg, { backgroundColor: colors.bg3 }]}>
          {FILTERS.map((f) => {
            const on = f === filter;
            return (
              <Pressable key={f} style={[s.segBtn, on && { backgroundColor: colors.bg2, borderColor: colors.border2 }]}
                onPress={() => setFilter(f)}>
                <Text style={[s.segText, { color: on ? colors.text : colors.text2 }]}>{f}</Text>
              </Pressable>
            );
          })}
        </View>

        {matchesFilter ? (
          <Pressable onPress={onViewAgent}>
            <Card accent={liveAgent.status === "active"} style={s.card}>
              <View style={s.cardTop}>
                <View style={s.cardLeft}>
                  <View style={[s.ava, { backgroundColor: colors.accentDim }]}>
                    <Ionicons name="hardware-chip-outline" size={20} color={colors.accent} />
                  </View>
                  <View>
                    <Text style={[s.name, { color: colors.text }]}>{liveAgent.name}</Text>
                    <Text style={[s.meta, { color: colors.text2 }]}>{liveAgent.strategy} · {liveAgent.pair}</Text>
                  </View>
                </View>
                <Badge status={liveAgent.status} />
              </View>

              <View style={s.barRow}>
                <ProgressBar value={liveAgent.spent} max={liveAgent.budget || 1} />
                <View style={s.barMeta}>
                  <Text style={[s.barLeft, { color: colors.text2 }]}>
                    {liveAgent.spent.toFixed(3)} / {liveAgent.budget.toFixed(2)} SUI
                  </Text>
                  <Text style={[s.barPct, { color: pct > 90 ? "#D44B2A" : colors.accent }]}>
                    {pct.toFixed(0)}%
                  </Text>
                </View>
              </View>

              <View style={s.statsRow}>
                {[
                  { label: "Trades",  val: String(liveAgent.trades) },
                  { label: "Last",    val: liveAgent.lastTrade },
                  { label: "Volume",  val: `${liveAgent.volume.toFixed(3)} SUI` },
                ].map(({ label, val }) => (
                  <View key={label} style={s.stat}>
                    <Text style={[s.statK, { color: colors.text2 }]}>{label}</Text>
                    <Text style={[s.statV, { color: colors.text }]}>{val}</Text>
                  </View>
                ))}
              </View>
            </Card>
          </Pressable>
        ) : (
          <View style={s.empty}>
            <Ionicons name="hardware-chip-outline" size={34} color={colors.text3} />
            <Text style={[s.emptyT, { color: colors.text2 }]}>No {filter.toLowerCase()} agents</Text>
            <Button variant="primary" onPress={onCreateAgent}
              icon={<Ionicons name="add" size={17} color="#fff" />}>
              Create an agent
            </Button>
          </View>
        )}

        <View style={{ height: 16 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root:    { flex: 1 },
  scroll:  { padding: 14, gap: 10 },
  seg:     { flexDirection: "row", borderRadius: 12, padding: 3, gap: 2 },
  segBtn:  { flex: 1, paddingVertical: 8, borderRadius: 10, alignItems: "center", borderWidth: StyleSheet.hairlineWidth, borderColor: "transparent" },
  segText: { fontSize: 13, fontWeight: "600" },
  card:    { padding: 16, gap: 14 },
  cardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  cardLeft:{ flexDirection: "row", alignItems: "center", gap: 10 },
  ava:     { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center" },
  name:    { fontSize: 15, fontWeight: "700" },
  meta:    { fontSize: 12, marginTop: 2 },
  barRow:  { gap: 6 },
  barMeta: { flexDirection: "row", justifyContent: "space-between" },
  barLeft: { fontSize: 12 },
  barPct:  { fontSize: 12, fontWeight: "700" },
  statsRow:{ flexDirection: "row", justifyContent: "space-between" },
  stat:    { alignItems: "center" },
  statK:   { fontSize: 11, marginBottom: 3 },
  statV:   { fontSize: 13, fontWeight: "700" },
  empty:   { alignItems: "center", gap: 14, paddingVertical: 48 },
  emptyT:  { fontSize: 15, fontWeight: "600" },
});
