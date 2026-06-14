export type AgentStatus = "active" | "paused" | "revoked";
export type TxStatus = "confirmed" | "pending" | "failed";
export type TxType = "Buy" | "Sell";

export interface Agent {
  id: string;
  name: string;
  strategy: string;
  status: AgentStatus;
  pair: string;
  budget: number;
  spent: number;
  timeLeft: string;
  lastTrade: string;
  trades: number;
  volume: number;
  successRate: number;
  avgSlippage: number;
  created: string;
}

export interface Tx {
  id: string;
  time: string;
  type: TxType;
  pair: string;
  amount: string;
  value: string;
  price: string;
  status: TxStatus;
  gas: string;
  hash: string;
  agent: string;
}

export interface Strategy {
  value: string;
  label: string;
  desc: string;
  icon: string;
}

export interface Template {
  id: string;
  title: string;
  icon: string;
  desc: string;
  params: string[];
  level: "Easy" | "Advanced" | "Custom";
}

export const WALLET = {
  usdc: 1284.5,
  sui: 842.0,
  suiPrice: 1.182,
  totalUsd: 2279.74,
  invested: 1820,
  value: 1944.4,
  gain: 124.4,
  gainPct: 6.8,
  dayChange: 18.2,
  dayPct: 0.9,
  spark: [12, 14, 13, 16, 18, 17, 21, 20, 24, 23, 27, 31],
};

export const STATS = {
  tradesToday: 33,
  volume: 5240,
  successRate: 98,
};

export const STRATEGIES: Strategy[] = [
  { value: "DCA",          label: "DCA — Dollar-cost average",  desc: "Buy a fixed amount on a fixed schedule.",            icon: "calendar-outline" },
  { value: "Smart Buy",    label: "Smart Buy — Buy the dip",     desc: "Trigger a buy when price drops by a set %.",         icon: "trending-down-outline" },
  { value: "Grid Trading", label: "Grid Trading",                desc: "Place laddered orders across a price range.",        icon: "grid-outline" },
  { value: "Manual",       label: "Manual",                      desc: "You define each execution rule yourself.",           icon: "options-outline" },
];

export const TEMPLATES: Template[] = [
  { id: "dip",    title: "Buy the dip",        icon: "trending-down-outline", desc: "Buys automatically when the price drops from its recent high.", params: ["5% dip trigger", "Up to 5 buys"],  level: "Easy" },
  { id: "dca",    title: "Steady accumulator",  icon: "calendar-outline",      desc: "Dollar-cost averages with equal buys on a fixed schedule.",     params: ["10 equal orders", "Every 12h"],     level: "Easy" },
  { id: "grid",   title: "Aggressive grid",     icon: "grid-outline",          desc: "Places laddered orders across a price range for volume.",        params: ["5 price levels", "High volume"],   level: "Advanced" },
  { id: "custom", title: "Build your own",       icon: "options-outline",       desc: "Configure every parameter yourself in the full wizard.",         params: ["Full control"],                    level: "Custom" },
];

export const AGENTS: Agent[] = [
  { id: "agt_8f3a", name: "SUI Accumulator", strategy: "DCA",          status: "active",  pair: "SUI / USDC",  budget: 500,  spent: 485, timeLeft: "18h 45m", lastTrade: "5 min ago",  trades: 42, volume: 5200,  successRate: 98,  avgSlippage: 0.31, created: "Jun 8, 2026"  },
  { id: "agt_2c91", name: "Dip Hunter",      strategy: "Smart Buy",    status: "paused",  pair: "DEEP / USDC", budget: 250,  spent: 88,  timeLeft: "2d 04h",  lastTrade: "1 hour ago", trades: 6,  volume: 880,   successRate: 100, avgSlippage: 0.44, created: "Jun 10, 2026" },
  { id: "agt_5a02", name: "Grid ETH",        strategy: "Grid Trading", status: "active",  pair: "ETH / USDC",  budget: 1000, spent: 612, timeLeft: "5d 09h",  lastTrade: "22 min ago", trades: 71, volume: 12400, successRate: 96,  avgSlippage: 0.28, created: "Jun 5, 2026"  },
  { id: "agt_91fd", name: "Weekend DCA",     strategy: "DCA",          status: "revoked", pair: "SUI / USDC",  budget: 300,  spent: 300, timeLeft: "Ended",   lastTrade: "3 days ago", trades: 24, volume: 3000,  successRate: 100, avgSlippage: 0.35, created: "May 28, 2026" },
];

export const ACTIVITY: Tx[] = [
  { id: "tx1", time: "12s ago",  type: "Buy",  pair: "SUI / USDC",  amount: "+42.0 SUI",   value: "49.64 USDC", price: "1.182", status: "confirmed", gas: "0.0021", hash: "0x9f3a…7c21", agent: "SUI Accumulator" },
  { id: "tx2", time: "4m ago",   type: "Buy",  pair: "SUI / USDC",  amount: "+38.5 SUI",   value: "45.18 USDC", price: "1.173", status: "confirmed", gas: "0.0019", hash: "0x71be…0a93", agent: "SUI Accumulator" },
  { id: "tx3", time: "11m ago",  type: "Sell", pair: "DEEP / USDC", amount: "−120 DEEP",   value: "31.20 USDC", price: "0.260", status: "pending",   gas: "0.0022", hash: "0x4d02…ff18", agent: "Dip Hunter"      },
  { id: "tx4", time: "1h ago",   type: "Buy",  pair: "SUI / USDC",  amount: "+40.1 SUI",   value: "46.92 USDC", price: "1.170", status: "confirmed", gas: "0.0020", hash: "0xa8c5…3b27", agent: "SUI Accumulator" },
  { id: "tx5", time: "2h ago",   type: "Buy",  pair: "DEEP / USDC", amount: "+200 DEEP",   value: "53.00 USDC", price: "0.265", status: "confirmed", gas: "0.0023", hash: "0x0e9f…7c44", agent: "Dip Hunter"      },
  { id: "tx6", time: "3h ago",   type: "Buy",  pair: "SUI / USDC",  amount: "+39.0 SUI",   value: "45.63 USDC", price: "1.170", status: "failed",    gas: "0.0000", hash: "0x55a1…9d0c", agent: "SUI Accumulator" },
];

export const fmtUSD = (n: number) =>
  n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const fmtNum = (n: number) => n.toLocaleString("en-US");
