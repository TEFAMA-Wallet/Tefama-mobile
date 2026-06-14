import { Pressable, StyleSheet, Text, View } from "react-native";
import { useColorTheme } from "../lib/ThemeContext";
import { getTheme } from "../theme";

interface Props {
  children: React.ReactNode;
  action?: string;
  onAction?: () => void;
}

export function SectionHead({ children, action, onAction }: Props) {
  const { isDark } = useColorTheme();
  const { colors } = getTheme(isDark);

  return (
    <View style={s.root}>
      <Text style={[s.title, { color: colors.text }]}>{children}</Text>
      {action && (
        <Pressable onPress={onAction} hitSlop={10}>
          <Text style={[s.action, { color: colors.accent }]}>{action}</Text>
        </Pressable>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  root:   { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 2 },
  title:  { fontSize: 15, fontWeight: "700", letterSpacing: -0.2 },
  action: { fontSize: 13, fontWeight: "600" },
});
