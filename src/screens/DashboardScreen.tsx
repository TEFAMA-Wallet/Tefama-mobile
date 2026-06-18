import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Defs, LinearGradient as SvgGrad, Path, Stop } from "react-native-svg";
import { useColorTheme } from "../lib/ThemeContext";
import { getTheme } from "../theme";
import { useAuth } from "../lib/AuthContext";
import type { usePrice, useWallet, useTrades } from "../lib/useOnchain";

type PriceData  = ReturnType<typeof usePrice>;
type WalletData = ReturnType<typeof useWallet>;
type TradeData  = ReturnType<typeof useTrades>;

type Tx = {
  id: string; time: string; type: "Buy" | "Sell"; pair: string;
  amount: string; value: string; price: string;
  status: "confirmed" | "pending" | "failed";
  gas: string; hash: string; agent: string;
};

import type { Agent } from "../lib/data";

interface Props {
  priceData:      PriceData;
  walletData:     WalletData;
  tradeData:      TradeData;
  liveAgent:      Agent;
  onViewAgent:    () => void;
  onViewAgents:   () => void;
  onViewActivity: () => void;
  onViewTx:       (tx: Tx) => void;
}

function MiniSparkline({ prices }: { prices: number[] }) {
  const { isDark } = useColorTheme();
  const { colors } = getTheme(isDark);
  if (prices.length < 2) return <View style={{ height: 32 }} />;
  const W = 120, H = 32;
  const max = Math.max(...prices), min = Math.min(...prices);
  const pts = prices.map((v, i) => [
    (i / (prices.length - 1)) * W,
    H - 2 - ((v - min) / ((max - min) || 1)) * (H - 6),
  ]);
  const line = pts.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" ");
  const area = `${line} L${W} ${H} L0 ${H} Z`;
  return (
    <Svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
      <Defs>
        <SvgGrad id="ms" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%"   stopColor="rgba(255,255,255,0.3)" />
          <Stop offset="100%" stopColor="rgba(255,255,255,0)"   />
        </SvgGrad>
      </Defs>
      <Path d={area} fill="url(#ms)" />
      <Path d={line} fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function firstWord(name: string) {
  return name.split(" ")[0] || name;
}

export function DashboardScreen({
  priceData, walletData, tradeData, liveAgent,
  onViewAgent, onViewAgents, onViewActivity, onViewTx,
}: Props) {
  const { isDark } = useColorTheme();
  const { colors } = getTheme(isDark);
  const { session } = useAuth();

  const vault     = walletData.vault;
  const pct       = vault ? Math.min((vault.spent / (vault.budgetCap || 1)) * 100, 100) : 0;
  const deepValue = walletData.deepBalance * priceData.deepPrice;
  const totalUsd  = walletData.suiBalance * priceData.price + walletData.usdcBalance + deepValue;
  const isActive  = liveAgent.status === "active";

  const sparkPrices = tradeData.trades.slice(-10).reverse().map(t => t.price);

  const recentTxs = tradeData.trades.slice(0, 3).map(t => ({
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

  const greeting = session?.name ? `Hey, ${firstWord(session.name)}` : "TEFAMA";

  return (
    <View style={[s.root, { backgroundColor: colors.bg }]}>

      {/* ── Custom header ── */}
      <View style={s.header}>
        <View>
          <Text style={[s.greeting, { color: colors.text2 }]}>{greeting}</Text>
          <Text style={[s.headerTitle, { color: colors.text }]}>Your portfolio</Text>
        </View>
        <View style={s.headerRight}>
          {priceData.loading ? <ActivityIndicator size="small" color={colors.accent} /> : null}
          <Pressable style={[s.iconBtn, { backgroundColor: colors.accentDim }]} hitSlop={8}>
            <Ionicons name="notifications-outline" size={20} color={colors.accent} />
          </Pressable>
        </View>
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* ── Agent hero card (gradient) ── */}
        <LinearGradient
          colors={isActive ? ["#1A0900", "#FF8C0020"] : ["#160C00", "#160C00"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[s.heroCard, { borderColor: isActive ? "rgba(255,140,0,0.30)" : colors.border }]}
        >
          {/* Agent status row */}
          <View style={s.heroTop}>
            <View style={s.heroLeft}>
              <View style={[s.agentDot, { backgroundColor: isActive ? "#4CAF50" : colors.text3 }]} />
              <Text style={s.agentLabel}>{liveAgent.name}</Text>
              <View style={[s.statusPill, { backgroundColor: isActive ? "rgba(76,175,80,0.18)" : "rgba(245,240,232,0.08)" }]}>
                <Text style={[s.statusText, { color: isActive ? "#4CAF50" : colors.text2 }]}>
                  {isActive ? "ACTIVE" : liveAgent.status.toUpperCase()}
                </Text>
              </View>
            </View>
            <MiniSparkline prices={sparkPrices} />
          </View>

          {/* Budget bar */}
          <View style={s.budgetSection}>
            <View style={s.budgetRow}>
              <Text style={s.budgetLabel}>Budget used</Text>
              <Text style={s.budgetPct}>{pct.toFixed(0)}%</Text>
            </View>
            <View style={s.barTrack}>
              <View style={[s.barFill, {
                width: `${pct}%` as any,
                backgroundColor: pct > 90 ? "#D44B2A" : pct > 70 ? "#FFB300" : "#FF8C00",
              }]} />
            </View>
            <View style={s.budgetNums}>
              <Text style={s.budgetSpent}>{vault ? vault.spent.toFixed(3) : "—"} SUI spent</Text>
              <Text style={s.budgetCap}>/ {vault ? vault.budgetCap.toFixed(2) : "—"} SUI cap</Text>
            </View>
          </View>

          {/* Mini stats */}
          <View style={s.heroStats}>
            {[
              { label: "Trades",   val: String(tradeData.count || "—") },
              { label: "DEEP acc", val: walletData.deepBalance > 0 ? walletData.deepBalance.toFixed(1) : "—" },
              { label: "P&L",      val: tradeData.pnl !== 0 ? `${tradeData.pnl > 0 ? "+" : ""}${tradeData.pnl.toFixed(3)}` : "—", green: tradeData.pnl > 0 },
            ].map(({ label, val, green }) => (
              <View key={label} style={s.heroStat}>
                <Text style={s.heroStatK}>{label}</Text>
                <Text style={[s.heroStatV, green ? { color: "#4CAF50" } : {}]}>{val}</Text>
              </View>
            ))}
          </View>

          <Pressable style={s.heroBtn} onPress={onViewAgent}>
            <Text style={s.heroBtnText}>View agent</Text>
            <Ionicons name="chevron-forward" size={14} color="#FF8C00" />
          </Pressable>
        </LinearGradient>

        {/* ── Balances ── */}
        <View style={[s.balCard, { backgroundColor: colors.bg2, borderColor: colors.border }]}>
          <Text style={[s.balTitle, { color: colors.text2 }]}>Wallet balances</Text>
          {walletData.loading && walletData.suiBalance === 0 ? (
            <ActivityIndicator color={colors.accent} style={{ marginVertical: 12 }} />
          ) : (
            <>
              {[
                { symbol: "SUI",  amount: walletData.suiBalance,  usd: walletData.suiBalance * priceData.price,  color: colors.accent },
                { symbol: "DEEP", amount: walletData.deepBalance, usd: deepValue,                                 color: "#7EC86A"     },
                { symbol: "USDC", amount: walletData.usdcBalance, usd: walletData.usdcBalance,                    color: "#4A8FD4"     },
              ].map(({ symbol, amount, usd, color }, i, arr) => (
                <View key={symbol} style={[s.balRow, i < arr.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border }]}>
                  <View style={[s.balDot, { backgroundColor: color }]} />
                  <Text style={[s.balSymbol, { color: colors.text }]}>{symbol}</Text>
                  <Text style={[s.balAmount, { color: colors.text2 }]}>{amount.toFixed(3)}</Text>
                  <Text style={[s.balUsd, { color: colors.text }]}>${usd.toFixed(2)}</Text>
                </View>
              ))}
              <View style={[s.balTotal, { borderTopColor: colors.border2 }]}>
                <Text style={[s.balTotalLabel, { color: colors.text2 }]}>Total</Text>
                <Text style={[s.balTotalVal, { color: colors.text }]}>${totalUsd.toFixed(2)}</Text>
              </View>
            </>
          )}
        </View>

        {/* ── Price strip ── */}
        <View style={s.priceRow}>
          {[
            { symbol: "SUI", price: priceData.price, change: priceData.change24h },
            { symbol: "DEEP", price: priceData.deepPrice, change: priceData.deepChange24h },
          ].map(({ symbol, price, change }) => {
            const up = change >= 0;
            return (
              <View key={symbol} style={[s.priceChip, { backgroundColor: colors.bg2, borderColor: colors.border }]}>
                <Text style={[s.priceSymbol, { color: colors.text }]}>{symbol}</Text>
                <Text style={[s.priceVal, { color: colors.text }]}>${price < 1 ? price.toFixed(5) : price.toFixed(4)}</Text>
                <View style={[s.changePill, { backgroundColor: up ? "rgba(76,175,80,0.14)" : "rgba(212,75,42,0.14)" }]}>
                  <Ionicons name={up ? "trending-up" : "trending-down"} size={10} color={up ? "#4CAF50" : "#D44B2A"} />
                  <Text style={[s.changeText, { color: up ? "#4CAF50" : "#D44B2A" }]}>{up ? "+" : ""}{change.toFixed(2)}%</Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* ── Recent trades ── */}
        <View style={s.section}>
          <View style={s.sectionHead}>
            <Text style={[s.sectionTitle, { color: colors.text }]}>Recent trades</Text>
            <Pressable onPress={onViewActivity} style={s.seeAll}>
              <Text style={[s.seeAllText, { color: colors.accent }]}>See all</Text>
              <Ionicons name="chevron-forward" size={13} color={colors.accent} />
            </Pressable>
          </View>

          {tradeData.loading && recentTxs.length === 0 ? (
            <View style={[s.tradesCard, { backgroundColor: colors.bg2, borderColor: colors.border }]}>
              <ActivityIndicator color={colors.accent} style={{ padding: 24 }} />
            </View>
          ) : recentTxs.length === 0 ? (
            <View style={[s.emptyCard, { backgroundColor: colors.bg2, borderColor: colors.border }]}>
              <Ionicons name="receipt-outline" size={28} color={colors.text3} />
              <Text style={[s.emptyText, { color: colors.text2 }]}>No trades yet</Text>
            </View>
          ) : (
            <View style={[s.tradesCard, { backgroundColor: colors.bg2, borderColor: colors.border }]}>
              {recentTxs.map((tx, i) => (
                <Pressable key={tx.id} onPress={() => onViewTx(tx)}
                  style={[s.tradeRow, i < recentTxs.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border }]}>
                  <View style={s.tradeIco}>
                    <Ionicons name="arrow-down" size={13} color="#4CAF50" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[s.tradePair, { color: colors.text }]}>{tx.pair}</Text>
                    <Text style={[s.tradeTime, { color: colors.text3 }]}>{tx.time} · DCA</Text>
                  </View>
                  <View style={{ alignItems: "flex-end" }}>
                    <Text style={[s.tradeAmt, { color: "#4CAF50" }]}>{tx.amount}</Text>
                    <Text style={[s.tradeVal, { color: colors.text2 }]}>{tx.value}</Text>
                  </View>
                </Pressable>
              ))}
            </View>
          )}
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </View>
  );
}

const HERO_BORDER_R = 20;

const s = StyleSheet.create({
  root:    { flex: 1 },
  scroll:  { padding: 16, gap: 14 },

  // Header
  header:      { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingTop: 10, paddingBottom: 6 },
  greeting:    { fontSize: 12, fontWeight: "500", marginBottom: 1 },
  headerTitle: { fontSize: 22, fontWeight: "800", letterSpacing: -0.5 },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 8 },
  iconBtn:     { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },

  // Hero agent card
  heroCard:      { borderRadius: HERO_BORDER_R, borderWidth: 1, padding: 18, gap: 14 },
  heroTop:       { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  heroLeft:      { flexDirection: "row", alignItems: "center", gap: 8 },
  agentDot:      { width: 8, height: 8, borderRadius: 4 },
  agentLabel:    { color: "rgba(245,240,232,0.85)", fontSize: 14, fontWeight: "700" },
  statusPill:    { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 100 },
  statusText:    { fontSize: 10, fontWeight: "800", letterSpacing: 0.8 },

  budgetSection: { gap: 6 },
  budgetRow:     { flexDirection: "row", justifyContent: "space-between" },
  budgetLabel:   { color: "rgba(245,240,232,0.50)", fontSize: 12 },
  budgetPct:     { color: "rgba(245,240,232,0.85)", fontSize: 12, fontWeight: "700" },
  barTrack:      { height: 5, backgroundColor: "rgba(255,255,255,0.08)", borderRadius: 3, overflow: "hidden" },
  barFill:       { height: "100%", borderRadius: 3 },
  budgetNums:    { flexDirection: "row", gap: 4 },
  budgetSpent:   { color: "rgba(245,240,232,0.85)", fontSize: 12, fontWeight: "600" },
  budgetCap:     { color: "rgba(245,240,232,0.40)", fontSize: 12 },

  heroStats:  { flexDirection: "row", gap: 0 },
  heroStat:   { flex: 1, alignItems: "center", paddingVertical: 10, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: "rgba(255,255,255,0.08)" },
  heroStatK:  { color: "rgba(245,240,232,0.45)", fontSize: 10, fontWeight: "600", marginBottom: 3 },
  heroStatV:  { color: "rgba(245,240,232,0.90)", fontSize: 15, fontWeight: "800" },

  heroBtn:     { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 4, paddingVertical: 10, borderRadius: 12, backgroundColor: "rgba(255,140,0,0.12)", borderWidth: 1, borderColor: "rgba(255,140,0,0.22)" },
  heroBtnText: { color: "#FF8C00", fontSize: 14, fontWeight: "700" },

  // Balances
  balCard:    { borderRadius: 16, borderWidth: 1, padding: 16 },
  balTitle:   { fontSize: 12, fontWeight: "600", marginBottom: 10 },
  balRow:     { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 11 },
  balDot:     { width: 8, height: 8, borderRadius: 4 },
  balSymbol:  { fontSize: 14, fontWeight: "700", width: 44 },
  balAmount:  { flex: 1, fontSize: 13 },
  balUsd:     { fontSize: 14, fontWeight: "600" },
  balTotal:   { flexDirection: "row", justifyContent: "space-between", paddingTop: 12, marginTop: 4, borderTopWidth: 1 },
  balTotalLabel: { fontSize: 13, fontWeight: "600" },
  balTotalVal:   { fontSize: 16, fontWeight: "800" },

  // Price strip
  priceRow:    { flexDirection: "row", gap: 10 },
  priceChip:   { flex: 1, borderRadius: 14, borderWidth: 1, padding: 14, gap: 4 },
  priceSymbol: { fontSize: 12, fontWeight: "700" },
  priceVal:    { fontSize: 18, fontWeight: "800", letterSpacing: -0.5 },
  changePill:  { flexDirection: "row", alignItems: "center", gap: 3, paddingHorizontal: 6, paddingVertical: 3, borderRadius: 100, alignSelf: "flex-start" },
  changeText:  { fontSize: 11, fontWeight: "700" },

  // Section
  section:     { gap: 10 },
  sectionHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  sectionTitle:{ fontSize: 16, fontWeight: "700" },
  seeAll:      { flexDirection: "row", alignItems: "center", gap: 2 },
  seeAllText:  { fontSize: 13, fontWeight: "600" },

  // Trades
  tradesCard:  { borderRadius: 16, borderWidth: 1, overflow: "hidden" },
  emptyCard:   { borderRadius: 16, borderWidth: 1, padding: 32, alignItems: "center", gap: 10 },
  emptyText:   { fontSize: 14 },
  tradeRow:    { flexDirection: "row", alignItems: "center", gap: 12, padding: 14 },
  tradeIco:    { width: 30, height: 30, borderRadius: 15, backgroundColor: "rgba(76,175,80,0.12)", alignItems: "center", justifyContent: "center" },
  tradePair:   { fontSize: 14, fontWeight: "600" },
  tradeTime:   { fontSize: 11, marginTop: 2 },
  tradeAmt:    { fontSize: 14, fontWeight: "700" },
  tradeVal:    { fontSize: 11, marginTop: 2 },
});
