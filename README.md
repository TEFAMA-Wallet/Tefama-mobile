# TEFAMA Mobile

> Autonomous AI trading agents — in your pocket.

TEFAMA is a React Native mobile application built with Expo that lets users create, monitor, and manage on-chain autonomous trading agents. Each agent executes a defined strategy within a hard budget ceiling and time limit, fully on-chain, with one-tap revocation.

---

## Screenshots

| Splash | Onboarding | Connect |
|--------|------------|---------|
| Dark splash with animated logo | 3-slide feature carousel | zkLogin — no seed phrase |

| Dashboard | Agents | Activity |
|-----------|--------|----------|
| Portfolio balance + sparkline | Agent list with budget bars | Full on-chain transaction log |

---

## Features

- **Autonomous agents** — create agents that execute DCA, Smart Buy, Grid Trading, or custom strategies on-chain
- **Hard budget caps** — every agent is constrained by an on-chain spend ceiling and time limit it cannot exceed
- **One-tap revocation** — instantly kill any agent; remaining funds return to your wallet
- **zkLogin** — sign in with Google or Apple, no seed phrases or browser extensions needed
- **Portfolio dashboard** — live balance, sparkline performance chart, active agent hero card with circular progress ring
- **Activity log** — full history of on-chain executions with status (confirmed / pending / failed)
- **4-step wizard** — guided agent creation with real-time risk assessment
- **Dark / light theme** — persisted across sessions via AsyncStorage

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | [Expo](https://expo.dev) SDK 54 |
| Language | TypeScript |
| UI primitives | React Native 0.81 |
| Navigation | State-machine router (no library) |
| Charts | `react-native-svg` |
| Icons | `@expo/vector-icons` (Ionicons) |
| Gradients | `expo-linear-gradient` |
| Storage | `@react-native-async-storage/async-storage` |
| Builds | EAS Build |

---

## Project Structure

```
tefama-mobile/
├── App.tsx                    # Root entry — SafeAreaProvider + ThemeProvider
├── app.json                   # Expo config
├── eas.json                   # EAS build profiles
├── assets/
│   └── branding/              # App icon, adaptive icon, splash image
└── src/
    ├── AppContainer.tsx        # Navigation state machine
    ├── theme.ts                # Color tokens + spacing/radius scale
    ├── components/
    │   ├── AppBar.tsx          # Screen header
    │   ├── AgentCard.tsx       # Agent list item with progress bar
    │   ├── Badge.tsx           # Status pill (active / paused / revoked / confirmed …)
    │   ├── BottomNav.tsx       # Tab bar with floating Create FAB
    │   ├── BrandLogo.tsx       # SVG logo mark
    │   ├── Button.tsx          # primary · secondary · danger · ghost + IconButton
    │   ├── Card.tsx            # Elevated card container
    │   ├── CircularProgress.tsx# SVG circular budget ring
    │   ├── ProgressBar.tsx     # Linear budget bar
    │   ├── SectionHead.tsx     # Section label with optional action
    │   └── TxRow.tsx           # Transaction list row
    ├── lib/
    │   ├── data.ts             # Types + mock data (AGENTS, ACTIVITY, WALLET …)
    │   └── ThemeContext.tsx    # Dark / light theme context + toggle
    └── screens/
        ├── SplashScreen.tsx        # Animated logo entrance
        ├── OnboardingScreen.tsx    # 3-slide feature carousel
        ├── ConnectScreen.tsx       # zkLogin (Google / Apple)
        ├── DashboardScreen.tsx     # Home tab — portfolio + active agent
        ├── AgentsScreen.tsx        # Agents tab — list + filters
        ├── ActivityScreen.tsx      # Activity tab — tx log + filters
        ├── SettingsScreen.tsx      # Settings tab
        ├── AgentDetailsScreen.tsx  # Agent detail — ring + stats + executions
        ├── CreateAgentScreen.tsx   # 4-step agent creation wizard
        ├── TemplatesScreen.tsx     # Strategy template picker
        ├── AgentCreatedScreen.tsx  # Success screen
        └── TxDetailModal.tsx       # Transaction detail bottom sheet
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- Expo CLI (`npm install -g expo-cli`)
- Expo Go app on your phone **or** an Android / iOS simulator

### Install & run

```bash
git clone https://github.com/TEFAMA-Wallet/Tefama-mobile.git
cd Tefama-mobile
npm install
npx expo start
```

Scan the QR code with **Expo Go** on your device, or press:
- `a` — open Android emulator
- `i` — open iOS simulator
- `w` — open in browser (web mode)

---

## Build & Deploy

TEFAMA uses [EAS Build](https://docs.expo.dev/build/introduction/) for production builds.

```bash
# Install EAS CLI
npm install -g eas-cli

# Log in to your Expo account
eas login

# Development build (internal distribution)
eas build --profile development --platform android

# Preview APK
eas build --profile preview --platform android

# Production build
eas build --profile production --platform all
```

---

## Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

---

## Screens Flow

```
Splash → Onboarding → Connect (zkLogin)
                          ↓
              ┌───────────────────────┐
              │     Bottom Nav        │
              │  Dashboard · Agents   │
              │  [+ Create] · Activity│
              │       · Settings      │
              └───────────────────────┘
                    ↓           ↓
             Agent Details   Create Agent Wizard
                                  ↓
                            Templates → Wizard → Created
```

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Commit your changes
4. Open a pull request

---

## License

Private — all rights reserved © 2026 TEFAMA
