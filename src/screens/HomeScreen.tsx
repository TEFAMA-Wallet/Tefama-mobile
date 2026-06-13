import { StyleSheet, Text, View } from "react-native";
import { useColorTheme } from "../lib/ThemeContext";
import { getTheme } from "../theme";

export function HomeScreen() {
  const { isDark } = useColorTheme();
  const { colors } = getTheme(isDark);

  return (
    <View style={[s.root, { backgroundColor: colors.bg }]}>
      <Text style={[s.title, { color: colors.text }]}>Home</Text>
      <Text style={[s.sub,   { color: colors.text2 }]}>Your content goes here.</Text>
    </View>
  );
}

const s = StyleSheet.create({
  root:  { flex: 1, alignItems: "center", justifyContent: "center", gap: 8 },
  title: { fontSize: 22, fontWeight: "700", letterSpacing: -0.4 },
  sub:   { fontSize: 14 },
});
