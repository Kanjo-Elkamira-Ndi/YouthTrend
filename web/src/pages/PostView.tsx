import { AppShell } from "@/components/layout/AppShell";
import { useParams, Link } from "react-router-dom";
import { AuthorBadge } from "@/components/common/AuthorBadge";
import { Button } from "@/components/ui/button";
import { Bookmark, MessageCircle, Share2, MoreHorizontal, PartyPopper, ThumbsUp, MessageSquare } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PostCard } from "@/components/feed/PostCard";
import { CATEGORIES } from "@/lib/constants";
import { Textarea } from "@/components/ui/textarea";
import { useQuery } from "@tanstack/react-query";
import { api, unwrap } from "@/lib/api";
import type { Post } from "@/types/post";
import { FeedSkeleton } from "@/components/common/Skeletons";
import { InlineError } from "@/components/common/InlineError";

const PostView = () => {
  const { campusSlug, postSlug } = useParams<{ campusSlug: string; postSlug: string }>();

  const { data: post, isLoading, isError, refetch } = useQuery({
    queryKey: ['post', campusSlug, postSlug],
    queryFn: () => api.get('/posts/' + campusSlug + '/' + postSlug).then(unwrap<Post>),
    enabled: !!campusSlug && !!postSlug,
  });

  const [claps, setClaps] = useState(0);
  const [bursts, setBursts] = useState<number[]>([]);

  useEffect(() => {
    if (post) {
      setClaps(post.clap_count);
    }
  }, [post?.clap_count]);

  useEffect(() => {
    if (post?.id) {
      api.post('/analytics/posts/' + post.id + '/view').catch(() => {});
    }
  }, [post?.id]);

  const onClap = () => {
    setClaps((c) => c + 1);
    const id = Date.now();
    setBursts((b) => [...b, id]);
    setTimeout(() => setBursts((b) => b.filter((x) => x !== id)), 700);
  };

  if (isLoading) {
    return (
      <AppShell hideRight>
        <div className="max-w-3xl mx-auto"><FeedSkeleton /></div>
      </AppShell>
    );
  }

  if (isError || !post) {
    return (
      <AppShell hideRight>
        <div className="max-w-3xl mx-auto mt-12">
          <InlineError message="Couldn't load this post." onRetry={refetch} />
        </div>
      </AppShell>
    );
  }

  const cat = CATEGORIES.find((c) => c.name === post.category);
  const authorUser = post.author_name ? {
    id: '',
    username: post.author_username ?? '',
    name: post.author_name,
    avatar: post.author_avatar_url ?? '',
    campus: post.campus_short_code ?? '',
  } : null;

  return (
    <AppShell hideRight>
      <article className="max-w-3xl mx-auto relative">
        <div className="hidden xl:flex flex-col gap-3 absolute -left-20 top-32 sticky-actions">
          <ActionBtn icon={<PartyPopper className="h-4 w-4" />} label={claps} onClick={onClap} />
          <ActionBtn icon={<MessageCircle className="h-4 w-4" />} label={post.comment_count} />
          <ActionBtn icon={<Bookmark className="h-4 w-4" />} />
          <ActionBtn icon={<Share2 className="h-4 w-4" />} />
        </div>

        {post.cover_url && (
          <div className="rounded-2xl overflow-hidden bg-muted aspect-[16/8] mb-6">
            <img src={post.cover_url} alt={post.title} className="h-full w-full object-cover" />
          </div>
        )}

        <div className="flex items-center gap-2 mb-3">
          <span className="inline-flex items-center gap-2 text-xs font-bold px-2.5 py-1 rounded-full bg-primary/10 text-primary">
            {cat && <cat.icon className="h-4 w-4" />}
            {post.category}
          </span>
          <span className="text-xs text-muted-foreground">{post.published_at ? new Date(post.published_at).toLocaleDateString() : ''}</span>
        </div>

        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-[1.1]">{post.title}</h1>

        <div className="mt-6 flex items-center justify-between border-y border-border py-4">
          {authorUser && <AuthorBadge user={authorUser} sub={post.published_at ? new Date(post.published_at).toLocaleDateString() : undefined} />}
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline">Follow</Button>
            <button className="text-muted-foreground hover:text-foreground"><MoreHorizontal className="h-4 w-4" /></button>
          </div>
        </div>

        <div className="prose prose-neutral dark:prose-invert max-w-none mt-8 text-[17px] leading-[1.85]">
          {post.body.split("\n").map((line, i) => {
            const t = line.trim();
            if (!t) return null;
            if (t.startsWith("**") && t.endsWith("**")) return <h2 key={i} className="text-2xl font-bold mt-8 mb-3">{t.replace(/\*\*/g, "")}</h2>;
            if (t.startsWith(">")) return <blockquote key={i} className="border-l-4 border-primary pl-4 italic text-muted-foreground my-6">{t.slice(1).trim()}</blockquote>;
            if (/^\d+\./.test(t)) return <p key={i} className="my-2 pl-4">{t}</p>;
            return <p key={i} className="my-4 text-foreground/90">{t}</p>;
          })}
        </div>

        <div className="mt-12 flex flex-col items-center gap-3 py-8 border-y border-border">
          <button onClick={onClap} className="relative h-20 w-20 rounded-full bg-primary/10 hover:bg-primary/20 inline-flex items-center justify-center text-4xl active:scale-90 transition-transform">
            👏
            <AnimatePresence>
              {bursts.map((b) => (
                <motion.span key={b} initial={{ y: 0, opacity: 1, scale: 1 }} animate={{ y: -40, opacity: 0, scale: 1.4 }} transition={{ duration: 0.7 }} className="absolute text-2xl pointer-events-none">+1</motion.span>
              ))}
            </AnimatePresence>
          </button>
          <div className="text-sm text-muted-foreground"><span className="font-bold text-foreground">{claps.toLocaleString()}</span> claps</div>
        </div>

        <section className="mt-12">
          <h3 className="text-xl font-bold mb-4">Comments ({post.comment_count})</h3>
          <div className="flex gap-3 mb-6">
            <img src={post.author_avatar_url ?? ''} className="h-10 w-10 rounded-full" alt="" />
            <div className="flex-1 space-y-2">
              <Textarea placeholder="Add to the discussion..." className="bg-card resize-none" rows={3} />
              <div className="flex justify-end"><Button size="sm" className="bg-primary hover:bg-primary/90">Comment</Button></div>
            </div>
          </div>
        </section>
      </article>
    </AppShell>
  );
};

const ActionBtn = ({ icon, label, onClick }: { icon: React.ReactNode; label?: number | string; onClick?: () => void }) => (
  <button onClick={onClick} className="h-11 w-11 rounded-full border border-border bg-card hover:bg-secondary flex flex-col items-center justify-center text-xs">
    <span>{icon}</span>
    {label !== undefined && <span className="text-[9px] text-muted-foreground">{typeof label === "number" && label >= 1000 ? (label / 1000).toFixed(1) + "k" : label}</span>}
  </button>
);

export default PostView;
