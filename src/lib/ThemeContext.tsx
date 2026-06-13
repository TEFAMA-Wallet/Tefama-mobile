import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface ThemeCtx {
  isDark: boolean;
  toggle: () => void;
}

const Ctx = createContext<ThemeCtx>({ isDark: true, toggle: () => {} });

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem("theme").then((v) => {
      if (v === "light") setIsDark(false);
    });
  }, []);

  function toggle() {
    setIsDark((prev) => {
      AsyncStorage.setItem("theme", prev ? "light" : "dark").catch(() => {});
      return !prev;
    });
  }

  return <Ctx.Provider value={{ isDark, toggle }}>{children}</Ctx.Provider>;
}

export function useColorTheme() {
  return useContext(Ctx);
}
