import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Svg, { Defs, LinearGradient as SvgGrad, Path, Stop } from "react-native-svg";
import { AppBar } from "../components/AppBar";
import { Card } from "../components/Card";
import { Badge } from "../components/Badge";
import { CircularProgress } from "../components/CircularProgress";
import { Button, IconButton } from "../components/Button";
import { SectionHead } from "../components/SectionHead";
import { BrandLogo } from "../components/BrandLogo";
import { fmtUSD, fmtNum } from "../lib/data";
import type { Agent } from "../lib/data";
import { useColorTheme } from "../lib/ThemeContext";
import { getTheme } from "../theme";
import type { usePrice, useWallet, useTrades } from "../lib/useOnchain";
type PriceData  = ReturnType<typeof usePrice>;
type WalletData = ReturnType<typeof useWallet>;
type TradeData  = ReturnType<typeof useTrades>;

// Tx shape used for the modal (kept compatible with TxDetailModal)
type Tx = {
  id: string; time: string; type: "Buy" | "Sell"; pair: string;
  amount: string; value: string; price: string;
  status: "confirmed" | "pending" | "failed";
  gas: string; hash: string; agent: string;
};

interface Props {
  priceData:  PriceData;
  walletData: WalletData;
  tradeData:  TradeData;
  liveAgent:  Agent;
  onViewAgent:    () => void;
  onViewAgents:   () => void;
  onViewActivity: () => void;
  onViewTx: (tx: Tx) => void;
}

function Sparkline({ prices }: { prices: number[] }) {
  const { isDark } = useColorTheme();
  const { colors } = getTheme(isDark);
  if (prices.length < 2) return null;
  const W = 300, H = 44;
  const max = Math.max(...prices), min = Math.min(...prices);
  const pts = prices.map((v, i) => [
    (i / (prices.length - 1)) * W,
    H - 3 - ((v - min) / ((max - min) || 1)) * (H - 8),
  ]);
  const line = pts.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" ");
  const area = `${line} L${W} ${H} L0 ${H} Z`;
  return (
    <Svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ marginTop: 10 }}>
      <Defs>
        <SvgGrad id="sg" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%"   stopColor={colors.accent} stopOpacity={0.28} />
          <Stop offset="100%" stopColor={colors.accent} stopOpacity={0}    />
        </SvgGrad>
      </Defs>
      <Path d={area} fill="url(#sg)" />
      <Path d={line}  fill="none" stroke={colors.accent} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function DashboardScreen({
  priceData, walletData, tradeData, liveAgent,
  onViewAgent, onViewAgents, onViewActivity, onViewTx,
}: Props) {
  const { isDark } = useColorTheme();
  const { colors } = getTheme(isDark);

  const vault      = walletData.vault;
  const pct        = vault ? (vault.spent / (vault.budgetCap || 1)) * 100 : 0;
  const deepValue  = walletData.deepBalance * priceData.deepPrice;
  const totalUsd   = walletData.suiBalance * priceData.price + walletData.usdcBalance + deepValue;
  const gainPct    = tradeData.roi;
  const sparkPrices = tradeData.trades.slice(-12).reverse().map(t => t.price);

  const recentTxs = tradeData.trades.slice(0, 4).map(t => ({
    id:     t.id,
    time:   t.time,
    type:   "Buy" as const,
    pair:   "DEEP / SUI",
    amount: `+${t.baseReceived.toFixed(3)} DEEP`,
    value:  `${t.quoteSpent.toFixed(4)} SUI`,
    price:  t.price.toFixed(6),
    status: t.status as "confirmed" | "pending" | "failed",
    gas:    "—",
    hash:   t.digest,
    agent:  "DCA Agent",
  }));

  return (
    <View style={[s.root, { backgroundColor: colors.bg }]}>
      <AppBar
        title="Dashboard"
        subtitle="Sui Testnet"
        leading={<BrandLogo size={28} />}
        actions={
          <IconButton size="sm">
            <Ionicons name="menu-outline" size={20} color={colors.text2} />
          </IconButton>
        }
      />

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* ── Portfolio hero ── */}
        <Card style={{ position: "relative", overflow: "hidden", padding: 18 }}>
          <View style={[s.heroGlow, { backgroundColor: colors.accentDim }]} />
          <Text style={[s.heroLabel, { color: colors.text2 }]}>Total portfolio</Text>
          {walletData.loading && !vault ? (
            <ActivityIndicator color={colors.accent} style={{ marginVertical: 8 }} />
          ) : (
            <Text style={[s.heroBal, { color: colors.text }]}>
              ${fmtUSD(totalUsd || 0)}
            </Text>
          )}
          <View style={s.toks}>
            <View style={s.tok}>
              <View style={[s.tokDot, { backgroundColor: colors.accent }]} />
              <Text style={[s.tokText, { color: colors.text2 }]}>{walletData.suiBalance.toFixed(3)} SUI</Text>
            </View>
            <View style={s.tok}>
              <View style={[s.tokDot, { backgroundColor: "#4A8FD4" }]} />
              <Text style={[s.tokText, { color: colors.text2 }]}>{walletData.deepBalance.toFixed(2)} DEEP</Text>
            </View>
            {gainPct !== 0 && (
              <View style={[s.chip, { backgroundColor: gainPct >= 0 ? "rgba(76,175,80,0.15)" : "rgba(212,75,42,0.15)" }]}>
                <Ionicons name={gainPct >= 0 ? "trending-up-outline" : "trending-down-outline"} size={13} color={gainPct >= 0 ? "#4CAF50" : "#D44B2A"} />
                <Text style={[s.chipText, { color: gainPct >= 0 ? "#4CAF50" : "#D44B2A" }]}>{gainPct >= 0 ? "+" : ""}{gainPct.toFixed(2)}%</Text>
              </View>
            )}
          </View>
        </Card>

        {/* ── Price strip ── */}
        <Card style={{ padding: 14 }}>
          <View style={s.pfTop}>
            <Text style={[s.pfLabel, { color: colors.text2 }]}>SUI price</Text>
            <Text style={[s.pfPeriod, { color: colors.text3 }]}>DeepBook testnet</Text>
          </View>
          <View style={s.pfRow}>
            <View>
              <Text style={[s.pfGain, { color: colors.text }]}>${priceData.price.toFixed(4)}</Text>
              <Text style={[s.pfSub, { color: colors.text2 }]}>
                DEEP ${priceData.deepPrice.toFixed(6)} · Vol {fmtNum(Math.round(priceData.volume24h))} SUI
              </Text>
            </View>
            {priceData.change24h !== 0 && (
              <View style={[s.chip, { backgroundColor: priceData.change24h >= 0 ? "rgba(76,175,80,0.15)" : "rgba(212,75,42,0.15)" }]}>
                <Text style={{ color: priceData.change24h >= 0 ? "#4CAF50" : "#D44B2A", fontSize: 12, fontWeight: "700" }}>
                  {priceData.change24h >= 0 ? "+" : ""}{priceData.change24h.toFixed(2)}%
                </Text>
              </View>
            )}
          </View>
          <Sparkline prices={sparkPrices} />
        </Card>

        {/* ── Active agent hero ── */}
        <SectionHead action="All agents" onAction={onViewAgents}>Active agent</SectionHead>
        <Card accent style={{ padding: 20 }}>
          <View style={s.agentTop}>
            <View style={s.agentLeft}>
              <View style={[s.ava, { backgroundColor: colors.accentDim }]}>
                <Ionicons name="hardware-chip-outline" size={22} color={colors.accent} />
              </View>
              <View>
                <Text style={[s.agentName, { color: colors.text }]}>{liveAgent.name}</Text>
                <Text style={[s.agentMeta, { color: colors.text2 }]}>{liveAgent.strategy} · {liveAgent.pair}</Text>
              </View>
            </View>
            <Badge status={liveAgent.status} />
          </View>

          <View style={s.ringRow}>
            <CircularProgress
              value={vault?.spent ?? 0} max={vault?.budgetCap ?? 1}
              size={132} stroke={11}
              valueText={vault ? `${vault.spent.toFixed(3)} / ${vault.budgetCap.toFixed(2)}` : "—"}
              caption="SUI used"
              tone={pct > 90 ? "danger" : "brand"}
            />
            <View style={s.miniStats}>
              {[
                { icon: "repeat-outline",      label: "Trades",   val: String(tradeData.count) },
                { icon: "layers-outline",       label: "DEEP acc", val: walletData.deepBalance.toFixed(2) },
                { icon: "cash-outline",         label: "P&L",      val: `${tradeData.pnl >= 0 ? "+" : ""}${tradeData.pnl.toFixed(4)} SUI`, green: tradeData.pnl >= 0 },
              ].map(({ icon, label, val, green }) => (
                <View key={label} style={s.miniStat}>
                  <View style={s.miniStatLeft}>
                    <Ionicons name={icon as any} size={14} color={colors.text2} />
                    <Text style={[s.miniK, { color: colors.text2 }]}>{label}</Text>
                  </View>
                  <Text style={[s.miniV, { color: green ? "#4CAF50" : colors.text }]}>{val}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={s.agentBtns}>
            <Button variant="secondary" size="sm" block onPress={onViewAgent}>View details</Button>
          </View>
        </Card>

        {/* ── Quick stats ── */}
        <View style={s.statGrid}>
          {[
            { label: "SUI price",   val: `$${priceData.price.toFixed(4)}` },
            { label: "Total trades", val: String(tradeData.count) },
            { label: "ROI",         val: `${tradeData.roi >= 0 ? "+" : ""}${tradeData.roi.toFixed(1)}%`, green: tradeData.roi >= 0 },
          ].map(({ label, val, green }) => (
            <Card key={label} style={[s.statCard, { padding: 14 }]}>
              <Text style={[s.statK, { color: colors.text2 }]}>{label}</Text>
              <Text style={[s.statV, { color: green ? "#4CAF50" : colors.text }]}>{val}</Text>
            </Card>
          ))}
        </View>

        {/* ── Recent trades ── */}
        <SectionHead action="View all" onAction={onViewActivity}>Recent trades</SectionHead>
        <Card style={{ padding: 4 }}>
          {tradeData.loading && recentTxs.length === 0 ? (
            <ActivityIndicator color={colors.accent} style={{ padding: 20 }} />
          ) : recentTxs.length === 0 ? (
            <Text style={[s.empty, { color: colors.text2 }]}>No trades yet</Text>
          ) : (
            recentTxs.map((tx) => (
              <View key={tx.id} style={[s.txRow, { borderBottomColor: colors.border }]}>
                <View style={[s.txIco, { backgroundColor: "rgba(76,175,80,0.12)" }]}>
                  <Ionicons name="arrow-down-outline" size={14} color="#4CAF50" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[s.txPair, { color: colors.text }]}>{tx.pair}</Text>
                  <Text style={[s.txTime, { color: colors.text3 }]}>{tx.time}</Text>
                </View>
                <View style={{ alignItems: "flex-end" }}>
                  <Text style={[s.txAmt, { color: "#4CAF50" }]}>{tx.amount}</Text>
                  <Text style={[s.txVal, { color: colors.text2 }]}>{tx.value}</Text>
                </View>
              </View>
            ))
          )}
        </Card>

        <View style={{ height: 16 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root:      { flex: 1 },
  scroll:    { padding: 14, gap: 12 },

  heroGlow:  { position: "absolute", width: 200, height: 200, borderRadius: 100, top: -60, right: -40, opacity: 0.6 },
  heroLabel: { fontSize: 12, marginBottom: 4 },
  heroBal:   { fontSize: 36, fontWeight: "800", letterSpacing: -1 },
  toks:      { flexDirection: "row", alignItems: "center", gap: 12, marginTop: 10, flexWrap: "wrap" },
  tok:       { flexDirection: "row", alignItems: "center", gap: 5 },
  tokDot:    { width: 8, height: 8, borderRadius: 4 },
  tokText:   { fontSize: 13 },
  chip:      { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 100 },
  chipText:  { fontSize: 12, fontWeight: "700" },

  pfTop:    { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  pfLabel:  { fontSize: 12 },
  pfPeriod: { fontSize: 12 },
  pfRow:    { marginTop: 8, flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  pfGain:   { fontSize: 22, fontWeight: "800", letterSpacing: -0.5 },
  pfSub:    { fontSize: 11, marginTop: 2 },

  agentTop:  { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16 },
  agentLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  ava:       { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  agentName: { fontSize: 15, fontWeight: "700" },
  agentMeta: { fontSize: 12, marginTop: 2 },
  ringRow:   { flexDirection: "row", alignItems: "center", gap: 18 },
  miniStats: { flex: 1, gap: 12 },
  miniStat:  { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  miniStatLeft: { flexDirection: "row", alignItems: "center", gap: 5 },
  miniK:     { fontSize: 12 },
  miniV:     { fontSize: 13, fontWeight: "700" },
  agentBtns: { flexDirection: "row", gap: 10, marginTop: 18 },

  statGrid: { flexDirection: "row", gap: 10 },
  statCard: { flex: 1 },
  statK:    { fontSize: 11, marginBottom: 6 },
  statV:    { fontSize: 20, fontWeight: "800", letterSpacing: -0.5 },

  empty:    { textAlign: "center", padding: 20, fontSize: 14 },
  txRow:    { flexDirection: "row", alignItems: "center", gap: 12, padding: 12, borderBottomWidth: StyleSheet.hairlineWidth },
  txIco:    { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  txPair:   { fontSize: 14, fontWeight: "600" },
  txTime:   { fontSize: 12, marginTop: 2 },
  txAmt:    { fontSize: 14, fontWeight: "700" },
  txVal:    { fontSize: 12, marginTop: 2 },
});
