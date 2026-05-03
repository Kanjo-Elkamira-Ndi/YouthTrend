import { Link, NavLink } from "react-router-dom";
import { Logo } from "@/components/common/Logo";
import { ThemeToggle, LanguageToggle } from "@/components/common/Toggle";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export const PublicNavbar = () => {
  const [open, setOpen] = useState(false);
  const links = [
    { to: "/", label: "Home" },
    { to: "/explore", label: "Explore" },
    { to: "/", label: "About" },
    { to: "/", label: "Campuses" },
  ];
  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-background/80 border-b border-border">
      <div className="container flex h-16 items-center justify-between">
        <Logo />
        <nav className="hidden md:flex items-center gap-8">
          {links.map((l, i) => (
            <NavLink key={i} to={l.to} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="hidden md:flex items-center gap-2">
          <LanguageToggle />
          <ThemeToggle />
          <Link to="/signin"><Button variant="ghost" size="sm">Sign In</Button></Link>
          <Link to="/signup"><Button size="sm" className="bg-primary hover:bg-primary/90">Get Started</Button></Link>
        </div>
        <button className="md:hidden h-9 w-9 inline-flex items-center justify-center" onClick={() => setOpen(!open)} aria-label="Menu">
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {open && (
        <div className="md:hidden border-t border-border bg-background">
          <div className="container py-4 space-y-3">
            {links.map((l, i) => (
              <Link key={i} to={l.to} onClick={() => setOpen(false)} className="block text-sm font-medium">{l.label}</Link>
            ))}
            <div className="flex items-center gap-2 pt-2">
              <ThemeToggle /><LanguageToggle />
              <Link to="/signin" className="ml-auto"><Button variant="ghost" size="sm">Sign In</Button></Link>
              <Link to="/signup"><Button size="sm">Get Started</Button></Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
