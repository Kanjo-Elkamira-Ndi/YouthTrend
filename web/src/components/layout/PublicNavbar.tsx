import { Link, useLocation, useNavigate } from "react-router-dom";
import { Logo } from "@/components/common/Logo";
import { ThemeToggle, LanguageToggle } from "@/components/common/Toggle";
import { useState, useRef, useEffect } from "react";
import { Menu, X, Search, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";

const RECENT_KEY = "yt_recent_searches";
const MAX_RECENT = 5;

const getRecents = (): string[] => {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]");
  } catch { return []; }
};

const saveRecents = (term: string) => {
  const arr = [term, ...getRecents().filter((s) => s !== term)].slice(0, MAX_RECENT);
  localStorage.setItem(RECENT_KEY, JSON.stringify(arr));
};

export const PublicNavbar = () => {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [focused, setFocused] = useState(false);
  const [recents, setRecents] = useState<string[]>(getRecents);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setFocused(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const submit = (term: string) => {
    const t = term.trim();
    if (!t) return;
    saveRecents(t);
    setRecents(getRecents());
    setQ(t);
    setFocused(false);
    navigate("/search?q=" + encodeURIComponent(t));
  };

  const removeRecent = (term: string) => {
    const arr = getRecents().filter((s) => s !== term);
    localStorage.setItem(RECENT_KEY, JSON.stringify(arr));
    setRecents(arr);
  };

  const links = [
    { to: "/", label: "Home" },
    { to: "/explore", label: "Explore" },
    { to: "/about", label: "About" },
    { to: "/campuses", label: "Campuses" },
  ];

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-background/80 border-b border-border">
      <div className="container flex h-16 items-center justify-between gap-4">
        <Logo />

        {/* Search bar */}
        <div ref={searchRef} className="hidden md:flex relative flex-1 max-w-sm">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onFocus={() => setFocused(true)}
              onKeyDown={(e) => e.key === "Enter" && submit(q)}
              placeholder="Search..."
              className="pl-9 h-9 bg-card text-sm"
            />
          </div>
          {focused && recents.length > 0 && !q && (
            <div className="absolute left-0 right-0 top-full mt-1 z-50 bg-background border border-border rounded-lg shadow-xl p-3 space-y-1">
              <h4 className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider mb-1">Recent</h4>
              {recents.map((r) => (
                <div key={r} className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-muted/50 group cursor-pointer">
                  <Clock className="h-3 w-3 text-muted-foreground shrink-0" />
                  <button onClick={() => submit(r)} className="text-xs flex-1 text-left">{r}</button>
                  <button onClick={() => removeRecent(r)} className="opacity-0 group-hover:opacity-100">
                    <X className="h-3 w-3 text-muted-foreground" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <nav className="hidden md:flex items-center gap-8">
          {links.map((l, i) => {
            const isActive = pathname === l.to;
            return (
              <Link
                key={i}
                to={l.to}
                className={`relative text-sm font-medium transition-colors ${isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                {l.label}
                {isActive && (
                  <motion.span
                    layoutId="publicNavIndicator"
                    className="absolute -bottom-[22px] left-0 right-0 h-0.5 bg-primary rounded-full"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
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
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submit(q)}
                placeholder="Search..."
                className="pl-9 h-9 bg-card text-sm"
              />
            </div>
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
