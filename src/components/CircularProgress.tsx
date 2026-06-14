import { StyleSheet, Text, View } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { useColorTheme } from "../lib/ThemeContext";
import { getTheme } from "../theme";

interface Props {
  value: number;
  max: number;
  size?: number;
  stroke?: number;
  valueText?: string;
  caption?: string;
  tone?: "brand" | "danger";
}

export function CircularProgress({ value, max, size = 132, stroke = 11, valueText, caption, tone = "brand" }: Props) {
  const { isDark } = useColorTheme();
  const { colors } = getTheme(isDark);

  const r = (size - stroke) / 2;
  const cx = size / 2;
  const circumference = 2 * Math.PI * r;
  const pct = Math.min(1, value / (max || 1));
  const filled = circumference * pct;
  const fill = tone === "danger" ? "#D44B2A" : colors.accent;
  const trackColor = colors.bg4;

  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <Circle
          cx={cx} cy={cx} r={r}
          stroke={trackColor} strokeWidth={stroke}
          fill="none"
          rotation={-90} originX={cx} originY={cx}
        />
        <Circle
          cx={cx} cy={cx} r={r}
          stroke={fill} strokeWidth={stroke}
          fill="none"
          strokeDasharray={`${filled} ${circumference}`}
          strokeLinecap="round"
          rotation={-90} originX={cx} originY={cx}
        />
      </Svg>
      <View style={s.inner}>
        {valueText ? <Text style={[s.val, { color: colors.text, fontSize: size > 150 ? 13 : 11 }]} numberOfLines={1}>{valueText}</Text> : null}
        {caption   ? <Text style={[s.cap, { color: colors.text2 }]}>{caption}</Text> : null}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  inner: { alignItems: "center", paddingHorizontal: 8 },
  val:   { fontWeight: "700", textAlign: "center" },
  cap:   { fontSize: 10, marginTop: 2, textAlign: "center" },
});
