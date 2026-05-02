import { Link } from "@tanstack/react-router";
import { Bell, Search } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { LanguageToggle } from "./LanguageToggle";
import { Logo } from "./Logo";
import { currentUser } from "@/lib/mock";

export function TopNav() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
      <div className="flex h-14 items-center gap-3 px-4 sm:px-6">
        <Link to="/feed" className="lg:hidden"><Logo /></Link>
        <div className="relative ml-auto hidden flex-1 max-w-md md:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            placeholder="Search YouthTrend…"
            className="h-9 w-full rounded-lg border border-border bg-card pl-9 pr-3 text-sm outline-none placeholder:text-muted-foreground focus:border-brand"
          />
        </div>
        <button className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card"><Search className="h-4 w-4" /></button>
        <button className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card">
          <Bell className="h-4 w-4" />
          <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-brand px-1 text-[10px] font-semibold text-brand-foreground">3</span>
        </button>
        <LanguageToggle />
        <ThemeToggle />
        <Link to={"/profile/$username" as any} params={{ username: currentUser.username } as any}>
          <img src={currentUser.avatar} className="h-9 w-9 rounded-full border border-border object-cover" alt="" />
        </Link>
      </div>
    </header>
  );
}
