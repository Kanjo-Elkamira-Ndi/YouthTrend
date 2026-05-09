import { NavLink, Link } from "react-router-dom";
import { Home, Flame, Compass, Bookmark, FileText, User, Settings, PenSquare } from "lucide-react";
import { currentUser, users } from "@/mock";
import { Button } from "@/components/ui/button";

const items = [
  { to: "/feed", icon: Home, label: "Home Feed" },
  { to: "/explore", icon: Flame, label: "Trending" },
  { to: "/explore", icon: Compass, label: "Explore" },
  { to: "/bookmarks", icon: Bookmark, label: "Bookmarks" },
  { to: "/my-posts", icon: FileText, label: "My Posts" },
  { to: `/profile/${currentUser.username}`, icon: User, label: "My Profile" },
  { to: "/settings", icon: Settings, label: "Settings" },
];

export const SidebarNav = () => {
  const suggested = users.filter((u) => u.id !== currentUser.id).slice(0, 3);
  return (
    <aside className="hidden lg:flex flex-col w-64 shrink-0 sticky top-16 h-[calc(100vh-4rem)] py-6 pr-4 overflow-y-auto">
      <div className="flex items-center gap-3 px-2 pb-4 border-b border-border">
        <img src={currentUser.avatar} alt={currentUser.name} className="h-10 w-10 rounded-full ring-1 ring-border" />
        <div className="min-w-0">
          <div className="text-sm font-semibold truncate">{currentUser.name}</div>
          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-secondary">🏫 {currentUser.campus}</span>
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
