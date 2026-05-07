import { AppShell } from "@/components/layout/AppShell";
import { CategoryPills } from "@/components/feed/CategoryPills";
import { PostCard } from "@/components/feed/PostCard";
import { posts } from "@/mock";
import { useEffect, useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { EmptyState } from "@/components/common/EmptyState";
import { InlineError } from "@/components/common/InlineError";
import { FeedSkeleton } from "@/components/common/Skeletons";
import { OnboardingModal } from "@/components/common/OnboardingModal";
import { Users } from "lucide-react";

const Feed = () => {
  const [tab, setTab] = useState("for-you");
  const [cat, setCat] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(t);
  }, []);

  const filtered = cat === "All" ? posts : posts.filter((p) => p.category === cat);

  return (
    <AppShell>
      <OnboardingModal />
      <div className="space-y-5">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="w-full justify-start bg-transparent border-b border-border rounded-none p-0 h-auto">
            {[["for-you", "For You"], ["following", "Following"], ["campus", "Campus"], ["new", "New"]].map(([v, l]) => (
              <TabsTrigger key={v} value={v}
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-transparent shadow-none px-4 pb-3">
                {l}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <CategoryPills active={cat} onChange={setCat} />

        {error && <InlineError message="Couldn't refresh your feed." onRetry={() => setError(false)} />}

        {loading ? (
          <FeedSkeleton />
        ) : tab === "following" ? (
          <EmptyState
            icon={Users}
            heading="No one to follow yet"
            subtext="Follow writers you like to see their posts here."
            action={{ label: "Explore Writers", href: "/explore" }}
          />
        ) : (
          <motion.div
            className="space-y-4"
            initial="hidden"
            animate="show"
            variants={{ show: { transition: { staggerChildren: 0.06 } } }}
          >
            {filtered.map((p, i) => (
              <motion.div key={p.id} variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}>
                {i === 0 ? <PostCard post={p} variant="featured" /> : <PostCard post={p} />}
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </AppShell>
  );
};

export default Feed;
