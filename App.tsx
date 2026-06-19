import { StatusBar } from "expo-status-bar";
import { StyleSheet, View } from "react-native";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";
import { useFonts } from "expo-font";
import { Ionicons } from "@expo/vector-icons";
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
  // Pre-load Ionicons on Hermes/iOS before any component uses the icon font.
  // Without this, Hermes throws "Property 'Ionicons' doesn't exist" on first render.
  const [fontsLoaded] = useFonts({ ...Ionicons.font });

  if (!fontsLoaded) {
    // Transparent placeholder — SplashScreen handles the visible loading state
    return <View style={s.safe} />;
  }

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
