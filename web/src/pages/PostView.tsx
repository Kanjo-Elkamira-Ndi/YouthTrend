import { AppShell } from "@/components/layout/AppShell";
import { useParams, Link } from "react-router-dom";
import { AuthorBadge } from "@/components/common/AuthorBadge";
import { Button } from "@/components/ui/button";
import { Bookmark, MessageCircle, Share2, MoreHorizontal, PartyPopper, ThumbsUp, MessageSquare, Pencil, Trash2, X, Check } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CATEGORIES } from "@/lib/constants";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, unwrap } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import type { Post } from "@/types/post";
import type { Comment } from "@/types/comment";
import { FeedSkeleton } from "@/components/common/Skeletons";
import { InlineError } from "@/components/common/InlineError";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const PostView = () => {
  const { campusSlug, postSlug } = useParams<{ campusSlug: string; postSlug: string }>();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: post, isLoading, isError, refetch } = useQuery({
    queryKey: ['post', campusSlug, postSlug],
    queryFn: () => api.get('/posts/' + campusSlug + '/' + postSlug).then(unwrap<Post>),
    enabled: !!campusSlug && !!postSlug,
  });

  const { data: commentsData, isLoading: commentsLoading } = useQuery({
    queryKey: ['comments', post?.id],
    queryFn: () => api.get('/posts/' + post!.id + '/comments').then(unwrap<{ data: Comment[] }>),
    enabled: !!post?.id,
  });

  const [claps, setClaps] = useState(0);
  const [bursts, setBursts] = useState<number[]>([]);
  const [commentBody, setCommentBody] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyBody, setReplyBody] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editBody, setEditBody] = useState("");

  useEffect(() => {
    if (post) setClaps(post.clap_count);
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

  const addComment = useMutation({
    mutationFn: (body: string) =>
      api.post('/posts/' + post!.id + '/comments', { body }).then(unwrap),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', post!.id] });
      setCommentBody('');
      toast.success('Comment posted.');
    },
    onError: () => toast.error('Failed to post comment.'),
  });

  const addReply = useMutation({
    mutationFn: ({ body, parentId }: { body: string; parentId: string }) =>
      api.post('/posts/' + post!.id + '/comments', { body, parentId }).then(unwrap),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', post!.id] });
      setReplyBody('');
      setReplyTo(null);
      toast.success('Reply posted.');
    },
    onError: () => toast.error('Failed to post reply.'),
  });

  const editComment = useMutation({
    mutationFn: ({ commentId, body }: { commentId: string; body: string }) =>
      api.patch('/comments/' + commentId, { body }).then(unwrap),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', post!.id] });
      setEditingId(null);
      toast.success('Comment updated.');
    },
    onError: () => toast.error('Failed to edit comment.'),
  });

  const deleteComment = useMutation({
    mutationFn: (commentId: string) => api.delete('/comments/' + commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', post!.id] });
      toast.success('Comment deleted.');
    },
    onError: () => toast.error('Failed to delete comment.'),
  });

  const comments = commentsData?.data ?? [];

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

          {user && (
            <div className="flex gap-3 mb-8">
              <img src={user.avatar_url ?? ''} className="h-10 w-10 rounded-full" alt="" />
              <div className="flex-1 space-y-2">
                <Textarea
                  placeholder="Add to the discussion..."
                  className="bg-card resize-none"
                  rows={3}
                  value={commentBody}
                  onChange={(e) => setCommentBody(e.target.value)}
                />
                <div className="flex justify-end gap-2">
                  <Button size="sm" variant="ghost" onClick={() => setCommentBody('')}>Cancel</Button>
                  <Button size="sm" className="bg-primary hover:bg-primary/90" disabled={!commentBody.trim() || addComment.isPending} onClick={() => addComment.mutate(commentBody)}>
                    {addComment.isPending ? 'Posting...' : 'Comment'}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {commentsLoading ? (
            <FeedSkeleton />
          ) : comments.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">No comments yet. Be the first to share your thoughts!</p>
          ) : (
            <div className="space-y-6">
              {comments.map((comment) => (
                <CommentThread
                  key={comment.id}
                  comment={comment}
                  postId={post.id}
                  user={user}
                  replyTo={replyTo}
                  replyBody={replyBody}
                  editingId={editingId}
                  editBody={editBody}
                  onReplyToggle={(id) => { setReplyTo(replyTo === id ? null : id); setReplyBody(''); }}
                  onReplyBodyChange={setReplyBody}
                  onReplySubmit={() => replyTo && addReply.mutate({ body: replyBody, parentId: replyTo })}
                  onEditToggle={(id, body) => { setEditingId(editingId === id ? null : id); setEditBody(body); }}
                  onEditBodyChange={setEditBody}
                  onEditSubmit={() => editingId && editComment.mutate({ commentId: editingId, body: editBody })}
                  onDelete={(id) => deleteComment.mutate(id)}
                  isReplyPending={addReply.isPending}
                  isEditPending={editComment.isPending}
                />
              ))}
            </div>
          )}
        </section>
      </article>
    </AppShell>
  );
};

const CommentThread = ({
  comment,
  postId,
  user,
  replyTo,
  replyBody,
  editingId,
  editBody,
  onReplyToggle,
  onReplyBodyChange,
  onReplySubmit,
  onEditToggle,
  onEditBodyChange,
  onEditSubmit,
  onDelete,
  isReplyPending,
  isEditPending,
}: {
  comment: Comment;
  postId: string;
  user: { id: string; avatar_url: string | null } | null;
  replyTo: string | null;
  replyBody: string;
  editingId: string | null;
  editBody: string;
  onReplyToggle: (id: string) => void;
  onReplyBodyChange: (v: string) => void;
  onReplySubmit: () => void;
  onEditToggle: (id: string, body: string) => void;
  onEditBodyChange: (v: string) => void;
  onEditSubmit: () => void;
  onDelete: (id: string) => void;
  isReplyPending: boolean;
  isEditPending: boolean;
}) => {
  const isOwn = user?.id === comment.author_id;
  const isEditing = editingId === comment.id;

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <img src={comment.author_avatar_url ?? ''} className="h-9 w-9 rounded-full shrink-0" alt={comment.author_name ?? ''} />
        <div className="flex-1 yt-card p-3 bg-secondary/50">
          <div className="flex items-center gap-2 mb-1">
            <Link to={`/profile/${comment.author_username}`} className="text-sm font-semibold hover:underline">
              {comment.author_name}
            </Link>
            <span className="text-[10px] text-muted-foreground">{new Date(comment.created_at).toLocaleDateString()}</span>
          </div>

          {isEditing ? (
            <div className="space-y-2">
              <Input value={editBody} onChange={(e) => onEditBodyChange(e.target.value)} className="text-sm" />
              <div className="flex gap-2">
                <Button size="sm" variant="ghost" onClick={() => onEditToggle(comment.id, comment.body)}><X className="h-3 w-3 mr-1" /> Cancel</Button>
                <Button size="sm" onClick={onEditSubmit} disabled={isEditPending}><Check className="h-3 w-3 mr-1" /> Save</Button>
              </div>
            </div>
          ) : (
            <p className="text-sm">{comment.body}</p>
          )}

          <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
            {user && !comment.parent_id && (
              <button className="inline-flex items-center gap-1 hover:text-primary" onClick={() => onReplyToggle(comment.id)}>
                <MessageSquare className="h-3.5 w-3.5" /> Reply
              </button>
            )}
            {isOwn && !isEditing && (
              <>
                <button className="inline-flex items-center gap-1 hover:text-primary" onClick={() => onEditToggle(comment.id, comment.body)}>
                  <Pencil className="h-3.5 w-3.5" /> Edit
                </button>
                <button className="inline-flex items-center gap-1 hover:text-red-500" onClick={() => onDelete(comment.id)}>
                  <Trash2 className="h-3.5 w-3.5" /> Delete
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {replyTo === comment.id && (
        <div className="ml-12 flex gap-3 mb-2">
          <div className="flex-1 space-y-2">
            <Textarea
              placeholder="Write a reply..."
              className="bg-card resize-none text-sm"
              rows={2}
              value={replyBody}
              onChange={(e) => onReplyBodyChange(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <Button size="sm" variant="ghost" onClick={() => onReplyToggle(comment.id)}>Cancel</Button>
              <Button size="sm" disabled={!replyBody.trim() || isReplyPending} onClick={onReplySubmit}>
                {isReplyPending ? 'Posting...' : 'Reply'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {comment.replies?.map((reply) => (
        <div key={reply.id} className="ml-12 space-y-4">
          <div className="flex gap-3">
            <img src={reply.author_avatar_url ?? ''} className="h-8 w-8 rounded-full shrink-0" alt={reply.author_name ?? ''} />
            <div className="flex-1 yt-card p-3 bg-secondary/50">
              <div className="flex items-center gap-2 mb-1">
                <Link to={`/profile/${reply.author_username}`} className="text-sm font-semibold hover:underline">
                  {reply.author_name}
                </Link>
                <span className="text-[10px] text-muted-foreground">{new Date(reply.created_at).toLocaleDateString()}</span>
              </div>
              {editingId === reply.id ? (
                <div className="space-y-2">
                  <Input value={editBody} onChange={(e) => onEditBodyChange(e.target.value)} className="text-sm" />
                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost" onClick={() => onEditToggle(reply.id, reply.body)}><X className="h-3 w-3 mr-1" /> Cancel</Button>
                    <Button size="sm" onClick={onEditSubmit} disabled={isEditPending}><Check className="h-3 w-3 mr-1" /> Save</Button>
                  </div>
                </div>
              ) : (
                <p className="text-sm">{reply.body}</p>
              )}
              <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                {(user?.id === reply.author_id) && !isEditing && (
                  <>
                    <button className="inline-flex items-center gap-1 hover:text-primary" onClick={() => onEditToggle(reply.id, reply.body)}>
                      <Pencil className="h-3.5 w-3.5" /> Edit
                    </button>
                    <button className="inline-flex items-center gap-1 hover:text-red-500" onClick={() => onDelete(reply.id)}>
                      <Trash2 className="h-3.5 w-3.5" /> Delete
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

const ActionBtn = ({ icon, label, onClick }: { icon: React.ReactNode; label?: number | string; onClick?: () => void }) => (
  <button onClick={onClick} className="h-11 w-11 rounded-full border border-border bg-card hover:bg-secondary flex flex-col items-center justify-center text-xs">
    <span>{icon}</span>
    {label !== undefined && <span className="text-[9px] text-muted-foreground">{typeof label === "number" && label >= 1000 ? (label / 1000).toFixed(1) + "k" : label}</span>}
  </button>
);

export default PostView;
