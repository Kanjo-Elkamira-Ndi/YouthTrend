import { Search } from "lucide-react";
import { announcements, events, tagCloud, trending } from "@/lib/mock";
import { Link } from "@tanstack/react-router";

export function RightRail() {
  return (
    <aside className="hidden xl:block w-80 shrink-0 space-y-5 py-6 pr-6">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          placeholder="Search posts, people, tags…"
          className="h-10 w-full rounded-xl border border-border bg-card pl-9 pr-3 text-sm outline-none placeholder:text-muted-foreground focus:border-brand"
        />
      </div>

      <Card title="📢 Campus Announcements">
        <ul className="space-y-3">
          {announcements.map((a) => (
            <li key={a.id} className="flex gap-2.5">
              <span className="mt-0.5 rounded-md bg-brand-soft px-1.5 py-0.5 text-[10px] font-semibold uppercase text-brand">Official</span>
              <div className="flex-1">
                <p className="text-sm leading-snug text-foreground">{a.title}</p>
                <span className="text-xs text-muted-foreground">{a.time} ago</span>
              </div>
            </li>
          ))}
        </ul>
      </Card>

      <Card title="🔥 Trending on Campus">
        <ol className="space-y-3">
          {trending.map((t) => (
            <li key={t.id} className="flex items-start gap-3">
              <span className="text-lg font-bold text-muted-foreground">0{t.rank}</span>
              <Link to="/post/$id" params={{ id: t.id }} className="flex-1">
                <p className="line-clamp-2 text-sm font-medium leading-snug hover:text-brand">{t.title}</p>
                <span className="text-xs text-muted-foreground">👏 {t.claps}</span>
              </Link>
            </li>
          ))}
        </ol>
      </Card>

      <Card title="🏷️ Explore Topics">
        <div className="flex flex-wrap gap-1.5">
          {tagCloud.map((t) => (
            <span key={t} className="cursor-pointer rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground hover:bg-brand-soft hover:text-brand">
              #{t}
            </span>
          ))}
        </div>
      </Card>

      <Card title="📅 Upcoming Events">
        <ul className="space-y-3">
          {events.map((e) => (
            <li key={e.id} className="rounded-lg border border-border p-3">
              <div className="flex items-center justify-between">
                <span className="rounded-md bg-brand-soft px-2 py-0.5 text-xs font-semibold text-brand">{e.date}</span>
                <span className="text-xs text-muted-foreground">{e.venue}</span>
              </div>
              <p className="mt-2 text-sm font-medium">{e.title}</p>
            </li>
          ))}
        </ul>
      </Card>
    </aside>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-border bg-card p-4">
      <h4 className="mb-3 text-sm font-semibold">{title}</h4>
      {children}
    </section>
  );
}
