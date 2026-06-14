import { useState } from "react";
import { View, StyleSheet } from "react-native";
import { BottomNav }         from "./components/BottomNav";
import { TxDetailModal }     from "./screens/TxDetailModal";
import { SplashScreen }      from "./screens/SplashScreen";
import { OnboardingScreen }  from "./screens/OnboardingScreen";
import { ConnectScreen }     from "./screens/ConnectScreen";
import { DashboardScreen }   from "./screens/DashboardScreen";
import { AgentsScreen }      from "./screens/AgentsScreen";
import { ActivityScreen }    from "./screens/ActivityScreen";
import { SettingsScreen }    from "./screens/SettingsScreen";
import { AgentDetailsScreen }from "./screens/AgentDetailsScreen";
import { CreateAgentScreen } from "./screens/CreateAgentScreen";
import { TemplatesScreen }   from "./screens/TemplatesScreen";
import { AgentCreatedScreen }from "./screens/AgentCreatedScreen";
import type { Agent, Tx }    from "./lib/data";
import type { NavTab }       from "./components/BottomNav";
import { AGENTS }            from "./lib/data";

type Screen =
  | "splash" | "onboarding" | "connect"
  | "home" | "agents" | "activity" | "settings"
  | "agent-detail" | "create" | "templates" | "created";

const TAB_SCREENS: NavTab[] = ["home", "agents", "activity", "settings"];

export function AppContainer() {
  const [screen,  setScreen]  = useState<Screen>("splash");
  const [tab,     setTab]     = useState<NavTab>("home");
  const [agent,   setAgent]   = useState<Agent>(AGENTS[0]);
  const [tx,      setTx]      = useState<Tx | null>(null);

  const isTabScreen = (TAB_SCREENS as string[]).includes(screen);

  function go(s: Screen, payload?: Agent) {
    if (payload) setAgent(payload);
    setScreen(s);
    if ((TAB_SCREENS as string[]).includes(s)) setTab(s as NavTab);
  }

  function handleNavChange(key: NavTab | "create") {
    if (key === "create") { setScreen("templates"); return; }
    setTab(key);
    setScreen(key);
  }

  let content: React.ReactNode;

  switch (screen) {
    case "splash":
      content = <SplashScreen onDone={() => setScreen("onboarding")} />;
      break;
    case "onboarding":
      content = <OnboardingScreen onDone={() => setScreen("connect")} />;
      break;
    case "connect":
      content = <ConnectScreen onConnected={() => go("home")} />;
      break;
    case "home":
      content = <DashboardScreen
        onViewAgent={(a) => { setAgent(a); setScreen("agent-detail"); }}
        onViewAgents={() => go("agents")}
        onViewActivity={() => go("activity")}
        onViewTx={(t) => setTx(t)}
      />;
      break;
    case "agents":
      content = <AgentsScreen
        onViewAgent={(a) => { setAgent(a); setScreen("agent-detail"); }}
        onCreateAgent={() => setScreen("templates")}
      />;
      break;
    case "activity":
      content = <ActivityScreen onViewTx={(t) => setTx(t)} />;
      break;
    case "settings":
      content = <SettingsScreen />;
      break;
    case "agent-detail":
      content = <AgentDetailsScreen
        agent={agent}
        onBack={() => setScreen("agents")}
        onRevoke={() => setScreen("home")}
        onViewActivity={() => go("activity")}
        onViewTx={(t) => setTx(t)}
      />;
      break;
    case "templates":
      content = <TemplatesScreen
        onBack={() => setScreen(tab)}
        onSelect={() => setScreen("create")}
      />;
      break;
    case "create":
      content = <CreateAgentScreen
        onBack={() => setScreen("templates")}
        onDone={() => setScreen("created")}
      />;
      break;
    case "created":
      content = <AgentCreatedScreen
        onViewAgent={(a) => { setAgent(a); setScreen("agent-detail"); }}
        onHome={() => go("home")}
      />;
      break;
    default:
      content = <DashboardScreen
        onViewAgent={(a) => { setAgent(a); setScreen("agent-detail"); }}
        onViewAgents={() => go("agents")}
        onViewActivity={() => go("activity")}
        onViewTx={(t) => setTx(t)}
      />;
  }

  return (
    <View style={s.root}>
      <View style={s.content}>{content}</View>

      {isTabScreen && (
        <BottomNav value={tab} onChange={handleNavChange} />
      )}

      <TxDetailModal tx={tx} onClose={() => setTx(null)} />
    </View>
  );
}

const s = StyleSheet.create({
  root:    { flex: 1 },
  content: { flex: 1 },
});
