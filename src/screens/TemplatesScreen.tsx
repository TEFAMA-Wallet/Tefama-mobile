import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AppBar } from "../components/AppBar";
import { TEMPLATES } from "../lib/data";
import { useColorTheme } from "../lib/ThemeContext";
import { getTheme } from "../theme";

const LEVEL_COLORS: Record<string, { bg: string; text: string }> = {
  Easy:     { bg: "rgba(76,175,80,0.15)",  text: "#4CAF50" },
  Advanced: { bg: "rgba(255,140,0,0.15)",  text: "#FF8C00" },
  Custom:   { bg: "rgba(74,143,212,0.15)", text: "#4A8FD4" },
};

export function TemplatesScreen({ onBack, onSelect }: { onBack: () => void; onSelect: () => void }) {
  const { isDark } = useColorTheme();
  const { colors } = getTheme(isDark);

  return (
    <View style={[s.root, { backgroundColor: colors.bg }]}>
      <AppBar title="Choose a strategy" subtitle="Start from a tested preset" onBack={onBack} />

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        {TEMPLATES.map((t) => {
          const lc = LEVEL_COLORS[t.level];
          return (
            <Pressable key={t.id} onPress={onSelect}
              style={({ pressed }) => [s.card, { backgroundColor: colors.bgCard, borderColor: colors.border, opacity: pressed ? 0.8 : 1 }]}>
              <View style={[s.ico, { backgroundColor: colors.accentDim }]}>
                <Ionicons name={t.icon as any} size={20} color={colors.accent} />
              </View>
              <View style={s.txt}>
                <Text style={[s.title, { color: colors.text }]}>{t.title}</Text>
                <Text style={[s.desc,  { color: colors.text2 }]}>{t.desc}</Text>
                <View style={s.params}>
                  {t.params.map((p) => (
                    <View key={p} style={[s.chip, { backgroundColor: colors.bg4 }]}>
                      <Text style={[s.chipText, { color: colors.text2 }]}>{p}</Text>
                    </View>
                  ))}
                </View>
              </View>
              <View style={[s.levelBadge, { backgroundColor: lc.bg }]}>
                <Text style={[s.levelText, { color: lc.text }]}>{t.level}</Text>
              </View>
            </Pressable>
          );
        })}

        <Text style={[s.legal, { color: colors.text3 }]}>
          Presets use tested parameters. You can fine-tune everything after picking one.
        </Text>
        <View style={{ height: 16 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root:       { flex: 1 },
  scroll:     { padding: 14, gap: 10 },
  card:       { flexDirection: "row", alignItems: "flex-start", gap: 12, padding: 16, borderRadius: 16, borderWidth: StyleSheet.hairlineWidth },
  ico:        { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  txt:        { flex: 1 },
  title:      { fontSize: 15, fontWeight: "700" },
  desc:       { fontSize: 13, lineHeight: 18, marginTop: 4 },
  params:     { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 8 },
  chip:       { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 100 },
  chipText:   { fontSize: 11 },
  levelBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 100, flexShrink: 0 },
  levelText:  { fontSize: 11, fontWeight: "700" },
  legal:      { fontSize: 12, lineHeight: 18, textAlign: "center", marginTop: 4 },
});
