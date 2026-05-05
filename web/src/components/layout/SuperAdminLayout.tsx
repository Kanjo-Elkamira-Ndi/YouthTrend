import { useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Building2,
  UsersRound,
  FileText,
  ShieldAlert,
  BarChart3,
  Settings2,
  ScrollText,
  ShieldCheck,
  TriangleAlert,
  ChevronDown,
  LogOut,
  Menu,
  X,
  Search,
  Bell,
} from "lucide-react";
import { Logo } from "@/components/common/Logo";
import { ThemeToggle } from "@/components/common/Toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const NOTIF = 7;

const NAV = [
  { to: "/super-admin/dashboard",         label: "Dashboard",         icon: LayoutDashboard },
  { to: "/super-admin/campuses",          label: "Campuses",          icon: Building2,    badge: "5",    badgeTone: "muted" as const },
  { to: "/super-admin/users",             label: "All Users",         icon: UsersRound,   badge: "6.2k", badgeTone: "muted" as const },
  { to: "/super-admin/content",           label: "All Content",       icon: FileText },
  { to: "/super-admin/moderation",        label: "Global Moderation", icon: ShieldAlert,  badge: "24",   badgeTone: "red" as const },
  { to: "/super-admin/analytics",         label: "Analytics",         icon: BarChart3 },
  { to: "/super-admin/platform-settings", label: "Platform Settings", icon: Settings2 },
  { to: "/super-admin/audit-log",         label: "Audit Log",         icon: ScrollText },
];

const TITLES: Record<string, string> = {
  "/super-admin/dashboard":         "Dashboard",
  "/super-admin/campuses":          "Campus Management",
  "/super-admin/users":             "All Users",
  "/super-admin/content":           "All Content",
  "/super-admin/moderation":        "Global Moderation",
  "/super-admin/analytics":         "Analytics",
  "/super-admin/platform-settings": "Platform Settings",
  "/super-admin/audit-log":         "Audit Log",
};

// near-black sidebar background, in both themes
const SIDEBAR_BG = "bg-[#0F172A] dark:bg-[#080C14]";

const SidebarContent = ({ onNavigate }: { onNavigate?: () => void }) => (
  <div className={`relative flex h-full flex-col text-slate-200 ${SIDEBAR_BG}`}>
    {/* Right accent line */}
    <div className="absolute top-0 right-0 h-full w-[2px] bg-primary" />

    {/* Top: logo + role identity */}
    <div className="px-5 pt-5 pb-4 border-b border-white/5">
      <Logo className="text-slate-100" />
      <div className="mt-4 rounded-lg bg-primary/10 border border-primary/30 p-3">
        <div className="flex items-start gap-2">
          <ShieldCheck className="h-5 w-5 text-primary fill-primary/30 shrink-0 mt-0.5" />
          <div className="min-w-0">
            <div className="text-sm font-bold text-primary">Super Admin</div>
            <div className="text-[11px] text-slate-400">Platform Owner</div>
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
                : "text-slate-400 hover:bg-white/5 hover:text-slate-100"}`
          }
        >
          <item.icon className={`h-4 w-4 ${item.label === "Global Moderation" ? "animate-pulse" : ""}`} />
          <span className="flex-1">{item.label}</span>
          {item.badge ? (
            <span
              className={`ml-auto inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[10px] font-bold ${
                item.badgeTone === "red"
                  ? "bg-red-500 text-white"
                  : "bg-white/10 text-slate-200"
              }`}
            >
              {item.badge}
            </span>
          ) : null}
        </NavLink>
      ))}
    </nav>

    {/* Bottom: caution + user */}
    <div className="border-t border-white/5 p-3 space-y-3">
      <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-3 flex gap-2">
        <TriangleAlert className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
        <p className="text-[11px] leading-snug text-amber-300/90">
          You are in <span className="font-bold">Super Admin</span> mode. Actions
          here affect the entire platform.
        </p>
      </div>
      <div className="border-t border-white/5 pt-3 flex items-center gap-2">
        <img src="https://i.pravatar.cc/150?u=jordan" alt="" className="h-9 w-9 rounded-full ring-1 ring-white/10 object-cover" />
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-slate-100 truncate">Jordan Ndi</div>
          <div className="text-[11px] text-primary font-semibold">Super Admin</div>
        </div>
        <button aria-label="Sign out" className="h-8 w-8 inline-flex items-center justify-center rounded-md hover:bg-white/5 text-slate-400">
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </div>
  </div>
);

const SuperAdminLayout = () => {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const title = TITLES[pathname] ?? "Super Admin";

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-60 shrink-0 relative">
        <SidebarContent />
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in"
            onClick={() => setOpen(false)}
          />
          <aside className="relative w-72 max-w-[85%] shadow-2xl animate-in slide-in-from-left">
            <button
              onClick={() => setOpen(false)}
              className="absolute right-3 top-3 z-10 h-8 w-8 inline-flex items-center justify-center rounded-md hover:bg-white/10 text-slate-200"
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
        <header className={`sticky top-0 z-30 h-14 border-b border-white/5 ${SIDEBAR_BG} text-slate-200`}>
          <div className="h-full px-4 lg:px-6 flex items-center gap-3">
            <button
              onClick={() => setOpen(true)}
              className="lg:hidden h-9 w-9 inline-flex items-center justify-center rounded-md hover:bg-white/10"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>

            <span className="hidden md:inline text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-primary px-2 py-0.5 rounded border border-primary/30 bg-primary/5">
              Super Admin
            </span>
            <h1 className="text-base font-bold tracking-tight text-slate-100">{title}</h1>

            <div className="ml-auto flex items-center gap-1.5">
              <button
                aria-label="Platform status"
                className="hidden sm:inline-flex items-center gap-2 h-8 px-3 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 text-xs font-medium"
              >
                <span className="relative inline-flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60 animate-ping" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                </span>
                All Systems Operational
              </button>
              <button aria-label="Search" className="h-9 w-9 inline-flex items-center justify-center rounded-md hover:bg-white/10">
                <Search className="h-4 w-4" />
              </button>
              <button aria-label="Notifications" className="relative h-9 w-9 inline-flex items-center justify-center rounded-md hover:bg-white/10">
                <Bell className="h-4 w-4" />
                <span className="absolute top-1.5 right-1.5 inline-flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-red-500 text-white text-[9px] font-bold">
                  {NOTIF}
                </span>
              </button>
              <ThemeToggle />
              <DropdownMenu>
                <DropdownMenuTrigger className="ml-1 inline-flex items-center gap-1.5 rounded-md p-1 hover:bg-white/10">
                  <img src="https://i.pravatar.cc/150?u=jordan" alt="" className="h-7 w-7 rounded-full object-cover ring-1 ring-white/10" />
                  <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44">
                  <DropdownMenuItem asChild>
                    <Link to="/profile/jordan.ndi">Profile</Link>
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

export default SuperAdminLayout;
