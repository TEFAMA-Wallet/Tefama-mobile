import AsyncStorage from "@react-native-async-storage/async-storage";
import * as WebBrowser from "expo-web-browser";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { API_BASE } from "./constants";

WebBrowser.maybeCompleteAuthSession();

const STORAGE_KEY = "@tefama_session_v3";

// URL the website will deep-link back to after Google auth
const CONNECT_URL = `${API_BASE}/connect?mobile=1`;
const REDIRECT_SCHEME = "tefama://";

export interface Session {
  email:   string;
  name:    string;
  picture: string;
  address: string;
  sub:     string;
}

interface AuthState {
  session:     Session | null;
  isLoading:   boolean;
  isConnected: boolean;
  login:       () => Promise<void>;
  logout:      () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

// Parse key=value pairs from a tefama://auth?... URL
function parseDeepLink(url: string): Record<string, string> {
  const qi = url.indexOf("?");
  if (qi === -1) return {};
  return Object.fromEntries(new URLSearchParams(url.slice(qi + 1)));
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session,   setSession]  = useState<Session | null>(null);
  const [isLoading, setLoading]  = useState(true);

  // Restore persisted session on mount
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (raw) {
        try { setSession(JSON.parse(raw) as Session); } catch { /* ignore */ }
      }
      setLoading(false);
    });
  }, []);

  const login = useCallback(async () => {
    // Open the website connect page in an in-app browser (SFSafariViewController / Chrome Custom Tab).
    // The website handles Google OAuth with its already-registered redirect URI.
    // After auth, it deep-links back to tefama://auth?address=...&email=...&sub=...
    const result = await WebBrowser.openAuthSessionAsync(CONNECT_URL, REDIRECT_SCHEME);

    if (result.type === "cancel" || result.type === "dismiss") {
      throw new Error("Sign-in was cancelled");
    }
    if (result.type !== "success") {
      throw new Error("Sign-in failed — please try again");
    }

    const params  = parseDeepLink(result.url);
    const address = params.address;
    const email   = params.email;
    const sub     = params.sub;

    if (!address || !email || !sub) {
      throw new Error("Incomplete auth data from website — please try again");
    }

    const newSession: Session = {
      address,
      email,
      name:    params.name    ?? email,
      picture: params.picture ?? "",
      sub,
    };

    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newSession));
    setSession(newSession);
  }, []);

  const logout = useCallback(async () => {
    await AsyncStorage.removeItem(STORAGE_KEY);
    setSession(null);
  }, []);

  return (
    <AuthContext.Provider value={{ session, isLoading, isConnected: !!session, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}
