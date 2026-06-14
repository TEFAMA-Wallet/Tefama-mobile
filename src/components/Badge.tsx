import { StyleSheet, Text, View } from "react-native";
import type { AgentStatus, TxStatus } from "../lib/data";

type BadgeStatus = AgentStatus | TxStatus | "Sui Testnet";

const CONFIG: Record<string, { bg: string; text: string; label: string }> = {
  active:     { bg: "rgba(76,175,80,0.15)",   text: "#4CAF50", label: "Active"     },
  paused:     { bg: "rgba(255,140,0,0.15)",   text: "#FF8C00", label: "Paused"     },
  revoked:    { bg: "rgba(120,120,120,0.15)", text: "#888",    label: "Revoked"    },
  confirmed:  { bg: "rgba(76,175,80,0.15)",   text: "#4CAF50", label: "Confirmed"  },
  pending:    { bg: "rgba(255,140,0,0.15)",   text: "#FF8C00", label: "Pending"    },
  failed:     { bg: "rgba(212,75,42,0.15)",   text: "#D44B2A", label: "Failed"     },
  "Sui Testnet": { bg: "rgba(76,175,80,0.15)", text: "#4CAF50", label: "Sui Testnet" },
};

export function Badge({ status }: { status: BadgeStatus }) {
  const cfg = CONFIG[status] ?? { bg: "rgba(120,120,120,0.15)", text: "#888", label: status };
  return (
    <View style={[s.root, { backgroundColor: cfg.bg }]}>
      <Text style={[s.text, { color: cfg.text }]}>{cfg.label}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  root: { borderRadius: 100, paddingHorizontal: 9, paddingVertical: 3 },
  text: { fontSize: 11, fontWeight: "700", letterSpacing: 0.2 },
});
