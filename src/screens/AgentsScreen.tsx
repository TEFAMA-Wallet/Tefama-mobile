import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AppBar } from "../components/AppBar";
import { AgentCard } from "../components/AgentCard";
import { Button, IconButton } from "../components/Button";
import { AGENTS } from "../lib/data";
import type { Agent, AgentStatus } from "../lib/data";
import { useColorTheme } from "../lib/ThemeContext";
import { getTheme } from "../theme";

type Filter = "All" | Capitalize<AgentStatus>;
const FILTERS: Filter[] = ["All", "Active", "Paused", "Revoked"];

interface Props {
  onViewAgent:   (agent: Agent) => void;
  onCreateAgent: () => void;
}

export function AgentsScreen({ onViewAgent, onCreateAgent }: Props) {
  const [filter, setFilter] = useState<Filter>("All");
  const { isDark } = useColorTheme();
  const { colors } = getTheme(isDark);

  const rows = AGENTS.filter((a) =>
    filter === "All" || a.status === filter.toLowerCase()
  );

  return (
    <View style={[s.root, { backgroundColor: colors.bg }]}>
      <AppBar
        title="My agents"
        subtitle={`${AGENTS.length} total`}
        actions={
          <IconButton size="sm">
            <Ionicons name="options-outline" size={18} color={colors.text2} />
          </IconButton>
        }
      />

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* filter tabs */}
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

        {rows.length > 0 ? (
          <View style={s.stack}>
            {rows.map((a) => <AgentCard key={a.id} agent={a} onPress={() => onViewAgent(a)} />)}
          </View>
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
  stack:   { gap: 10 },
  empty:   { alignItems: "center", gap: 14, paddingVertical: 48 },
  emptyT:  { fontSize: 15, fontWeight: "600" },
});
