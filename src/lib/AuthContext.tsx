import AsyncStorage from "@react-native-async-storage/async-storage";
import * as AuthSession from "expo-auth-session";
import * as Crypto from "expo-crypto";
import * as WebBrowser from "expo-web-browser";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { API_BASE, GOOGLE_CLIENT_ID } from "./constants";

WebBrowser.maybeCompleteAuthSession();

const STORAGE_KEY = "@tefama_session_v1";

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

const discovery = {
  authorizationEndpoint: "https://accounts.google.com/o/oauth2/v2/auth",
  tokenEndpoint:         "https://oauth2.googleapis.com/token",
};

function b64urlDecode(str: string): string {
  const b64 = str.replace(/-/g, "+").replace(/_/g, "/");
  const pad  = (4 - (b64.length % 4)) % 4;
  return atob(b64 + "=".repeat(pad));
}

function decodeJwt(token: string): Record<string, unknown> {
  const parts = token.split(".");
  if (parts.length !== 3) throw new Error("Invalid JWT");
  return JSON.parse(b64urlDecode(parts[1])) as Record<string, unknown>;
}

async function deriveAddress(sub: string, salt: string): Promise<string> {
  const hex = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    sub + ":" + salt,
    { encoding: Crypto.CryptoEncoding.HEX },
  );
  return "0x" + hex.slice(0, 62).padEnd(62, "0");
}

async function fetchSalt(idToken: string): Promise<string> {
  try {
    const res = await fetch(`${API_BASE}/api/zklogin/salt`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: idToken }),
    });
    if (res.ok) {
      const body = await res.json() as { salt?: string };
      if (body.salt) return body.salt;
    }
  } catch { /* fall through to default */ }
  return "tefama-default-salt";
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession]   = useState<Session | null>(null);
  const [isLoading, setLoading] = useState(true);

  const redirectUri = AuthSession.makeRedirectUri({ scheme: "tefama" });

  const [request,, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId:     GOOGLE_CLIENT_ID,
      redirectUri,
      responseType: AuthSession.ResponseType.Token,
      scopes:       ["openid", "email", "profile"],
      extraParams:  { access_type: "offline" },
    },
    discovery,
  );

  // Load persisted session on mount
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (raw) {
        try { setSession(JSON.parse(raw) as Session); } catch { /* ignore */ }
      }
      setLoading(false);
    });
  }, []);

  const login = useCallback(async () => {
    if (!request) return;
    const result = await promptAsync();
    if (result.type !== "success") return;

    const { access_token } = result.params;

    // Fetch Google profile using access token
    const profileRes = await fetch(
      "https://www.googleapis.com/oauth2/v3/userinfo",
      { headers: { Authorization: `Bearer ${access_token}` } },
    );
    const profile = await profileRes.json() as {
      sub?: string; email?: string; name?: string; picture?: string;
    };

    const sub   = profile.sub   ?? "";
    const email = profile.email ?? "";
    const name  = profile.name  ?? email;
    const pic   = profile.picture ?? "";

    // Derive Sui address
    const salt    = await fetchSalt(access_token);
    const address = await deriveAddress(sub, salt);

    const newSession: Session = { email, name, picture: pic, address, sub };
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newSession));
    setSession(newSession);
  }, [request, promptAsync]);

  const logout = useCallback(async () => {
    await AsyncStorage.removeItem(STORAGE_KEY);
    setSession(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ session, isLoading, isConnected: !!session, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}
