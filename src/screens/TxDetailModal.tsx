import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Badge } from "../components/Badge";
import { Button } from "../components/Button";
import type { Tx } from "../lib/data";
import { useColorTheme } from "../lib/ThemeContext";
import { getTheme } from "../theme";

interface Props {
  tx: Tx | null;
  onClose: () => void;
}

export function TxDetailModal({ tx, onClose }: Props) {
  const { isDark } = useColorTheme();
  const { colors } = getTheme(isDark);

  if (!tx) return null;
  const isBuy = tx.type === "Buy";

  const ROWS: [string, React.ReactNode][] = [
    ["Amount", tx.amount],
    ["Value",  tx.value ],
    ["Price",  `${tx.price} USDC`],
    ["Gas fee",`${tx.gas} SUI`],
    ["Agent",  tx.agent ],
    ["Tx hash",tx.hash  ],
  ];

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={s.overlay} onPress={onClose} />
      <View style={[s.sheet, { backgroundColor: colors.bg2, borderTopColor: colors.border }]}>
        {/* handle */}
        <View style={[s.handle, { backgroundColor: colors.border2 }]} />

        {/* header */}
        <View style={s.head}>
          <View style={[s.headIco, { backgroundColor: isBuy ? "rgba(76,175,80,0.15)" : "rgba(212,75,42,0.15)" }]}>
            <Ionicons name={isBuy ? "arrow-down-outline" : "arrow-up-outline"} size={22} color={isBuy ? "#4CAF50" : "#D44B2A"} />
          </View>
          <Text style={[s.headTitle, { color: colors.text }]}>{tx.type} {tx.pair}</Text>
        </View>

        {/* rows */}
        {ROWS.map(([k, v], i) => (
          <View key={k} style={[s.row, i < ROWS.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border }]}>
            <Text style={[s.rowK, { color: colors.text2 }]}>{k}</Text>
            <Text style={[s.rowV, { color: colors.text }]}>{v}</Text>
          </View>
        ))}
        <View style={[s.row, { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border }]}>
          <Text style={[s.rowK, { color: colors.text2 }]}>Status</Text>
          <Badge status={tx.status} />
        </View>

        {/* actions */}
        <View style={s.actions}>
          <Button variant="ghost"     onPress={onClose}>Close</Button>
          <Button variant="secondary" icon={<Ionicons name="open-outline" size={16} color={colors.text} />}>Explorer</Button>
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay:   { flex: 1, backgroundColor: "rgba(0,0,0,0.5)" },
  sheet:     { borderTopLeftRadius: 24, borderTopRightRadius: 24, borderTopWidth: StyleSheet.hairlineWidth, padding: 20, paddingBottom: 36 },
  handle:    { width: 40, height: 4, borderRadius: 2, alignSelf: "center", marginBottom: 20 },
  head:      { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 20 },
  headIco:   { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  headTitle: { fontSize: 17, fontWeight: "700" },
  row:       { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 12 },
  rowK:      { fontSize: 14 },
  rowV:      { fontSize: 14, fontWeight: "600" },
  actions:   { flexDirection: "row", justifyContent: "flex-end", gap: 10, marginTop: 16 },
});
