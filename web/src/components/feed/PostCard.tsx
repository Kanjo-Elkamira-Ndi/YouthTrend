import { Post } from "@/types";
import { AuthorBadge } from "@/components/common/AuthorBadge";
import { Bookmark, MessageCircle, MoreHorizontal } from "lucide-react";
import { Link } from "react-router-dom";
import { CATEGORIES } from "@/lib/constants";
import { motion } from "framer-motion";

type Props = { post: Post; variant?: "compact" | "featured" };

export const PostCard = ({ post, variant = "compact" }: Props) => {
  const cat = CATEGORIES.find((c) => c.name === post.category);

  if (variant === "featured") {
    return (
      <motion.article
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="yt-card yt-card-hover overflow-hidden"
      >
        <Link to={`/post/${post.id}`} className="block">
          <div className="aspect-[16/8] overflow-hidden bg-muted">
            <img src={post.cover} alt={post.title} className="h-full w-full object-cover hover:scale-[1.03] transition-transform duration-500" />
          </div>
        </Link>
        <div className="p-5 space-y-3">
          <div className="flex items-center gap-2 text-xs">
            <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary font-semibold">
              {cat?.emoji} {post.category}
            </span>
            <span className="text-muted-foreground">{post.readMinutes} min read</span>
          </div>
          <Link to={`/post/${post.id}`}>
            <h3 className="text-xl font-bold leading-snug hover:text-primary transition-colors">{post.title}</h3>
          </Link>
          <p className="text-sm text-muted-foreground line-clamp-2">{post.excerpt}</p>
          <div className="flex items-center justify-between pt-2">
            <AuthorBadge user={post.author} sub={post.publishedAt} />
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span>👏 {fmt(post.claps)}</span>
              <span className="inline-flex items-center gap-1"><MessageCircle className="h-3.5 w-3.5" />{post.comments}</span>
              <button className="hover:text-primary"><Bookmark className="h-4 w-4" /></button>
            </div>
          </div>
        </div>
      </motion.article>
    );
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="yt-card yt-card-hover p-4 sm:p-5"
    >
      <div className="flex items-center justify-between mb-3">
        <AuthorBadge user={post.author} sub={post.publishedAt} />
        <button className="text-muted-foreground hover:text-foreground"><MoreHorizontal className="h-4 w-4" /></button>
      </div>
      <div className="flex gap-4">
        <div className="flex-1 min-w-0 space-y-2">
          <Link to={`/post/${post.id}`}>
            <h3 className="text-lg sm:text-xl font-bold leading-snug hover:text-primary transition-colors line-clamp-2">
              {post.title}
            </h3>
          </Link>
          <p className="text-sm text-muted-foreground line-clamp-2">{post.excerpt}</p>
          <div className="flex items-center gap-3 text-xs pt-1">
            <span className="px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground font-semibold">
              {cat?.emoji} {post.category}
            </span>
            <span className="text-muted-foreground">{post.readMinutes} min read</span>
          </div>
        </div>
        <Link to={`/post/${post.id}`} className="shrink-0">
          <div className="w-28 h-28 sm:w-36 sm:h-28 rounded-lg overflow-hidden bg-muted">
            <img src={post.cover} alt={post.title} className="h-full w-full object-cover" />
          </div>
        </Link>
      </div>
      <div className="flex items-center gap-4 pt-3 mt-3 border-t border-border text-xs text-muted-foreground">
        <span>👏 {fmt(post.claps)}</span>
        <span className="inline-flex items-center gap-1"><MessageCircle className="h-3.5 w-3.5" />{post.comments}</span>
        <button className="ml-auto hover:text-primary"><Bookmark className="h-4 w-4" /></button>
      </div>
    </motion.article>
  );
};

function fmt(n: number) {
  if (n >= 1000) return (n / 1000).toFixed(1) + "k";
  return String(n);
}
