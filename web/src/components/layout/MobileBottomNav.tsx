import { NavLink, useLocation } from "react-router-dom";
import { Bookmark, Compass, House, PenSquare, UserCircle } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const items = [
  { to: "/feed", label: "Home", icon: House },
  { to: "/explore", label: "Explore", icon: Compass },
  { to: "/bookmarks", label: "Bookmarks", icon: Bookmark },
  { to: "/profile/me", label: "Profile", icon: UserCircle, badge: true },
];

export const MobileBottomNav = () => {
  const { pathname } = useLocation();
  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 h-[60px] bg-background/95 backdrop-blur-lg border-t border-border flex items-center justify-around">
      {items.slice(0, 2).map((it) => <Item key={it.to} {...it} active={pathname === it.to} />)}
      <NavLink to="/write" className="flex items-center justify-center -mt-5">
        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="h-12 w-12 rounded-full bg-primary text-primary-foreground inline-flex items-center justify-center shadow-lg shadow-primary/30"
        >
          <PenSquare className="h-5 w-5" />
        </motion.div>
      </NavLink>
      {items.slice(2).map((it) => <Item key={it.to} {...it} active={pathname.startsWith(it.to.split("/").slice(0, 2).join("/"))} />)}
    </nav>
  );
};

const Item = ({
  to,
  label,
  icon: Icon,
  active,
  badge,
}: {
  to: string;
  label: string;
  icon: any;
  active: boolean;
  badge?: boolean;
}) => (
  <NavLink to={to} className="relative flex flex-col items-center justify-center gap-0.5 flex-1 h-full">
    {active && (
      <motion.span
        layoutId="mobileNavActive"
        className="absolute top-0 h-0.5 w-8 rounded-full bg-primary"
      />
    )}
    <div className="relative">
      <Icon className={cn("h-5 w-5", active ? "text-primary" : "text-muted-foreground")} />
      {badge && <span className="absolute -top-0.5 -right-1 h-2 w-2 rounded-full bg-red-500" />}
    </div>
    <span className={cn("text-[10px]", active ? "text-primary" : "text-muted-foreground")}>{label}</span>
  </NavLink>
);

export default MobileBottomNav;
