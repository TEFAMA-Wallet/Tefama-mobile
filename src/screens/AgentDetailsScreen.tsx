import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AppBar } from "../components/AppBar";
import { Card } from "../components/Card";
import { Badge } from "../components/Badge";
import { CircularProgress } from "../components/CircularProgress";
import { SectionHead } from "../components/SectionHead";
import { Button, IconButton } from "../components/Button";
import { fmtNum } from "../lib/data";
import type { Agent } from "../lib/data";
import { useColorTheme } from "../lib/ThemeContext";
import { getTheme } from "../theme";
import { EXPLORER_BASE, VAULT_ID } from "../lib/constants";

type Tx = {
  id: string; time: string; type: "Buy" | "Sell"; pair: string;
  amount: string; value: string; price: string;
  status: "confirmed" | "pending" | "failed";
  gas: string; hash: string; agent: string;
};

interface Props {
  agent:          Agent;
  trades:         Tx[];
  onBack:         () => void;
  onRevoke:       () => void;
  onViewActivity: () => void;
  onViewTx:       (tx: Tx) => void;
}

function shortHash(h: string) {
  return h.length > 12 ? `${h.slice(0, 6)}…${h.slice(-4)}` : h;
}

export function AgentDetailsScreen({ agent, trades, onBack, onRevoke, onViewActivity, onViewTx }: Props) {
  const { isDark } = useColorTheme();
  const { colors } = getTheme(isDark);
  const active  = agent.status === "active";
  const revoked = agent.status === "revoked";
  const pct     = (agent.spent / (agent.budget || 1)) * 100;
  const txs     = trades.slice(0, 5);

  const INFO_ROWS: [string, string, boolean][] = [
    ["Vault ID",  shortHash(VAULT_ID), true ],
    ["Strategy",  agent.strategy,      false],
    ["Protocol",  "Deepbook v3",       false],
    ["Network",   "Sui Testnet",       false],
    ["Created",   agent.created,       false],
  ];

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

        <Card accent={active} style={{ alignItems: "center", padding: 24 }}>
          <Badge status={agent.status} />
          <View style={{ marginVertical: 18 }}>
            <CircularProgress
              value={agent.spent} max={agent.budget || 1} size={172} stroke={13}
              valueText={`${agent.spent.toFixed(3)} / ${agent.budget.toFixed(2)}`}
              caption="SUI budget"
              tone={pct > 90 ? "danger" : "brand"}
            />
          </View>
          <View style={[s.timeWrap, { backgroundColor: colors.bg4 }]}>
            <Ionicons name="repeat-outline" size={15} color={colors.text2} />
            <Text style={[s.timeText, { color: colors.text2 }]}>{agent.trades} executions</Text>
          </View>
        </Card>

        <View style={s.grid}>
          {[
            { label: "Total trades", val: String(agent.trades) },
            { label: "Volume (SUI)", val: agent.volume.toFixed(3) },
            { label: "Success",      val: `${agent.successRate}%`, green: true },
          ].map(({ label, val, green }) => (
            <Card key={label} style={[s.statCard, { padding: 14 }]}>
              <Text style={[s.statK, { color: colors.text2 }]}>{label}</Text>
              <Text style={[s.statV, { color: green ? "#4CAF50" : colors.text }]}>{val}</Text>
            </Card>
          ))}
        </View>

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

        {txs.length > 0 && (
          <>
            <SectionHead action="View all" onAction={onViewActivity}>Recent executions</SectionHead>
            <Card style={{ padding: 4 }}>
              {txs.map((tx, i) => (
                <Pressable key={tx.id} onPress={() => onViewTx(tx)}
                  style={[s.txRow, i < txs.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border }]}>
                  <View style={[s.txIco, { backgroundColor: "rgba(76,175,80,0.12)" }]}>
                    <Ionicons name="arrow-down-outline" size={14} color="#4CAF50" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[s.txPair, { color: colors.text }]}>{tx.amount}</Text>
                    <Text style={[s.txTime, { color: colors.text3 }]}>{tx.time}</Text>
                  </View>
                  <View style={{ alignItems: "flex-end" }}>
                    <Text style={[s.txVal, { color: colors.text2 }]}>{tx.value}</Text>
                    <Badge status={tx.status} />
                  </View>
                </Pressable>
              ))}
            </Card>
          </>
        )}

        <View style={{ height: 16 }} />
      </ScrollView>

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
  txRow:    { flexDirection: "row", alignItems: "center", gap: 12, padding: 12 },
  txIco:    { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  txPair:   { fontSize: 14, fontWeight: "600" },
  txTime:   { fontSize: 12, marginTop: 2 },
  txVal:    { fontSize: 13 },
  footer:   { flexDirection: "row", gap: 12, padding: 14, borderTopWidth: StyleSheet.hairlineWidth },
});
