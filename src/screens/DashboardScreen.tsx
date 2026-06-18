import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import type { ReactNode } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useColorTheme } from "../lib/ThemeContext";
import { getTheme } from "../theme";
import { useAuth } from "../lib/AuthContext";
import type { Tx } from "../lib/data";
import type { Vault } from "../lib/useOnchain";

interface Props {
  price:         number;
  deepPrice:     number;
  change24h:     number;
  deepChange24h: number;
  priceLoading:  boolean;
  suiBalance:    number;
  usdcBalance:   number;
  deepBalance:   number;
  vault:         Vault | null;
  walletLoading: boolean;
  trades:        Tx[];
  tradeCount:    number;
  tradePnl:      number;
  tradeRoi:      number;
  tradeLoading:  boolean;
  onViewAgent:    () => void;
  onViewActivity: () => void;
  onViewTx:       (tx: Tx) => void;
  bellEl?:        ReactNode;
}

function Skeleton({ w = 80, h = 20 }: { w?: number | string; h?: number }) {
  const { isDark } = useColorTheme();
  const { colors } = getTheme(isDark);
  return (
    <View style={{ width: w as any, height: h, borderRadius: 5, backgroundColor: colors.bgSoft3 }} />
  );
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
        <Ionicons name={icon} size={17} color={colors.text3} />
      </View>
      {loading ? <Skeleton w={110} h={26} /> : (
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
  onViewAgent, onViewActivity, onViewTx, bellEl,
}: Props) {
  const { isDark } = useColorTheme();
  const { colors } = getTheme(isDark);
  const { session } = useAuth();

  const totalUsd     = suiBalance * price + usdcBalance + deepBalance * deepPrice;
  const loading      = walletLoading || priceLoading;
  const budgetUsed   = vault ? Math.min(100, ((vault.spent ?? 0) / (vault.budgetCap ?? 1)) * 100) : 0;
  const recent       = trades.slice(0, 6);
  const firstName    = session?.name?.split(" ")[0] ?? "";

  return (
    <View style={[s.root, { backgroundColor: colors.bg }]}>
      {/* Header */}
      <View style={[s.header, { borderBottomColor: colors.border }]}>
        <View>
          <Text style={[s.pageTitle, { color: colors.text }]}>Dashboard</Text>
          <Text style={[s.pageSub, { color: colors.text2 }]} numberOfLines={1}>
            {firstName ? `Welcome back, ${firstName}` : "Welcome back"}
          </Text>
        </View>
        <View style={s.headerRight}>
          {bellEl}
          <Pressable style={[s.newAgentBtn, { backgroundColor: colors.accent }]} onPress={onViewAgent}>
            <Ionicons name="add" size={15} color="#fff" />
            <Text style={s.newAgentText}>New agent</Text>
          </Pressable>
        </View>
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* Stat grid */}
        <View style={s.statGrid}>
          <StatCard
            label="Portfolio value" icon="wallet-outline"
            value={usd(totalUsd, 2)}
            delta={`SUI @ ${usd(price, 4)} · ${change24h >= 0 ? "+" : ""}${change24h.toFixed(2)}% 24h`}
            deltaUp={change24h >= 0} loading={loading}
          />
          <StatCard
            label="SUI balance" icon="trending-up-outline"
            value={`${suiBalance.toFixed(4)} SUI`}
            sub={`≈ ${usd(suiBalance * price, 2)}`}
            loading={loading}
          />
          <StatCard
            label="Total trades" icon="repeat-outline"
            value={String(tradeCount)}
            sub={tradeLoading ? undefined : tradeCount === 0 ? "No trades yet" : `Last: ${trades[0]?.time ?? "—"}`}
            loading={tradeLoading}
          />
          <StatCard
            label="P&L (unrealised)" icon="hardware-chip-outline"
            value={`${tradePnl >= 0 ? "+" : ""}${usd(tradePnl, 4)}`}
            delta={tradeCount > 0 ? `${tradeRoi >= 0 ? "+" : ""}${tradeRoi.toFixed(2)}% ROI · ${tradeCount} trades` : undefined}
            deltaUp={tradePnl >= 0} loading={tradeLoading}
          />
        </View>

        {/* Vault card */}
        {vault && (
          <View style={[s.panel, { backgroundColor: colors.bg3, borderColor: colors.border }]}>
            <View style={s.panelHead}>
              <Text style={[s.panelTitle, { color: colors.text }]}>Vault · DCA agent</Text>
              <Pressable onPress={onViewAgent}>
                <View style={[s.statusBadge, {
                  backgroundColor: vault.paused ? colors.bgSoft3 : colors.accentDim,
                  borderColor: vault.paused ? colors.border : colors.accentB,
                }]}>
                  {!vault.paused && (
                    <View style={[s.pulseDot, { backgroundColor: colors.accent }]} />
                  )}
                  <Text style={[s.statusText, { color: vault.paused ? colors.text2 : colors.accent }]}>
                    {vault.paused ? "Paused" : "Running"}
                  </Text>
                </View>
              </Pressable>
            </View>
            <View style={s.budgetRow}>
              <Text style={[s.budgetLabel, { color: colors.text3 }]}>Budget used</Text>
              <Text style={[s.budgetNum, { color: colors.text2, fontFamily: "monospace" }]}>
                {(vault.spent ?? 0).toFixed(4)} / {(vault.budgetCap ?? 0).toFixed(4)} SUI
              </Text>
            </View>
            <View style={[s.barTrack, { backgroundColor: colors.bgSoft3 }]}>
              <View style={[s.barFill, {
                width: `${budgetUsed}%` as any,
                backgroundColor: budgetUsed > 90 ? colors.red : colors.accent,
              }]} />
            </View>
          </View>
        )}

        {/* Price + Recent trades row */}
        <View style={s.twoCol}>
          {/* Price card */}
          <View style={[s.panel, s.pricePanel, { backgroundColor: colors.bg3, borderColor: colors.border }]}>
            <View style={s.panelHead}>
              <Text style={[s.panelTitle, { color: colors.text }]}>SUI / USDC · DeepBook</Text>
              <Text style={[s.liveTag, { color: colors.text3 }]}>live · testnet</Text>
            </View>
            {priceLoading ? <Skeleton w="100%" h={44} /> : (
              <View style={s.priceRow}>
                <Text style={[s.bigPrice, { color: colors.text, fontFamily: "monospace" }]}>{usd(price, 4)}</Text>
                <Text style={[s.priceDelta, { color: change24h >= 0 ? colors.accent : colors.red, fontFamily: "monospace" }]}>
                  {change24h >= 0 ? "+" : ""}{change24h.toFixed(2)}%
                </Text>
              </View>
            )}
            <View style={s.priceMetaRow}>
              <Text style={[s.priceMeta, { color: colors.text2 }]}>
                DEEP <Text style={{ color: colors.text, fontFamily: "monospace" }}>{usd(deepPrice, 6)}</Text>
              </Text>
            </View>
          </View>

          {/* Recent trades */}
          <View style={[s.panel, s.tradesPanel, { backgroundColor: colors.bg3, borderColor: colors.border }]}>
            <View style={s.panelHead}>
              <Text style={[s.panelTitle, { color: colors.text }]}>Recent trades</Text>
              <Pressable onPress={onViewActivity}>
                <Text style={[s.viewAll, { color: colors.accent }]}>View all</Text>
              </Pressable>
            </View>
            {tradeLoading && recent.length === 0 ? (
              <View style={{ gap: 10 }}>
                {[1, 2, 3].map(i => <Skeleton key={i} w="100%" h={36} />)}
              </View>
            ) : recent.length === 0 ? (
              <View style={s.emptyState}>
                <Ionicons name="pulse-outline" size={28} color={colors.text4} />
                <Text style={[s.emptyText, { color: colors.text3 }]}>No trades yet. Start your first agent to see live activity.</Text>
              </View>
            ) : (
              recent.map((tx, i) => (
                <Pressable key={tx.id} onPress={() => onViewTx(tx)}
                  style={[s.tradeRow, i < recent.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border }]}>
                  <View style={[s.tradeIco, { backgroundColor: colors.bgSoft }]}>
                    <Ionicons name="arrow-down-left-box" size={14} color={colors.accent} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[s.tradeDesc, { color: colors.text }]}>Bought {tx.amount.replace("+", "")}</Text>
                    <Text style={[s.tradeTime, { color: colors.text3 }]}>{tx.time}</Text>
                  </View>
                  <Text style={[s.tradeVal, { color: colors.text, fontFamily: "monospace" }]}>{tx.value}</Text>
                </Pressable>
              ))
            )}
          </View>
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root:   { flex: 1 },
  scroll: { padding: 16, gap: 14 },

  header:       { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingTop: 10, paddingBottom: 12, borderBottomWidth: StyleSheet.hairlineWidth },
  headerRight:  { flexDirection: "row", alignItems: "center", gap: 8 },
  pageTitle:    { fontSize: 22, fontWeight: "700", letterSpacing: -0.4 },
  pageSub:      { fontSize: 13, marginTop: 2, lineHeight: 18 },
  newAgentBtn:  { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 8, marginTop: 2 },
  newAgentText: { color: "#fff", fontSize: 13, fontWeight: "600" },

  statGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  statCard: { width: "48%", flexGrow: 1, borderRadius: 14, borderWidth: 1, padding: 16, gap: 4 },
  statTop:  { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
  statLabel:{ fontSize: 12, fontWeight: "600" },
  statValue:{ fontSize: 20, fontWeight: "700", letterSpacing: -0.5 },
  statDelta:{ fontSize: 12, marginTop: 2, fontFamily: "monospace" },
  statSub:  { fontSize: 12, marginTop: 4, fontFamily: "monospace" },

  panel:    { borderRadius: 14, borderWidth: 1, padding: 16 },
  panelHead:{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 },
  panelTitle:{ fontSize: 14, fontWeight: "600" },

  statusBadge: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 9, paddingVertical: 4, borderRadius: 100, borderWidth: 1 },
  pulseDot:    { width: 6, height: 6, borderRadius: 3 },
  statusText:  { fontSize: 12, fontWeight: "600" },

  budgetRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  budgetLabel:{ fontSize: 13 },
  budgetNum: { fontSize: 13 },
  barTrack:  { height: 8, borderRadius: 4, overflow: "hidden" },
  barFill:   { height: "100%", borderRadius: 4 },

  twoCol:      { gap: 12 },
  pricePanel:  {},
  tradesPanel: {},

  liveTag:  { fontSize: 11, fontFamily: "monospace" },
  priceRow: { flexDirection: "row", alignItems: "baseline", gap: 12, marginBottom: 10 },
  bigPrice: { fontSize: 30, fontWeight: "700", letterSpacing: -0.5 },
  priceDelta:{ fontSize: 14 },
  priceMetaRow:{ flexDirection: "row", gap: 16 },
  priceMeta:{ fontSize: 13 },

  viewAll: { fontSize: 13, fontWeight: "500" },

  emptyState:{ paddingVertical: 24, alignItems: "center", gap: 10 },
  emptyText: { fontSize: 13, textAlign: "center", lineHeight: 19 },

  tradeRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 10 },
  tradeIco: { width: 30, height: 30, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  tradeDesc:{ fontSize: 13, fontWeight: "500" },
  tradeTime:{ fontSize: 12, marginTop: 1 },
  tradeVal: { fontSize: 13 },
});
