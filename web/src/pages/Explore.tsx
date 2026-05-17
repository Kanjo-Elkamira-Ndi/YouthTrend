import { AppShell } from "@/components/layout/AppShell";
import { CategoryPills } from "@/components/feed/CategoryPills";
import { PostCard } from "@/components/feed/PostCard";
import { Skeleton } from "@/components/ui/skeleton";
import { InlineError } from "@/components/common/InlineError";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Search, SearchX, GraduationCap } from "lucide-react";
import { EmptyState } from "@/components/common/EmptyState";
import { FeedSkeleton } from "@/components/common/Skeletons";
import { api, unwrap, unwrapPaginated } from "@/lib/api";
import { CAMPUS_ICONS } from "@/lib/constants";
import type { CampusRow } from "@/types/campus";
import type { Post } from "@/types/post";

const Explore = () => {
  const [cat, setCat] = useState("All");

  const { data: campusesData, isLoading: campusesLoading, isError: campusesError, refetch: refetchCampuses } = useQuery({
    queryKey: ["campuses"],
    queryFn: () => api.get("/campuses").then(unwrap) as Promise<CampusRow[]>,
  });

  const { data: postsData, isLoading: postsLoading, isError: postsError, refetch: refetchPosts } = useQuery({
    queryKey: ['explore-posts', cat],
    queryFn: () => {
      const params: Record<string, unknown> = { sort: 'trending' };
      if (cat !== 'All') params.category = cat;
      return api.get('/posts/explore', { params }).then(unwrapPaginated<Post>);
    },
  });

  const filtered = postsData?.data ?? [];
  const error = postsError;
  const refetch = () => { refetchCampuses(); refetchPosts(); };

  return (
    <AppShell>
      <div className="space-y-6">
        {error && <InlineError message="Couldn't load trending posts." onRetry={refetch} />}
        <div>
          <h1 className="text-3xl font-extrabold">Explore</h1>
          <p className="text-muted-foreground mt-1">Discover stories across all Cameroonian campuses.</p>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search posts, tags, or writers..." className="pl-9 h-11 bg-card" />
        </div>

        {campusesLoading && (
          <div className="grid md:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="yt-card p-4 flex items-center gap-3">
                <Skeleton className="h-12 w-12 rounded-xl" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            ))}
          </div>
        )}
        {campusesError && <InlineError message="Failed to load campuses" onRetry={refetchCampuses} />}
        {campusesData && (
          <div className="grid md:grid-cols-3 gap-4">
            {campusesData.map((c) => {
              const CampusIcon = CAMPUS_ICONS[c.short_code] ?? GraduationCap;
              return (
                <div key={c.id} className="yt-card yt-card-hover p-4 flex items-center gap-3">
                  <span className="h-12 w-12 rounded-xl bg-primary/10 inline-flex items-center justify-center">
                    <CampusIcon className="h-6 w-6 text-primary" />
                  </span>
                  <div>
                    <div className="font-bold">{c.short_code}</div>
                    <div className="text-xs text-muted-foreground">{(c.member_count ?? 0).toLocaleString()} members</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <CategoryPills active={cat} onChange={setCat} />

        {postsLoading ? <FeedSkeleton /> : filtered.length === 0 ? (
          <EmptyState
            icon={SearchX}
            heading="No results found"
            subtext="Try a different keyword or browse by category."
          />
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {filtered.map((p) => <PostCard key={p.id} post={p} />)}
          </div>
        )}
      </div>
    </AppShell>
  );
};

export default Explore;
