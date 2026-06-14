import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AppBar } from "../components/AppBar";
import { Card } from "../components/Card";
import { TxRow } from "../components/TxRow";
import { IconButton } from "../components/Button";
import { ACTIVITY } from "../lib/data";
import type { Tx, TxStatus } from "../lib/data";
import { useColorTheme } from "../lib/ThemeContext";
import { getTheme } from "../theme";

type Filter = "All" | Capitalize<TxStatus>;
const FILTERS: Filter[] = ["All", "Confirmed", "Pending", "Failed"];

export function ActivityScreen({ onViewTx }: { onViewTx: (tx: Tx) => void }) {
  const [filter, setFilter] = useState<Filter>("All");
  const { isDark } = useColorTheme();
  const { colors } = getTheme(isDark);

  const rows = ACTIVITY.filter((t) =>
    filter === "All" || t.status === filter.toLowerCase()
  );

  return (
    <View style={[s.root, { backgroundColor: colors.bg }]}>
      <AppBar
        title="Activity"
        subtitle={`${ACTIVITY.length} on-chain executions`}
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

        <Card style={{ padding: 4 }}>
          {rows.length > 0
            ? rows.map((tx) => <TxRow key={tx.id} tx={tx} onPress={() => onViewTx(tx)} />)
            : <Text style={[s.empty, { color: colors.text2 }]}>No {filter.toLowerCase()} transactions</Text>
          }
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
});
