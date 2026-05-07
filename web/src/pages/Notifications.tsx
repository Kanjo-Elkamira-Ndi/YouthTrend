import { useMemo, useState, useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { notifications } from "@/mock";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import {
  Bell,
  CheckCheck,
  ChevronRight,
  Heart,
  Megaphone,
  MessageCircle,
  Settings as SettingsIcon,
  ShieldAlert,
  Star,
  UserPlus,
  PartyPopper as HandsClapping,
  User,
  Bookmark,
  Flame,
  Newspaper,
  Trophy,
  GraduationCap,
  Calendar,
  Music,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AppNotification {
  id: string;
  icon: string;
  text: string;
  time: string;
  read: boolean;
  group: "Today" | "This Week";
}

// Map notification icon strings to Lucide components
const ICON_MAP: Record<string, { icon: any; color: string }> = {
  clap: { icon: Heart, color: "bg-red-500/10 text-red-400" },
  comment: { icon: MessageCircle, color: "bg-primary/10 text-primary" },
  follow: { icon: UserPlus, color: "bg-emerald-500/10 text-emerald-400" },
  announcement: { icon: Megaphone, color: "bg-amber-500/10 text-amber-400" },
  save: { icon: Bookmark, color: "bg-purple-500/10 text-purple-400" },
  gist: { icon: Flame, color: "bg-orange-500/10 text-orange-400" },
  news: { icon: Newspaper, color: "bg-blue-500/10 text-blue-400" },
  sports: { icon: Trophy, color: "bg-green-500/10 text-green-400" },
  academics: { icon: GraduationCap, color: "bg-indigo-500/10 text-indigo-400" },
  events: { icon: Calendar, color: "bg-pink-500/10 text-pink-400" },
  culture: { icon: Music, color: "bg-teal-500/10 text-teal-400" },
};

const Notifications = () => {
  const [items, setItems] = useState<AppNotification[]>(notifications);
  const [tab, setTab] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(t);
  }, []);

  const filtered = useMemo(() => {
    switch (tab) {
      case "unread":
        return items.filter((n) => !n.read);
      case "mentions":
        return items.filter((n) => n.icon === "comment");
      case "campus":
        return items.filter((n) => n.icon === "announcement" || n.icon === "gist" || n.icon === "news");
      default:
        return items;
    }
  }, [items, tab]);

  const unreadCount = items.filter((n) => !n.read).length;

  const markAllRead = () => setItems((arr) => arr.map((n) => ({ ...n, read: true })));
  const markRead = (id: string) => setItems((arr) => arr.map((n) => (n.id === id ? { ...n, read: true } : n)));

  const groups = ["Today", "This Week"] as const;

  // Simple loading skeleton
  if (loading) {
    return (
      <AppShell hideRight>
        <div className="max-w-3xl">
          <div className="flex items-center justify-between mb-6">
            <div className="h-9 w-48 bg-muted rounded animate-pulse" />
            <div className="h-9 w-36 bg-muted rounded animate-pulse" />
          </div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-start gap-3 p-4">
                <div className="h-9 w-9 rounded-full bg-muted animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 bg-muted rounded animate-pulse" />
                  <div className="h-3 w-1/4 bg-muted rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell hideRight>
      <div className="max-w-3xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-extrabold">Notifications</h1>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button variant="outline" size="sm" onClick={markAllRead}>
                <CheckCheck className="h-4 w-4 mr-1" /> Mark All as Read
              </Button>
            )}
            <Link to="/settings#notifications">
              <Button variant="ghost" size="icon">
                <SettingsIcon className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>

        <Tabs value={tab} onValueChange={setTab} className="mb-6">
          <TabsList className="w-full justify-start bg-transparent border-b border-border rounded-none p-0 h-auto">
            <TabTrigger value="all" label="All" />
            <TabTrigger value="unread" label="Unread" badge={unreadCount} />
            <TabTrigger value="mentions" label="Mentions" />
            <TabTrigger value="campus" label="Campus" />
          </TabsList>
        </Tabs>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Bell className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold">All caught up</h3>
            <p className="text-sm text-muted-foreground mt-1">
              You have no new notifications. Check back after you publish your first post.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {groups.map((g) => {
              const groupItems = filtered.filter((n) => n.group === g);
              if (groupItems.length === 0) return null;
              return (
                <section key={g}>
                  <h2 className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-3 sticky top-16 bg-background/95 backdrop-blur py-1">
                    {g}
                  </h2>
                  <div className="space-y-1">
                    {groupItems.map((n) => (
                      <NotifRow key={n.id} n={n} onRead={markRead} />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
};

const TabTrigger = ({
  value,
  label,
  badge,
}: {
  value: string;
  label: string;
  badge?: number;
}) => (
  <TabsTrigger
    value={value}
    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-transparent shadow-none px-4 pb-3 gap-2"
  >
    {label}
    {badge !== undefined && badge > 0 && (
      <Badge className="bg-primary text-primary-foreground h-5 px-1.5 text-[10px]">
        {badge}
      </Badge>
    )}
  </TabsTrigger>
);

const NotifRow = ({ n, onRead }: { n: AppNotification; onRead: (id: string) => void }) => {
  const meta = ICON_MAP[n.icon] ?? { icon: MessageCircle, color: "bg-secondary text-muted-foreground" };
  const Icon = meta.icon;

  return (
    <div
      onClick={() => onRead(n.id)}
      className={cn(
        "flex items-start gap-3 p-3 rounded-md transition-colors hover:bg-muted/50 cursor-pointer",
        !n.read && "border-l-2 border-primary bg-primary/[0.03] pl-3"
      )}
    >
      <span className={cn("h-9 w-9 rounded-full inline-flex items-center justify-center shrink-0", meta.color)}>
        <Icon className="h-4 w-4" />
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-sm leading-snug">{n.text}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-muted-foreground">{n.time}</span>
        </div>
      </div>
      {!n.read && <span className="h-2 w-2 rounded-full bg-primary self-center shrink-0" />}
    </div>
  );
};

export default Notifications;