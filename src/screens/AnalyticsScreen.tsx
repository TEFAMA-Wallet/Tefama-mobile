import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useColorTheme } from "../lib/ThemeContext";
import { getTheme } from "../theme";
import type { Tx } from "../lib/data";
import type { Vault } from "../lib/useOnchain";

interface Props {
  price:         number;
  deepPrice:     number;
  change24h:     number;
  deepChange24h: number;
  high24h:       number;
  low24h:        number;
  volume24h:     number;
  suiBalance:    number;
  usdcBalance:   number;
  deepBalance:   number;
  vault:         Vault | null;
  trades:        Tx[];
  pnl:           number;
  roi:           number;
  count:         number;
  loading:       boolean;
}

function Skeleton({ w = 80, h = 20 }: { w?: number | string; h?: number }) {
  const { isDark } = useColorTheme();
  const { colors } = getTheme(isDark);
  return <View style={{ width: w as any, height: h, borderRadius: 5, backgroundColor: colors.bgSoft3 }} />;
}

function usd(n: number, d = 2) {
  return "$" + n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
}

function Row({ label, value, valueColor, change, loading: load }: {
  label: string; value: string; valueColor?: string; change?: number; loading?: boolean;
}) {
  const { isDark } = useColorTheme();
  const { colors } = getTheme(isDark);
  return (
    <View style={[r.row, { borderBottomColor: colors.border }]}>
      <Text style={[r.label, { color: colors.text2 }]}>{label}</Text>
      {load ? <Skeleton w={80} h={15} /> : (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Text style={[r.value, { color: valueColor ?? colors.text, fontFamily: "monospace" }]}>{value}</Text>
          {change !== undefined && (
            <Text style={[r.change, { color: change >= 0 ? colors.accent : colors.red }]}>
              {change >= 0 ? "+" : ""}{change.toFixed(2)}%
            </Text>
          )}
        </View>
      )}
    </View>
  );
}

export function AnalyticsScreen({
  price, deepPrice, change24h, deepChange24h,
  high24h, low24h, volume24h,
  suiBalance, usdcBalance, deepBalance,
  vault, trades, pnl, roi, count, loading,
}: Props) {
  const { isDark } = useColorTheme();
  const { colors } = getTheme(isDark);

  const totalDeepAcc   = trades.reduce((s, t) => s + Number(t.amount.replace("+", "").replace(" DEEP", "")), 0);
  const totalSuiSpent  = trades.reduce((s, t) => s + Number(t.value.replace(" SUI", "")), 0);
  const avgBuyPrice    = totalDeepAcc > 0 ? totalSuiSpent / totalDeepAcc : 0;
  const currentDeepVal = totalDeepAcc * (deepPrice / (price || 1));
  const unrealisedSui  = currentDeepVal - totalSuiSpent;

  const allocs = [
    { sym: "SUI",  usdVal: suiBalance * price,     color: "#6FBCF0" },
    { sym: "USDC", usdVal: usdcBalance,             color: "#2775CA" },
    { sym: "DEEP", usdVal: deepBalance * deepPrice, color: colors.accent },
  ];
  const totalAlloc = allocs.reduce((s, a) => s + a.usdVal, 0) || 1;

  return (
    <View style={[s.root, { backgroundColor: colors.bg }]}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* ── Market data ── */}
        <View style={[s.panel, { backgroundColor: colors.bg3, borderColor: colors.border }]}>
          <Text style={[s.panelTitle, { color: colors.text }]}>Market</Text>
          <Row label="SUI / USDC"  value={usd(price, 4)}     change={change24h}     loading={loading} />
          <Row label="DEEP / SUI"  value={usd(deepPrice, 6)} change={deepChange24h} loading={loading} />
          <Row label="24h High"    value={usd(high24h, 4)}                          loading={loading} />
          <Row label="24h Low"     value={usd(low24h, 4)}                           loading={loading} />
          <Row
            label="24h Volume"
            value={volume24h > 0 ? usd(volume24h, 0) : "—"}
            loading={loading}
          />
        </View>

        {/* ── DCA performance ── */}
        <View style={[s.panel, { backgroundColor: colors.bg3, borderColor: colors.border }]}>
          <Text style={[s.panelTitle, { color: colors.text }]}>DCA Performance</Text>
          <Row label="Trade count"    value={String(count)}                                                         loading={loading} />
          <Row label="Success rate"   value={count > 0 ? "100%" : "—"}                                             loading={loading} />
          <Row label="Total invested" value={totalSuiSpent > 0 ? `${totalSuiSpent.toFixed(4)} SUI` : "—"}         loading={loading} />
          <Row label="DEEP acquired"  value={totalDeepAcc > 0 ? `${totalDeepAcc.toFixed(4)} DEEP` : "—"}          loading={loading} />
          <Row label="Avg buy price"  value={avgBuyPrice > 0 ? usd(avgBuyPrice, 6) : "—"}                         loading={loading} />
          <Row label="Current value"  value={currentDeepVal > 0 ? `${currentDeepVal.toFixed(4)} SUI` : "—"}       loading={loading} />
          <Row
            label="Unrealised P&L"
            value={unrealisedSui !== 0 ? `${unrealisedSui >= 0 ? "+" : ""}${unrealisedSui.toFixed(4)} SUI` : "—"}
            valueColor={unrealisedSui >= 0 ? colors.accent : colors.red}
            loading={loading}
          />
          <Row
            label="ROI"
            value={`${roi >= 0 ? "+" : ""}${roi.toFixed(2)}%`}
            valueColor={roi >= 0 ? colors.accent : colors.red}
            loading={loading}
          />
        </View>

        {/* ── Portfolio allocation ── */}
        <View style={[s.panel, { backgroundColor: colors.bg3, borderColor: colors.border }]}>
          <Text style={[s.panelTitle, { color: colors.text }]}>Allocation</Text>
          {allocs.map(({ sym, usdVal, color }) => {
            const pct = Math.round((usdVal / totalAlloc) * 100);
            return (
              <View key={sym} style={s.allocRow}>
                <View style={[s.allocDot, { backgroundColor: color }]} />
                <Text style={[s.allocSym, { color: colors.text }]}>{sym}</Text>
                <View style={[s.allocTrack, { backgroundColor: colors.bgSoft3 }]}>
                  <View style={[s.allocFill, { width: `${pct}%` as any, backgroundColor: color }]} />
                </View>
                <Text style={[s.allocPct, { color: colors.text2 }]}>{pct}%</Text>
              </View>
            );
          })}
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </View>
  );
}

const r = StyleSheet.create({
  row:    { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth },
  label:  { fontSize: 13 },
  value:  { fontSize: 14, fontWeight: "600" },
  change: { fontSize: 12, fontWeight: "500" },
});

const s = StyleSheet.create({
  root:      { flex: 1 },
  scroll:    { padding: 16, gap: 14 },
  panel:     { borderRadius: 14, borderWidth: 1, padding: 16 },
  panelTitle:{ fontSize: 15, fontWeight: "700", marginBottom: 8 },
  allocRow:  { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 11 },
  allocDot:  { width: 8, height: 8, borderRadius: 4 },
  allocSym:  { fontSize: 13, fontWeight: "600", width: 44 },
  allocTrack:{ flex: 1, height: 6, borderRadius: 3, overflow: "hidden" },
  allocFill: { height: "100%", borderRadius: 3 },
  allocPct:  { fontSize: 13, width: 36, textAlign: "right" },
});
