import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useColorTheme } from "../lib/ThemeContext";
import { getTheme } from "../theme";
import type { Tx } from "../lib/data";
import type { Vault } from "../lib/useOnchain";

interface Props {
  price:        number;
  deepPrice:    number;
  change24h:    number;
  deepChange24h:number;
  high24h:      number;
  low24h:       number;
  volume24h:    number;
  suiBalance:   number;
  usdcBalance:  number;
  deepBalance:  number;
  vault:        Vault | null;
  trades:       Tx[];
  pnl:          number;
  roi:          number;
  count:        number;
  loading:      boolean;
}

function Skeleton({ w = 80, h = 20 }: { w?: number | string; h?: number }) {
  const { isDark } = useColorTheme();
  const { colors } = getTheme(isDark);
  return <View style={{ width: w as any, height: h, borderRadius: 5, backgroundColor: colors.bgSoft3 }} />;
}

function usd(n: number, d = 2) {
  return "$" + n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
}

function StatPill({ label, value, sub, color, loading: load }: {
  label: string; value: string; sub?: string; color?: string; loading?: boolean;
}) {
  const { isDark } = useColorTheme();
  const { colors } = getTheme(isDark);
  return (
    <View style={[sp.card, { backgroundColor: colors.bg3, borderColor: colors.border }]}>
      <Text style={[sp.label, { color: colors.text3 }]}>{label}</Text>
      {load ? <Skeleton w={100} h={26} /> : (
        <Text style={[sp.value, color ? { color } : { color: colors.text }]}>{value}</Text>
      )}
      {sub && !load && <Text style={[sp.sub, { color: colors.text3 }]}>{sub}</Text>}
    </View>
  );
}

function MarketRow({ label, value, change, loading: load }: { label: string; value: string; change?: number; loading?: boolean }) {
  const { isDark } = useColorTheme();
  const { colors } = getTheme(isDark);
  return (
    <View style={[mr.row, { borderBottomColor: colors.border }]}>
      <Text style={[mr.label, { color: colors.text2 }]}>{label}</Text>
      {load ? <Skeleton w={70} h={16} /> : (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <Text style={[mr.value, { color: colors.text, fontFamily: "monospace" }]}>{value}</Text>
          {change !== undefined && (
            <Text style={[mr.change, { color: change >= 0 ? colors.accent : colors.red, fontFamily: "monospace" }]}>
              {change >= 0 ? "+" : ""}{change.toFixed(2)}%
            </Text>
          )}
        </View>
      )}
    </View>
  );
}

export function AnalyticsScreen({ price, deepPrice, change24h, deepChange24h, high24h, low24h, volume24h, suiBalance, usdcBalance, deepBalance, vault, trades, pnl, roi, count, loading }: Props) {
  const { isDark } = useColorTheme();
  const { colors } = getTheme(isDark);

  const spent    = vault?.spent ?? 0;
  const budgetCap = vault?.budgetCap ?? 0;
  const totalVal = suiBalance * price + usdcBalance + deepBalance * deepPrice;

  const totalDeepAcc = trades.reduce((s, t) => s + Number(t.amount.replace("+", "").replace(" DEEP", "")), 0);
  const totalSuiSpent = trades.reduce((s, t) => s + Number(t.value.replace(" SUI", "")), 0);
  const avgBuyPrice = totalDeepAcc > 0 ? totalSuiSpent / totalDeepAcc : 0;
  const currentDeepValSui = totalDeepAcc * (deepPrice / (price || 1));
  const unrealisedSui = currentDeepValSui - totalSuiSpent;

  const allocs = [
    { sym: "SUI",  usdVal: suiBalance * price,    color: "#6FBCF0" },
    { sym: "USDC", usdVal: usdcBalance,            color: "#2775CA" },
    { sym: "DEEP", usdVal: deepBalance * deepPrice, color: colors.accent },
  ];
  const totalAlloc = allocs.reduce((s, a) => s + a.usdVal, 0) || 1;

  return (
    <View style={[s.root, { backgroundColor: colors.bg }]}>
      <View style={[s.header, { borderBottomColor: colors.border }]}>
        <Text style={[s.pageTitle, { color: colors.text }]}>Analytics</Text>
        <Text style={[s.pageSub, { color: colors.text2 }]}>Portfolio & agent performance · Sui testnet</Text>
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* Key stats */}
        <View style={s.statGrid}>
          <StatPill label="Total value"      value={usd(totalVal, 2)}              loading={loading} />
          <StatPill label="Total trades"     value={String(count)}                  loading={loading} />
          <StatPill label="Unrealised P&L"   value={`${pnl >= 0 ? "+" : ""}${usd(pnl, 4)}`}
            color={pnl >= 0 ? colors.accent : colors.red}                           loading={loading} />
          <StatPill label="ROI"              value={`${roi >= 0 ? "+" : ""}${roi.toFixed(2)}%`}
            color={roi >= 0 ? colors.accent : colors.red}                           loading={loading} />
          <StatPill label="DEEP accumulated" value={totalDeepAcc > 0 ? totalDeepAcc.toFixed(4) : "—"} loading={loading} />
          <StatPill label="Avg buy price"    value={avgBuyPrice > 0 ? usd(avgBuyPrice, 6) : "—"}      loading={loading} />
        </View>

        {/* Market data */}
        <View style={[s.panel, { backgroundColor: colors.bg3, borderColor: colors.border }]}>
          <Text style={[s.panelTitle, { color: colors.text }]}>Market data</Text>
          <MarketRow label="SUI / USDC"    value={usd(price, 4)}      change={change24h}     loading={loading} />
          <MarketRow label="DEEP / SUI"    value={usd(deepPrice, 6)}  change={deepChange24h} loading={loading} />
          <MarketRow label="24h High"      value={usd(high24h, 4)}                           loading={loading} />
          <MarketRow label="24h Low"       value={usd(low24h, 4)}                            loading={loading} />
          <MarketRow label="24h Volume"    value={volume24h > 0 ? usd(volume24h, 0) : "—"}  loading={loading} />
        </View>

        {/* Vault state */}
        {vault && (
          <View style={[s.panel, { backgroundColor: colors.bg3, borderColor: colors.border }]}>
            <Text style={[s.panelTitle, { color: colors.text }]}>Vault performance</Text>
            <MarketRow label="Budget spent"   value={`${spent.toFixed(4)} SUI`}    />
            <MarketRow label="Budget cap"     value={`${budgetCap.toFixed(4)} SUI`} />
            <MarketRow label="Budget used"    value={`${budgetCap > 0 ? ((spent / budgetCap) * 100).toFixed(1) : 0}%`} />
            <MarketRow label="Unrealised SUI" value={`${unrealisedSui >= 0 ? "+" : ""}${unrealisedSui.toFixed(4)} SUI`} />
          </View>
        )}

        {/* Portfolio allocation */}
        <View style={[s.panel, { backgroundColor: colors.bg3, borderColor: colors.border }]}>
          <Text style={[s.panelTitle, { color: colors.text }]}>Portfolio allocation</Text>
          {allocs.map(({ sym, usdVal, color }) => {
            const pct = Math.round((usdVal / totalAlloc) * 100);
            return (
              <View key={sym} style={s.allocRow}>
                <View style={[s.allocDot, { backgroundColor: color }]} />
                <Text style={[s.allocSym, { color: colors.text }]}>{sym}</Text>
                <View style={[s.allocTrack, { backgroundColor: colors.bgSoft3 }]}>
                  <View style={[s.allocFill, { width: `${pct}%` as any, backgroundColor: color }]} />
                </View>
                <Text style={[s.allocPct, { color: colors.text2, fontFamily: "monospace" }]}>{pct}%</Text>
              </View>
            );
          })}
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </View>
  );
}

const sp = StyleSheet.create({
  card:  { width: "48%", flexGrow: 1, borderRadius: 12, borderWidth: 1, padding: 14, gap: 4 },
  label: { fontSize: 11, fontWeight: "700", letterSpacing: 0.6, textTransform: "uppercase", marginBottom: 4 },
  value: { fontSize: 20, fontWeight: "700", letterSpacing: -0.3 },
  sub:   { fontSize: 12, marginTop: 4 },
});

const mr = StyleSheet.create({
  row:    { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 11, borderBottomWidth: StyleSheet.hairlineWidth },
  label:  { fontSize: 13 },
  value:  { fontSize: 14, fontWeight: "600" },
  change: { fontSize: 12 },
});

const s = StyleSheet.create({
  root:   { flex: 1 },
  scroll: { padding: 16, gap: 14 },
  header:    { paddingHorizontal: 16, paddingTop: 10, paddingBottom: 12, borderBottomWidth: StyleSheet.hairlineWidth },
  pageTitle: { fontSize: 22, fontWeight: "700", letterSpacing: -0.4 },
  pageSub:   { fontSize: 13, marginTop: 2 },
  statGrid:  { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  panel:     { borderRadius: 14, borderWidth: 1, padding: 16 },
  panelTitle:{ fontSize: 15, fontWeight: "600", marginBottom: 12 },
  allocRow:  { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 10 },
  allocDot:  { width: 8, height: 8, borderRadius: 4 },
  allocSym:  { fontSize: 13, fontWeight: "600", width: 40 },
  allocTrack:{ flex: 1, height: 6, borderRadius: 3, overflow: "hidden" },
  allocFill: { height: "100%", borderRadius: 3 },
  allocPct:  { fontSize: 13, width: 36, textAlign: "right" },
});
