import { AppShell } from "@/components/layout/AppShell";
import { PostCard } from "@/components/feed/PostCard";
import { posts } from "@/mock";
import { useState } from "react";
import { EmptyState } from "@/components/common/EmptyState";
import { Bookmark } from "lucide-react";

const Bookmarks = () => {
  const [items] = useState(posts.slice(0, 4));
  return (
    <AppShell>
      <h1 className="text-3xl font-extrabold mb-6">Your Bookmarks</h1>
      {items.length === 0 ? (
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
