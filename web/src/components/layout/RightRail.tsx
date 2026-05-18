import type { ReactNode } from "react";
import { trending, topics, events, announcements as mockAnnouncements } from "@/mock";
import { Search, Megaphone, TrendingUp, Tag, CalendarDays, ThumbsUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api, unwrap } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export const RightRail = () => {
  const { user } = useAuth();

  const { data: announcements } = useQuery({
    queryKey: ['announcements', user?.campus_id],
    queryFn: () => api.get('/announcements', { params: { perPage: 3 } }).then(unwrap),
    enabled: !!user?.campus_id,
  });

  const list = Array.isArray(announcements) ? announcements : mockAnnouncements;

  return (
  <aside className="hidden xl:flex flex-col w-80 shrink-0 sticky top-16 h-[calc(100vh-4rem)] py-6 pl-4 overflow-y-auto space-y-5">
    <Link to="/search">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search YouthTrend..." className="pl-9 bg-card" readOnly />
      </div>
    </Link>

    <Section title="Campus Announcements" icon={<Megaphone className="h-4 w-4 text-primary" />}>
      <div className="space-y-3">
        {(list as any[]).slice(0, 3).map((a: any) => (
          <div key={a.id} className="text-sm">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-bold">OFFICIAL</span>
              <span className="text-[10px] text-muted-foreground">{a.created_at ? new Date(a.created_at).toLocaleDateString() : a.time}</span>
            </div>
            <div className="font-semibold">{a.title}</div>
            <p className="text-xs text-muted-foreground">{a.body}</p>
          </div>
        ))}
      </div>
    </Section>

    <Section title="Trending on Campus" icon={<TrendingUp className="h-4 w-4 text-primary" />}>
      <ol className="space-y-3">
        {trending.map((t, i) => (
          <li key={t.id} className="flex gap-3">
            <span className="text-2xl font-extrabold text-muted-foreground/40 leading-none">{String(i + 1).padStart(2, "0")}</span>
            <div className="min-w-0">
              <Link to="/post/p1" className="text-sm font-semibold leading-snug hover:text-primary line-clamp-2">{t.title}</Link>
              <div className="text-xs text-muted-foreground mt-0.5 inline-flex items-center gap-1"><ThumbsUp className="h-3.5 w-3.5" />{t.claps.toLocaleString()}</div>
            </div>
          </li>
        ))}
      </ol>
    </Section>

    <Section title="Explore Topics" icon={<Tag className="h-4 w-4 text-primary" />}>
      <div className="flex flex-wrap gap-2">
        {topics.map((t) => (
          <a key={t} href="#" className="text-xs px-2.5 py-1 rounded-full bg-secondary hover:bg-primary hover:text-primary-foreground transition-colors">{t}</a>
        ))}
      </div>
    </Section>

    <Section title="Upcoming Events" icon={<CalendarDays className="h-4 w-4 text-primary" />}>
      <div className="space-y-3">
        {events.map((e) => (
          <div key={e.id} className="flex gap-3">
            <div className="w-12 text-center bg-primary/10 rounded-lg py-1.5 shrink-0">
              <div className="text-[10px] font-semibold text-primary">{e.date.split(" ")[0]}</div>
              <div className="text-base font-bold text-primary">{e.date.split(" ")[1]}</div>
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold">{e.title}</div>
              <div className="text-xs text-muted-foreground">{e.venue}</div>
            </div>
          </div>
        ))}
      </div>
    </Section>
  </aside>
);
};

const Section = ({ title, icon, children }: { title: string; icon: ReactNode; children: ReactNode }) => (
  <div className="yt-card p-4">
    <div className="flex items-center gap-2 mb-3 text-sm font-bold">
      {icon}
      <span>{title}</span>
    </div>
    {children}
  </div>
);
