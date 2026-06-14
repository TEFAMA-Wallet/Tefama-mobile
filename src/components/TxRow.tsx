import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Badge } from "./Badge";
import type { Tx } from "../lib/data";
import { useColorTheme } from "../lib/ThemeContext";
import { getTheme } from "../theme";

interface Props {
  tx: Tx;
  onPress?: () => void;
}

export function TxRow({ tx, onPress }: Props) {
  const { isDark } = useColorTheme();
  const { colors } = getTheme(isDark);
  const isBuy = tx.type === "Buy";

  return (
    <Pressable style={({ pressed }) => [s.root, { opacity: pressed ? 0.7 : 1 }]} onPress={onPress}>
      <View style={[s.icon, { backgroundColor: isBuy ? "rgba(76,175,80,0.15)" : "rgba(212,75,42,0.15)" }]}>
        <Ionicons
          name={isBuy ? "arrow-down-outline" : "arrow-up-outline"}
          size={16}
          color={isBuy ? "#4CAF50" : "#D44B2A"}
        />
      </View>
      <View style={s.mid}>
        <Text style={[s.pair, { color: colors.text }]}>{tx.pair}</Text>
        <Text style={[s.sub,  { color: colors.text2 }]}>{tx.agent} · {tx.time}</Text>
      </View>
      <View style={s.right}>
        <Text style={[s.amount, { color: isBuy ? "#4CAF50" : colors.text }]}>{tx.amount}</Text>
        {tx.status === "confirmed"
          ? <Text style={[s.value, { color: colors.text2 }]}>{tx.value}</Text>
          : <Badge status={tx.status} />
        }
      </View>
    </Pressable>
  );
}

const s = StyleSheet.create({
  root:   { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12, paddingHorizontal: 14 },
  icon:   { width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center" },
  mid:    { flex: 1 },
  pair:   { fontSize: 14, fontWeight: "600" },
  sub:    { fontSize: 12, marginTop: 2 },
  right:  { alignItems: "flex-end", gap: 3 },
  amount: { fontSize: 14, fontWeight: "600" },
  value:  { fontSize: 12 },
});
