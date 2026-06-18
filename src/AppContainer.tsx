import { useState } from "react";
import { View, StyleSheet } from "react-native";
import { BottomNav }         from "./components/BottomNav";
import { TxDetailModal, type TxShape } from "./screens/TxDetailModal";
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
import { useAuth }           from "./lib/AuthContext";
import { usePrice, useWallet, useTrades, type Trade } from "./lib/useOnchain";
import { VAULT_ID }          from "./lib/constants";
import type { Agent }        from "./lib/data";
import type { NavTab }       from "./components/BottomNav";

type Screen =
  | "splash" | "onboarding" | "connect"
  | "home" | "agents" | "activity" | "settings"
  | "agent-detail" | "create" | "templates" | "created";

const TAB_SCREENS: NavTab[] = ["home", "agents", "activity", "settings"];

// Adapts a live Trade into the legacy Tx shape the detail modal expects
function tradeToTx(t: Trade) {
  return {
    id:     t.id,
    time:   t.time,
    type:   "Buy" as const,
    pair:   "DEEP / SUI",
    amount: `+${t.baseReceived.toFixed(3)} DEEP`,
    value:  `${t.quoteSpent.toFixed(4)} SUI`,
    price:  t.price.toFixed(6),
    status: t.status as "confirmed" | "pending" | "failed",
    gas:    "—",
    hash:   t.digest,
    agent:  "DCA Agent",
  };
}

export function AppContainer() {
  const { session, isLoading: authLoading } = useAuth();

  const [screen,    setScreen]    = useState<Screen>("splash");
  const [tab,       setTab]       = useState<NavTab>("home");
  const [selAgent,  setSelAgent]  = useState<Agent | null>(null);
  const [selTx,     setSelTx]     = useState<TxShape | null>(null);
  const [splashDone, setSplashDone] = useState(false);

  // Global data hooks — available to all screens
  const priceData  = usePrice();
  const walletData = useWallet(session?.address ?? null);
  const tradeData  = useTrades(VAULT_ID, priceData.deepPrice);

  const isTabScreen = (TAB_SCREENS as string[]).includes(screen);

  function go(s: Screen) {
    setScreen(s);
    if ((TAB_SCREENS as string[]).includes(s)) setTab(s as NavTab);
  }

  function handleNavChange(key: NavTab | "create") {
    if (key === "create") { setScreen("templates"); return; }
    setTab(key);
    setScreen(key);
  }

  function handleSplashDone() {
    setSplashDone(true);
    if (authLoading) { setScreen("splash"); return; } // wait a tick
    if (session) { setScreen("home"); } else { setScreen("onboarding"); }
  }

  // Once auth resolves after splash, navigate
  if (splashDone && screen === "splash" && !authLoading) {
    setScreen(session ? "home" : "onboarding");
  }

  // Build a synthetic "Agent" from live vault data for screens that need it
  const vault = walletData.vault;
  const liveAgent: Agent = {
    id:          "vault_0",
    name:        "DCA Agent",
    strategy:    "DCA",
    status:      vault?.paused ? "paused" : "active",
    pair:        "DEEP / SUI",
    budget:      vault?.budgetCap ?? 0,
    spent:       vault?.spent     ?? 0,
    timeLeft:    "—",
    lastTrade:   tradeData.trades[0]?.time ?? "—",
    trades:      tradeData.count,
    volume:      tradeData.trades.reduce((s, t) => s + t.quoteSpent, 0),
    successRate: tradeData.count > 0 ? 100 : 0,
    avgSlippage: 0,
    created:     "Jun 2026",
  };

  const liveTxs = tradeData.trades.map(tradeToTx);

  let content: React.ReactNode;

  switch (screen) {
    case "splash":
      content = <SplashScreen onDone={handleSplashDone} />;
      break;
    case "onboarding":
      content = <OnboardingScreen onDone={() => go("connect")} />;
      break;
    case "connect":
      content = <ConnectScreen onConnected={() => go("home")} />;
      break;
    case "home":
      content = <DashboardScreen
        priceData={priceData}
        walletData={walletData}
        tradeData={tradeData}
        liveAgent={liveAgent}
        onViewAgent={() => { setSelAgent(liveAgent); go("agent-detail"); }}
        onViewAgents={() => go("agents")}
        onViewActivity={() => go("activity")}
        onViewTx={(tx) => setSelTx(tx)}
      />;
      break;
    case "agents":
      content = <AgentsScreen
        liveAgent={liveAgent}
        onViewAgent={() => { setSelAgent(liveAgent); go("agent-detail"); }}
        onCreateAgent={() => go("templates")}
      />;
      break;
    case "activity":
      content = <ActivityScreen
        trades={liveTxs}
        loading={tradeData.loading}
        onViewTx={(tx) => setSelTx(tx)}
      />;
      break;
    case "settings":
      content = <SettingsScreen />;
      break;
    case "agent-detail":
      content = <AgentDetailsScreen
        agent={selAgent ?? liveAgent}
        trades={liveTxs}
        onBack={() => go("agents")}
        onRevoke={() => go("home")}
        onViewActivity={() => go("activity")}
        onViewTx={(tx) => setSelTx(tx)}
      />;
      break;
    case "templates":
      content = <TemplatesScreen
        onBack={() => go(tab)}
        onSelect={() => go("create")}
      />;
      break;
    case "create":
      content = <CreateAgentScreen
        onBack={() => go("templates")}
        onDone={() => go("created")}
      />;
      break;
    case "created":
      content = <AgentCreatedScreen
        onViewAgent={() => { setSelAgent(liveAgent); go("agent-detail"); }}
        onHome={() => go("home")}
      />;
      break;
    default:
      content = <DashboardScreen
        priceData={priceData}
        walletData={walletData}
        tradeData={tradeData}
        liveAgent={liveAgent}
        onViewAgent={() => { setSelAgent(liveAgent); go("agent-detail"); }}
        onViewAgents={() => go("agents")}
        onViewActivity={() => go("activity")}
        onViewTx={(tx) => setSelTx(tx)}
      />;
  }

  return (
    <View style={s.root}>
      <View style={s.content}>{content}</View>

      {isTabScreen && (
        <BottomNav value={tab} onChange={handleNavChange} />
      )}

      <TxDetailModal tx={selTx} onClose={() => setSelTx(null)} />
    </View>
  );
}

const s = StyleSheet.create({
  root:    { flex: 1 },
  content: { flex: 1 },
});
