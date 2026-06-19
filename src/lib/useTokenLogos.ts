import { useEffect, useState } from "react";

// CoinGecko IDs for each token symbol
const COINGECKO_IDS: Record<string, string> = {
  SUI:  "sui",
  USDC: "usd-coin",
  DEEP: "deep",
};

// Cached results so we only fetch once per app session
const cache: Record<string, string> = {};

export function useTokenLogos(symbols: string[]): Record<string, string | null> {
  const [logos, setLogos] = useState<Record<string, string | null>>(() =>
    Object.fromEntries(symbols.map(s => [s, cache[s] ?? null]))
  );

  useEffect(() => {
    const missing = symbols.filter(s => !cache[s] && COINGECKO_IDS[s]);
    if (missing.length === 0) return;

    const ids = missing.map(s => COINGECKO_IDS[s]).join(",");
    fetch(
      `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${ids}&per_page=20&sparkline=false`,
      { headers: { Accept: "application/json" } }
    )
      .then(r => r.json())
      .then((data: { id: string; image: string }[]) => {
        const updates: Record<string, string | null> = {};
        for (const sym of missing) {
          const coin = data.find(d => d.id === COINGECKO_IDS[sym]);
          if (coin?.image) {
            cache[sym] = coin.image;
            updates[sym] = coin.image;
          }
        }
        if (Object.keys(updates).length > 0) {
          setLogos(prev => ({ ...prev, ...updates }));
        }
      })
      .catch(() => {}); // silently fall back to letter icons
  }, []);

  return logos;
}
