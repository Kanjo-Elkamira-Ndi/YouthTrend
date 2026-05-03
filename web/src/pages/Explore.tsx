import { AppShell } from "@/components/layout/AppShell";
import { CategoryPills } from "@/components/feed/CategoryPills";
import { PostCard } from "@/components/feed/PostCard";
import { posts, campuses, topics } from "@/mock";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { CAMPUS_ICONS } from "@/lib/constants";

const Explore = () => {
  const [cat, setCat] = useState("All");
  const filtered = cat === "All" ? posts : posts.filter((p) => p.category === cat);
  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-extrabold">Explore</h1>
          <p className="text-muted-foreground mt-1">Discover stories across all Cameroonian campuses.</p>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search posts, tags, or writers..." className="pl-9 h-11 bg-card" />
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {campuses.map((c) => {
            const CampusIcon = CAMPUS_ICONS[c.short] ?? CAMPUS_ICONS.UY1;
            return (
              <div key={c.id} className="yt-card yt-card-hover p-4 flex items-center gap-3">
                <span className="h-12 w-12 rounded-xl bg-primary/10 inline-flex items-center justify-center text-primary">
                  <CampusIcon className="h-6 w-6" />
                </span>
                <div>
                  <div className="font-bold">{c.short}</div>
                  <div className="text-xs text-muted-foreground">{c.members.toLocaleString()} members</div>
                </div>
              </div>
            );
          })}
        </div>

        <div>
          <h3 className="text-sm font-bold uppercase text-muted-foreground tracking-wider mb-3">Topics</h3>
          <div className="flex flex-wrap gap-2">
            {topics.map((t) => <a href="#" key={t} className="text-sm px-3 py-1.5 rounded-full bg-secondary hover:bg-primary hover:text-primary-foreground">{t}</a>)}
          </div>
        </div>

        <CategoryPills active={cat} onChange={setCat} />

        <div className="grid md:grid-cols-2 gap-4">
          {filtered.map((p) => <PostCard key={p.id} post={p} />)}
        </div>
      </div>
    </AppShell>
  );
};

export default Explore;
