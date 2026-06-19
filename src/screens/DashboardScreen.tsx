import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useColorTheme } from "../lib/ThemeContext";
import { getTheme } from "../theme";
import type { Tx } from "../lib/data";
import type { Vault } from "../lib/useOnchain";

interface Props {
  price:          number;
  deepPrice:      number;
  change24h:      number;
  deepChange24h:  number;
  priceLoading:   boolean;
  suiBalance:     number;
  usdcBalance:    number;
  deepBalance:    number;
  vault:          Vault | null;
  walletLoading:  boolean;
  trades:         Tx[];
  tradeCount:     number;
  tradePnl:       number;
  tradeRoi:       number;
  tradeLoading:   boolean;
  onViewAgent:    () => void;
  onViewActivity: () => void;
  onViewTx:       (tx: Tx) => void;
}

function Skeleton({ w = 80, h = 20 }: { w?: number | string; h?: number }) {
  const { isDark } = useColorTheme();
  const { colors } = getTheme(isDark);
  return <View style={{ width: w as any, height: h, borderRadius: 5, backgroundColor: colors.bgSoft3 }} />;
}

function usd(n: number, decimals = 2) {
  return "$" + n.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

function StatCard({ label, icon, value, delta, deltaUp, sub, loading }: {
  label: string; icon: keyof typeof Ionicons.glyphMap;
  value: string; delta?: string; deltaUp?: boolean; sub?: string; loading?: boolean;
}) {
  const { isDark } = useColorTheme();
  const { colors } = getTheme(isDark);
  return (
    <View style={[s.statCard, { backgroundColor: colors.bg3, borderColor: colors.border }]}>
      <View style={s.statTop}>
        <Text style={[s.statLabel, { color: colors.text2 }]}>{label}</Text>
        <Ionicons name={icon} size={16} color={colors.text3} />
      </View>
      {loading ? <Skeleton w={100} h={24} /> : (
        <Text style={[s.statValue, { color: colors.text }]}>{value}</Text>
      )}
      {delta && !loading && (
        <Text style={[s.statDelta, { color: deltaUp ? colors.accent : colors.red }]}>{delta}</Text>
      )}
      {sub && !loading && (
        <Text style={[s.statSub, { color: colors.text3 }]}>{sub}</Text>
      )}
    </View>
  );
}

export function DashboardScreen({
  price, deepPrice, change24h, priceLoading,
  suiBalance, usdcBalance, deepBalance, vault, walletLoading,
  trades, tradeCount, tradePnl, tradeRoi, tradeLoading,
  onViewAgent, onViewActivity, onViewTx,
}: Props) {
  const { isDark } = useColorTheme();
  const { colors } = getTheme(isDark);

  const totalUsd   = suiBalance * price + usdcBalance + deepBalance * deepPrice;
  const loading    = walletLoading || priceLoading;
  const budgetUsed = vault ? Math.min(100, ((vault.spent ?? 0) / (vault.budgetCap ?? 1)) * 100) : 0;
  const recent     = trades.slice(0, 5);
  const isActive   = vault ? !vault.paused : false;

  return (
    <View style={[s.root, { backgroundColor: colors.bg }]}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* ── Stats ── */}
        <View style={s.statGrid}>
          <StatCard
            label="Portfolio" icon="wallet-outline"
            value={usd(totalUsd, 2)}
            delta={`SUI ${change24h >= 0 ? "+" : ""}${change24h.toFixed(2)}% 24h`}
            deltaUp={change24h >= 0} loading={loading}
          />
          <StatCard
            label="Total trades" icon="repeat-outline"
            value={String(tradeCount)}
            sub={tradeCount === 0 ? "No trades yet" : `Last: ${trades[0]?.time ?? "—"}`}
            loading={tradeLoading}
          />
          <StatCard
            label="P&L" icon="trending-up-outline"
            value={`${tradePnl >= 0 ? "+" : ""}${usd(tradePnl, 4)}`}
            delta={tradeCount > 0 ? `${tradeRoi >= 0 ? "+" : ""}${tradeRoi.toFixed(2)}% ROI` : undefined}
            deltaUp={tradePnl >= 0} loading={tradeLoading}
          />
          <StatCard
            label="SUI price" icon="pulse-outline"
            value={usd(price, 4)}
            sub={`DEEP ${usd(deepPrice, 6)}`}
            loading={priceLoading}
          />
        </View>

        {/* ── My Agents ── */}
        <View>
          <Text style={[s.sectionTitle, { color: colors.text }]}>My Agents</Text>

          <Pressable
            onPress={onViewAgent}
            style={({ pressed }) => [
              s.agentCard,
              { backgroundColor: colors.bg3, borderColor: isActive ? "rgba(6,182,212,0.28)" : colors.border },
              pressed && { opacity: 0.92 },
            ]}
          >
            {/* Agent header row */}
            <View style={s.agentHead}>
              <View style={s.agentIconWrap}>
                <Ionicons name="hardware-chip-outline" size={20} color={colors.accent} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[s.agentName, { color: colors.text }]}>DCA Agent</Text>
                <Text style={[s.agentPair, { color: colors.text3 }]}>DEEP / SUI · DeepBook v3</Text>
              </View>
              <View style={[s.statusBadge, {
                backgroundColor: isActive ? colors.accentDim : colors.bgSoft3,
                borderColor:     isActive ? colors.accentB   : colors.border,
              }]}>
                {isActive && <View style={[s.pulseDot, { backgroundColor: colors.accent }]} />}
                <Text style={[s.statusText, { color: isActive ? colors.accent : colors.text3 }]}>
                  {vault == null ? "Loading" : vault.paused ? "Paused" : "Running"}
                </Text>
              </View>
            </View>

            {/* Budget bar */}
            {vault && (
              <>
                <View style={s.budgetRow}>
                  <Text style={[s.budgetLabel, { color: colors.text3 }]}>Budget used</Text>
                  <Text style={[s.budgetNum, { color: colors.text2 }]}>
                    {vault.spent.toFixed(3)} / {vault.budgetCap.toFixed(3)} SUI · {budgetUsed.toFixed(0)}%
                  </Text>
                </View>
                <View style={[s.barTrack, { backgroundColor: colors.bgSoft3 }]}>
                  <View style={[s.barFill, {
                    width: `${budgetUsed}%` as any,
                    backgroundColor: budgetUsed > 90 ? colors.red : colors.accent,
                  }]} />
                </View>
              </>
            )}

            {/* Footer row */}
            <View style={s.agentFooter}>
              <Text style={[s.agentMeta, { color: colors.text3 }]}>
                {tradeCount} trades · last {trades[0]?.time ?? "—"}
              </Text>
              <View style={s.agentCta}>
                <Text style={[s.agentCtaText, { color: colors.accent }]}>View details</Text>
                <Ionicons name="chevron-forward" size={14} color={colors.accent} />
              </View>
            </View>
          </Pressable>
        </View>

        {/* ── Recent trades ── */}
        <View style={[s.panel, { backgroundColor: colors.bg3, borderColor: colors.border }]}>
          <View style={s.panelHead}>
            <Text style={[s.panelTitle, { color: colors.text }]}>Recent trades</Text>
            <Pressable onPress={onViewActivity}>
              <Text style={[s.viewAll, { color: colors.accent }]}>View all</Text>
            </Pressable>
          </View>

          {tradeLoading && recent.length === 0 ? (
            <View style={{ gap: 10 }}>
              {[1, 2, 3].map(i => <Skeleton key={i} w="100%" h={40} />)}
            </View>
          ) : recent.length === 0 ? (
            <View style={s.emptyState}>
              <Ionicons name="pulse-outline" size={28} color={colors.text4} />
              <Text style={[s.emptyText, { color: colors.text3 }]}>No trades yet. Your agent will appear here once it executes.</Text>
            </View>
          ) : (
            recent.map((tx, i) => (
              <Pressable key={tx.id} onPress={() => onViewTx(tx)}
                style={[s.tradeRow, i < recent.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border }]}>
                <View style={[s.tradeIco, { backgroundColor: colors.accentDim }]}>
                  <Ionicons name="arrow-down-left-box" size={14} color={colors.accent} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[s.tradeDesc, { color: colors.text }]}>Bought {tx.amount.replace("+", "")}</Text>
                  <Text style={[s.tradeTime, { color: colors.text3 }]}>{tx.time}</Text>
                </View>
                <Text style={[s.tradeVal, { color: colors.text2, fontFamily: "monospace" }]}>{tx.value}</Text>
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
  scroll: { padding: 16, gap: 16 },

  // Stats
  statGrid:  { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  statCard:  { width: "48%", flexGrow: 1, borderRadius: 14, borderWidth: 1, padding: 14, gap: 4 },
  statTop:   { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
  statLabel: { fontSize: 12, fontWeight: "600" },
  statValue: { fontSize: 19, fontWeight: "700", letterSpacing: -0.4 },
  statDelta: { fontSize: 11, marginTop: 2 },
  statSub:   { fontSize: 11, marginTop: 2 },

  // Section title
  sectionTitle: { fontSize: 15, fontWeight: "700", marginBottom: 10 },

  // Agent card
  agentCard: { borderRadius: 16, borderWidth: 1, padding: 16, gap: 12 },
  agentHead: { flexDirection: "row", alignItems: "center", gap: 12 },
  agentIconWrap: { width: 40, height: 40, borderRadius: 12, backgroundColor: "rgba(6,182,212,0.12)", alignItems: "center", justifyContent: "center" },
  agentName: { fontSize: 15, fontWeight: "700" },
  agentPair: { fontSize: 12, marginTop: 1 },
  statusBadge: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 9, paddingVertical: 5, borderRadius: 100, borderWidth: 1 },
  pulseDot:    { width: 6, height: 6, borderRadius: 3 },
  statusText:  { fontSize: 12, fontWeight: "600" },

  budgetRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  budgetLabel: { fontSize: 12 },
  budgetNum:   { fontSize: 12 },
  barTrack:  { height: 6, borderRadius: 3, overflow: "hidden" },
  barFill:   { height: "100%", borderRadius: 3 },

  agentFooter:   { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 2 },
  agentMeta:     { fontSize: 12 },
  agentCta:      { flexDirection: "row", alignItems: "center", gap: 2 },
  agentCtaText:  { fontSize: 13, fontWeight: "600" },

  // Panel
  panel:    { borderRadius: 14, borderWidth: 1, padding: 16 },
  panelHead:{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 },
  panelTitle:{ fontSize: 14, fontWeight: "600" },
  viewAll:  { fontSize: 13, fontWeight: "500" },

  emptyState: { paddingVertical: 24, alignItems: "center", gap: 10 },
  emptyText:  { fontSize: 13, textAlign: "center", lineHeight: 19 },

  tradeRow:  { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 10 },
  tradeIco:  { width: 32, height: 32, borderRadius: 9, alignItems: "center", justifyContent: "center" },
  tradeDesc: { fontSize: 13, fontWeight: "500" },
  tradeTime: { fontSize: 11, marginTop: 1 },
  tradeVal:  { fontSize: 13 },
});
