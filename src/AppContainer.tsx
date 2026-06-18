import { useEffect, useState } from "react";
import { View, StyleSheet }    from "react-native";
import { BottomNav }            from "./components/BottomNav";
import { TxDetailModal }        from "./screens/TxDetailModal";
import { SplashScreen }         from "./screens/SplashScreen";
import { ConnectScreen }        from "./screens/ConnectScreen";
import { DashboardScreen }      from "./screens/DashboardScreen";
import { WalletScreen }         from "./screens/WalletScreen";
import { ActivityScreen }       from "./screens/ActivityScreen";
import { AnalyticsScreen }      from "./screens/AnalyticsScreen";
import { SettingsScreen }       from "./screens/SettingsScreen";
import { AgentDetailsScreen }   from "./screens/AgentDetailsScreen";
import { CreateAgentScreen }    from "./screens/CreateAgentScreen";
import { TemplatesScreen }      from "./screens/TemplatesScreen";
import { AgentCreatedScreen }   from "./screens/AgentCreatedScreen";
import type { Tx, Agent }       from "./lib/data";
import type { NavTab }          from "./components/BottomNav";
import { useAuth }              from "./lib/AuthContext";
import { usePrice, useWallet, useTrades, type Trade } from "./lib/useOnchain";
import { VAULT_ID }             from "./lib/constants";

type Screen =
  | "splash" | "connect"
  | "home" | "wallet" | "activity" | "analytics" | "settings"
  | "agent-detail" | "create" | "templates" | "created";

const TAB_SCREENS: NavTab[] = ["home", "wallet", "activity", "analytics", "settings"];

function tradeToTx(t: Trade): Tx {
  return {
    id:     t.id,
    time:   t.time,
    type:   "Buy",
    pair:   "DEEP / SUI",
    amount: `+${t.baseReceived.toFixed(4)} DEEP`,
    value:  `${t.quoteSpent.toFixed(4)} SUI`,
    price:  t.price.toFixed(8),
    status: t.status,
    gas:    "—",
    hash:   t.digest,
    agent:  "DCA Agent",
  };
}

export function AppContainer() {
  const { session, isLoading: authLoading } = useAuth();

  const [screen,    setScreen]    = useState<Screen>("splash");
  const [tab,       setTab]       = useState<NavTab>("home");
  const [selTx,     setSelTx]     = useState<Tx | null>(null);
  const [splashDone,setSplashDone]= useState(false);

  // All data hooks — active even before login (price is public)
  const priceData  = usePrice();
  const walletData = useWallet(session?.address ?? null);
  const tradeData  = useTrades(VAULT_ID, priceData.deepPrice);

  const liveTxs = tradeData.trades.map(tradeToTx);

  // Build agent from live vault
  const vault = walletData.vault;
  const liveAgent: Agent = {
    id:          VAULT_ID,
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

  function handleSplashDone() {
    setSplashDone(true);
    if (!authLoading) {
      setScreen(session ? "home" : "connect");
    }
  }

  useEffect(() => {
    if (splashDone && screen === "splash" && !authLoading) {
      setScreen(session ? "home" : "connect");
    }
  }, [authLoading, session, splashDone, screen]);

  const isTabScreen = (TAB_SCREENS as string[]).includes(screen);

  function go(s: Screen) {
    setScreen(s);
    if ((TAB_SCREENS as string[]).includes(s)) setTab(s as NavTab);
  }

  function handleTabChange(key: NavTab) {
    setTab(key);
    setScreen(key);
  }

  const commonDashProps = {
    price:         priceData.price,
    deepPrice:     priceData.deepPrice,
    change24h:     priceData.change24h,
    deepChange24h: priceData.deepChange24h,
    priceLoading:  priceData.loading,
    suiBalance:    walletData.suiBalance,
    usdcBalance:   walletData.usdcBalance,
    deepBalance:   walletData.deepBalance,
    vault:         walletData.vault,
    walletLoading: walletData.loading,
    trades:        liveTxs,
    tradeCount:    tradeData.count,
    tradePnl:      tradeData.pnl,
    tradeRoi:      tradeData.roi,
    tradeLoading:  tradeData.loading,
    liveAgent,
    onViewAgent:    () => go("agent-detail"),
    onViewActivity: () => go("activity"),
    onViewTx:       setSelTx,
  };

  let content: React.ReactNode;

  switch (screen) {
    case "splash":
      content = <SplashScreen onDone={handleSplashDone} />;
      break;

    case "connect":
      content = <ConnectScreen onConnected={() => { setScreen("home"); setTab("home"); }} />;
      break;

    case "home":
      content = <DashboardScreen {...commonDashProps} />;
      break;

    case "wallet":
      content = (
        <WalletScreen
          price={priceData.price}
          deepPrice={priceData.deepPrice}
          suiBalance={walletData.suiBalance}
          usdcBalance={walletData.usdcBalance}
          deepBalance={walletData.deepBalance}
          vault={walletData.vault}
          walletLoading={walletData.loading}
          priceLoading={priceData.loading}
        />
      );
      break;

    case "activity":
      content = (
        <ActivityScreen
          trades={liveTxs}
          pnl={tradeData.pnl}
          count={tradeData.count}
          loading={tradeData.loading}
          onRefresh={tradeData.refresh}
          onViewTx={setSelTx}
          deepPrice={priceData.deepPrice}
        />
      );
      break;

    case "analytics":
      content = (
        <AnalyticsScreen
          price={priceData.price}
          deepPrice={priceData.deepPrice}
          change24h={priceData.change24h}
          deepChange24h={priceData.deepChange24h}
          high24h={priceData.high24h}
          low24h={priceData.low24h}
          volume24h={priceData.volume24h}
          suiBalance={walletData.suiBalance}
          usdcBalance={walletData.usdcBalance}
          deepBalance={walletData.deepBalance}
          vault={walletData.vault}
          trades={liveTxs}
          pnl={tradeData.pnl}
          roi={tradeData.roi}
          count={tradeData.count}
          loading={priceData.loading || walletData.loading || tradeData.loading}
        />
      );
      break;

    case "settings":
      content = <SettingsScreen vault={walletData.vault} />;
      break;

    case "agent-detail":
      content = (
        <AgentDetailsScreen
          agent={liveAgent}
          trades={liveTxs}
          onBack={() => go("home")}
          onRevoke={() => go("home")}
          onViewActivity={() => go("activity")}
          onViewTx={setSelTx}
        />
      );
      break;

    case "templates":
      content = (
        <TemplatesScreen
          onBack={() => go(tab)}
          onSelect={() => go("create")}
        />
      );
      break;

    case "create":
      content = (
        <CreateAgentScreen
          onBack={() => go("templates")}
          onDone={() => go("created")}
        />
      );
      break;

    case "created":
      content = (
        <AgentCreatedScreen
          onViewAgent={() => go("agent-detail")}
          onHome={() => go("home")}
        />
      );
      break;

    default:
      content = <DashboardScreen {...commonDashProps} />;
  }

  return (
    <View style={s.root}>
      <View style={s.content}>{content}</View>
      {isTabScreen && <BottomNav value={tab} onChange={handleTabChange} />}
      <TxDetailModal tx={selTx} onClose={() => setSelTx(null)} />
    </View>
  );
}

const s = StyleSheet.create({
  root:    { flex: 1 },
  content: { flex: 1 },
});
