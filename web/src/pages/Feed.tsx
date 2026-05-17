import { AppShell } from "@/components/layout/AppShell";
import { CategoryPills } from "@/components/feed/CategoryPills";
import { PostCard } from "@/components/feed/PostCard";
import { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { EmptyState } from "@/components/common/EmptyState";
import { InlineError } from "@/components/common/InlineError";
import { FeedSkeleton } from "@/components/common/Skeletons";
import { OnboardingModal } from "@/components/common/OnboardingModal";
import { Users, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api, unwrapPaginated } from "@/lib/api";
import type { Post } from "@/types/post";
import { useEffect } from "react";

type TabKey = "campus" | "following" | "trending";

const Feed = () => {
  const [tab, setTab] = useState<TabKey>("campus");
  const [cat, setCat] = useState("All");
  const [campusPage, setCampusPage] = useState(1);
  const [followingPage, setFollowingPage] = useState(1);
  const [trendingPage, setTrendingPage] = useState(1);
  const [allCampusPosts, setAllCampusPosts] = useState<Post[]>([]);
  const [allFollowingPosts, setAllFollowingPosts] = useState<Post[]>([]);
  const [allTrendingPosts, setAllTrendingPosts] = useState<Post[]>([]);

  const { data: campusData, isLoading: campusLoading, isError: campusError, refetch: refetchCampus } = useQuery({
    queryKey: ['feed', 'campus', 'recent', campusPage],
    queryFn: () => api.get('/posts', { params: { sort: 'recent', page: campusPage } }).then(unwrapPaginated<Post>),
  });

  const { data: followingData, isLoading: followingLoading, isError: followingError, refetch: refetchFollowing } = useQuery({
    queryKey: ['feed', 'following', followingPage],
    queryFn: () => api.get('/posts/following', { params: { page: followingPage } }).then(unwrapPaginated<Post>),
  });

  const { data: trendingData, isLoading: trendingLoading, isError: trendingError, refetch: refetchTrending } = useQuery({
    queryKey: ['feed', 'trending', trendingPage],
    queryFn: () => api.get('/posts/trending', { params: { page: trendingPage } }).then(unwrapPaginated<Post>),
  });

  useEffect(() => {
    if (campusData?.data) {
      setAllCampusPosts(prev => {
        if (campusPage === 1) return campusData.data;
        const existingIds = new Set(prev.map(p => p.id));
        const newPosts = campusData.data.filter(p => !existingIds.has(p.id));
        return [...prev, ...newPosts];
      });
    }
  }, [campusData, campusPage]);

  useEffect(() => {
    if (followingData?.data) {
      setAllFollowingPosts(prev => {
        if (followingPage === 1) return followingData.data;
        const existingIds = new Set(prev.map(p => p.id));
        const newPosts = followingData.data.filter(p => !existingIds.has(p.id));
        return [...prev, ...newPosts];
      });
    }
  }, [followingData, followingPage]);

  useEffect(() => {
    if (trendingData?.data) {
      setAllTrendingPosts(prev => {
        if (trendingPage === 1) return trendingData.data;
        const existingIds = new Set(prev.map(p => p.id));
        const newPosts = trendingData.data.filter(p => !existingIds.has(p.id));
        return [...prev, ...newPosts];
      });
    }
  }, [trendingData, trendingPage]);

  const handleTabChange = (v: string) => {
    setTab(v as TabKey);
  };

  const filtered = cat === "All"
    ? allCampusPosts
    : allCampusPosts.filter((p) => p.category === cat);

  const campusMeta = campusData?.meta;
  const followingMeta = followingData?.meta;
  const trendingMeta = trendingData?.meta;

  const loadMore = () => {
    switch (tab) {
      case "campus":
        if (campusMeta?.hasNext) setCampusPage(p => p + 1);
        break;
      case "following":
        if (followingMeta?.hasNext) setFollowingPage(p => p + 1);
        break;
      case "trending":
        if (trendingMeta?.hasNext) setTrendingPage(p => p + 1);
        break;
    }
  };

  const loading = campusLoading || followingLoading || trendingLoading;
  const error = campusError || followingError || trendingError;
  const refetch = () => { refetchCampus(); refetchFollowing(); refetchTrending(); };

  const currentPosts = tab === "campus" ? filtered : tab === "following" ? allFollowingPosts : allTrendingPosts;
  const currentMeta = tab === "campus" ? campusMeta : tab === "following" ? followingMeta : trendingMeta;

  return (
    <AppShell>
      <OnboardingModal />
      <div className="space-y-5">
        <Tabs value={tab} onValueChange={(v) => {
          handleTabChange(v);
          // Reset page state per tab
          if (v === 'campus' && allCampusPosts.length === 0) setCampusPage(1);
          if (v === 'following' && allFollowingPosts.length === 0) setFollowingPage(1);
          if (v === 'trending' && allTrendingPosts.length === 0) setTrendingPage(1);
        }}>
          <TabsList className="w-full justify-start bg-transparent border-b border-border rounded-none p-0 h-auto">
            {[["campus", "Campus"], ["following", "Following"], ["trending", "Trending"]].map(([v, l]) => (
              <TabsTrigger key={v} value={v}
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-transparent shadow-none px-4 pb-3">
                {l}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {tab === "campus" && <CategoryPills active={cat} onChange={setCat} />}

        {error && <InlineError message="Couldn't refresh your feed." onRetry={refetch} />}

        {loading && currentPosts.length === 0 ? (
          <FeedSkeleton />
        ) : tab === "following" && currentPosts.length === 0 && !followingLoading ? (
          <EmptyState
            icon={Users}
            heading="No one to follow yet"
            subtext="Follow writers you like to see their posts here."
            action={{ label: "Explore Writers", href: "/explore" }}
          />
        ) : (
          <>
            <motion.div
              className="space-y-4"
              initial="hidden"
              animate="show"
              variants={{ show: { transition: { staggerChildren: 0.06 } } }}
            >
              {currentPosts.map((p, i) => (
                <motion.div key={p.id} variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}>
                  {tab !== "campus" && i === 0 ? <PostCard post={p} variant="featured" /> : <PostCard post={p} />}
                </motion.div>
              ))}
            </motion.div>

            {currentMeta?.hasNext && (
              <div className="flex justify-center pt-4">
                <button
                  onClick={loadMore}
                  className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                >
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Load more
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </AppShell>
  );
};

export default Feed;
