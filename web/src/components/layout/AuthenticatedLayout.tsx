import { Outlet } from "react-router-dom";
import { MobileBottomNav } from "./MobileBottomNav";

export const AuthenticatedLayout = () => (
  <div className="pb-16 md:pb-0">
    <Outlet />
    <MobileBottomNav />
  </div>
);

export default AuthenticatedLayout;
