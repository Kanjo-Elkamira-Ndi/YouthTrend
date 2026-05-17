import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import type { ReactNode } from "react";

export const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="min-h-screen bg-background" />;

  if (!user) return <Navigate to="/signin" replace />;

  return <>{children}</>;
};

export const AdminRoute = ({ children, roles }: { children: ReactNode; roles: string[] }) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="min-h-screen bg-background" />;

  if (!user) return <Navigate to="/signin" replace />;

  if (!roles.includes(user.role)) return <Navigate to="/feed" replace />;

  return <>{children}</>;
};
