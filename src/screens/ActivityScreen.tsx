import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useColorTheme } from "../lib/ThemeContext";
import { getTheme } from "../theme";
import type { Tx } from "../lib/data";

interface Props {
  trades:   Tx[];
  pnl:      number;
  count:    number;
  loading:  boolean;
  onRefresh:() => void;
  onViewTx: (tx: Tx) => void;
  deepPrice:number;
}

function Skeleton({ w = 80, h = 14 }: { w?: number | string; h?: number }) {
  const { isDark } = useColorTheme();
  const { colors } = getTheme(isDark);
  return <View style={{ width: w as any, height: h, borderRadius: 4, backgroundColor: colors.bgSoft3 }} />;
}

function usd(n: number, d = 2) {
  return "$" + n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
}

export function ActivityScreen({ trades, pnl, count, loading, onRefresh, onViewTx, deepPrice }: Props) {
  const { isDark } = useColorTheme();
  const { colors } = getTheme(isDark);

  const totalSuiSpent   = trades.reduce((s, t) => s + Number(t.value.replace(" SUI", "")), 0);
  const totalDeepAcc    = trades.reduce((s, t) => s + Number(t.amount.replace("+", "").replace(" DEEP", "")), 0);

  const SUMMARY = [
    { label: "Total trades",     val: loading ? null : String(count) },
    { label: "SUI spent",        val: loading ? null : totalSuiSpent > 0 ? `${totalSuiSpent.toFixed(4)} SUI` : "—" },
    { label: "DEEP accumulated", val: loading ? null : totalDeepAcc > 0 ? `${totalDeepAcc.toFixed(4)} DEEP` : "—" },
    { label: "Unrealised P&L",   val: loading ? null : `${pnl >= 0 ? "+" : ""}${usd(pnl, 4)}`, color: pnl >= 0 ? colors.accent : colors.red },
  ];

  return (
    <View style={[s.root, { backgroundColor: colors.bg }]}>
      <View style={[s.header, { borderBottomColor: colors.border }]}>
        <View>
          <Text style={[s.pageTitle, { color: colors.text }]}>Activity log</Text>
          <Text style={[s.pageSub, { color: colors.text2 }]}>All on-chain executions · Sui testnet</Text>
        </View>
        <Pressable
          onPress={onRefresh}
          style={[s.refreshBtn, { backgroundColor: colors.bgSoft, borderColor: colors.border }]}
        >
          <Ionicons name="refresh-outline" size={14} color={colors.text2} />
          <Text style={[s.refreshText, { color: colors.text2 }]}>Refresh</Text>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={onRefresh} tintColor={colors.accent} />}
      >
        {/* Summary strip */}
        <View style={s.summaryGrid}>
          {SUMMARY.map(({ label, val, color }) => (
            <View key={label} style={[s.summaryCard, { backgroundColor: colors.bgSoft, borderColor: colors.border }]}>
              <Text style={[s.summaryLabel, { color: colors.text3 }]}>{label}</Text>
              {val === null
                ? <Skeleton w={80} h={20} />
                : <Text style={[s.summaryVal, { color: color ?? colors.text, fontFamily: "monospace" }]}>{val}</Text>
              }
            </View>
          ))}
        </View>

        {/* Trades list */}
        <View style={[s.panel, { backgroundColor: colors.bg3, borderColor: colors.border }]}>
          {/* Table header */}
          <View style={[s.thead, { borderBottomColor: colors.border }]}>
            {["Type", "Asset", "Received", "Spent", "Price", "Time"].map(h => (
              <Text key={h} style={[s.th, { color: colors.text3, flex: h === "Time" ? 1.2 : 1 }]}>{h}</Text>
            ))}
          </View>

          {loading && trades.length === 0 ? (
            [1, 2, 3, 4, 5].map(i => (
              <View key={i} style={[s.trow, { borderBottomColor: colors.border }]}>
                {[50, 40, 80, 70, 60, 60].map((w, j) => <Skeleton key={j} w={w} h={14} />)}
              </View>
            ))
          ) : trades.length === 0 ? (
            <View style={s.empty}>
              <Ionicons name="pulse-outline" size={32} color={colors.text4} />
              <Text style={[s.emptyTitle, { color: colors.text2 }]}>No on-chain trades found yet.</Text>
              <Text style={[s.emptySub, { color: colors.text3 }]}>Run the agent to see live execution data here.</Text>
            </View>
          ) : (
            trades.map((tx, i) => (
              <Pressable key={tx.id} onPress={() => onViewTx(tx)}
                style={[s.trow, i < trades.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border }]}>
                <View style={[s.buyTag, { backgroundColor: colors.accentDim }]}>
                  <Ionicons name="arrow-down-left-box" size={10} color={colors.accent} />
                  <Text style={[s.buyText, { color: colors.accent }]}>buy</Text>
                </View>
                <Text style={[s.tdAccent, { color: colors.accent, flex: 1, fontFamily: "monospace", fontWeight: "600" }]}>DEEP</Text>
                <Text style={[s.td, { color: colors.text, flex: 1, fontFamily: "monospace" }]}>{tx.amount.replace("+", "")}</Text>
                <Text style={[s.td, { color: colors.text, flex: 1, fontFamily: "monospace" }]}>{tx.value}</Text>
                <Text style={[s.td, { color: colors.text2, flex: 1, fontFamily: "monospace" }]}>{usd(Number(tx.price), 6)}</Text>
                <Text style={[s.tdTime, { color: colors.text3, flex: 1.2 }]}>{tx.time}</Text>
              </Pressable>
            ))
          )}
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root:   { flex: 1 },
  scroll: { padding: 16, gap: 14 },

  header:      { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", paddingHorizontal: 16, paddingTop: 10, paddingBottom: 12, borderBottomWidth: StyleSheet.hairlineWidth },
  pageTitle:   { fontSize: 22, fontWeight: "700", letterSpacing: -0.4 },
  pageSub:     { fontSize: 13, marginTop: 2 },
  refreshBtn:  { flexDirection: "row", alignItems: "center", gap: 5, borderRadius: 8, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 6, marginTop: 2 },
  refreshText: { fontSize: 12, fontWeight: "500" },

  summaryGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  summaryCard: { width: "48%", flexGrow: 1, borderRadius: 12, borderWidth: 1, padding: 14 },
  summaryLabel:{ fontSize: 11, fontWeight: "700", letterSpacing: 0.7, textTransform: "uppercase", marginBottom: 6 },
  summaryVal:  { fontSize: 17, fontWeight: "700" },

  panel:  { borderRadius: 14, borderWidth: 1, overflow: "hidden" },
  thead:  { flexDirection: "row", padding: 12, borderBottomWidth: 1, gap: 4 },
  th:     { fontSize: 11, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.5 },
  trow:   { flexDirection: "row", alignItems: "center", padding: 12, gap: 4 },
  buyTag: { flexDirection: "row", alignItems: "center", gap: 3, paddingHorizontal: 6, paddingVertical: 3, borderRadius: 100 },
  buyText:{ fontSize: 10, fontWeight: "700" },
  tdAccent:{ fontSize: 12 },
  td:     { fontSize: 12 },
  tdTime: { fontSize: 11 },

  empty:      { paddingVertical: 48, alignItems: "center", gap: 10 },
  emptyTitle: { fontSize: 15, fontWeight: "600", textAlign: "center" },
  emptySub:   { fontSize: 13, textAlign: "center", lineHeight: 19 },
});
