import { Logo } from "@/components/common/Logo";
import { ThemeToggle, LanguageToggle } from "@/components/common/Toggles";
import { Bell, Search, Home, Compass, Bookmark, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Link, NavLink } from "react-router-dom";
import { currentUser } from "@/mock";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const AppNavbar = () => (
  <>
    <header className="sticky top-0 z-40 backdrop-blur-md bg-background/85 border-b border-border">
      <div className="container flex h-16 items-center gap-4">
        <Logo />
        <div className="hidden md:flex relative flex-1 max-w-md mx-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search posts, people, campuses..." className="pl-9 bg-card" />
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button className="md:hidden h-9 w-9 inline-flex items-center justify-center rounded-lg border border-border"><Search className="h-4 w-4" /></button>
          <Link to="/notifications" className="relative h-9 w-9 inline-flex items-center justify-center rounded-lg border border-border hover:bg-secondary">
            <Bell className="h-4 w-4" />
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-primary-foreground text-[10px] font-bold inline-flex items-center justify-center">3</span>
          </Link>
          <div className="hidden sm:flex items-center gap-2"><LanguageToggle /><ThemeToggle /></div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="h-9 w-9 rounded-full overflow-hidden ring-1 ring-border">
                <img src={currentUser.avatar} alt={currentUser.name} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild><Link to={`/profile/${currentUser.username}`}>Profile</Link></DropdownMenuItem>
              <DropdownMenuItem asChild><Link to="/settings">Settings</Link></DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild><Link to="/">Sign Out</Link></DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
    {/* Mobile bottom nav */}
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-background/95 backdrop-blur border-t border-border">
      <div className="grid grid-cols-4">
        {[
          { to: "/feed", icon: Home, label: "Home" },
          { to: "/explore", icon: Compass, label: "Explore" },
          { to: "/bookmarks", icon: Bookmark, label: "Saved" },
          { to: `/profile/${currentUser.username}`, icon: User, label: "Me" },
        ].map((it, i) => (
          <NavLink key={i} to={it.to} end={it.to === "/feed"} className={({ isActive }) =>
            `flex flex-col items-center gap-0.5 py-2.5 text-[10px] font-medium ${isActive ? "text-primary" : "text-muted-foreground"}`
          }>
            <it.icon className="h-5 w-5" />
            {it.label}
          </NavLink>
        ))}
      </div>
    </nav>
  </>
);
