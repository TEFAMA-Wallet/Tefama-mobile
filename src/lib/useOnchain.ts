import { useCallback, useEffect, useRef, useState } from "react";
import { API_BASE, VAULT_ID } from "./constants";

interface PollState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

function usePolling<T>(
  url: string | null,
  interval: number,
): PollState<T> & { refresh: () => void } {
  const [state, setState] = useState<PollState<T>>({ data: null, loading: true, error: null });
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const urlRef   = useRef(url);
  urlRef.current = url;

  const fetchOnce = useCallback(async () => {
    const u = urlRef.current;
    if (!u) { setState(s => ({ ...s, loading: false })); return; }
    try {
      const res = await fetch(u);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json() as T;
      setState({ data, loading: false, error: null });
    } catch (e) {
      setState(s => ({ ...s, loading: false, error: String(e) }));
    }
  }, []);

  useEffect(() => {
    setState(s => ({ ...s, loading: true }));
    fetchOnce();
    timerRef.current = setInterval(fetchOnce, interval);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [url, interval, fetchOnce]);

  return { ...state, refresh: fetchOnce };
}

// ── Price ──────────────────────────────────────────────────────────────────

interface PriceData {
  price: number;
  change24h: number;
  high24h: number;
  low24h: number;
  volume24h: number;
  deepPrice: number;
  deepInSui: number;
  deepChange24h: number;
}

export function usePrice() {
  const { data, loading, error, refresh } = usePolling<PriceData>(`${API_BASE}/api/price`, 20_000);
  return {
    price:        data?.price        ?? 0,
    change24h:    data?.change24h    ?? 0,
    high24h:      data?.high24h      ?? 0,
    low24h:       data?.low24h       ?? 0,
    volume24h:    data?.volume24h    ?? 0,
    deepPrice:    data?.deepPrice    ?? 0,
    deepInSui:    data?.deepInSui    ?? 0,
    deepChange24h:data?.deepChange24h?? 0,
    loading,
    error,
    refresh,
  };
}

// ── Wallet ─────────────────────────────────────────────────────────────────

export interface Vault {
  id: string;
  budgetCap: number;
  spent: number;
  paused: boolean;
}

interface WalletData {
  suiBalance:  number;
  usdcBalance: number;
  deepBalance: number;
  vault:       Vault | null;
}

export function useWallet(address: string | null) {
  const url = address ? `${API_BASE}/api/wallet/${address}` : null;
  const { data, loading, error, refresh } = usePolling<WalletData>(url, 15_000);
  return {
    suiBalance:  data?.suiBalance  ?? 0,
    usdcBalance: data?.usdcBalance ?? 0,
    deepBalance: data?.deepBalance ?? 0,
    vault:       data?.vault       ?? null,
    loading,
    error,
    refresh,
  };
}

// ── Trades ─────────────────────────────────────────────────────────────────

export interface Trade {
  id: string;
  digest: string;
  type: "buy" | "sell";
  asset: string;
  quoteSpent: number;
  baseReceived: number;
  price: number;
  agent: string;
  timestampMs: number;
  time: string;
  status: "confirmed" | "pending" | "failed";
  explorerUrl: string;
}

interface TradesData {
  trades: Trade[];
  pnl:    number;
  roi:    number;
  count:  number;
}

export function useTrades(vaultId?: string, deepPrice?: number) {
  const p = new URLSearchParams();
  if (vaultId)   p.set("vault", vaultId);
  if (deepPrice) p.set("price", String(deepPrice));
  const url = `${API_BASE}/api/trades?${p}`;
  const { data, loading, error, refresh } = usePolling<TradesData>(url, 30_000);
  return {
    trades:  data?.trades ?? [],
    pnl:     data?.pnl    ?? 0,
    roi:     data?.roi    ?? 0,
    count:   data?.count  ?? 0,
    loading,
    error,
    refresh,
  };
}

// ── Agent run ──────────────────────────────────────────────────────────────

export interface RunResult {
  success?: boolean;
  digest?:  string;
  skipped?: boolean;
  reason?:  string;
  error?:   string;
}

export async function runAgent(): Promise<RunResult> {
  const res = await fetch(`${API_BASE}/api/agent/run`);
  return res.json() as Promise<RunResult>;
}
