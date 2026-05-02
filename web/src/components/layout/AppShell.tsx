import { ReactNode } from "react";
import { AppNavbar } from "./AppNavbar";
import { SidebarNav } from "./SidebarNav";
import { RightRail } from "./RightRail";

export const AppShell = ({ children, hideRight = false }: { children: ReactNode; hideRight?: boolean }) => (
  <div className="min-h-screen bg-background">
    <AppNavbar />
    <div className="container flex gap-6 pb-24 lg:pb-6">
      <SidebarNav />
      <main className="flex-1 min-w-0 py-6">{children}</main>
      {!hideRight && <RightRail />}
    </div>
  </div>
);
