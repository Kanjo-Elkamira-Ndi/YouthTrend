import { AppShell } from "@/components/layout/AppShell";
import { posts, comments } from "@/mock";
import { useParams, Link } from "react-router-dom";
import { AuthorBadge } from "@/components/common/AuthorBadge";
import { Button } from "@/components/ui/button";
import { Bookmark, MessageCircle, Share2, MoreHorizontal, PartyPopper, ThumbsUp, MessageSquare } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PostCard } from "@/components/feed/PostCard";
import { CATEGORIES } from "@/lib/constants";
import { Textarea } from "@/components/ui/textarea";

const PostView = () => {
  const { id } = useParams();
  const post = posts.find((p) => p.id === id) ?? posts[0];
  const cat = CATEGORIES.find((c) => c.name === post.category);
  const [claps, setClaps] = useState(post.claps);
  const [bursts, setBursts] = useState<number[]>([]);
  const related = posts.filter((p) => p.id !== post.id && p.campus === post.campus).slice(0, 3);

  const onClap = () => {
    setClaps((c) => c + 1);
    const id = Date.now();
    setBursts((b) => [...b, id]);
    setTimeout(() => setBursts((b) => b.filter((x) => x !== id)), 700);
  };

  return (
    <AppShell hideRight>
      <article className="max-w-3xl mx-auto relative">
        {/* Floating action bar */}
        <div className="hidden xl:flex flex-col gap-3 absolute -left-20 top-32 sticky-actions">
          <ActionBtn icon={<PartyPopper className="h-4 w-4" />} label={claps} onClick={onClap} />
          <ActionBtn icon={<MessageCircle className="h-4 w-4" />} label={post.comments} />
          <ActionBtn icon={<Bookmark className="h-4 w-4" />} />
          <ActionBtn icon={<Share2 className="h-4 w-4" />} />
        </div>

        <div className="rounded-2xl overflow-hidden bg-muted aspect-[16/8] mb-6">
          <img src={post.cover} alt={post.title} className="h-full w-full object-cover" />
        </div>

        <div className="flex items-center gap-2 mb-3">
          <span className="inline-flex items-center gap-2 text-xs font-bold px-2.5 py-1 rounded-full bg-primary/10 text-primary">
            {cat && <cat.icon className="h-4 w-4" />}
            {post.category}
          </span>
          <span className="text-xs text-muted-foreground">{post.readMinutes} min read · {post.publishedAt}</span>
        </div>

        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-[1.1]">{post.title}</h1>

        <div className="mt-6 flex items-center justify-between border-y border-border py-4">
          <AuthorBadge user={post.author} sub={`${post.author.department} · ${post.publishedAt}`} />
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline">Follow</Button>
            <button className="text-muted-foreground hover:text-foreground"><MoreHorizontal className="h-4 w-4" /></button>
          </div>
        </div>

        <div className="prose prose-neutral dark:prose-invert max-w-none mt-8 text-[17px] leading-[1.85]">
          {post.body?.split("\n").map((line, i) => {
            const t = line.trim();
            if (!t) return null;
            if (t.startsWith("**") && t.endsWith("**")) return <h2 key={i} className="text-2xl font-bold mt-8 mb-3">{t.replace(/\*\*/g, "")}</h2>;
            if (t.startsWith(">")) return <blockquote key={i} className="border-l-4 border-primary pl-4 italic text-muted-foreground my-6">{t.slice(1).trim()}</blockquote>;
            if (/^\d+\./.test(t)) return <p key={i} className="my-2 pl-4">{t}</p>;
            return <p key={i} className="my-4 text-foreground/90">{t}</p>;
          })}
        </div>

        {/* Big clap button */}
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

        {/* Comments */}
        <section className="mt-12">
          <h3 className="text-xl font-bold mb-4">Comments ({post.comments})</h3>
          <div className="flex gap-3 mb-6">
            <img src={post.author.avatar} className="h-10 w-10 rounded-full" alt="" />
            <div className="flex-1 space-y-2">
              <Textarea placeholder="Add to the discussion..." className="bg-card resize-none" rows={3} />
              <div className="flex justify-end"><Button size="sm" className="bg-primary hover:bg-primary/90">Comment</Button></div>
            </div>
          </div>

          <div className="space-y-5">
            {comments.map((c) => (
              <div key={c.id} className="space-y-3">
                <CommentRow c={c} />
                {c.replies?.map((r) => (
                  <div key={r.id} className="ml-12"><CommentRow c={r} /></div>
                ))}
              </div>
            ))}
          </div>
        </section>

        {/* Related */}
        <section className="mt-16">
          <h3 className="text-xl font-bold mb-4">More from {post.campus}</h3>
          <div className="grid md:grid-cols-3 gap-4">
            {related.map((p) => (
              <Link to={`/post/${p.id}`} key={p.id} className="yt-card yt-card-hover overflow-hidden">
                <div className="aspect-video bg-muted overflow-hidden"><img src={p.cover} className="h-full w-full object-cover" alt={p.title} /></div>
                <div className="p-4">
                  <h4 className="font-bold leading-snug line-clamp-2">{p.title}</h4>
                  <div className="mt-2 text-xs text-muted-foreground">{p.author.name} · {p.readMinutes} min</div>
                </div>
              </Link>
            ))}
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

const CommentRow = ({ c }: { c: typeof comments[0] }) => (
  <div className="flex gap-3">
    <img src={c.author.avatar} className="h-9 w-9 rounded-full shrink-0" alt={c.author.name} />
    <div className="flex-1 yt-card p-3 bg-secondary/50">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-sm font-semibold">{c.author.name}</span>
        <span className="text-[10px] text-muted-foreground">{c.time}</span>
      </div>
      <p className="text-sm">{c.text}</p>
      <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
        <button className="inline-flex items-center gap-1 hover:text-primary"><ThumbsUp className="h-3.5 w-3.5" />{c.likes}</button>
        <button className="inline-flex items-center gap-1 hover:text-primary"><MessageSquare className="h-3.5 w-3.5" />Reply</button>
        <button className="hover:text-foreground ml-auto"><MoreHorizontal className="h-3.5 w-3.5" /></button>
      </div>
    </div>
  </div>
);

export default PostView;