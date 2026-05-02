import { SidebarNav } from "./SidebarNav";
import { TopNav } from "./TopNav";
import { MobileBottomNav } from "./MobileBottomNav";
import { RightRail } from "./RightRail";

export function AppShell({ children, hideRightRail = false }: { children: React.ReactNode; hideRightRail?: boolean }) {
  return (
    <div className="flex min-h-screen">
      <SidebarNav />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopNav />
        <div className="flex flex-1 gap-0">
          <main className="min-w-0 flex-1 px-4 pb-24 pt-6 sm:px-6 lg:pb-12">{children}</main>
          {!hideRightRail && <RightRail />}
        </div>
      </div>
      <MobileBottomNav />
    </div>
  );
}
