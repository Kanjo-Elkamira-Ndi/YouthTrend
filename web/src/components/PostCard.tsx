import { Link } from "@tanstack/react-router";
import { Bookmark, MessageCircle, MoreHorizontal } from "lucide-react";
import { motion } from "framer-motion";
import type { Post } from "@/lib/mock";
import { AuthorBadge } from "./AuthorBadge";

export function PostCard({ post, variant = "compact", index = 0 }: { post: Post; variant?: "compact" | "featured"; index?: number }) {
  const Wrap = motion.article;
  if (variant === "featured") {
    return (
      <Wrap
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: index * 0.04 }}
        className="card-hover overflow-hidden rounded-xl border border-border bg-card"
      >
        <Link to="/post/$id" params={{ id: post.id }} className="block">
          <div className="aspect-[16/9] overflow-hidden bg-muted">
            <img src={post.cover} alt={post.title} className="h-full w-full object-cover transition-transform duration-500 hover:scale-105" />
          </div>
          <div className="space-y-3 p-5">
            <div className="flex items-center gap-2 text-xs">
              <span className="rounded-full bg-brand-soft px-2.5 py-1 font-medium text-brand">{post.category}</span>
              <span className="text-muted-foreground">{post.readTime} min read</span>
            </div>
            <h3 className="text-xl font-bold leading-snug text-foreground">{post.title}</h3>
            <p className="line-clamp-2 text-sm text-muted-foreground">{post.excerpt}</p>
            <div className="flex items-center justify-between pt-2">
              <AuthorBadge author={post.author} time={post.publishedAt} />
              <PostMeta post={post} />
            </div>
          </div>
        </Link>
      </Wrap>
    );
  }

  return (
    <Wrap
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.03 }}
      className="card-hover rounded-xl border border-border bg-card p-4 sm:p-5"
    >
      <Link to="/post/$id" params={{ id: post.id }} className="grid grid-cols-[1fr_120px] gap-4 sm:grid-cols-[1fr_180px] sm:gap-6">
        <div className="min-w-0 space-y-2.5">
          <AuthorBadge author={post.author} time={post.publishedAt} size="sm" />
          <h3 className="line-clamp-2 text-base font-bold leading-snug text-foreground sm:text-lg">{post.title}</h3>
          <p className="line-clamp-2 text-sm text-muted-foreground">{post.excerpt}</p>
          <div className="flex items-center gap-3 pt-1 text-xs text-muted-foreground">
            <span className="rounded-full bg-muted px-2 py-0.5 font-medium text-foreground">{post.category}</span>
            <span>{post.readTime} min</span>
            <span className="ml-auto"><PostMeta post={post} /></span>
          </div>
        </div>
        <div className="aspect-[4/3] w-full overflow-hidden rounded-lg bg-muted">
          <img src={post.cover} alt={post.title} className="h-full w-full object-cover" />
        </div>
      </Link>
    </Wrap>
  );
}

function PostMeta({ post }: { post: Post }) {
  return (
    <div className="flex items-center gap-3 text-xs text-muted-foreground">
      <span className="inline-flex items-center gap-1">👏 {post.claps}</span>
      <span className="inline-flex items-center gap-1"><MessageCircle className="h-3.5 w-3.5" /> {post.comments}</span>
      <button className="hover:text-foreground" aria-label="bookmark"><Bookmark className="h-3.5 w-3.5" /></button>
      <button className="hover:text-foreground" aria-label="more"><MoreHorizontal className="h-3.5 w-3.5" /></button>
    </div>
  );
}
