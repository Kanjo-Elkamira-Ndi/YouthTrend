import { useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  FileText,
  ShieldAlert,
  Megaphone,
  Settings,
  ArrowLeft,
  LogOut,
  Menu,
  X,
  Search,
  Bell,
  ChevronDown,
} from "lucide-react";
import { Logo } from "@/components/common/Logo";
import { ThemeToggle } from "@/components/common/Toggles";
import { mockCampus } from "@/mock/campusAdmin";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const PENDING_REPORTS = 12;
const NOTIF_COUNT = 3;

const NAV = [
  { to: "/campus-admin/dashboard",     label: "Dashboard",       icon: LayoutDashboard },
  { to: "/campus-admin/users",         label: "User Management", icon: Users },
  { to: "/campus-admin/content",       label: "Content",         icon: FileText },
  { to: "/campus-admin/moderation",    label: "Moderation",      icon: ShieldAlert, badge: PENDING_REPORTS },
  { to: "/campus-admin/announcements", label: "Announcements",   icon: Megaphone },
  { to: "/campus-admin/settings",      label: "Settings",        icon: Settings },
];

const TITLES: Record<string, string> = {
  "/campus-admin/dashboard": "Dashboard",
  "/campus-admin/users": "User Management",
  "/campus-admin/content": "Content Management",
  "/campus-admin/moderation": "Moderation Queue",
  "/campus-admin/announcements": "Announcements",
  "/campus-admin/settings": "Campus Settings",
};

const SidebarContent = ({ onNavigate }: { onNavigate?: () => void }) => (
  <div className="flex h-full flex-col">
    {/* Logo + Campus identity */}
    <div className="px-5 pt-5 pb-4 border-b border-border">
      <Logo />
      <div className="mt-4 rounded-lg bg-primary/10 border border-primary/20 p-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl leading-none">{mockCampus.emoji}</span>
          <div className="min-w-0">
            <div className="text-sm font-semibold truncate">{mockCampus.name}</div>
            <div className="text-[11px] uppercase tracking-wider text-primary font-bold">Campus Admin</div>
          </div>
        </div>
      </div>
    </div>

    {/* Nav */}
    <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
      {NAV.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          onClick={onNavigate}
          className={({ isActive }) =>
            `group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors
             ${isActive
                ? "bg-primary/10 text-primary border-l-2 border-primary pl-[10px]"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"}`
          }
        >
          <item.icon className={`h-4 w-4 ${item.label === "Moderation" && item.badge ? "animate-pulse" : ""}`} />
          <span className="flex-1">{item.label}</span>
          {item.badge ? (
            <span className="ml-auto inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-red-500 text-white text-[10px] font-bold">
              {item.badge}
            </span>
          ) : null}
        </NavLink>
      ))}
    </nav>

    {/* Bottom */}
    <div className="border-t border-border p-3 space-y-3">
      <Link
        to="/feed"
        onClick={onNavigate}
        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Campus Feed
      </Link>
      <div className="border-t border-border pt-3 flex items-center gap-2">
        <img src="https://i.pravatar.cc/150?u=fatima" alt="" className="h-9 w-9 rounded-full ring-1 ring-border object-cover" />
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold truncate">Fatima Nkemdirim</div>
          <div className="text-[11px] text-muted-foreground">Campus Admin</div>
        </div>
        <button aria-label="Sign out" className="h-8 w-8 inline-flex items-center justify-center rounded-md hover:bg-secondary text-muted-foreground">
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </div>
  </div>
);

const CampusAdminLayout = () => {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const title = TITLES[pathname] ?? "Campus Admin";

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-60 shrink-0 border-r border-border bg-secondary/40">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar drawer */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in"
            onClick={() => setOpen(false)}
          />
          <aside className="relative w-72 max-w-[85%] bg-card border-r border-border shadow-2xl animate-in slide-in-from-left">
            <button
              onClick={() => setOpen(false)}
              className="absolute right-3 top-3 h-8 w-8 inline-flex items-center justify-center rounded-md hover:bg-secondary"
              aria-label="Close menu"
            >
              <X className="h-4 w-4" />
            </button>
            <SidebarContent onNavigate={() => setOpen(false)} />
          </aside>
        </div>
      )}

      {/* Main column */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-30 h-14 border-b border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="h-full px-4 lg:px-6 flex items-center gap-3">
            <button
              onClick={() => setOpen(true)}
              className="lg:hidden h-9 w-9 inline-flex items-center justify-center rounded-md hover:bg-secondary"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="text-base font-bold tracking-tight">{title}</h1>

            <div className="ml-auto flex items-center gap-1.5">
              <button aria-label="Search" className="h-9 w-9 inline-flex items-center justify-center rounded-md hover:bg-secondary">
                <Search className="h-4 w-4" />
              </button>
              <button aria-label="Notifications" className="relative h-9 w-9 inline-flex items-center justify-center rounded-md hover:bg-secondary">
                <Bell className="h-4 w-4" />
                <span className="absolute top-1.5 right-1.5 inline-flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-red-500 text-white text-[9px] font-bold">
                  {NOTIF_COUNT}
                </span>
              </button>
              <ThemeToggle />
              <DropdownMenu>
                <DropdownMenuTrigger className="ml-1 inline-flex items-center gap-1.5 rounded-md p-1 hover:bg-secondary">
                  <img src="https://i.pravatar.cc/150?u=fatima" alt="" className="h-7 w-7 rounded-full object-cover ring-1 ring-border" />
                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44">
                  <DropdownMenuItem asChild>
                    <Link to="/profile/fatima.nkemdirim">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-red-500 focus:text-red-500">Sign Out</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default CampusAdminLayout;
