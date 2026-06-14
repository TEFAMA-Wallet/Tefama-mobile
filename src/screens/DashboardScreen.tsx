import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Svg, { Defs, LinearGradient as SvgGrad, Path, Stop } from "react-native-svg";
import { AppBar } from "../components/AppBar";
import { Card } from "../components/Card";
import { Badge } from "../components/Badge";
import { CircularProgress } from "../components/CircularProgress";
import { ProgressBar } from "../components/ProgressBar";
import { Button, IconButton } from "../components/Button";
import { SectionHead } from "../components/SectionHead";
import { TxRow } from "../components/TxRow";
import { BrandLogo } from "../components/BrandLogo";
import { WALLET, STATS, AGENTS, ACTIVITY, fmtUSD, fmtNum } from "../lib/data";
import type { Agent, Tx } from "../lib/data";
import { useColorTheme } from "../lib/ThemeContext";
import { getTheme } from "../theme";

function Sparkline() {
  const { isDark } = useColorTheme();
  const { colors } = getTheme(isDark);
  const spark = WALLET.spark;
  const W = 300, H = 44;
  const max = Math.max(...spark), min = Math.min(...spark);
  const pts = spark.map((v, i) => [
    (i / (spark.length - 1)) * W,
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

interface Props {
  onViewAgent: (agent: Agent) => void;
  onViewAgents: () => void;
  onViewActivity: () => void;
  onViewTx: (tx: Tx) => void;
}

export function DashboardScreen({ onViewAgent, onViewAgents, onViewActivity, onViewTx }: Props) {
  const { isDark } = useColorTheme();
  const { colors } = getTheme(isDark);
  const hero = AGENTS[0];
  const pct  = (hero.spent / hero.budget) * 100;

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
          <Text style={[s.heroBal,   { color: colors.text }]}>${fmtUSD(WALLET.totalUsd)}</Text>
          <View style={s.toks}>
            <View style={s.tok}>
              <View style={[s.tokDot, { backgroundColor: colors.accent }]} />
              <Text style={[s.tokText, { color: colors.text2 }]}>{fmtNum(WALLET.sui)} SUI</Text>
            </View>
            <View style={s.tok}>
              <View style={[s.tokDot, { backgroundColor: "#4A8FD4" }]} />
              <Text style={[s.tokText, { color: colors.text2 }]}>{fmtUSD(WALLET.usdc)} USDC</Text>
            </View>
            <View style={[s.chip, { backgroundColor: "rgba(76,175,80,0.15)" }]}>
              <Ionicons name="trending-up-outline" size={13} color="#4CAF50" />
              <Text style={[s.chipText, { color: "#4CAF50" }]}>+{WALLET.gainPct}%</Text>
            </View>
          </View>
        </Card>

        {/* ── Portfolio performance ── */}
        <Card style={{ padding: "16px 18px" as any }}>
          <View style={s.pfTop}>
            <Text style={[s.pfLabel, { color: colors.text2 }]}>Portfolio performance</Text>
            <Text style={[s.pfPeriod, { color: colors.text3 }]}>24h</Text>
          </View>
          <View style={s.pfRow}>
            <View>
              <Text style={[s.pfGain, { color: "#4CAF50" }]}>+${fmtUSD(WALLET.gain)}</Text>
              <Text style={[s.pfSub,  { color: colors.text2 }]}>Invested ${fmtUSD(WALLET.invested)} · now ${fmtUSD(WALLET.value)}</Text>
            </View>
          </View>
          <Sparkline />
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
                <Text style={[s.agentName, { color: colors.text }]}>{hero.name}</Text>
                <Text style={[s.agentMeta, { color: colors.text2 }]}>{hero.strategy} · {hero.pair}</Text>
              </View>
            </View>
            <Badge status={hero.status} />
          </View>

          <View style={s.ringRow}>
            <CircularProgress
              value={hero.spent} max={hero.budget} size={132} stroke={11}
              valueText={`${hero.spent} / ${hero.budget}`} caption="USDC used"
              tone={pct > 90 ? "danger" : "brand"}
            />
            <View style={s.miniStats}>
              {[
                { icon: "time-outline",        label: "Time left",  val: hero.timeLeft      },
                { icon: "repeat-outline",      label: "Trades",     val: String(hero.trades) },
                { icon: "speedometer-outline", label: "Success",    val: `${hero.successRate}%`, green: true },
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
            <Button variant="secondary" size="sm" block onPress={() => onViewAgent(hero)}>View details</Button>
            <Button variant="danger"    size="sm" block onPress={() => onViewAgent(hero)}
              icon={<Ionicons name="close-circle-outline" size={15} color="#D44B2A" />}>
              Revoke
            </Button>
          </View>
        </Card>

        {/* ── Quick stats ── */}
        <View style={s.statGrid}>
          {[
            { label: "Trades today", val: String(STATS.tradesToday) },
            { label: "Volume",       val: `$${fmtNum(STATS.volume)}` },
            { label: "Success rate", val: `${STATS.successRate}%`, green: true },
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
          {ACTIVITY.slice(0, 4).map((tx) => (
            <TxRow key={tx.id} tx={tx} onPress={() => onViewTx(tx)} />
          ))}
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
  pfRow:    { marginTop: 8 },
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
});
