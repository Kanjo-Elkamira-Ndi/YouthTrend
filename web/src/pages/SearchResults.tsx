import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Search, SearchX, X } from "lucide-react";
import { mockSearchResults, mockRecentSearches, mockTrendingSearches } from "@/mock/writerTools";
import { PostCard } from "@/components/feed/PostCard";
import { EmptyState } from "@/components/common/EmptyState";
import { PostCardSkeleton, WriterCardSkeleton } from "@/components/common/Skeletons";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "all", label: "All Results" },
  { id: "posts", label: "Posts" },
  { id: "writers", label: "Writers" },
  { id: "campuses", label: "Campuses" },
  { id: "categories", label: "Categories" },
];

const SearchResults = () => {
  const [params, setParams] = useSearchParams();
  const q = params.get("q") || "";
  const [input, setInput] = useState(q);
  const [tab, setTab] = useState("all");
  const [sort, setSort] = useState("relevant");
  const [focused, setFocused] = useState(false);
  const [recents, setRecents] = useState(mockRecentSearches);
  const [follows, setFollows] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(t);
  }, [q, tab]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setFocused(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const submit = (term: string) => {
    setParams({ q: term });
    setInput(term);
    setFocused(false);
  };

  const results = mockSearchResults;
  const totalCount = results.posts.length + results.writers.length + results.campuses.length;

  const highlight = (text: string) => {
    if (!q) return text;
    const parts = text.split(new RegExp(`(${q})`, "gi"));
    return parts.map((p, i) =>
      p.toLowerCase() === q.toLowerCase()
        ? <mark key={i} className="bg-yellow-300/40 text-foreground rounded px-0.5">{p}</mark>
        : <span key={i}>{p}</span>
    );
  };

  const noResults = q && results.posts.length === 0;

  return (
    <AppShell hideRight>
      <div className="max-w-4xl space-y-6">
        <div ref={ref} className="relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onFocus={() => setFocused(true)}
              onKeyDown={(e) => e.key === "Enter" && submit(input)}
              placeholder="Search posts, writers, campuses..."
              className="pl-10 h-12 text-base bg-card focus-visible:ring-2 focus-visible:ring-primary transition-all"
            />
          </div>
          {focused && !input && (
            <div className="absolute left-0 right-0 top-full mt-2 z-50 bg-background border border-border rounded-xl shadow-xl p-4 space-y-4">
              <div>
                <h4 className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-2">Recent searches</h4>
                <div className="space-y-1">
                  {recents.map((r) => (
                    <div key={r} className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-muted/50 group">
                      <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                      <button onClick={() => submit(r)} className="text-sm flex-1 text-left">{r}</button>
                      <button onClick={() => setRecents((arr) => arr.filter((x) => x !== r))} className="opacity-0 group-hover:opacity-100">
                        <X className="h-3.5 w-3.5 text-muted-foreground" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-2">Trending searches</h4>
                <div className="flex flex-wrap gap-2">
                  {mockTrendingSearches.map((t) => (
                    <button key={t} onClick={() => submit(t)} className="text-xs px-3 py-1.5 rounded-full bg-secondary hover:bg-primary hover:text-primary-foreground">
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
          {q && (
            <p className="text-sm text-muted-foreground mt-2">{totalCount} results for "{q}"</p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 justify-between border-b border-border pb-3">
          <div className="flex gap-1 overflow-x-auto">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors",
                  tab === t.id ? "bg-primary text-primary-foreground" : "bg-secondary hover:bg-secondary/70",
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="text-xs bg-card border border-border rounded-md px-2 py-1.5"
          >
            <option value="relevant">Most Relevant</option>
            <option value="newest">Newest</option>
            <option value="claps">Most Claps</option>
          </select>
        </div>

        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => <PostCardSkeleton key={i} />)}
            <div className="grid md:grid-cols-2 gap-4">
              {Array.from({ length: 2 }).map((_, i) => <WriterCardSkeleton key={i} />)}
            </div>
          </div>
        ) : noResults ? (
          <EmptyState
            icon={SearchX}
            heading={`No results for "${q}"`}
            subtext="Try different keywords or browse by category."
            action={{ label: "Browse Explore", href: "/explore" }}
          />
        ) : (
          <>
            {(tab === "all" || tab === "posts") && (
              <Section title="Posts" link="See all posts" onClick={() => setTab("posts")}>
                <div className="space-y-4">
                  {(tab === "all" ? results.posts.slice(0, 3) : results.posts).map((p) => (
                    <div key={p.id} className="[&_h3]:!leading-snug">
                      <Link to={`/post/${p.id}`} className="block yt-card yt-card-hover p-4 sm:p-5">
                        <h3 className="font-bold text-lg">{highlight(p.title)}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{highlight(p.excerpt)}</p>
                      </Link>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {(tab === "all" || tab === "writers") && (
              <Section title="Writers" link="See all writers" onClick={() => setTab("writers")}>
                <div className={cn(tab === "writers" ? "grid md:grid-cols-2 gap-4" : "space-y-3")}>
                  {(tab === "all" ? results.writers.slice(0, 3) : results.writers).map((u) => {
                    const f = follows[u.id];
                    if (tab === "writers") {
                      return (
                        <div key={u.id} className="yt-card yt-card-hover overflow-hidden">
                          <div className="h-16 bg-gradient-to-r from-primary/30 to-primary/10" />
                          <div className="p-4">
                            <img src={u.avatar} alt={u.name} className="h-14 w-14 rounded-full -mt-12 border-4 border-background" />
                            <div className="mt-2 flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <div className="font-bold flex items-center gap-2">{u.name} <Badge variant="secondary">{u.campus}</Badge></div>
                                <div className="text-xs text-muted-foreground">{u.department} · {u.year}</div>
                              </div>
                              <Button size="sm" variant={f ? "default" : "outline"} onClick={() => setFollows((x) => ({ ...x, [u.id]: !f }))}>
                                {f ? "Following" : "Follow"}
                              </Button>
                            </div>
                            <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{u.bio}</p>
                            <div className="flex gap-4 text-xs text-muted-foreground mt-3 pt-3 border-t border-border">
                              <span><b className="text-foreground">12</b> posts</span>
                              <span><b className="text-foreground">{u.followers}</b> followers</span>
                              <span><b className="text-foreground">{u.totalClaps}</b> claps</span>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return (
                      <div key={u.id} className="yt-card p-4 flex items-center gap-3">
                        <img src={u.avatar} alt={u.name} className="h-12 w-12 rounded-full" />
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold truncate">{u.name}</div>
                          <div className="text-xs text-muted-foreground truncate">{u.campus} · {u.department} · {u.followers} followers</div>
                        </div>
                        <Button size="sm" variant={f ? "default" : "outline"} onClick={() => setFollows((x) => ({ ...x, [u.id]: !f }))}>
                          {f ? "Following" : "Follow"}
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </Section>
            )}

            {(tab === "all" || tab === "campuses") && (
              <Section title="Campuses">
                <div className="grid md:grid-cols-2 gap-4">
                  {results.campuses.map((c) => (
                    <div key={c.id} className="yt-card yt-card-hover p-5 flex items-center gap-4">
                      <span className="h-14 w-14 rounded-xl bg-primary/10 inline-flex items-center justify-center text-3xl">{c.emoji}</span>
                      <div className="flex-1">
                        <div className="font-bold">{c.name}</div>
                        <div className="text-xs text-muted-foreground">{c.members.toLocaleString()} members</div>
                      </div>
                      <Button size="sm" variant="outline">View</Button>
                    </div>
                  ))}
                </div>
              </Section>
            )}
          </>
        )}
      </div>
    </AppShell>
  );
};

const Section = ({ title, link, onClick, children }: { title: string; link?: string; onClick?: () => void; children: React.ReactNode }) => (
  <section className="space-y-3">
    <div className="flex items-center justify-between">
      <h2 className="text-lg font-bold">{title}</h2>
      {link && <button onClick={onClick} className="text-sm text-primary font-semibold hover:underline">{link} →</button>}
    </div>
    {children}
  </section>
);

export default SearchResults;
