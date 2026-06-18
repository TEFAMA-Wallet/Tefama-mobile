import { useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AppBar } from "../components/AppBar";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { SectionHead } from "../components/SectionHead";
import { STRATEGIES, fmtUSD } from "../lib/data";
import { useColorTheme } from "../lib/ThemeContext";
import { getTheme } from "../theme";
import { runAgent } from "../lib/useOnchain";

interface AgentData {
  name: string;
  strategy: string;
  budget: string;
  window: string;
  splits: string;
  slip: number;
  agree: boolean;
}

const TIME_WINDOWS = ["24 hours", "7 days", "30 days", "Custom"];
const STEPS = ["Strategy", "Budget", "Parameters", "Review"];

interface Props {
  onBack: () => void;
  onDone: () => void;
}

export function CreateAgentScreen({ onBack, onDone }: Props) {
  const [step, setStep]   = useState(0);
  const [busy, setBusy]   = useState(false);
  const [runMsg, setRunMsg] = useState("");
  const [data, setData] = useState<AgentData>({ name: "DCA Agent", strategy: "DCA", budget: "0.3", window: "Continuous", splits: "1", slip: 0.5, agree: false });
  const { isDark } = useColorTheme();
  const { colors } = getTheme(isDark);

  const set = <K extends keyof AgentData>(k: K, v: AgentData[K]) => setData((d) => ({ ...d, [k]: v }));
  const canNext = step === 3 ? data.agree && !busy : true;

  async function handleNext() {
    if (step < 3) { setStep(step + 1); return; }
    setBusy(true);
    setRunMsg("");
    try {
      const result = await runAgent();
      if (result.success) {
        setRunMsg(`Trade executed! TX: ${result.digest?.slice(0, 8)}…`);
        setTimeout(onDone, 1200);
      } else if (result.skipped) {
        setRunMsg(`Skipped: ${result.reason}`);
        setTimeout(onDone, 1500);
      } else {
        setRunMsg(result.error ?? "Unknown error");
        setBusy(false);
      }
    } catch (e) {
      setRunMsg(String(e));
      setBusy(false);
    }
  }

  function handleBack() {
    if (step === 0) { onBack(); } else { setStep(step - 1); }
  }

  const budget = Number(data.budget) || 0;
  const budgetPct = (budget / 2279.74) * 100;

  return (
    <View style={[s.root, { backgroundColor: colors.bg }]}>
      <AppBar title="Create agent" subtitle={`Step ${step + 1} of 4`} onBack={handleBack} />

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* step progress */}
        <View style={s.wizSteps}>
          {STEPS.map((label, k) => (
            <View key={label} style={s.wizStep}>
              <View style={[s.wizBar, { backgroundColor: k <= step ? colors.accent : colors.bg4 }]} />
              <Text style={[s.wizLabel, { color: k <= step ? colors.accent : colors.text3 }]}>{label}</Text>
            </View>
          ))}
        </View>

        {/* ── Step 0: Strategy ── */}
        {step === 0 && (
          <>
            <FieldLabel label="Agent name" colors={colors}>
              <TextInput
                value={data.name}
                onChangeText={(v) => set("name", v)}
                style={[s.input, { color: colors.text, borderColor: colors.border2, backgroundColor: colors.bg3 }]}
                placeholderTextColor={colors.text3}
              />
            </FieldLabel>

            <SectionHead>Strategy template</SectionHead>
            <View style={s.stack}>
              {STRATEGIES.map((str) => {
                const on = data.strategy === str.value;
                return (
                  <Pressable key={str.value} onPress={() => set("strategy", str.value)}
                    style={[s.stratBtn, { backgroundColor: on ? colors.accentDim : colors.bgCard, borderColor: on ? colors.accent : colors.border }]}>
                    <View style={[s.stratIco, { backgroundColor: on ? colors.accentB : colors.bg4 }]}>
                      <Ionicons name={str.icon as any} size={20} color={on ? colors.accent : colors.text2} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[s.stratT, { color: colors.text }]}>{str.value}</Text>
                      <Text style={[s.stratD, { color: colors.text2 }]}>{str.desc}</Text>
                    </View>
                    <View style={[s.radio, { borderColor: on ? colors.accent : colors.border2, backgroundColor: on ? colors.accent : "transparent" }]}>
                      {on && <Ionicons name="checkmark" size={13} color="#fff" />}
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </>
        )}

        {/* ── Step 1: Budget ── */}
        {step === 1 && (
          <>
            <FieldLabel label="Budget cap" colors={colors}>
              <View style={s.inputRow}>
                <TextInput
                  value={data.budget}
                  onChangeText={(v) => set("budget", v)}
                  keyboardType="decimal-pad"
                  style={[s.input, { flex: 1, color: colors.text, borderColor: colors.border2, backgroundColor: colors.bg3 }]}
                  placeholderTextColor={colors.text3}
                />
                <Text style={[s.unit, { color: colors.text2 }]}>USDC</Text>
              </View>
            </FieldLabel>

            <FieldLabel label="Time window" colors={colors}>
              <View style={s.pillRow}>
                {TIME_WINDOWS.map((w) => (
                  <Pressable key={w} onPress={() => set("window", w)}
                    style={[s.pill, { backgroundColor: data.window === w ? colors.accentDim : colors.bg3, borderColor: data.window === w ? colors.accent : colors.border }]}>
                    <Text style={[s.pillText, { color: data.window === w ? colors.accent : colors.text2 }]}>{w}</Text>
                  </Pressable>
                ))}
              </View>
            </FieldLabel>

            <Card style={[s.infoCard, { backgroundColor: colors.accentDim, borderColor: colors.accentB }]}>
              <Ionicons name="information-circle-outline" size={18} color={colors.accent} />
              <Text style={[s.infoText, { color: colors.text2 }]}>
                The agent can spend up to{" "}
                <Text style={{ color: colors.text, fontWeight: "700" }}>{fmtUSD(budget)} USDC</Text>{" "}
                over {data.window}. The ceiling is enforced on-chain.
              </Text>
            </Card>

            {/* risk card */}
            <Card>
              <View style={s.riskHead}>
                <Text style={[s.riskTitle, { color: colors.text }]}>Risk assessment</Text>
                <View style={[s.riskBadge, { backgroundColor: budgetPct < 15 ? "rgba(76,175,80,0.15)" : "rgba(212,75,42,0.15)" }]}>
                  <Text style={{ color: budgetPct < 15 ? "#4CAF50" : "#D44B2A", fontSize: 12, fontWeight: "700" }}>
                    {budgetPct < 15 ? "Low" : budgetPct < 35 ? "Medium" : "High"}
                  </Text>
                </View>
              </View>
              {[["Budget", `${budgetPct.toFixed(0)}% of wallet`], ["Time window", data.window], ["Strategy", data.strategy]].map(([k, v]) => (
                <View key={k} style={s.riskRow}>
                  <Text style={[s.riskK, { color: colors.text2 }]}>{k}</Text>
                  <Text style={[s.riskV, { color: colors.text }]}>{v}</Text>
                </View>
              ))}
            </Card>
          </>
        )}

        {/* ── Step 2: Parameters ── */}
        {step === 2 && (
          <>
            <SectionHead>{data.strategy} parameters</SectionHead>
            <FieldLabel label="Number of splits" hint="Budget is divided evenly across this many buys." colors={colors}>
              <TextInput
                value={data.splits}
                onChangeText={(v) => set("splits", v)}
                keyboardType="number-pad"
                style={[s.input, { color: colors.text, borderColor: colors.border2, backgroundColor: colors.bg3 }]}
              />
            </FieldLabel>
            <FieldLabel label="Price threshold" hint="Pause buying above this price." colors={colors}>
              <View style={s.inputRow}>
                <TextInput defaultValue="1.25" keyboardType="decimal-pad"
                  style={[s.input, { flex: 1, color: colors.text, borderColor: colors.border2, backgroundColor: colors.bg3 }]} />
                <Text style={[s.unit, { color: colors.text2 }]}>USDC</Text>
              </View>
            </FieldLabel>
            <FieldLabel label="Min interval" hint="Minimum time between executions." colors={colors}>
              <View style={s.inputRow}>
                <TextInput defaultValue="6" keyboardType="number-pad"
                  style={[s.input, { flex: 1, color: colors.text, borderColor: colors.border2, backgroundColor: colors.bg3 }]} />
                <Text style={[s.unit, { color: colors.text2 }]}>hrs</Text>
              </View>
            </FieldLabel>
          </>
        )}

        {/* ── Step 3: Review ── */}
        {step === 3 && (
          <>
            <Card style={{ padding: 0, paddingHorizontal: 16 }}>
              {[
                ["Name",     data.name],
                ["Strategy", data.strategy],
                ["Budget cap", `${fmtUSD(budget)} USDC`],
                ["Time window", data.window],
                ["Slippage", `${data.slip.toFixed(1)}%`],
                ["Splits",   data.splits],
                ["Protocol", "Deepbook v3"],
              ].map(([k, v], i, arr) => (
                <View key={k} style={[s.kv, i < arr.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border }]}>
                  <Text style={[s.kvK, { color: colors.text2 }]}>{k}</Text>
                  <Text style={[s.kvV, { color: colors.text }]}>{v}</Text>
                </View>
              ))}
            </Card>

            <Card style={[s.infoCard, { backgroundColor: "rgba(212,75,42,0.08)", borderColor: "rgba(212,75,42,0.25)" }]}>
              <Ionicons name="warning-outline" size={18} color="#D44B2A" />
              <Text style={[s.infoText, { color: colors.text2 }]}>
                Agents trade real assets autonomously. Executions are irreversible. Only the budget ceiling and time limit constrain it.
              </Text>
            </Card>

            <Pressable style={s.agreeRow} onPress={() => set("agree", !data.agree)}>
              <View style={[s.checkbox, { borderColor: data.agree ? colors.accent : colors.border2, backgroundColor: data.agree ? colors.accent : "transparent" }]}>
                {data.agree && <Ionicons name="checkmark" size={14} color="#fff" />}
              </View>
              <Text style={[s.agreeText, { color: colors.text2 }]}>
                I understand the risks and authorize on-chain execution.
              </Text>
            </Pressable>
          </>
        )}

        <View style={{ height: 16 }} />
      </ScrollView>

      {/* sticky footer */}
      <View style={[s.footer, { backgroundColor: colors.bg, borderTopColor: colors.border }]}>
        {runMsg ? (
          <Text style={[s.runMsg, { color: runMsg.startsWith("Trade") || runMsg.startsWith("Skipped") ? "#4CAF50" : "#D44B2A" }]}>{runMsg}</Text>
        ) : null}
        <Button variant="primary" size="lg" block disabled={!canNext} onPress={handleNext}
          icon={busy ? <ActivityIndicator size={16} color="#fff" /> : step === 3 ? <Ionicons name="shield-checkmark-outline" size={18} color="#fff" /> : undefined}
          iconRight={step < 3 ? <Ionicons name="arrow-forward" size={18} color="#fff" /> : undefined}>
          {busy ? "Running agent…" : step === 3 ? "Run DCA agent" : "Continue"}
        </Button>
      </View>
    </View>
  );
}

function FieldLabel({ label, hint, children, colors }: { label: string; hint?: string; children: React.ReactNode; colors: any }) {
  return (
    <View style={s.field}>
      <Text style={[s.fieldLabel, { color: colors.text2 }]}>{label}</Text>
      {children}
      {hint && <Text style={[s.fieldHint, { color: colors.text3 }]}>{hint}</Text>}
    </View>
  );
}

const s = StyleSheet.create({
  root:      { flex: 1 },
  scroll:    { padding: 14, gap: 14 },
  wizSteps:  { flexDirection: "row", gap: 6 },
  wizStep:   { flex: 1, gap: 4 },
  wizBar:    { height: 3, borderRadius: 100 },
  wizLabel:  { fontSize: 10, fontWeight: "600" },
  stack:     { gap: 8 },
  stratBtn:  { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: 14, borderWidth: 1 },
  stratIco:  { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center" },
  stratT:    { fontSize: 14, fontWeight: "700" },
  stratD:    { fontSize: 12, marginTop: 2 },
  radio:     { width: 22, height: 22, borderRadius: 11, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  field:     { gap: 6 },
  fieldLabel:{ fontSize: 13, fontWeight: "600" },
  fieldHint: { fontSize: 12 },
  input:     { borderWidth: 1, borderRadius: 12, padding: 13, fontSize: 15 },
  inputRow:  { flexDirection: "row", alignItems: "center", gap: 8 },
  unit:      { fontSize: 14, fontWeight: "600", minWidth: 40 },
  pillRow:   { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  pill:      { paddingHorizontal: 14, paddingVertical: 9, borderRadius: 100, borderWidth: 1 },
  pillText:  { fontSize: 13, fontWeight: "600" },
  infoCard:  { flexDirection: "row", gap: 10, padding: 14, borderRadius: 14, borderWidth: 1, alignItems: "flex-start" },
  infoText:  { flex: 1, fontSize: 13, lineHeight: 19 },
  riskHead:  { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  riskTitle: { fontSize: 14, fontWeight: "700" },
  riskBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 100 },
  riskRow:   { flexDirection: "row", justifyContent: "space-between", paddingVertical: 6 },
  riskK:     { fontSize: 13 },
  riskV:     { fontSize: 13, fontWeight: "600" },
  kv:        { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 14 },
  kvK:       { fontSize: 14 },
  kvV:       { fontSize: 14, fontWeight: "600" },
  agreeRow:  { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  checkbox:  { width: 22, height: 22, borderRadius: 6, borderWidth: 2, alignItems: "center", justifyContent: "center", marginTop: 2 },
  agreeText: { flex: 1, fontSize: 14, lineHeight: 20 },
  footer:    { padding: 14, borderTopWidth: StyleSheet.hairlineWidth, gap: 8 },
  runMsg:    { fontSize: 13, textAlign: "center", fontWeight: "600" },
});
