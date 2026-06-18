import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import type { ReactNode } from "react";
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
  bellEl?:  ReactNode;
}

function Skeleton({ w = 80, h = 14 }: { w?: number | string; h?: number }) {
  const { isDark } = useColorTheme();
  const { colors } = getTheme(isDark);
  return <View style={{ width: w as any, height: h, borderRadius: 4, backgroundColor: colors.bgSoft3 }} />;
}

function usd(n: number, d = 2) {
  return "$" + n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
}

export function ActivityScreen({ trades, pnl, count, loading, onRefresh, onViewTx, deepPrice, bellEl }: Props) {
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
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 2 }}>
          {bellEl}
          <Pressable
            onPress={onRefresh}
            style={[s.refreshBtn, { backgroundColor: colors.bgSoft, borderColor: colors.border }]}
          >
          <Ionicons name="refresh-outline" size={14} color={colors.text2} />
          <Text style={[s.refreshText, { color: colors.text2 }]}>Refresh</Text>
        </Pressable>
        </View>
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

        {/* Trades list — card style */}
        <View style={[s.panel, { backgroundColor: colors.bg3, borderColor: colors.border }]}>
          {loading && trades.length === 0 ? (
            [1, 2, 3, 4, 5].map(i => (
              <View key={i} style={[s.trow, { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border }]}>
                <Skeleton w={32} h={32} />
                <View style={{ flex: 1, gap: 6 }}>
                  <Skeleton w={140} h={14} />
                  <Skeleton w={80} h={11} />
                </View>
                <View style={{ alignItems: "flex-end", gap: 6 }}>
                  <Skeleton w={70} h={14} />
                  <Skeleton w={90} h={11} />
                </View>
              </View>
            ))
          ) : trades.length === 0 ? (
            <View style={s.empty}>
              <Ionicons name="pulse-outline" size={32} color={colors.text4} />
              <Text style={[s.emptyTitle, { color: colors.text2 }]}>No on-chain trades found yet.</Text>
              <Text style={[s.emptySub, { color: colors.text3 }]}>Run the agent to see live execution data here.</Text>
            </View>
          ) : (
            trades.map((tx, i) => {
              const deepAmt = tx.amount.replace("+", "").replace(" DEEP", "");
              return (
                <Pressable key={tx.id} onPress={() => onViewTx(tx)}
                  style={[s.trow, i < trades.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border }]}>
                  <View style={[s.buyIco, { backgroundColor: colors.accentDim }]}>
                    <Ionicons name="arrow-down-left-box" size={16} color={colors.accent} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[s.cardTitle, { color: colors.text }]}>Bought {deepAmt} DEEP</Text>
                    <Text style={[s.cardTime, { color: colors.text3 }]}>{tx.time}</Text>
                  </View>
                  <View style={{ alignItems: "flex-end" }}>
                    <Text style={[s.cardVal, { color: colors.text, fontFamily: "monospace" }]}>{tx.value}</Text>
                    <Text style={[s.cardPrice, { color: colors.text2, fontFamily: "monospace" }]}>{usd(Number(tx.price), 6)} / DEEP</Text>
                  </View>
                </Pressable>
              );
            })
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

  panel:     { borderRadius: 14, borderWidth: 1, overflow: "hidden" },
  trow:      { flexDirection: "row", alignItems: "center", paddingHorizontal: 14, paddingVertical: 12, gap: 12 },
  buyIco:    { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  cardTitle: { fontSize: 13, fontWeight: "600", marginBottom: 2 },
  cardTime:  { fontSize: 11 },
  cardVal:   { fontSize: 13, fontWeight: "600", marginBottom: 2 },
  cardPrice: { fontSize: 11 },

  empty:      { paddingVertical: 48, alignItems: "center", gap: 10 },
  emptyTitle: { fontSize: 15, fontWeight: "600", textAlign: "center" },
  emptySub:   { fontSize: 13, textAlign: "center", lineHeight: 19 },
});
