import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AppBar } from "../components/AppBar";
import { Card } from "../components/Card";
import { Badge } from "../components/Badge";
import { CircularProgress } from "../components/CircularProgress";
import { SectionHead } from "../components/SectionHead";
import { Button, IconButton } from "../components/Button";
import { TxRow } from "../components/TxRow";
import { fmtUSD, fmtNum, ACTIVITY } from "../lib/data";
import type { Agent, Tx } from "../lib/data";
import { useColorTheme } from "../lib/ThemeContext";
import { getTheme } from "../theme";

interface Props {
  agent: Agent;
  onBack: () => void;
  onRevoke: () => void;
  onViewActivity: () => void;
  onViewTx: (tx: Tx) => void;
}

export function AgentDetailsScreen({ agent, onBack, onRevoke, onViewActivity, onViewTx }: Props) {
  const { isDark } = useColorTheme();
  const { colors } = getTheme(isDark);
  const active  = agent.status === "active";
  const revoked = agent.status === "revoked";
  const pct     = (agent.spent / agent.budget) * 100;
  const txs     = ACTIVITY.filter((t) => t.agent === agent.name).slice(0, 3);

  const INFO_ROWS = [
    ["Agent ID",    agent.id + "…2c91", true ],
    ["Strategy",    agent.strategy,      false],
    ["Protocol",    "Deepbook v3",       false],
    ["Slippage",    `${agent.avgSlippage}%`,  false],
    ["Created",     agent.created,       false],
  ] as [string, string, boolean][];

  return (
    <View style={[s.root, { backgroundColor: colors.bg }]}>
      <AppBar
        title={agent.name}
        subtitle={agent.pair}
        onBack={onBack}
        actions={
          <IconButton size="sm">
            <Ionicons name="open-outline" size={18} color={colors.text2} />
          </IconButton>
        }
      />

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* hero ring */}
        <Card accent={active} style={{ alignItems: "center", padding: 24 }}>
          <Badge status={agent.status} />
          <View style={{ marginVertical: 18 }}>
            <CircularProgress
              value={agent.spent} max={agent.budget} size={172} stroke={13}
              valueText={`${fmtUSD(agent.spent)} / ${fmtUSD(agent.budget)}`}
              caption="USDC budget"
              tone={pct > 90 ? "danger" : "brand"}
            />
          </View>
          {!revoked && (
            <View style={[s.timeWrap, { backgroundColor: colors.bg4 }]}>
              <Ionicons name="time-outline" size={15} color={colors.text2} />
              <Text style={[s.timeText, { color: colors.text2 }]}>{agent.timeLeft} remaining</Text>
            </View>
          )}
        </Card>

        {/* stats grid */}
        <View style={s.grid}>
          {[
            { label: "Total trades", val: String(agent.trades) },
            { label: "Volume",       val: `$${fmtNum(agent.volume)}` },
            { label: "Success",      val: `${agent.successRate}%`, green: true },
          ].map(({ label, val, green }) => (
            <Card key={label} style={[s.statCard, { padding: 14 }]}>
              <Text style={[s.statK, { color: colors.text2 }]}>{label}</Text>
              <Text style={[s.statV, { color: green ? "#4CAF50" : colors.text }]}>{val}</Text>
            </Card>
          ))}
        </View>

        {/* info rows */}
        <SectionHead>Agent info</SectionHead>
        <Card style={{ padding: 0, paddingHorizontal: 16 }}>
          {INFO_ROWS.map(([k, v, copy], i) => (
            <View key={k} style={[s.kv, i < INFO_ROWS.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border }]}>
              <Text style={[s.kvK, { color: colors.text2 }]}>{k}</Text>
              <View style={s.kvRight}>
                <Text style={[s.kvV, { color: colors.text }]}>{v}</Text>
                {copy && <Ionicons name="copy-outline" size={13} color={colors.text3} />}
              </View>
            </View>
          ))}
        </Card>

        {/* recent executions */}
        {txs.length > 0 && (
          <>
            <SectionHead action="View all" onAction={onViewActivity}>Recent executions</SectionHead>
            <Card style={{ padding: 4 }}>
              {txs.map((tx) => <TxRow key={tx.id} tx={tx} onPress={() => onViewTx(tx)} />)}
            </Card>
          </>
        )}

        <View style={{ height: 16 }} />
      </ScrollView>

      {/* sticky footer */}
      {!revoked && (
        <View style={[s.footer, { backgroundColor: colors.bg, borderTopColor: colors.border }]}>
          <Button variant="secondary" block size="sm"
            icon={<Ionicons name={active ? "pause-outline" : "play-outline"} size={17} color={colors.text} />}>
            {active ? "Pause" : "Resume"}
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
  root:     { flex: 1 },
  scroll:   { padding: 14, gap: 12 },
  timeWrap: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 100 },
  timeText: { fontSize: 13 },
  grid:     { flexDirection: "row", gap: 10 },
  statCard: { flex: 1 },
  statK:    { fontSize: 11, marginBottom: 6 },
  statV:    { fontSize: 22, fontWeight: "800", letterSpacing: -0.5 },
  kv:       { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 14 },
  kvK:      { fontSize: 14 },
  kvRight:  { flexDirection: "row", alignItems: "center", gap: 6 },
  kvV:      { fontSize: 14, fontWeight: "600" },
  footer:   { flexDirection: "row", gap: 12, padding: 14, borderTopWidth: StyleSheet.hairlineWidth },
});
