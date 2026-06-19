import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";

export interface NotifPrefs {
  trade:  boolean; // notify on every executed trade
  budget: boolean; // notify when vault budget hits 80% / 100%
  weekly: boolean; // weekly summary on first open of a new week
}

const KEY = "@tefama_notif_prefs_v2";
const DEFAULTS: NotifPrefs = { trade: true, budget: true, weekly: false };

export function useNotifPrefs(): { prefs: NotifPrefs; toggle: (key: keyof NotifPrefs) => void } {
  const [prefs, setPrefs] = useState<NotifPrefs>(DEFAULTS);

  useEffect(() => {
    AsyncStorage.getItem(KEY).then(raw => {
      if (raw) {
        try { setPrefs({ ...DEFAULTS, ...JSON.parse(raw) }); } catch { /* ignore */ }
      }
    });
  }, []);

  const toggle = useCallback((key: keyof NotifPrefs) => {
    setPrefs(prev => {
      const next = { ...prev, [key]: !prev[key] };
      AsyncStorage.setItem(KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  return { prefs, toggle };
}
