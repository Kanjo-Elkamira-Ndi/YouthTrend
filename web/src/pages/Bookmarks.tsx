import { AppShell } from "@/components/layout/AppShell";
import { PostCard } from "@/components/feed/PostCard";
import { posts } from "@/mock";

const Bookmarks = () => (
  <AppShell>
    <h1 className="text-3xl font-extrabold mb-6">Your Bookmarks</h1>
    <div className="space-y-4">
      {posts.slice(0, 4).map((p) => <PostCard key={p.id} post={p} />)}
    </div>
  </AppShell>
);

export default Bookmarks;
