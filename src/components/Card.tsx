import { StyleSheet, StyleProp, View, ViewStyle } from "react-native";
import { useColorTheme } from "../lib/ThemeContext";
import { getTheme } from "../theme";

interface Props {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  accent?: boolean;
}

export function Card({ children, style, accent }: Props) {
  const { isDark } = useColorTheme();
  const { colors } = getTheme(isDark);

  return (
    <View style={[
      s.card,
      {
        backgroundColor: colors.bgCard,
        borderColor: accent ? colors.accentB : colors.border,
      },
      accent && { borderColor: colors.accentB, borderWidth: 1 },
      style,
    ]}>
      {children}
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 16,
    overflow: "hidden",
  },
});
