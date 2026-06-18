import AsyncStorage from "@react-native-async-storage/async-storage";
import * as AuthSession from "expo-auth-session";
import * as Crypto from "expo-crypto";
import * as WebBrowser from "expo-web-browser";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { API_BASE, GOOGLE_CLIENT_ID } from "./constants";

WebBrowser.maybeCompleteAuthSession();

const STORAGE_KEY = "@tefama_session_v2";

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

const GOOGLE_DISCOVERY = {
  authorizationEndpoint: "https://accounts.google.com/o/oauth2/v2/auth",
  tokenEndpoint:         "https://oauth2.googleapis.com/token",
};

// Decode a JWT payload without verifying the signature
function decodeJwtPayload(token: string): Record<string, unknown> {
  const part = token.split(".")[1] ?? "";
  const padded = part.replace(/-/g, "+").replace(/_/g, "/");
  const pad = (4 - (padded.length % 4)) % 4;
  try {
    return JSON.parse(atob(padded + "=".repeat(pad))) as Record<string, unknown>;
  } catch {
    return {};
  }
}

// SHA256(sub + ":" + salt) → "0x" + first 62 hex chars
async function deriveAddress(sub: string, salt: string): Promise<string> {
  const hex = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    sub + ":" + salt,
    { encoding: Crypto.CryptoEncoding.HEX },
  );
  return "0x" + hex.slice(0, 62).padEnd(62, "0");
}

// POST id_token to the website salt API, same secret/logic as the website
async function fetchSalt(idToken: string): Promise<string> {
  try {
    const res = await fetch(`${API_BASE}/api/zklogin/salt`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ token: idToken }),
    });
    if (res.ok) {
      const body = await res.json() as { salt?: string; error?: string };
      if (body.salt) return body.salt;
      if (body.error) console.warn("[salt API]", body.error);
    }
  } catch (e) {
    console.warn("[salt API] fetch failed:", e);
  }
  // Fallback: deterministic salt so the address is consistent
  return "tefama-mobile-fallback-salt-v1";
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession]   = useState<Session | null>(null);
  const [isLoading, setLoading] = useState(true);

  const redirectUri = AuthSession.makeRedirectUri({ scheme: "tefama" });

  // Generate a fresh nonce per mount — Google requires nonce for id_token
  const nonce = useRef(
    Crypto.getRandomValues(new Uint8Array(16))
      .reduce((s, b) => s + b.toString(16).padStart(2, "0"), "")
  ).current;

  const [request,, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId:     GOOGLE_CLIENT_ID,
      redirectUri,
      responseType: AuthSession.ResponseType.IdToken,
      scopes:       ["openid", "email", "profile"],
      usePKCE:      false,
      extraParams:  { nonce },
    },
    GOOGLE_DISCOVERY,
  );

  // Restore persisted session
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (raw) {
        try { setSession(JSON.parse(raw) as Session); } catch { /* ignore */ }
      }
      setLoading(false);
    });
  }, []);

  const login = useCallback(async () => {
    if (!request) throw new Error("Auth request not ready — try again");

    const result = await promptAsync();

    if (result.type === "cancel" || result.type === "dismiss") {
      throw new Error("Sign-in was cancelled");
    }
    if (result.type !== "success") {
      throw new Error("Sign-in failed — please try again");
    }

    const idToken = result.params.id_token;
    if (!idToken) {
      throw new Error("Google did not return an id_token");
    }

    // Decode id_token to get profile (sub, email, name, picture)
    const payload = decodeJwtPayload(idToken);
    const sub     = String(payload.sub   ?? "");
    const email   = String(payload.email ?? "");
    const name    = String(payload.name  ?? email);
    const picture = String(payload.picture ?? "");

    if (!sub) throw new Error("Could not read user identity from token");

    // Derive salt (same algorithm as website backend)
    const salt    = await fetchSalt(idToken);
    const address = await deriveAddress(sub, salt);

    const newSession: Session = { email, name, picture, address, sub };
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newSession));
    setSession(newSession);
  }, [request, promptAsync]);

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
