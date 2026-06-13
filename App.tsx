import { StatusBar } from "expo-status-bar";
import { StyleSheet } from "react-native";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";
import { AppContainer } from "./src/AppContainer";
import { ThemeProvider, useColorTheme } from "./src/lib/ThemeContext";

function Inner() {
  const { isDark } = useColorTheme();
  return (
    <SafeAreaView edges={["top", "left", "right"]} style={[s.safe, { backgroundColor: isDark ? "#0A0600" : "#FFF8F0" }]}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <AppContainer />
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <Inner />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1 },
});
