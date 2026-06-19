import { useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTokenLogos } from "../lib/useTokenLogos";
import { LinearGradient } from "expo-linear-gradient";
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
}

function Skeleton({ w = 80, h = 20 }: { w?: number | string; h?: number }) {
  const { isDark } = useColorTheme();
  const { colors } = getTheme(isDark);
  return <View style={{ width: w as any, height: h, borderRadius: 6, backgroundColor: colors.bgSoft3 }} />;
}

function usd(n: number, d = 2) {
  return "$" + n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
}


const TOKEN_META = {
  SUI:  { color: "#6FBCF0", bg: "rgba(111,188,240,0.12)" },
  USDC: { color: "#2775CA", bg: "rgba(39,117,202,0.12)"  },
  DEEP: { color: "#06b6d4", bg: "rgba(6,182,212,0.12)"   },
};

export function WalletScreen({ price, deepPrice, suiBalance, usdcBalance, deepBalance, vault, walletLoading, priceLoading }: Props) {
  const { isDark } = useColorTheme();
  const { colors } = getTheme(isDark);
  const { session } = useAuth();

  const [copied, setCopied] = useState(false);
  const address = session?.address ?? "";
  const logos = useTokenLogos(["SUI", "USDC", "DEEP"]);
  const loading = walletLoading || priceLoading;

  const totalUsd = suiBalance * price + usdcBalance + deepBalance * deepPrice;

  const tokens = [
    { sym: "SUI",  name: "Sui",           balance: suiBalance,  usdVal: suiBalance * price,        price,          decimals: 4 },
    { sym: "USDC", name: "USD Coin",       balance: usdcBalance, usdVal: usdcBalance,               price: 1,       decimals: 2 },
    { sym: "DEEP", name: "DeepBook Token", balance: deepBalance, usdVal: deepBalance * deepPrice,   price: deepPrice, decimals: 4 },
  ];
  const totalForAlloc = tokens.reduce((s, t) => s + t.usdVal, 0) || 1;

  const budgetPct = vault && vault.budgetCap > 0
    ? Math.min(100, (vault.spent / vault.budgetCap) * 100)
    : 0;

  function copy() {
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  }

  return (
    <View style={[s.root, { backgroundColor: colors.bg }]}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* ── Hero balance card ── */}
        <LinearGradient
          colors={isDark ? ["#0c1418", "#080f12"] : ["#f0f9ff", "#e0f2fe"]}
          style={[s.heroCard, { borderColor: colors.border2 }]}
        >
          {/* Balance + network on same row */}
          <View style={s.heroTopRow}>
            {loading
              ? <Skeleton w={180} h={38} />
              : <Text style={[s.heroVal, { color: colors.text }]}>{usd(totalUsd, 2)}</Text>
            }
            <View style={[s.netChip, { backgroundColor: colors.accentDim, borderColor: colors.accentB }]}>
              <View style={[s.netDot, { backgroundColor: colors.accent }]} />
              <Text style={[s.netText, { color: colors.accent }]}>Testnet</Text>
            </View>
          </View>

          {/* Full address — tappable to copy, wraps naturally */}
          {address ? (
            <Pressable style={s.addrRow} onPress={copy}>
              <Text style={[s.addrFull, { color: colors.text3 }]} selectable={false}>
                {address}
              </Text>
              <Ionicons
                name={copied ? "checkmark-circle" : "copy-outline"}
                size={14}
                color={copied ? colors.accent : colors.text3}
                style={{ marginTop: 1 }}
              />
            </Pressable>
          ) : (
            <Skeleton w="80%" h={13} />
          )}
        </LinearGradient>

        {/* ── Holdings ── */}
        <View style={[s.card, { backgroundColor: colors.bg3, borderColor: colors.border }]}>
          <View style={s.cardHead}>
            <Text style={[s.cardTitle, { color: colors.text }]}>Holdings</Text>
            <Text style={[s.cardSub, { color: colors.text3 }]}>{tokens.length} assets</Text>
          </View>

          {loading
            ? [1, 2, 3].map(i => (
                <View key={i} style={[s.tokenRow, { borderBottomColor: colors.border }]}>
                  <Skeleton w={40} h={40} />
                  <View style={{ flex: 1, gap: 6, marginLeft: 12 }}>
                    <Skeleton w={80} h={14} />
                    <Skeleton w={55} h={11} />
                  </View>
                  <View style={{ alignItems: "flex-end", gap: 6 }}>
                    <Skeleton w={70} h={14} />
                    <Skeleton w={50} h={11} />
                  </View>
                </View>
              ))
            : tokens.map((t, i) => {
                const meta  = TOKEN_META[t.sym as keyof typeof TOKEN_META];
                const alloc = Math.round((t.usdVal / totalForAlloc) * 100);
                const isLast = i === tokens.length - 1;
                return (
                  <View key={t.sym} style={[s.tokenRow, !isLast && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border }]}>
                    {/* Token icon — real logo from CoinGecko, falls back to letter */}
                    <View style={[s.tokenIcon, { backgroundColor: meta.bg, borderWidth: 1, borderColor: meta.color + "30" }]}>
                      {logos[t.sym]
                        ? <Image source={{ uri: logos[t.sym]! }} style={s.tokenImg} />
                        : <Text style={[s.tokenLetter, { color: meta.color }]}>{t.sym[0]}</Text>
                      }
                    </View>

                    {/* Name + price */}
                    <View style={s.tokenInfo}>
                      <Text style={[s.tokenSym, { color: colors.text }]}>{t.sym}</Text>
                      <Text style={[s.tokenName, { color: colors.text3 }]}>{t.name}</Text>
                    </View>

                    {/* Balance + USD */}
                    <View style={s.tokenRight}>
                      <Text style={[s.tokenBal, { color: colors.text }]}>
                        {t.balance.toLocaleString("en-US", { maximumFractionDigits: t.decimals })}
                      </Text>
                      <Text style={[s.tokenUsd, { color: colors.text3 }]}>
                        {t.usdVal > 0 ? usd(t.usdVal, 2) : "—"}
                      </Text>
                    </View>
                  </View>
                );
              })
          }
        </View>

        {/* ── DCA Vault ── */}
        {vault && (
          <View style={[s.card, { backgroundColor: colors.bg3, borderColor: colors.border }]}>
            <View style={s.cardHead}>
              <Text style={[s.cardTitle, { color: colors.text }]}>DCA Vault</Text>
              <View style={[s.statusChip, {
                backgroundColor: vault.paused ? colors.bgSoft3 : colors.accentDim,
                borderColor:     vault.paused ? colors.border  : colors.accentB,
              }]}>
                {!vault.paused && <View style={[s.netDot, { backgroundColor: colors.accent }]} />}
                <Text style={[s.statusText, { color: vault.paused ? colors.text3 : colors.accent }]}>
                  {vault.paused ? "Paused" : "Active"}
                </Text>
              </View>
            </View>

            {/* Budget bar */}
            <View style={s.vaultRow}>
              <Text style={[s.vaultLabel, { color: colors.text3 }]}>Budget used</Text>
              <Text style={[s.vaultVal, { color: colors.text }]}>
                {vault.spent.toFixed(3)} / {vault.budgetCap.toFixed(3)} SUI
              </Text>
            </View>
            <View style={[s.allocBar, { backgroundColor: colors.bgSoft3, marginTop: 2 }]}>
              <View style={[s.allocFill, {
                width: `${budgetPct}%` as any,
                backgroundColor: budgetPct > 90 ? colors.red : colors.accent,
              }]} />
            </View>
            <Text style={[s.vaultPct, { color: colors.text3 }]}>{budgetPct.toFixed(1)}% utilised</Text>
          </View>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root:   { flex: 1 },
  scroll: { padding: 16, gap: 14 },

  // Hero
  heroCard:   { borderRadius: 18, borderWidth: 1, paddingHorizontal: 16, paddingTop: 16, paddingBottom: 14, gap: 10 },
  heroTopRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  heroVal:    { fontSize: 36, fontWeight: "700", letterSpacing: -1.5, flex: 1 },

  netChip:  { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 9, paddingVertical: 4, borderRadius: 100, borderWidth: 1, marginLeft: 10 },
  netDot:   { width: 6, height: 6, borderRadius: 3 },
  netText:  { fontSize: 11, fontWeight: "600" },

  addrRow:  { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  addrFull: { flex: 1, fontSize: 11, fontFamily: "monospace", lineHeight: 17 },

  // Card
  card:     { borderRadius: 16, borderWidth: 1, padding: 16 },
  cardHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
  cardTitle:{ fontSize: 15, fontWeight: "700" },
  cardSub:  { fontSize: 12 },

  // Token row
  tokenRow:   { flexDirection: "row", alignItems: "center", paddingVertical: 16, gap: 14 },
  tokenIcon:  { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  tokenImg:   { width: 28, height: 28, borderRadius: 14 },
  tokenLetter:{ fontSize: 17, fontWeight: "800" },
  tokenInfo:  { flex: 1 },
  tokenSym:   { fontSize: 15, fontWeight: "700" },
  tokenName:  { fontSize: 12, marginTop: 2 },
  tokenRight: { alignItems: "flex-end" },
  tokenBal:   { fontSize: 15, fontWeight: "600", fontFamily: "monospace" },
  tokenUsd:   { fontSize: 12, marginTop: 2 },
  allocBar:   { width: "100%", height: 3, borderRadius: 2, overflow: "hidden", marginTop: 4 },
  allocFill:  { height: "100%", borderRadius: 2 },

  // Vault
  statusChip: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 9, paddingVertical: 4, borderRadius: 100, borderWidth: 1 },
  statusText: { fontSize: 11, fontWeight: "600" },
  vaultRow:   { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 12 },
  vaultLabel: { fontSize: 13 },
  vaultVal:   { fontSize: 13, fontWeight: "600", fontFamily: "monospace" },
  vaultPct:   { fontSize: 11, marginTop: 6 },
});
