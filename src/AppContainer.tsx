import { useState } from "react";
import { AppShellScreen, Tab } from "./screens/AppShellScreen";
import { LandingScreen } from "./screens/LandingScreen";
import { SplashScreen } from "./screens/SplashScreen";

type Screen = "splash" | "landing" | "app";

export function AppContainer() {
  const [screen, setScreen] = useState<Screen>("splash");
  const [tab,    setTab]    = useState<Tab>("home");

  if (screen === "splash") {
    return <SplashScreen onDone={() => setScreen("landing")} />;
  }

  if (screen === "landing") {
    return <LandingScreen onGetStarted={() => { setTab("home"); setScreen("app"); }} />;
  }

  return (
    <AppShellScreen
      tab={tab}
      onChangeTab={setTab}
    />
  );
}
