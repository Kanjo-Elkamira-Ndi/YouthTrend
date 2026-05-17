import { createContext, useContext, type ReactNode } from "react";
import { useAuth } from "@/context/AuthContext";

interface CampusInfo {
  id: string | null;
  name: string | null;
  shortCode: string | null;
  slug: string | null;
}

interface CampusContextValue {
  campus: CampusInfo;
}

const CampusContext = createContext<CampusContextValue | null>(null);

export const CampusProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();

  const campus: CampusInfo = user
    ? {
        id: user.campus_id,
        name: user.campus_name,
        shortCode: user.campus_short_code,
        slug: user.campus_slug,
      }
    : { id: null, name: null, shortCode: null, slug: null };

  return (
    <CampusContext.Provider value={{ campus }}>
      {children}
    </CampusContext.Provider>
  );
};

export const useCampus = () => {
  const ctx = useContext(CampusContext);
  if (!ctx) throw new Error("useCampus must be used within CampusProvider");
  return ctx;
};
