import { AppShell } from "@/components/layout/AppShell";
import { PostCard } from "@/components/feed/PostCard";
import { EmptyState } from "@/components/common/EmptyState";
import { Bookmark } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api, unwrapPaginated } from "@/lib/api";
import { FeedSkeleton } from "@/components/common/Skeletons";
import { InlineError } from "@/components/common/InlineError";
import type { Post } from "@/types/post";

const Bookmarks = () => {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['bookmarks'],
    queryFn: () => api.get('/posts/bookmarks').then(unwrapPaginated<Post>),
  });

  const items = data?.data ?? [];

  return (
    <AppShell>
      <h1 className="text-3xl font-extrabold mb-6">Your Bookmarks</h1>

      {isLoading ? (
        <FeedSkeleton />
      ) : isError ? (
        <InlineError message="Failed to load bookmarks." onRetry={refetch} />
      ) : items.length === 0 ? (
        <EmptyState
          icon={Bookmark}
          heading="No bookmarks yet"
          subtext="Save posts you want to read later by clicking the bookmark icon on any post."
          action={{ label: "Browse Feed", href: "/feed" }}
        />
      ) : (
        <div className="space-y-4">
          {items.map((p) => <PostCard key={p.id} post={p} />)}
        </div>
      )}
    </AppShell>
  );
};

export default Bookmarks;
