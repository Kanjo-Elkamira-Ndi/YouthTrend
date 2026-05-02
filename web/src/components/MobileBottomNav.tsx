import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Compass, PenSquare, Bookmark, User } from "lucide-react";
import { currentUser } from "@/lib/mock";

type Item = {
  to: string;
  label: string;
  icon: typeof Home;
  primary?: boolean;
  params?: Record<string, string>;
};

const items: Item[] = [
  { to: "/feed", label: "Home", icon: Home },
  { to: "/explore", label: "Explore", icon: Compass },
  { to: "/write", label: "Write", icon: PenSquare, primary: true },
  { to: "/bookmarks", label: "Saved", icon: Bookmark },
  { to: "/profile/$username", label: "Me", icon: User, params: { username: currentUser.username } },
];

export function MobileBottomNav() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background/95 px-2 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden">
      <ul className="flex items-stretch justify-around">
        {items.map((it) => {
          const active = it.to === "/profile/$username" ? path.startsWith("/profile") : path === it.to;
          const Icon = it.icon;
          return (
            <li key={it.label} className="flex-1">
              <Link
                to={it.to as any}
                params={(it as any).params}
                className={`flex flex-col items-center gap-0.5 py-2.5 text-[11px] ${
                  it.primary
                    ? "text-brand"
                    : active
                    ? "text-foreground"
                    : "text-muted-foreground"
                }`}
              >
                {it.primary ? (
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-brand text-brand-foreground"><Icon className="h-4 w-4" /></span>
                ) : (
                  <Icon className="h-5 w-5" />
                )}
                <span>{it.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
