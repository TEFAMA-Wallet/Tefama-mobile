import { StatusBar } from "expo-status-bar";
import { StyleSheet } from "react-native";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";
import { AppContainer } from "./src/AppContainer";
import { ThemeProvider, useColorTheme } from "./src/lib/ThemeContext";
import { AuthProvider } from "./src/lib/AuthContext";

function Inner() {
  const { isDark } = useColorTheme();
  return (
    <SafeAreaView edges={["top", "left", "right"]} style={[s.safe, { backgroundColor: isDark ? "#0a0a0a" : "#f5f6fb" }]}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <AppContainer />
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <Inner />
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1 },
});
