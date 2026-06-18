import { useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Badge } from "../components/Badge";
import { useColorTheme } from "../lib/ThemeContext";
import { getTheme } from "../theme";
import type { Tx } from "../lib/data";

type Filter = "All" | "Confirmed" | "Pending" | "Failed";
const FILTERS: Filter[] = ["All", "Confirmed", "Pending", "Failed"];

interface Props {
  trades:   Tx[];
  loading:  boolean;
  onViewTx: (tx: Tx) => void;
}

const STATUS_ICON: Record<string, keyof typeof Ionicons.glyphMap> = {
  confirmed: "checkmark-circle",
  pending:   "time",
  failed:    "close-circle",
};
const STATUS_COLOR: Record<string, string> = {
  confirmed: "#4CAF50",
  pending:   "#FFB300",
  failed:    "#D44B2A",
};

export function ActivityScreen({ trades, loading, onViewTx }: Props) {
  const [filter, setFilter] = useState<Filter>("All");
  const { isDark } = useColorTheme();
  const { colors } = getTheme(isDark);

  const rows = trades.filter(t =>
    filter === "All" || t.status === filter.toLowerCase()
  );

  const confirmed = trades.filter(t => t.status === "confirmed").length;
  const failed    = trades.filter(t => t.status === "failed").length;

  return (
    <View style={[s.root, { backgroundColor: colors.bg }]}>

      {/* Header */}
      <View style={s.header}>
        <View>
          <Text style={[s.headerTitle, { color: colors.text }]}>Activity</Text>
          {trades.length > 0 && (
            <Text style={[s.headerSub, { color: colors.text2 }]}>
              {confirmed} confirmed · {failed > 0 ? `${failed} failed` : "all clean"}
            </Text>
          )}
        </View>
        {loading && <ActivityIndicator size="small" color={colors.accent} />}
      </View>

      {/* Filter tabs */}
      <View style={[s.filterBar, { backgroundColor: colors.bg3 }]}>
        {FILTERS.map((f) => {
          const on = f === filter;
          return (
            <Pressable key={f} onPress={() => setFilter(f)}
              style={[s.filterBtn, on && { backgroundColor: colors.bg2 }]}>
              <Text style={[s.filterText, { color: on ? colors.text : colors.text3 }]}>{f}</Text>
              {f !== "All" && (
                <View style={[s.filterDot, { backgroundColor: f === "Confirmed" ? "#4CAF50" : f === "Pending" ? "#FFB300" : "#D44B2A" }]} />
              )}
            </Pressable>
          );
        })}
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        {loading && rows.length === 0 ? (
          <View style={s.emptyWrap}>
            <ActivityIndicator size="large" color={colors.accent} />
            <Text style={[s.emptyText, { color: colors.text2 }]}>Loading trades…</Text>
          </View>
        ) : rows.length === 0 ? (
          <View style={s.emptyWrap}>
            <View style={[s.emptyIco, { backgroundColor: colors.accentDim }]}>
              <Ionicons name="receipt-outline" size={32} color={colors.accent} />
            </View>
            <Text style={[s.emptyTitle, { color: colors.text }]}>No {filter === "All" ? "" : filter.toLowerCase()} trades yet</Text>
            <Text style={[s.emptyText, { color: colors.text2 }]}>Your agent's on-chain executions appear here.</Text>
          </View>
        ) : (
          <View style={[s.list, { backgroundColor: colors.bg2, borderColor: colors.border }]}>
            {rows.map((tx, i) => {
              const statusColor = STATUS_COLOR[tx.status] ?? colors.text2;
              return (
                <Pressable key={tx.id} onPress={() => onViewTx(tx)}
                  style={[s.row, i < rows.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border }]}>
                  {/* Left icon */}
                  <View style={[s.rowIco, { backgroundColor: "rgba(76,175,80,0.10)" }]}>
                    <Ionicons name="arrow-down" size={15} color="#4CAF50" />
                  </View>

                  {/* Middle */}
                  <View style={{ flex: 1 }}>
                    <Text style={[s.rowPair, { color: colors.text }]}>{tx.pair}</Text>
                    <View style={s.rowMeta}>
                      <Ionicons name={STATUS_ICON[tx.status]} size={11} color={statusColor} />
                      <Text style={[s.rowTime, { color: colors.text3 }]}>{tx.time}</Text>
                    </View>
                  </View>

                  {/* Right */}
                  <View style={{ alignItems: "flex-end" }}>
                    <Text style={[s.rowAmt, { color: "#4CAF50" }]}>{tx.amount}</Text>
                    <Text style={[s.rowVal, { color: colors.text2 }]}>{tx.value}</Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        )}
        <View style={{ height: 24 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root:   { flex: 1 },
  scroll: { padding: 16 },

  header:      { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", paddingHorizontal: 16, paddingTop: 10, paddingBottom: 10 },
  headerTitle: { fontSize: 22, fontWeight: "800", letterSpacing: -0.5 },
  headerSub:   { fontSize: 12, fontWeight: "500", marginTop: 2 },

  filterBar:  { flexDirection: "row", marginHorizontal: 16, borderRadius: 12, padding: 3, gap: 2, marginBottom: 6 },
  filterBtn:  { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5, paddingVertical: 8, borderRadius: 10 },
  filterText: { fontSize: 12, fontWeight: "600" },
  filterDot:  { width: 6, height: 6, borderRadius: 3 },

  emptyWrap:  { alignItems: "center", paddingVertical: 56, gap: 12 },
  emptyIco:   { width: 68, height: 68, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  emptyTitle: { fontSize: 16, fontWeight: "700" },
  emptyText:  { fontSize: 14, textAlign: "center", lineHeight: 20, paddingHorizontal: 24 },

  list:   { borderRadius: 16, borderWidth: 1, overflow: "hidden" },
  row:    { flexDirection: "row", alignItems: "center", gap: 12, padding: 14 },
  rowIco: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  rowPair:{ fontSize: 14, fontWeight: "600" },
  rowMeta:{ flexDirection: "row", alignItems: "center", gap: 4, marginTop: 3 },
  rowTime:{ fontSize: 11 },
  rowAmt: { fontSize: 14, fontWeight: "700" },
  rowVal: { fontSize: 11, marginTop: 2 },
});
