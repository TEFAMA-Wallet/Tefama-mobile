import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { CircularProgress } from "../components/CircularProgress";
import { Badge } from "../components/Badge";
import { Button } from "../components/Button";
import type { Agent } from "../lib/data";
import { useColorTheme } from "../lib/ThemeContext";
import { getTheme } from "../theme";
import { VAULT_ID } from "../lib/constants";

interface Props {
  liveAgent:     Agent;
  onViewAgent:   () => void;
  onCreateAgent: () => void;
}

function shortId(id: string) {
  return `${id.slice(0, 6)}…${id.slice(-4)}`;
}

export function AgentsScreen({ liveAgent, onViewAgent, onCreateAgent }: Props) {
  const { isDark } = useColorTheme();
  const { colors } = getTheme(isDark);
  const isActive = liveAgent.status === "active";
  const pct      = Math.min((liveAgent.spent / (liveAgent.budget || 1)) * 100, 100);

  const STAT_ROWS = [
    { icon: "repeat-outline" as const,       label: "Total executions", val: String(liveAgent.trades || "—") },
    { icon: "cash-outline" as const,          label: "Total volume",     val: liveAgent.volume > 0 ? `${liveAgent.volume.toFixed(3)} SUI` : "—" },
    { icon: "speedometer-outline" as const,   label: "Success rate",     val: liveAgent.trades > 0 ? "100%" : "—", green: true },
    { icon: "time-outline" as const,          label: "Last trade",       val: liveAgent.lastTrade },
    { icon: "git-network-outline" as const,   label: "Protocol",         val: "DeepBook v3" },
    { icon: "server-outline" as const,        label: "Vault ID",         val: shortId(VAULT_ID), mono: true },
  ];

  return (
    <View style={[s.root, { backgroundColor: colors.bg }]}>

      {/* Header */}
      <View style={s.header}>
        <Text style={[s.headerTitle, { color: colors.text }]}>Your agent</Text>
        <Badge status={liveAgent.status} />
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* Ring card */}
        <LinearGradient
          colors={isActive ? ["#1C0A00", "#FF8C0018"] : ["#160C00", "#160C00"]}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={[s.ringCard, { borderColor: isActive ? "rgba(255,140,0,0.28)" : colors.border }]}
        >
          <View style={s.ringTop}>
            <View style={[s.agentAvatar, { backgroundColor: colors.accentDim }]}>
              <Ionicons name="hardware-chip" size={26} color={colors.accent} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.agentName}>{liveAgent.name}</Text>
              <Text style={s.agentMeta}>{liveAgent.strategy} · {liveAgent.pair}</Text>
            </View>
          </View>

          <View style={s.ringRow}>
            <CircularProgress
              value={liveAgent.spent}
              max={liveAgent.budget || 1}
              size={156}
              stroke={12}
              valueText={`${liveAgent.spent.toFixed(3)}`}
              caption={`of ${liveAgent.budget.toFixed(2)} SUI`}
              tone={pct > 90 ? "danger" : "brand"}
            />
            <View style={s.ringMeta}>
              <View style={[s.ringMetaItem, { borderBottomColor: "rgba(255,255,255,0.08)", borderBottomWidth: StyleSheet.hairlineWidth }]}>
                <Text style={s.ringMetaK}>SUI spent</Text>
                <Text style={s.ringMetaV}>{liveAgent.spent.toFixed(3)}</Text>
              </View>
              <View style={[s.ringMetaItem, { borderBottomColor: "rgba(255,255,255,0.08)", borderBottomWidth: StyleSheet.hairlineWidth }]}>
                <Text style={s.ringMetaK}>Remaining</Text>
                <Text style={s.ringMetaV}>{Math.max(0, liveAgent.budget - liveAgent.spent).toFixed(3)}</Text>
              </View>
              <View style={s.ringMetaItem}>
                <Text style={s.ringMetaK}>Used</Text>
                <Text style={[s.ringMetaV, pct > 90 ? { color: "#D44B2A" } : {}]}>{pct.toFixed(0)}%</Text>
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* Quick actions */}
        <View style={s.actionRow}>
          <Pressable style={[s.actionBtn, { backgroundColor: colors.accentDim, borderColor: colors.accentB }]} onPress={onViewAgent}>
            <Ionicons name="eye-outline" size={18} color={colors.accent} />
            <Text style={[s.actionLabel, { color: colors.accent }]}>Details</Text>
          </Pressable>
          <Pressable style={[s.actionBtn, { backgroundColor: colors.bg2, borderColor: colors.border }]}>
            <Ionicons name={isActive ? "pause-outline" : "play-outline"} size={18} color={colors.text2} />
            <Text style={[s.actionLabel, { color: colors.text2 }]}>{isActive ? "Pause" : "Resume"}</Text>
          </Pressable>
          <Pressable style={[s.actionBtn, { backgroundColor: "rgba(212,75,42,0.08)", borderColor: "rgba(212,75,42,0.20)" }]}>
            <Ionicons name="close-circle-outline" size={18} color="#D44B2A" />
            <Text style={[s.actionLabel, { color: "#D44B2A" }]}>Revoke</Text>
          </Pressable>
        </View>

        {/* Info rows */}
        <View style={[s.infoCard, { backgroundColor: colors.bg2, borderColor: colors.border }]}>
          <Text style={[s.infoCardTitle, { color: colors.text2 }]}>Agent details</Text>
          {STAT_ROWS.map(({ icon, label, val, green, mono }, i) => (
            <View key={label} style={[s.infoRow, i < STAT_ROWS.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border }]}>
              <View style={s.infoRowLeft}>
                <Ionicons name={icon} size={15} color={colors.text3} />
                <Text style={[s.infoK, { color: colors.text2 }]}>{label}</Text>
              </View>
              <Text style={[s.infoV, { color: green ? "#4CAF50" : colors.text, fontFamily: mono ? "monospace" : undefined }]}>{val}</Text>
            </View>
          ))}
        </View>

        {/* Create new agent button */}
        <Button variant="ghost" onPress={onCreateAgent}
          icon={<Ionicons name="add-circle-outline" size={18} color={colors.text2} />}>
          Create another agent
        </Button>

        <View style={{ height: 24 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root:   { flex: 1 },
  scroll: { padding: 16, gap: 14 },

  header:      { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingTop: 10, paddingBottom: 6 },
  headerTitle: { fontSize: 22, fontWeight: "800", letterSpacing: -0.5 },

  ringCard: { borderRadius: 20, borderWidth: 1, padding: 18, gap: 18 },
  ringTop:  { flexDirection: "row", alignItems: "center", gap: 12 },
  agentAvatar: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  agentName:   { color: "rgba(245,240,232,0.90)", fontSize: 17, fontWeight: "800" },
  agentMeta:   { color: "rgba(245,240,232,0.45)", fontSize: 12, marginTop: 2 },

  ringRow:     { flexDirection: "row", alignItems: "center", gap: 18 },
  ringMeta:    { flex: 1, gap: 0 },
  ringMetaItem:{ paddingVertical: 12 },
  ringMetaK:   { color: "rgba(245,240,232,0.45)", fontSize: 11, fontWeight: "600", marginBottom: 3 },
  ringMetaV:   { color: "rgba(245,240,232,0.90)", fontSize: 18, fontWeight: "800" },

  actionRow: { flexDirection: "row", gap: 10 },
  actionBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 13, borderRadius: 14, borderWidth: 1 },
  actionLabel: { fontSize: 13, fontWeight: "700" },

  infoCard:      { borderRadius: 16, borderWidth: 1, padding: 16 },
  infoCardTitle: { fontSize: 12, fontWeight: "600", marginBottom: 10 },
  infoRow:       { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 12 },
  infoRowLeft:   { flexDirection: "row", alignItems: "center", gap: 8 },
  infoK:         { fontSize: 14 },
  infoV:         { fontSize: 14, fontWeight: "600" },
});
