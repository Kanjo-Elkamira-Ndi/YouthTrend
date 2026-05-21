import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import { api, unwrap } from "@/lib/api";
import { authClient } from "@/lib/auth-client";
import type { AxiosError } from "axios";

export interface AppUser {
  id: string;
  email: string;
  full_name: string;
  username: string;
  role: string;
  status: string;
  campus_id: string | null;
  campus_name: string | null;
  campus_short_code: string | null;
  campus_slug: string | null;
  avatar_url: string | null;
  bio: string | null;
  department: string | null;
  year_of_study: number | null;
  language_pref: string;
  matricule: string | null;
  created_at: string;
  last_active_at: string | null;
}

export interface BetterAuthUser {
  id: string;
  email: string;
  name: string;
  emailVerified: boolean;
}

interface SessionPayload {
  authenticated: boolean;
  emailVerified: boolean;
  provisioned: boolean;
  betterAuthUser: BetterAuthUser | null;
  user: AppUser | null;
}

interface AuthContextValue {
  user: AppUser | null;
  betterAuthUser: BetterAuthUser | null;
  provisioned: boolean;
  emailVerified: boolean;
  loading: boolean;
  refetch: () => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [betterAuthUser, setBetterAuthUser] = useState<BetterAuthUser | null>(null);
  const [provisioned, setProvisioned] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchSession = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("/auth/session");
      const data = unwrap<SessionPayload>(res);

      if (data.authenticated) {
        setBetterAuthUser(data.betterAuthUser);
        setEmailVerified(data.emailVerified);
        setProvisioned(data.provisioned);

        if (data.provisioned) {
          const meRes = await api.get("/auth/me");
          setUser(unwrap<AppUser>(meRes));
        } else {
          // Auto-provision for OAuth signups (Google, etc.)
          await api.post("/auth/provision", {});
          const sessionRes = await api.get("/auth/session");
          const sessionData = unwrap<SessionPayload>(sessionRes);
          setProvisioned(true);
          if (sessionData.provisioned) {
            const meRes = await api.get("/auth/me");
            setUser(unwrap<AppUser>(meRes));
          } else {
            setUser(null);
          }
        }
      } else {
        setUser(null);
        setBetterAuthUser(null);
        setProvisioned(false);
        setEmailVerified(false);
      }
    } catch (err) {
      const axiosErr = err as AxiosError;
      if (axiosErr.response?.status !== 401) {
        console.error("Session fetch failed:", err);
      }
      setUser(null);
      setBetterAuthUser(null);
      setProvisioned(false);
      setEmailVerified(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

  const signOut = useCallback(async () => {
    await authClient.signOut();
    setUser(null);
    setBetterAuthUser(null);
    setProvisioned(false);
    setEmailVerified(false);
  }, []);

  return (
    <AuthContext.Provider value={{ user, betterAuthUser, provisioned, emailVerified, loading, refetch: fetchSession, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
