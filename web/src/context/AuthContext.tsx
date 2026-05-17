import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import api from "@/lib/api";
import type { User } from "@/types";

type AuthState = {
  user: User | null;
  provisioned: boolean;
  emailVerified: boolean;
  loading: boolean;
  refetch: () => Promise<void>;
};

type SessionResponse = {
  success: boolean;
  data: {
    authenticated: boolean;
    emailVerified: boolean;
    provisioned: boolean;
    betterAuthUser: { id: string; email: string; name: string } | null;
    user: Record<string, unknown> | null;
  };
};

function mapServerUser(raw: Record<string, unknown>): User {
  return {
    id: raw.id as string,
    username: raw.username as string,
    name: raw.full_name as string,
    avatar: (raw.avatar_url as string) ?? "",
    campus: ((raw.campus_short_code ?? raw.campus_name) as string) ?? "",
    department: (raw.department as string | undefined) ?? undefined,
    year: raw.year_of_study != null ? String(raw.year_of_study) : undefined,
    bio: (raw.bio as string | undefined) ?? undefined,
    joinedAt: raw.created_at ? String(raw.created_at) : undefined,
  };
}

const AuthContext = createContext<AuthState | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [provisioned, setProvisioned] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchSession = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get<SessionResponse>("/api/v1/auth/session");
      const data = res.data.data;

      if (data.authenticated) {
        setEmailVerified(data.emailVerified);
        setProvisioned(data.provisioned);
        if (data.user) {
          setUser(mapServerUser(data.user));
        } else {
          setUser(null);
        }
      } else {
        setUser(null);
        setProvisioned(false);
        setEmailVerified(false);
      }
    } catch {
      setUser(null);
      setProvisioned(false);
      setEmailVerified(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

  return (
    <AuthContext.Provider value={{ user, provisioned, emailVerified, loading, refetch: fetchSession }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
