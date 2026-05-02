import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Flame, Compass, Bookmark, FileText, User, Settings, PenSquare } from "lucide-react";
import { authors, currentUser } from "@/lib/mock";
import { Logo } from "./Logo";

const nav = [
  { to: "/feed", label: "Home Feed", icon: Home },
  { to: "/explore", label: "Explore", icon: Compass },
  { to: "/bookmarks", label: "Bookmarks", icon: Bookmark },
  { to: "/profile/$username", label: "My Profile", icon: User, params: { username: currentUser.username } as Record<string, string> },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

export function SidebarNav() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const suggested = authors.slice(0, 3);

  return (
    <aside className="hidden lg:flex sticky top-0 h-screen w-64 shrink-0 flex-col border-r border-border bg-sidebar">
      <div className="px-5 pt-5">
        <Link to="/feed"><Logo /></Link>
      </div>

      <div className="mx-3 mt-6 flex items-center gap-3 rounded-xl border border-border bg-card p-3">
        <img src={currentUser.avatar} className="h-10 w-10 rounded-full object-cover" alt="" />
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold">{currentUser.name}</div>
          <span className="rounded bg-brand-soft px-1.5 py-0.5 text-[10px] font-semibold uppercase text-brand">🏫 {currentUser.campus}</span>
        </div>
      </div>

      <nav className="mt-4 flex-1 space-y-0.5 px-3">
        <SideLink to="/feed" icon={Home} label="Home Feed" active={path === "/feed"} />
        <SideLink to="/explore" icon={Flame} label="Trending" active={path === "/trending"} />
        <SideLink to="/explore" icon={Compass} label="Explore" active={path === "/explore"} />
        <SideLink to="/bookmarks" icon={Bookmark} label="Bookmarks" active={path === "/bookmarks"} />
        <SideLink to="/write" icon={FileText} label="My Posts" active={path === "/write"} />
        <SideLink
          to="/profile/$username"
          params={{ username: currentUser.username }}
          icon={User}
          label="My Profile"
          active={path.startsWith("/profile")}
        />
        <SideLink to="/settings" icon={Settings} label="Settings" active={path === "/settings"} />

        <div className="pt-6">
          <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Suggested writers</div>
          {suggested.map((a) => (
            <div key={a.id} className="flex items-center gap-2.5 rounded-lg px-3 py-2">
              <img src={a.avatar} className="h-8 w-8 rounded-full object-cover" alt="" />
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium">{a.name}</div>
                <div className="truncate text-xs text-muted-foreground">{a.department}</div>
              </div>
              <button className="rounded-full border border-border px-2.5 py-1 text-xs font-medium hover:border-brand hover:text-brand">Follow</button>
            </div>
          ))}
        </div>
      </nav>

      <div className="p-4">
        <Link
          to="/write"
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand px-4 py-3 text-sm font-semibold text-brand-foreground shadow-lg shadow-brand/20 transition-transform hover:scale-[1.02]"
        >
          <PenSquare className="h-4 w-4" /> Write a Story
        </Link>
      </div>
    </aside>
  );
}

function SideLink({
  to,
  icon: Icon,
  label,
  active,
  params,
}: {
  to: string;
  icon: typeof Home;
  label: string;
  active?: boolean;
  params?: Record<string, string>;
}) {
  return (
    <Link
      to={to as any}
      params={params as any}
      className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
        active ? "bg-brand-soft text-brand" : "text-muted-foreground hover:bg-elevated hover:text-foreground"
      }`}
    >
      <Icon className="h-4 w-4" />
      {label}
    </Link>
  );
}
