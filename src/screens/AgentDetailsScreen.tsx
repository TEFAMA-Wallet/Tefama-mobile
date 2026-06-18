import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { CircularProgress } from "../components/CircularProgress";
import { Badge } from "../components/Badge";
import { SectionHead } from "../components/SectionHead";
import { Button } from "../components/Button";
import type { Agent, Tx } from "../lib/data";
import { useColorTheme } from "../lib/ThemeContext";
import { getTheme } from "../theme";
import { VAULT_ID } from "../lib/constants";

interface Props {
  agent:          Agent;
  trades:         Tx[];
  onBack:         () => void;
  onRevoke:       () => void;
  onViewActivity: () => void;
  onViewTx:       (tx: Tx) => void;
}

const STATUS_COLOR: Record<string, string> = {
  confirmed: "#4CAF50",
  pending:   "#FFB300",
  failed:    "#D44B2A",
};

export function AgentDetailsScreen({ agent, trades, onBack, onRevoke, onViewActivity, onViewTx }: Props) {
  const { isDark } = useColorTheme();
  const { colors } = getTheme(isDark);
  const active  = agent.status === "active";
  const revoked = agent.status === "revoked";
  const pct     = Math.min((agent.spent / (agent.budget || 1)) * 100, 100);
  const txs     = trades.slice(0, 6);

  return (
    <View style={[s.root, { backgroundColor: colors.bg }]}>

      {/* Back header */}
      <View style={s.topBar}>
        <Pressable style={[s.backBtn, { backgroundColor: colors.accentDim }]} onPress={onBack} hitSlop={8}>
          <Ionicons name="chevron-back" size={20} color={colors.accent} />
        </Pressable>
        <Text style={[s.topBarTitle, { color: colors.text }]}>{agent.name}</Text>
        <View style={s.backBtn} />
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* Gradient hero */}
        <LinearGradient
          colors={active ? ["#1C0A00", "#FF8C0016"] : ["#160C00", "#160C00"]}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={[s.heroCard, { borderColor: active ? "rgba(255,140,0,0.28)" : colors.border }]}
        >
          <View style={s.heroBadgeRow}>
            <Badge status={agent.status} />
            <Text style={s.heroPair}>{agent.pair}</Text>
          </View>

          <View style={s.heroRingRow}>
            <CircularProgress
              value={agent.spent}
              max={agent.budget || 1}
              size={168}
              stroke={13}
              valueText={`${agent.spent.toFixed(3)}`}
              caption={`of ${agent.budget.toFixed(2)} SUI`}
              tone={pct > 90 ? "danger" : "brand"}
            />
            <View style={s.ringStats}>
              {[
                { label: "Used",      val: `${pct.toFixed(0)}%`, accent: true },
                { label: "Remaining", val: `${Math.max(0, agent.budget - agent.spent).toFixed(3)}` },
                { label: "Trades",    val: String(agent.trades || "—") },
                { label: "Success",   val: agent.trades > 0 ? "100%" : "—", green: true },
              ].map(({ label, val, accent, green }) => (
                <View key={label} style={s.ringStat}>
                  <Text style={s.ringStatK}>{label}</Text>
                  <Text style={[s.ringStatV, accent ? { color: "#FF8C00" } : green ? { color: "#4CAF50" } : {}]}>{val}</Text>
                </View>
              ))}
            </View>
          </View>
        </LinearGradient>

        {/* Strategy info */}
        <View style={[s.infoCard, { backgroundColor: colors.bg2, borderColor: colors.border }]}>
          {[
            ["Strategy",    agent.strategy],
            ["Protocol",    "DeepBook v3"],
            ["Network",     "Sui Testnet"],
            ["Volume",      agent.volume > 0 ? `${agent.volume.toFixed(3)} SUI` : "—"],
            ["Vault ID",    `${VAULT_ID.slice(0, 10)}…${VAULT_ID.slice(-6)}`],
            ["Created",     agent.created],
          ].map(([k, v], i, arr) => (
            <View key={k} style={[s.infoRow, i < arr.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border }]}>
              <Text style={[s.infoK, { color: colors.text2 }]}>{k}</Text>
              <Text style={[s.infoV, { color: colors.text }]}>{v}</Text>
            </View>
          ))}
        </View>

        {/* Executions */}
        {txs.length > 0 && (
          <View style={s.section}>
            <View style={s.sectionHead}>
              <Text style={[s.sectionTitle, { color: colors.text }]}>Executions</Text>
              <Pressable onPress={onViewActivity} style={s.seeAll}>
                <Text style={[s.seeAllText, { color: colors.accent }]}>All trades</Text>
                <Ionicons name="chevron-forward" size={13} color={colors.accent} />
              </Pressable>
            </View>

            <View style={[s.txList, { backgroundColor: colors.bg2, borderColor: colors.border }]}>
              {txs.map((tx, i) => (
                <Pressable key={tx.id} onPress={() => onViewTx(tx)}
                  style={[s.txRow, i < txs.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border }]}>
                  <View style={[s.txIco, { backgroundColor: "rgba(76,175,80,0.10)" }]}>
                    <Ionicons name="arrow-down" size={13} color="#4CAF50" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[s.txAmt, { color: colors.text }]}>{tx.amount}</Text>
                    <Text style={[s.txTime, { color: colors.text3 }]}>{tx.time}</Text>
                  </View>
                  <View style={{ alignItems: "flex-end" }}>
                    <Text style={[s.txVal, { color: colors.text2 }]}>{tx.value}</Text>
                    <View style={s.txStatus}>
                      <View style={[s.txDot, { backgroundColor: STATUS_COLOR[tx.status] ?? colors.text3 }]} />
                      <Text style={[s.txStatusText, { color: STATUS_COLOR[tx.status] ?? colors.text2 }]}>{tx.status}</Text>
                    </View>
                  </View>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        <View style={{ height: 24 }} />
      </ScrollView>

      {!revoked && (
        <View style={[s.footer, { backgroundColor: colors.bg, borderTopColor: colors.border }]}>
          <Button variant="secondary" block size="sm"
            icon={<Ionicons name={active ? "pause-outline" : "play-outline"} size={17} color={colors.text} />}>
            {active ? "Pause agent" : "Resume agent"}
          </Button>
          <Button variant="danger" block size="sm" onPress={onRevoke}
            icon={<Ionicons name="close-circle-outline" size={17} color="#D44B2A" />}>
            Revoke
          </Button>
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  root:   { flex: 1 },
  scroll: { padding: 16, gap: 14 },

  topBar:      { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingTop: 10, paddingBottom: 6 },
  backBtn:     { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  topBarTitle: { fontSize: 17, fontWeight: "700" },

  heroCard:    { borderRadius: 20, borderWidth: 1, padding: 18, gap: 14 },
  heroBadgeRow:{ flexDirection: "row", alignItems: "center", gap: 10 },
  heroPair:    { color: "rgba(245,240,232,0.45)", fontSize: 12 },

  heroRingRow: { flexDirection: "row", alignItems: "center", gap: 16 },
  ringStats:   { flex: 1, gap: 0 },
  ringStat:    { paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "rgba(255,255,255,0.06)" },
  ringStatK:   { color: "rgba(245,240,232,0.40)", fontSize: 11, fontWeight: "600", marginBottom: 3 },
  ringStatV:   { color: "rgba(245,240,232,0.85)", fontSize: 17, fontWeight: "800" },

  infoCard: { borderRadius: 16, borderWidth: 1, overflow: "hidden" },
  infoRow:  { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingVertical: 13 },
  infoK:    { fontSize: 14 },
  infoV:    { fontSize: 14, fontWeight: "600" },

  section:     { gap: 10 },
  sectionHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  sectionTitle:{ fontSize: 16, fontWeight: "700" },
  seeAll:      { flexDirection: "row", alignItems: "center", gap: 2 },
  seeAllText:  { fontSize: 13, fontWeight: "600" },

  txList:  { borderRadius: 16, borderWidth: 1, overflow: "hidden" },
  txRow:   { flexDirection: "row", alignItems: "center", gap: 12, padding: 14 },
  txIco:   { width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center" },
  txAmt:   { fontSize: 14, fontWeight: "600" },
  txTime:  { fontSize: 11, marginTop: 2 },
  txVal:   { fontSize: 13, fontWeight: "600" },
  txStatus:{ flexDirection: "row", alignItems: "center", gap: 4, marginTop: 3 },
  txDot:   { width: 5, height: 5, borderRadius: 3 },
  txStatusText: { fontSize: 10, fontWeight: "600" },

  footer:  { flexDirection: "row", gap: 12, padding: 16, borderTopWidth: StyleSheet.hairlineWidth },
});
