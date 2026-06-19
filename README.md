# TEFAMA Mobile

> **Sui Overflow Hackathon · Track 2: Autonomous Agent Wallet — Mobile Companion**

TEFAMA Mobile is the React Native / Expo companion to [TEFAMA Web](https://github.com/TEFAMA-Wallet/Tefama-website). Sign in with Google, and your on-chain DCA agent — created on the web app or directly in mobile — is right there: live vault balance, every executed trade, real-time P&L, and full pause/revoke control. No seed phrases. No wallet extensions. Everything from the same zkLogin Google account.

---

## Download

<p align="center">
  <a href="https://expo.dev/accounts/tevinprime66/projects/tefama-mobile/builds/d78ed8f7-5048-4145-9499-fdf56f993cd2">
    <img src="https://img.shields.io/badge/Download%20APK-Android-3DDC84?style=for-the-badge&logo=android&logoColor=white" alt="Download for Android" height="44" />
  </a>
  &nbsp;&nbsp;
  <a href="https://expo.dev/accounts/tevinprime66/projects/tefama-mobile/builds/8d5203bb-f5f7-4641-b403-72e72ed5fa9a">
    <img src="https://img.shields.io/badge/Download-iOS%20Simulator-000000?style=for-the-badge&logo=apple&logoColor=white" alt="Download for iOS" height="44" />
  </a>
</p>

> **Android** — tap the badge, download the APK, install directly on your phone.  
> **iOS** — simulator build for Mac. Real-device build requires Apple Developer account.

---

## Relationship to the Web App

TEFAMA Mobile does **not** run its own backend. It connects directly to the same API that powers [tefama-website.vercel.app](https://tefama-website.vercel.app):

```
TEFAMA Web (Next.js · Vercel)
  │
  ├── /api/price          → SUI & DEEP market data, 24h stats
  ├── /api/wallet/:addr   → SUI/USDC/DEEP balances + vault state
  ├── /api/trades         → on-chain trade history for a vault
  └── /api/agent/run      → triggers the DCA agent manually
        │
        ▼
TEFAMA Mobile (Expo · React Native)
  reads the same data, same user address, same vault
```

An agent created on the web appears instantly in the mobile app when you log in with the same Google account. Your vault ID is resolved from your wallet address — nothing is hardcoded per user.

---

## What the App Does

| Screen | What you see |
|---|---|
| **Splash** | Animated logo entrance with staggered ring expansion |
| **Connect** | Google sign-in via Sui zkLogin — one tap, no seed phrase |
| **Dashboard** | Portfolio value · trade count · P&L · SUI price · My Agents card · recent trades |
| **Wallet** | Total balance hero card · token holdings (SUI, USDC, DEEP) with live logos · DCA vault budget bar |
| **Activity** | Full on-chain trade history · summary strip · pull-to-refresh |
| **Analytics** | Market data (price, 24h high/low/volume) · DCA performance (avg buy price, DEEP acquired, ROI) · portfolio allocation |
| **Settings** | Profile · wallet address · explorer link · dark/light mode · notifications · security |
| **Agent Details** | Circular budget ring · vault stats · trade log · pause / revoke controls |

---

## Features

- **zkLogin auth** — Google OAuth maps to a Sui wallet address via zkLogin. No extensions, no seed phrases, no passwords.
- **Live vault sync** — vault state and trade history are fetched from the same on-chain data source as the web app, keyed to the logged-in user's address.
- **Real token logos** — SUI, USDC, and DEEP icons are fetched live from the CoinGecko API and cached for the session.
- **Autonomous DCA agent** — the agent on-chain buys DEEP with SUI on DeepBook v3 on a cron schedule. The mobile app shows every execution as it happens.
- **Budget enforcement** — the Move contract's hot-potato pattern makes it physically impossible for the agent to exceed its daily SUI cap. The mobile UI reflects this in the vault progress bars.
- **Pause / revoke** — one tap to pause the agent or revoke it entirely; remaining funds return to the vault.
- **Notification bell** — real-time feed of trade executions, budget warnings (>80% used), and agent state changes.
- **Dark / light theme** — full theme system persisted via AsyncStorage. Primary is dark; light mode available from Settings.
- **Pull-to-refresh** — activity feed and all polling hooks refresh on demand, with a refresh icon in the Activity AppBar.

---

## Architecture

```
src/
├── AppContainer.tsx          # State-machine navigation (no nav library)
├── theme.ts                  # Color tokens — dark & light
├── components/
│   ├── AppBar.tsx            # Shared screen header (notification bell, actions)
│   ├── BottomNav.tsx         # 5-tab bar
│   ├── NotificationBell.tsx  # Live event feed
│   ├── CircularProgress.tsx  # SVG budget ring on agent detail
│   └── TxDetailModal.tsx     # Transaction bottom sheet
├── lib/
│   ├── AuthContext.tsx        # zkLogin session (Google OAuth via website proxy)
│   ├── ThemeContext.tsx       # Dark/light toggle + AsyncStorage persistence
│   ├── useOnchain.ts          # usePrice · useWallet · useTrades (polling hooks)
│   ├── useTokenLogos.ts       # CoinGecko logo fetcher with session cache
│   ├── useNotifications.ts    # In-app notification engine
│   └── constants.ts           # API_BASE · network · coin types
└── screens/
    ├── SplashScreen.tsx
    ├── ConnectScreen.tsx
    ├── DashboardScreen.tsx
    ├── WalletScreen.tsx
    ├── ActivityScreen.tsx
    ├── AnalyticsScreen.tsx
    ├── SettingsScreen.tsx
    ├── AgentDetailsScreen.tsx
    ├── TemplatesScreen.tsx
    ├── CreateAgentScreen.tsx
    └── AgentCreatedScreen.tsx
```

**Navigation** is a plain `useState` string enum in `AppContainer` — no React Navigation, no router library. Every screen is a regular component; transitions are instant re-renders.

**Data polling** uses a generic `usePolling<T>(url, interval)` hook that starts on mount, re-fetches on URL change, and cleans up the interval on unmount. `useWallet(address)` polls every 15 s; `useTrades(vaultId)` every 30 s; `usePrice()` every 20 s.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Expo](https://expo.dev) SDK 54 |
| Language | TypeScript (strict) |
| UI primitives | React Native 0.81 |
| Navigation | Custom state-machine (`useState`) |
| Auth | Sui zkLogin · `expo-web-browser` · Google OAuth |
| Gradients | `expo-linear-gradient` |
| Haptics | `expo-haptics` |
| Icons | `@expo/vector-icons` (Ionicons) |
| Storage | `@react-native-async-storage/async-storage` |
| Token logos | CoinGecko `/coins/markets` API |
| Backend | [TEFAMA Web API](https://github.com/TEFAMA-Wallet/Tefama-website) |
| Builds | EAS Build |

---

## Getting Started

### Prerequisites

- Node.js 18+
- Expo Go on your phone **or** an Android / iOS simulator

### Install & run

```bash
git clone https://github.com/TEFAMA-Wallet/Tefama-mobile.git
cd Tefama-mobile
npm install
npx expo start
```

Scan the QR with **Expo Go**, or press `a` for Android emulator / `i` for iOS simulator.

The app connects to `https://tefama-website.vercel.app` by default — no local backend needed.

---

## Try It Now

Pre-built binaries are available — no dev environment needed.

| Platform | Type | Link |
|---|---|---|
| **Android** | APK (install directly) | [Download APK](https://expo.dev/accounts/tevinprime66/projects/tefama-mobile/builds/d78ed8f7-5048-4145-9499-fdf56f993cd2) |
| **iOS** | Simulator build (.app) | [Download .tar.gz](https://expo.dev/accounts/tevinprime66/projects/tefama-mobile/builds/8d5203bb-f5f7-4641-b403-72e72ed5fa9a) |

### Android — install on a real device

1. Open the [Android build link](https://expo.dev/accounts/tevinprime66/projects/tefama-mobile/builds/d78ed8f7-5048-4145-9499-fdf56f993cd2) on your Android phone
2. Tap **Download** and install the APK
3. If prompted, allow installs from unknown sources under **Settings → Security**

### iOS — run on Simulator (Mac only)

```bash
# 1. Download and extract the build
curl -L "https://expo.dev/artifacts/eas/G_k_CkanGGtoi-wwP7y0oO-QQVVnJ5Km0SH1LdCyW-8.tar.gz" -o tefama-ios.tar.gz
tar -xzf tefama-ios.tar.gz

# 2. Boot a simulator and install
xcrun simctl boot "iPhone 16"
xcrun simctl install booted Tefama.app
xcrun simctl launch booted com.tefama.mobile
```

> iOS device builds (for real iPhones without a simulator) require an Apple Developer account. Run `eas build --profile preview --platform ios` to generate one.

---

## Build Your Own

TEFAMA Mobile uses [EAS Build](https://docs.expo.dev/build/introduction/).

```bash
npm install -g eas-cli
eas login

# Android APK — internal testing
eas build --profile preview --platform android

# iOS Simulator build — no Apple account needed
eas build --profile simulator --platform ios

# iOS real device — requires Apple Developer account
eas build --profile preview --platform ios

# Production
eas build --profile production --platform all
```

---

## Navigation Flow

```
Splash
  └── Connect (Google zkLogin)
        └── Bottom Nav
              ├── Dashboard
              │     └── Agent Details (pause / revoke / trades)
              ├── Wallet
              ├── Activity
              ├── Analytics
              └── Settings
                    └── New Agent
                          └── Templates → Create → Created
```

---

## On-Chain Components (from the Web App)

The mobile app is a read/write interface to the same contracts deployed by the web app. No new contracts.

**`vault.move`** — Budget policy object. Holds SUI and DEEP balances, tracks daily spend window, enforces agent allowlist. The mobile app reads `budgetCap`, `spent`, and `paused` fields to render progress bars and status badges.

**DeepBook BalanceManager** — The agent's trading account on DeepBook v3. Trades execute via `place_market_order` against the DEEP/SUI pool. The mobile Activity screen shows each `TradeSettled` event.

**zkLogin** — The same Google OAuth → Sui address derivation used by the web. The mobile uses the website's `/api/zklogin/salt` endpoint so both apps share the same derived address for the same Google account.

---

## Related

- **Web App** — [github.com/TEFAMA-Wallet/Tefama-website](https://github.com/TEFAMA-Wallet/Tefama-website)
- **Live Demo** — [tefama-website.vercel.app](https://tefama-website.vercel.app)
- **Sui Testnet Explorer** — [suiscan.xyz/testnet](https://suiscan.xyz/testnet)
- **DeepBook DEEP/SUI Pool** — `0x48c95963e9eac37a316b7ae04a0deb761bcdcc2b67912374d6036e7f0e9bae9f`

---

## License

Private — all rights reserved © 2026 TEFAMA
