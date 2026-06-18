import { useState } from "react";
import type { ReactNode } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useColorTheme } from "../lib/ThemeContext";
import { getTheme } from "../theme";
import { useAuth } from "../lib/AuthContext";
import type { Vault } from "../lib/useOnchain";

interface Props {
  price:         number;
  deepPrice:     number;
  suiBalance:    number;
  usdcBalance:   number;
  deepBalance:   number;
  vault:         Vault | null;
  walletLoading: boolean;
  priceLoading:  boolean;
  bellEl?:       ReactNode;
}

function Skeleton({ w = 80, h = 20 }: { w?: number | string; h?: number }) {
  const { isDark } = useColorTheme();
  const { colors } = getTheme(isDark);
  return <View style={{ width: w as any, height: h, borderRadius: 5, backgroundColor: colors.bgSoft3 }} />;
}

function usd(n: number, d = 2) {
  return "$" + n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
}

function shortAddr(a: string) { return `${a.slice(0, 8)}...${a.slice(-6)}`; }

export function WalletScreen({ price, deepPrice, suiBalance, usdcBalance, deepBalance, vault, walletLoading, priceLoading, bellEl }: Props) {
  const { isDark } = useColorTheme();
  const { colors } = getTheme(isDark);
  const { session } = useAuth();

  const [copied, setCopied] = useState(false);
  const address  = session?.address ?? "";
  const loading  = walletLoading || priceLoading;
  const totalUsd = suiBalance * price + usdcBalance + deepBalance * deepPrice;

  const tokens = [
    { sym: "SUI",  name: "Sui",           balance: suiBalance,  price,      usdVal: suiBalance * price,       decimals: 4, color: "#6FBCF0" },
    { sym: "USDC", name: "USD Coin",       balance: usdcBalance, price: 1,   usdVal: usdcBalance,              decimals: 2, color: "#2775CA" },
    { sym: "DEEP", name: "DeepBook Token", balance: deepBalance, price: deepPrice, usdVal: deepBalance * deepPrice, decimals: 4, color: colors.accent },
  ];
  const totalForAlloc = tokens.reduce((s, t) => s + t.usdVal, 0) || 1;

  function copy() {
    setCopied(true);
    setTimeout(() => setCopied(false), 1100);
  }

  return (
    <View style={[s.root, { backgroundColor: colors.bg }]}>
      <View style={[s.header, { borderBottomColor: colors.border }]}>
        <Text style={[s.pageTitle, { color: colors.text }]}>Wallet</Text>
        {bellEl}
        <Text style={[s.pageSub, { color: colors.text2 }]}>Your Sui wallet · zkLogin · Testnet</Text>
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* Balance hero */}
        <View style={[s.heroCard, { backgroundColor: colors.bg3, borderColor: colors.border2 }]}>
          <View style={s.heroTop}>
            <View>
              <Text style={[s.heroLabel, { color: colors.text3 }]}>TOTAL BALANCE</Text>
              {loading ? <Skeleton w={180} h={40} /> : (
                <>
                  <Text style={[s.heroVal, { color: colors.text, fontFamily: "monospace" }]}>{usd(totalUsd, 2)}</Text>
                  <Text style={[s.heroSub, { color: colors.text2, fontFamily: "monospace" }]}>
                    SUI @ {usd(price, 4)} · DEEP @ {usd(deepPrice, 6)} · DeepBook live
                  </Text>
                </>
              )}
            </View>
            <View style={{ alignItems: "flex-end", gap: 8 }}>
              <Text style={[s.zkLabel, { color: colors.text3 }]}>zkLogin · Google</Text>
              <Pressable
                style={[s.addrBtn, { backgroundColor: colors.bgSoft2, borderColor: colors.border2 }]}
                onPress={copy}
              >
                <Text style={[s.addrText, { color: colors.text2, fontFamily: "monospace" }]}>
                  {address ? shortAddr(address) : "—"}
                </Text>
                <Ionicons
                  name={copied ? "checkmark" : "copy-outline"}
                  size={13}
                  color={copied ? colors.accent : colors.text3}
                />
              </Pressable>
              <View style={s.netRow}>
                <View style={[s.netDot, { backgroundColor: colors.accent }]} />
                <Text style={[s.netText, { color: colors.text3 }]}>Sui Testnet</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Holdings — token cards */}
        <View style={[s.panel, { backgroundColor: colors.bg3, borderColor: colors.border }]}>
          <Text style={[s.panelTitle, { color: colors.text }]}>Holdings</Text>

          {loading ? (
            [1, 2, 3].map(i => (
              <View key={i} style={[s.tokenCard, { borderColor: colors.border }]}>
                <View style={s.tokenCardTop}>
                  <View style={{ flex: 1, gap: 6 }}>
                    <Skeleton w={100} h={14} />
                    <Skeleton w={60} h={11} />
                  </View>
                  <View style={{ alignItems: "flex-end", gap: 6 }}>
                    <Skeleton w={70} h={14} />
                    <Skeleton w={90} h={11} />
                  </View>
                </View>
                <Skeleton w="100%" h={5} />
              </View>
            ))
          ) : (
            tokens.map((t) => {
              const alloc = Math.round((t.usdVal / totalForAlloc) * 100);
              return (
                <View key={t.sym} style={[s.tokenCard, { borderColor: colors.border }]}>
                  <View style={s.tokenCardTop}>
                    <View style={s.tokenLeft}>
                      <View style={[s.tokenDot, { backgroundColor: t.color }]} />
                      <View>
                        <Text style={[s.tdBold, { color: colors.text }]}>{t.sym} — {t.name}</Text>
                        <Text style={[s.tdSub, { color: colors.text2 }]}>
                          {t.price > 0 ? usd(t.price, t.sym === "SUI" ? 4 : t.sym === "DEEP" ? 6 : 2) : "—"}
                        </Text>
                      </View>
                    </View>
                    <View style={{ alignItems: "flex-end" }}>
                      <Text style={[s.td, { color: colors.text, fontFamily: "monospace", fontWeight: "600" }]}>
                        {t.balance.toLocaleString("en-US", { maximumFractionDigits: t.decimals })}
                      </Text>
                      <Text style={[s.tdSub, { color: colors.text2, fontFamily: "monospace" }]}>
                        {t.usdVal > 0 ? usd(t.usdVal, 2) : "—"} · {alloc}%
                      </Text>
                    </View>
                  </View>
                  <View style={[s.allocTrack, { backgroundColor: colors.bgSoft3 }]}>
                    <View style={[s.allocFill, { width: `${alloc}%` as any, backgroundColor: t.color }]} />
                  </View>
                </View>
              );
            })
          )}
        </View>

        <Text style={[s.footer, { color: colors.text3 }]}>
          Balances fetched live from Sui testnet · refreshes every 15s
        </Text>

        <View style={{ height: 24 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root:   { flex: 1 },
  scroll: { padding: 16, gap: 14 },

  header:    { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingTop: 10, paddingBottom: 12, borderBottomWidth: StyleSheet.hairlineWidth },
  pageTitle: { fontSize: 22, fontWeight: "700", letterSpacing: -0.4 },
  pageSub:   { fontSize: 13, marginTop: 2 },

  heroCard: { borderRadius: 16, borderWidth: 1, padding: 20 },
  heroTop:  { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  heroLabel:{ fontSize: 11, fontWeight: "600", letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 8 },
  heroVal:  { fontSize: 36, fontWeight: "700", letterSpacing: -1 },
  heroSub:  { fontSize: 13, marginTop: 4 },
  zkLabel:  { fontSize: 12 },
  addrBtn:  { flexDirection: "row", alignItems: "center", gap: 6, borderRadius: 8, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 6 },
  addrText: { fontSize: 12 },
  netRow:   { flexDirection: "row", alignItems: "center", gap: 5 },
  netDot:   { width: 6, height: 6, borderRadius: 3 },
  netText:  { fontSize: 12 },

  panel:     { borderRadius: 14, borderWidth: 1, padding: 16 },
  panelTitle:{ fontSize: 15, fontWeight: "600", marginBottom: 10 },

  tokenCard:    { borderBottomWidth: StyleSheet.hairlineWidth, paddingVertical: 12, gap: 8 },
  tokenCardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  tokenLeft:    { flexDirection: "row", alignItems: "center", gap: 10, flex: 1, paddingRight: 8 },
  tokenDot:     { width: 10, height: 10, borderRadius: 5 },
  tdBold:    { fontSize: 13, fontWeight: "600" },
  tdSub:     { fontSize: 11, marginTop: 2 },
  td:        { fontSize: 13 },
  allocTrack:{ height: 5, borderRadius: 3, overflow: "hidden" },
  allocFill: { height: "100%", borderRadius: 3 },

  footer:    { fontSize: 12, textAlign: "center", lineHeight: 18 },
});
