import { announcements, trending, topics, events } from "@/mock";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";

export const RightRail = () => (
  <aside className="hidden xl:flex flex-col w-80 shrink-0 sticky top-16 h-[calc(100vh-4rem)] py-6 pl-4 overflow-y-auto space-y-5">
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input placeholder="Search YouthTrend..." className="pl-9 bg-card" />
    </div>

    <Section title="📢 Campus Announcements">
      <div className="space-y-3">
        {announcements.map((a) => (
          <div key={a.id} className="text-sm">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-bold">OFFICIAL</span>
              <span className="text-[10px] text-muted-foreground">{a.time}</span>
            </div>
            <div className="font-semibold">{a.title}</div>
            <p className="text-xs text-muted-foreground">{a.body}</p>
          </div>
        ))}
      </div>
    </Section>

    <Section title="🔥 Trending on Campus">
      <ol className="space-y-3">
        {trending.map((t, i) => (
          <li key={t.id} className="flex gap-3">
            <span className="text-2xl font-extrabold text-muted-foreground/40 leading-none">{String(i + 1).padStart(2, "0")}</span>
            <div className="min-w-0">
              <Link to="/post/p1" className="text-sm font-semibold leading-snug hover:text-primary line-clamp-2">{t.title}</Link>
              <div className="text-xs text-muted-foreground mt-0.5">👏 {t.claps.toLocaleString()}</div>
            </div>
          </li>
        ))}
      </ol>
    </Section>

    <Section title="🏷️ Explore Topics">
      <div className="flex flex-wrap gap-2">
        {topics.map((t) => (
          <a key={t} href="#" className="text-xs px-2.5 py-1 rounded-full bg-secondary hover:bg-primary hover:text-primary-foreground transition-colors">{t}</a>
        ))}
      </div>
    </Section>

    <Section title="📅 Upcoming Events">
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

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="yt-card p-4">
    <h4 className="text-sm font-bold mb-3">{title}</h4>
    {children}
  </div>
);
