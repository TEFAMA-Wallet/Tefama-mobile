import { useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AppBar } from "../components/AppBar";
import { Card } from "../components/Card";
import { Badge } from "../components/Badge";
import { IconButton } from "../components/Button";
import { useColorTheme } from "../lib/ThemeContext";
import { getTheme } from "../theme";
import { EXPLORER_BASE } from "../lib/constants";

type Tx = {
  id: string; time: string; type: "Buy" | "Sell"; pair: string;
  amount: string; value: string; price: string;
  status: "confirmed" | "pending" | "failed";
  gas: string; hash: string; agent: string;
};

type Filter = "All" | "Confirmed" | "Pending" | "Failed";
const FILTERS: Filter[] = ["All", "Confirmed", "Pending", "Failed"];

interface Props {
  trades:    Tx[];
  loading:   boolean;
  onViewTx:  (tx: Tx) => void;
}

export function ActivityScreen({ trades, loading, onViewTx }: Props) {
  const [filter, setFilter] = useState<Filter>("All");
  const { isDark } = useColorTheme();
  const { colors } = getTheme(isDark);

  const rows = trades.filter(t =>
    filter === "All" || t.status === filter.toLowerCase()
  );

  return (
    <View style={[s.root, { backgroundColor: colors.bg }]}>
      <AppBar
        title="Activity"
        subtitle={`${trades.length} on-chain executions`}
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

        <Card style={{ padding: 4 }}>
          {loading && rows.length === 0 ? (
            <ActivityIndicator color={colors.accent} style={{ padding: 24 }} />
          ) : rows.length === 0 ? (
            <Text style={[s.empty, { color: colors.text2 }]}>No {filter.toLowerCase()} transactions</Text>
          ) : (
            rows.map((tx, i) => (
              <Pressable key={tx.id} onPress={() => onViewTx(tx)}
                style={[s.row, i < rows.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border }]}>
                <View style={[s.ico, { backgroundColor: "rgba(76,175,80,0.12)" }]}>
                  <Ionicons name="arrow-down-outline" size={15} color="#4CAF50" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[s.pair, { color: colors.text }]}>{tx.pair}</Text>
                  <Text style={[s.time, { color: colors.text3 }]}>{tx.time}</Text>
                </View>
                <View style={{ alignItems: "flex-end" }}>
                  <Text style={[s.amt, { color: "#4CAF50" }]}>{tx.amount}</Text>
                  <Text style={[s.val, { color: colors.text2 }]}>{tx.value}</Text>
                </View>
                <Badge status={tx.status} />
              </Pressable>
            ))
          )}
        </Card>

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
  empty:   { textAlign: "center", padding: 24, fontSize: 14 },
  row:     { flexDirection: "row", alignItems: "center", gap: 12, padding: 14 },
  ico:     { width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center" },
  pair:    { fontSize: 14, fontWeight: "600" },
  time:    { fontSize: 12, marginTop: 2 },
  amt:     { fontSize: 14, fontWeight: "700" },
  val:     { fontSize: 12, marginTop: 2 },
});
