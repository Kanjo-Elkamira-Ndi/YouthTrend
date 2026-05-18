import { useEffect, useRef, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Clock, Search, SearchX, X, TrendingUp, Flame, Newspaper, Trophy, GraduationCap, Calendar, Theater, MessageSquare, ThumbsUp, MessageCircle, User } from "lucide-react";
import { PostCardSkeleton } from "@/components/common/Skeletons";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { api, unwrap, unwrapPaginated } from "@/lib/api";
import { InlineError } from "@/components/common/InlineError";

const RECENT_KEY = "yt_recent_searches";
const MAX_RECENT = 8;

const getRecents = (): string[] => {
  try { return JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]"); }
  catch { return []; }
};

const saveRecents = (term: string) => {
  const arr = [term, ...getRecents().filter((s) => s !== term)].slice(0, MAX_RECENT);
  localStorage.setItem(RECENT_KEY, JSON.stringify(arr));
};

const TABS = [
  { id: "all", label: "All Results" },
  { id: "posts", label: "Posts" },
  { id: "writers", label: "Writers" },
  { id: "campuses", label: "Campuses" },
];

const getCategoryIcon = (name: string) => {
  switch (name) {
    case "Gist": return Flame;
    case "News": return Newspaper;
    case "Sports": return Trophy;
    case "Academics": return GraduationCap;
    case "Events": return Calendar;
    case "Culture": return Theater;
    case "Opinion": return MessageSquare;
    default: return Flame;
  }
};

const SearchResults = () => {
  const [params, setParams] = useSearchParams();
  const q = params.get("q") || "";
  const [input, setInput] = useState(q);
  const [tab, setTab] = useState("all");
  const [focused, setFocused] = useState(false);
  const [recents, setRecents] = useState<string[]>(getRecents);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setFocused(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const submit = (term: string) => {
    const t = term.trim();
    if (!t) return;
    saveRecents(t);
    setRecents(getRecents());
    setInput(t);
    setFocused(false);
    setParams({ q: t });
  };

  const { data: searchAll, isLoading: allLoading, isError: allError } = useQuery({
    queryKey: ['search', q, 'all'],
    queryFn: () => api.get('/search', { params: { q, type: 'all' } }).then(unwrap<{ posts: any[]; writers: any[]; campuses: any[] }>),
    enabled: q.length >= 2 && tab === 'all',
  });

  const { data: searchPosts, isLoading: postsLoading } = useQuery({
    queryKey: ['search', q, 'posts'],
    queryFn: () => api.get('/search', { params: { q, type: 'posts' } }).then(unwrapPaginated<any>),
    enabled: q.length >= 2 && tab === 'posts',
  });

  const { data: searchWriters, isLoading: writersLoading } = useQuery({
    queryKey: ['search', q, 'writers'],
    queryFn: () => api.get('/search', { params: { q, type: 'writers' } }).then(unwrapPaginated<any>),
    enabled: q.length >= 2 && tab === 'writers',
  });

  const { data: searchCampuses, isLoading: campusesLoading } = useQuery({
    queryKey: ['search', q, 'campuses'],
    queryFn: () => api.get('/search', { params: { q, type: 'campuses' } }).then(unwrapPaginated<any>),
    enabled: q.length >= 2 && tab === 'campuses',
  });

  const { data: trending } = useQuery({
    queryKey: ['search', 'trending'],
    queryFn: () => api.get('/search/trending').then(unwrap<string[]>),
  });

  const trendTerms = Array.isArray(trending) ? trending : [];

  const isLoading = allLoading || postsLoading || writersLoading || campusesLoading;
  const noResults = q.length >= 2 && searchAll && searchAll.posts.length === 0 && searchAll.writers.length === 0 && searchAll.campuses.length === 0;

  const highlight = (text: string) => {
    if (!q) return text;
    const parts = text.split(new RegExp(`(${q})`, "gi"));
    return parts.map((p, i) =>
      p.toLowerCase() === q.toLowerCase()
        ? <mark key={i} className="bg-yellow-300/40 text-foreground rounded px-0.5">{p}</mark>
        : <span key={i}>{p}</span>
    );
  };

  const fmtCount = (n: number) => {
    if (n >= 1000) return (n / 1000).toFixed(1) + "k";
    return String(n);
  };

  const posts = searchAll?.posts ?? searchPosts?.data ?? [];
  const writers = searchAll?.writers ?? searchWriters?.data ?? [];
  const campuses = searchAll?.campuses ?? searchCampuses?.data ?? [];
  const totalCount = posts.length + writers.length + campuses.length;

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
              {recents.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-2">Recent searches</h4>
                  <div className="space-y-1">
                    {recents.map((r) => (
                      <div key={r} className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-muted/50 group">
                        <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                        <button onClick={() => submit(r)} className="text-sm flex-1 text-left">{r}</button>
                        <button onClick={() => {
                          const arr = getRecents().filter((x) => x !== r);
                          localStorage.setItem(RECENT_KEY, JSON.stringify(arr));
                          setRecents(arr);
                        }} className="opacity-0 group-hover:opacity-100">
                          <X className="h-3.5 w-3.5 text-muted-foreground" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {trendTerms.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-2 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" /> Trending searches
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {trendTerms.map((t) => (
                      <button key={t} onClick={() => submit(t)} className="text-xs px-3 py-1.5 rounded-full bg-secondary hover:bg-primary hover:text-primary-foreground">
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          {q && q.length >= 2 && (
            <p className="text-sm text-muted-foreground mt-2">{isLoading ? 'Searching...' : `${totalCount} results for "${q}"`}</p>
          )}
          {q && q.length < 2 && (
            <p className="text-sm text-muted-foreground mt-2">Enter at least 2 characters to search.</p>
          )}
        </div>

        {q.length >= 2 && (
          <div className="flex flex-wrap items-center gap-2 border-b border-border pb-3">
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
          </div>
        )}

        {q.length >= 2 && allError && (
          <InlineError message="Search failed. Please try again." />
        )}

        {q.length >= 2 && isLoading && (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => <PostCardSkeleton key={i} />)}
          </div>
        )}

        {q.length >= 2 && !isLoading && noResults && (
          <div className="text-center py-16 space-y-3">
            <SearchX className="h-12 w-12 text-muted-foreground/50 mx-auto" />
            <h2 className="text-xl font-bold">No results for "{q}"</h2>
            <p className="text-sm text-muted-foreground">Try different keywords or browse by category.</p>
            <Button asChild variant="outline"><Link to="/explore">Browse Explore</Link></Button>
          </div>
        )}

        {q.length >= 2 && !isLoading && (
          <>
            {(tab === "all" || tab === "posts") && posts.length > 0 && (
              <Section title="Posts" link={tab === "all" ? "See all posts" : undefined} onClick={() => setTab("posts")}>
                <div className="space-y-4">
                  {(tab === "all" ? posts.slice(0, 3) : posts).map((p: any) => {
                    const CatIcon = getCategoryIcon(p.category);
                    return (
                      <Link key={p.id} to={`/post/${p.campus_slug ?? p.campus_id}/${p.slug}`} className="block yt-card yt-card-hover p-4 sm:p-5">
                        <div className="flex items-center gap-2 text-xs mb-2">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary font-semibold">
                            <CatIcon className="h-3 w-3" /> {p.category}
                          </span>
                        </div>
                        <h3 className="font-bold text-lg">{highlight(p.title)}</h3>
                        {p.body && <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{highlight(p.body.replace(/[*#>`\n]+/g, ' '))}</p>}
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-3">
                          <span className="inline-flex items-center gap-1"><ThumbsUp className="h-3.5 w-3.5" />{fmtCount(p.clap_count ?? 0)}</span>
                          <span className="inline-flex items-center gap-1"><MessageCircle className="h-3.5 w-3.5" />{p.comment_count ?? 0}</span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </Section>
            )}

            {(tab === "all" || tab === "writers") && writers.length > 0 && (
              <Section title="Writers" link={tab === "all" ? "See all writers" : undefined} onClick={() => setTab("writers")}>
                <div className={cn(tab === "writers" ? "grid md:grid-cols-2 gap-4" : "space-y-3")}>
                  {(tab === "all" ? writers.slice(0, 3) : writers).map((u: any) => (
                    <Link key={u.id} to={`/profile/${u.username}`} className="yt-card yt-card-hover p-4 flex items-center gap-3">
                      <img src={u.avatar_url ?? ''} alt={u.full_name} className="h-12 w-12 rounded-full" />
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold truncate">{highlight(u.full_name)}</div>
                        <div className="text-xs text-muted-foreground truncate">
                          {u.department ?? ''}{u.department && u.follower_count !== undefined ? ' · ' : ''}{u.follower_count !== undefined ? `${fmtCount(u.follower_count)} followers` : ''}
                        </div>
                      </div>
                      <User className="h-4 w-4 text-muted-foreground" />
                    </Link>
                  ))}
                </div>
              </Section>
            )}

            {(tab === "all" || tab === "campuses") && campuses.length > 0 && (
              <Section title="Campuses" link={tab === "all" ? "See all campuses" : undefined} onClick={() => setTab("campuses")}>
                <div className="grid md:grid-cols-2 gap-4">
                  {(tab === "all" ? campuses.slice(0, 2) : campuses).map((c: any) => (
                    <div key={c.id} className="yt-card yt-card-hover p-5 flex items-center gap-4">
                      <span className="h-14 w-14 rounded-xl bg-primary/10 inline-flex items-center justify-center text-3xl">
                        {(c.name ?? '').charAt(0)}
                      </span>
                      <div className="flex-1">
                        <div className="font-bold">{c.name}</div>
                        <div className="text-xs text-muted-foreground">{c.member_count?.toLocaleString() ?? 0} members</div>
                      </div>
                      <Button size="sm" variant="outline" asChild>
                        <Link to={`/campus/${c.slug}`}>View</Link>
                      </Button>
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
