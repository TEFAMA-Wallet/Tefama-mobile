import { StyleSheet, Text, View } from "react-native";
import { useColorTheme } from "../lib/ThemeContext";
import { getTheme } from "../theme";

interface Props {
  value: number;
  max: number;
  tone?: "brand" | "danger";
  valueText?: string;
}

export function ProgressBar({ value, max, tone = "brand", valueText }: Props) {
  const { isDark } = useColorTheme();
  const { colors } = getTheme(isDark);
  const pct = Math.min(100, (value / (max || 1)) * 100);
  const fill = tone === "danger" ? "#D44B2A" : colors.accent;

  return (
    <View>
      {valueText ? (
        <Text style={[s.label, { color: colors.text2 }]}>{valueText}</Text>
      ) : null}
      <View style={[s.track, { backgroundColor: colors.bg4 }]}>
        <View style={[s.fill, { width: `${pct}%` as any, backgroundColor: fill }]} />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  label: { fontSize: 11, marginBottom: 5 },
  track: { height: 5, borderRadius: 100, overflow: "hidden" },
  fill:  { height: "100%", borderRadius: 100 },
});
