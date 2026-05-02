import { AppShell } from "@/components/layout/AppShell";
import { CategoryPills } from "@/components/feed/CategoryPills";
import { PostCard } from "@/components/feed/PostCard";
import { posts } from "@/mock";
import { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

const Feed = () => {
  const [tab, setTab] = useState("for-you");
  const [cat, setCat] = useState("All");
  const filtered = cat === "All" ? posts : posts.filter((p) => p.category === cat);

  return (
    <AppShell>
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

        <div className="space-y-4 pt-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="yt-card p-5 space-y-3">
              <div className="flex items-center gap-2"><Skeleton className="h-9 w-9 rounded-full" /><Skeleton className="h-3 w-32" /></div>
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
};

export default Feed;
