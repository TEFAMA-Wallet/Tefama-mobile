import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Tx } from "./data";
import type { Vault } from "./useOnchain";
import type { NotifPrefs } from "./useNotifPrefs";

export interface Notif {
  id:    string;
  type:  "trade" | "budget" | "agent" | "info";
  title: string;
  body:  string;
  time:  string;
  read:  boolean;
  link?: string;
}

const NOTIFS_KEY  = "@tefama_notifs_v1";
const WEEKLY_KEY  = "@tefama_weekly_seen_v1";
const MAX         = 50;

function nowStr() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function makeId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

function isoWeek(d = new Date()) {
  const jan1 = new Date(d.getFullYear(), 0, 1);
  const week = Math.ceil((((d.getTime() - jan1.getTime()) / 86400000) + jan1.getDay() + 1) / 7);
  return `${d.getFullYear()}-W${week}`;
}

export function useNotifications(
  trades: Tx[],
  vault:  Vault | null,
  prefs:  NotifPrefs,
) {
  const [notifs, setNotifs]  = useState<Notif[]>([]);
  const seenTradeIds          = useRef<Set<string>>(new Set());
  const seenBudget80          = useRef(false);
  const seenBudget100         = useRef(false);
  const prevPaused            = useRef<boolean | null>(null);
  const firstFetch            = useRef(true);

  // Load persisted notifications on mount
  useEffect(() => {
    AsyncStorage.getItem(NOTIFS_KEY).then(raw => {
      if (raw) {
        try { setNotifs(JSON.parse(raw) as Notif[]); } catch { /* ignore */ }
      }
    });
  }, []);

  function save(updated: Notif[]) {
    const capped = updated.slice(0, MAX);
    setNotifs(capped);
    AsyncStorage.setItem(NOTIFS_KEY, JSON.stringify(capped));
  }

  // Uses a ref so we always push onto the latest notifs without stale closure
  const notifsRef = useRef<Notif[]>([]);
  notifsRef.current = notifs;

  function push(n: Omit<Notif, "id" | "time" | "read">) {
    const next: Notif = { ...n, id: makeId(), time: nowStr(), read: false };
    save([next, ...notifsRef.current]);
  }

  // ── Watch trades → "Trade executed" notification ──────────────────────────
  useEffect(() => {
    if (firstFetch.current) {
      // Seed seen IDs on first load without generating notifications
      trades.forEach(t => seenTradeIds.current.add(t.id));
      firstFetch.current = false;
      return;
    }
    if (!prefs.trade) return; // user disabled trade notifications
    trades.forEach(t => {
      if (seenTradeIds.current.has(t.id)) return;
      seenTradeIds.current.add(t.id);
      push({
        type:  "trade",
        title: "Trade executed",
        body:  `Agent bought ${t.amount.replace("+", "")} for ${t.value}`,
        link:  t.hash,
      });
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trades, prefs.trade]);

  // ── Watch vault budget → warnings ─────────────────────────────────────────
  useEffect(() => {
    if (!vault) return;
    const pct = (vault.spent / (vault.budgetCap || 1)) * 100;

    if (prefs.budget) {
      if (pct >= 100 && !seenBudget100.current) {
        seenBudget100.current = true;
        push({ type: "budget", title: "Budget exhausted", body: "Vault budget is fully used. Agent has stopped trading." });
      } else if (pct >= 80 && !seenBudget80.current) {
        seenBudget80.current = true;
        push({ type: "budget", title: "Budget at 80%", body: `${pct.toFixed(0)}% of vault budget has been spent.` });
      }
    }

    // Agent pause/resume — always shown regardless of budget toggle
    if (prevPaused.current !== null && prevPaused.current !== vault.paused) {
      push({
        type:  "agent",
        title: vault.paused ? "Agent paused" : "Agent resumed",
        body:  vault.paused ? "DCA agent has been paused." : "DCA agent is now running.",
      });
    }
    prevPaused.current = vault.paused;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vault, prefs.budget]);

  // ── Weekly summary — fires once per calendar week on app open ─────────────
  useEffect(() => {
    if (!prefs.weekly || trades.length === 0) return;

    const thisWeek = isoWeek();
    AsyncStorage.getItem(WEEKLY_KEY).then(seen => {
      if (seen === thisWeek) return; // already shown this week
      AsyncStorage.setItem(WEEKLY_KEY, thisWeek);

      const totalSui  = trades.reduce((s, t) => s + Number(t.value.replace(" SUI", "")), 0);
      const totalDeep = trades.reduce((s, t) => s + Number(t.amount.replace("+", "").replace(" DEEP", "")), 0);
      push({
        type:  "info",
        title: "Weekly summary",
        body:  `${trades.length} total trade${trades.length === 1 ? "" : "s"} · ${totalSui.toFixed(3)} SUI spent · ${totalDeep.toFixed(4)} DEEP accumulated`,
      });
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefs.weekly, trades.length]);

  // ── Actions ───────────────────────────────────────────────────────────────
  const markAllRead = useCallback(() => {
    save(notifsRef.current.map(n => ({ ...n, read: true })));
  }, []);

  const markRead = useCallback((id: string) => {
    save(notifsRef.current.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const clear = useCallback(() => save([]), []);

  const addAgentTriggered = useCallback(() => {
    push({ type: "agent", title: "Agent deployed", body: "Your DCA agent is now live and trading on DeepBook." });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const unread = notifs.filter(n => !n.read).length;

  return { notifs, unread, markAllRead, markRead, clear, addAgentTriggered };
}
