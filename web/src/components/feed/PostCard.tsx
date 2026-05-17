import type { Post } from "@/types/post";
import { AuthorBadge } from "@/components/common/AuthorBadge";
import { Bookmark, MessageCircle, MoreHorizontal, Flame, Newspaper, Trophy, GraduationCap, Calendar, Theater, MessageSquare, ThumbsUp } from "lucide-react";
import { Link } from "react-router-dom";
import { CATEGORIES } from "@/lib/constants";
import { motion } from "framer-motion";
import { useState } from "react";
import { cn } from "@/lib/utils";

type Props = { post: Post; variant?: "compact" | "featured" };

const getCategoryIcon = (name: string) => {
  switch (name) {
    case "Gist": return Flame;
    case "News": return Newspaper;
    case "Sports": return Trophy;
    case "Academics": return GraduationCap;
    case "Events": return Calendar;
    case "Culture": return Theater;
    case "Opinion": return MessageSquare;
    default: return Flame;
  }
};

const BookmarkBtn = ({ post, className }: { post: Post; className?: string }) => {
  const [on, setOn] = useState(post.has_bookmarked);
  return (
    <motion.button
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOn((v) => !v); }}
      whileTap={{ scale: 0.8 }}
      animate={on ? { scale: [1, 1.25, 1] } : { scale: 1 }}
      transition={{ duration: 0.3 }}
      className={cn("hover:text-primary transition-colors", on && "text-primary", className)}
      aria-label={on ? "Remove bookmark" : "Bookmark"}
    >
      <Bookmark className={cn("h-4 w-4", on && "fill-primary")} />
    </motion.button>
  );
};

const ProgressBar = () => (
  <div className="h-0.5 w-full bg-border rounded-full overflow-hidden mt-3">
    <motion.div
      className="h-full bg-primary"
      initial={{ width: 0 }}
      whileInView={{ width: "100%" }}
      viewport={{ once: true, amount: 0.6 }}
      transition={{ duration: 1.4, ease: "easeOut" }}
    />
  </div>
);

const excerptFromBody = (body: string, max = 120) => {
  const stripped = body.replace(/[*#>`\n]+/g, ' ').replace(/\s+/g, ' ').trim();
  return stripped.length > max ? stripped.slice(0, max) + '…' : stripped;
};

const fmtCount = (n: number) => {
  if (n >= 1000) return (n / 1000).toFixed(1) + "k";
  return String(n);
};

export const PostCard = ({ post, variant = "compact" }: Props) => {
  const cat = CATEGORIES.find((c) => c.name === post.category);
  const CategoryIcon = getCategoryIcon(cat?.name || "");
  const authorUser = post.author_name ? {
    id: '',
    username: post.author_username ?? '',
    name: post.author_name,
    avatar: post.author_avatar_url ?? '',
    campus: post.campus_short_code ?? '',
  } : null;

  if (variant === "featured") {
    return (
      <motion.article
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -2 }}
        transition={{ duration: 0.4 }}
        className="yt-card yt-card-hover overflow-hidden group"
      >
        <Link to={`/post/${post.campus_slug}/${post.slug}`} className="block">
          <div className="aspect-[16/8] overflow-hidden bg-muted">
            <img src={post.cover_url ?? ''} alt={post.title} className="h-full w-full object-cover group-hover:scale-[1.03] transition-transform duration-500" />
          </div>
        </Link>
        <div className="p-5 space-y-3">
          <div className="flex items-center gap-2 text-xs">
            <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary font-semibold">
              <CategoryIcon className="h-4 w-4 inline" /> {post.category}
            </span>
            <span className="text-muted-foreground">{post.published_at ? new Date(post.published_at).toLocaleDateString() : ''}</span>
          </div>
          <Link to={`/post/${post.campus_slug}/${post.slug}`}>
            <h3 className="text-xl font-bold leading-snug hover:text-primary transition-colors">{post.title}</h3>
          </Link>
          <p className="text-sm text-muted-foreground line-clamp-2">{excerptFromBody(post.body)}</p>
          <div className="flex items-center justify-between pt-2">
            {authorUser && <AuthorBadge user={authorUser} sub={post.published_at ? new Date(post.published_at).toLocaleDateString() : undefined} />}
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1"><ThumbsUp className="h-3.5 w-3.5" />{fmtCount(post.clap_count)}</span>
              <span className="inline-flex items-center gap-1"><MessageCircle className="h-3.5 w-3.5" />{post.comment_count}</span>
              <BookmarkBtn post={post} />
            </div>
          </div>
          <ProgressBar />
        </div>
      </motion.article>
    );
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.35 }}
      className="yt-card yt-card-hover p-4 sm:p-5 group"
    >
      <div className="flex items-center justify-between mb-3">
        {authorUser && <AuthorBadge user={authorUser} sub={post.published_at ? new Date(post.published_at).toLocaleDateString() : undefined} />}
        <button className="text-muted-foreground hover:text-foreground"><MoreHorizontal className="h-4 w-4" /></button>
      </div>
      <div className="flex gap-4">
        <div className="flex-1 min-w-0 space-y-2">
          <Link to={`/post/${post.campus_slug}/${post.slug}`}>
            <h3 className="text-lg sm:text-xl font-bold leading-snug hover:text-primary transition-colors line-clamp-2">
              {post.title}
            </h3>
          </Link>
          <p className="text-sm text-muted-foreground line-clamp-2">{post.subtitle || excerptFromBody(post.body)}</p>
          <div className="flex items-center gap-3 text-xs pt-1">
            <span className="px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground font-semibold">
              <CategoryIcon className="h-4 w-4 inline" /> {post.category}
            </span>
            <span className="text-muted-foreground">{post.published_at ? new Date(post.published_at).toLocaleDateString() : ''}</span>
          </div>
        </div>
        <Link to={`/post/${post.campus_slug}/${post.slug}`} className="shrink-0">
          <div className="w-28 h-28 sm:w-36 sm:h-28 rounded-lg overflow-hidden bg-muted">
            <img src={post.cover_url ?? ''} alt={post.title} className="h-full w-full object-cover group-hover:scale-[1.04] transition-transform duration-500" />
          </div>
        </Link>
      </div>
      <div className="flex items-center gap-4 pt-3 mt-3 border-t border-border text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1"><ThumbsUp className="h-3.5 w-3.5" />{fmtCount(post.clap_count)}</span>
        <span className="inline-flex items-center gap-1"><MessageCircle className="h-3.5 w-3.5" />{post.comment_count}</span>
        <BookmarkBtn post={post} className="ml-auto" />
      </div>
    </motion.article>
  );
};
