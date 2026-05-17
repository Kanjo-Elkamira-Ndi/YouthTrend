import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { FeedSkeleton } from "@/components/common/Skeletons";

const ProtectedRoute = () => {
  const { user, loading } = useAuth();

  if (loading) return <FeedSkeleton />;

  if (!user) return <Navigate to="/signin" replace />;

  return <Outlet />;
};

export default ProtectedRoute;
