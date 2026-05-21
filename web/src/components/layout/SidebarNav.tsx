import { NavLink, Link } from "react-router-dom";
import { Home, Flame, Compass, Bookmark, FileText, User, Settings, PenSquare } from "lucide-react";
import { users } from "@/mock";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { initials, resolveMediaUrl } from "@/lib/media";

export const SidebarNav = () => {
  const { user } = useAuth();
  const items = [
    { to: "/feed", icon: Home, label: "Home Feed" },
    { to: "/explore", icon: Flame, label: "Trending" },
    { to: "/explore", icon: Compass, label: "Explore" },
    { to: "/bookmarks", icon: Bookmark, label: "Bookmarks" },
    { to: "/my-posts", icon: FileText, label: "My Posts" },
    { to: `/profile/${user?.username ?? ""}`, icon: User, label: "My Profile" },
    { to: "/settings", icon: Settings, label: "Settings" },
  ];
  const suggested = users.filter((u) => u.username !== user?.username).slice(0, 3);

  return (
    <aside className="hidden lg:flex flex-col w-64 shrink-0 sticky top-16 h-[calc(100vh-4rem)] py-6 pr-4 overflow-y-auto">
      <div className="flex items-center gap-3 px-2 pb-4 border-b border-border">
        <div className="h-10 w-10 rounded-full ring-1 ring-border bg-secondary overflow-hidden inline-flex items-center justify-center shrink-0">
          {resolveMediaUrl(user?.avatar_url) ? (
            <img src={resolveMediaUrl(user?.avatar_url)} alt={user?.full_name ?? ""} className="h-full w-full object-cover" />
          ) : (
            <span className="text-xs font-bold">{initials(user?.full_name)}</span>
          )}
        </div>
        <div className="min-w-0">
          <div className="text-sm font-semibold truncate">{user?.full_name ?? "Your profile"}</div>
          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-secondary">
            {user?.campus_short_code ? `🏫 ${user.campus_short_code}` : user?.role?.replace("_", " ") ?? "Signed in"}
          </span>
        </div>
      </div>
      <nav className="mt-4 space-y-1">
        {items.map((it, i) => (
          <NavLink
            key={i}
            to={it.to}
            end={it.to === "/feed"}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive ? "bg-primary/10 text-primary" : "text-foreground hover:bg-secondary"
              }`
            }
          >
            <it.icon className="h-4 w-4" />
            {it.label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-6 pt-4 border-t border-border">
        <div className="text-xs font-semibold text-muted-foreground mb-3 px-2">SUGGESTED WRITERS</div>
        <div className="space-y-2">
          {suggested.map((u) => (
            <div key={u.id} className="flex items-center gap-2 px-2">
              <img src={u.avatar} className="h-8 w-8 rounded-full" alt={u.name} />
              <div className="min-w-0 flex-1">
                <div className="text-xs font-semibold truncate">{u.name}</div>
                <div className="text-[10px] text-muted-foreground">{u.campus}</div>
              </div>
              <Button size="sm" variant="outline" className="h-7 px-2 text-xs">Follow</Button>
            </div>
          ))}
        </div>
      </div>

      <Link to="/write" className="mt-6">
        <Button className="w-full bg-primary hover:bg-primary/90"><PenSquare className="h-4 w-4 mr-2" /> Write a Story</Button>
      </Link>
    </aside>
  );
};
