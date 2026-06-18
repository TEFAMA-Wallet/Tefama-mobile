import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Tx } from "./data";
import type { Vault } from "./useOnchain";

export interface Notif {
  id:    string;
  type:  "trade" | "budget" | "agent" | "info";
  title: string;
  body:  string;
  time:  string;
  read:  boolean;
  link?: string;
}

const KEY   = "@tefama_notifs_v1";
const MAX   = 50;

function now() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function makeId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

export function useNotifications(trades: Tx[], vault: Vault | null) {
  const [notifs, setNotifs]     = useState<Notif[]>([]);
  const seenTradeIds             = useRef<Set<string>>(new Set());
  const seenBudget80             = useRef(false);
  const seenBudget100            = useRef(false);
  const prevPaused               = useRef<boolean | null>(null);
  const firstFetch               = useRef(true);

  // Load persisted notifications
  useEffect(() => {
    AsyncStorage.getItem(KEY).then((raw) => {
      if (raw) {
        try { setNotifs(JSON.parse(raw) as Notif[]); } catch { /* ignore */ }
      }
    });
  }, []);

  function save(updated: Notif[]) {
    const capped = updated.slice(0, MAX);
    setNotifs(capped);
    AsyncStorage.setItem(KEY, JSON.stringify(capped));
  }

  function push(n: Omit<Notif, "id" | "time" | "read">) {
    save([{ ...n, id: makeId(), time: now(), read: false }, ...notifs]);
  }

  // Watch trades for new executions
  useEffect(() => {
    if (firstFetch.current) {
      // Seed seen IDs without generating notifications
      trades.forEach((t) => seenTradeIds.current.add(t.id));
      firstFetch.current = false;
      return;
    }
    trades.forEach((t) => {
      if (seenTradeIds.current.has(t.id)) return;
      seenTradeIds.current.add(t.id);
      push({
        type:  "trade",
        title: "Trade executed",
        body:  `Agent bought ${t.amount} for ${t.value}`,
        link:  t.hash,
      });
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trades]);

  // Watch vault budget
  useEffect(() => {
    if (!vault) return;
    const pct = (vault.spent / (vault.budgetCap || 1)) * 100;

    if (pct >= 100 && !seenBudget100.current) {
      seenBudget100.current = true;
      push({ type: "budget", title: "Budget exhausted", body: "Vault budget is fully used. Agent has stopped trading." });
    } else if (pct >= 80 && !seenBudget80.current) {
      seenBudget80.current = true;
      push({ type: "budget", title: "Budget at 80%", body: `${pct.toFixed(0)}% of vault budget has been spent.` });
    }

    if (prevPaused.current !== null && prevPaused.current !== vault.paused) {
      push({
        type:  "agent",
        title: vault.paused ? "Agent paused" : "Agent resumed",
        body:  vault.paused ? "DCA agent has been paused." : "DCA agent is running again.",
      });
    }
    prevPaused.current = vault.paused;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vault]);

  const markAllRead = useCallback(() => {
    save(notifs.map((n) => ({ ...n, read: true })));
  }, [notifs]);

  const markRead = useCallback((id: string) => {
    save(notifs.map((n) => n.id === id ? { ...n, read: true } : n));
  }, [notifs]);

  const clear = useCallback(() => save([]), []);

  const addAgentTriggered = useCallback(() => {
    push({ type: "agent", title: "Agent deployed", body: "Your DCA agent is now live and trading on DeepBook." });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notifs]);

  const unread = notifs.filter((n) => !n.read).length;

  return { notifs, unread, markAllRead, markRead, clear, addAgentTriggered };
}
