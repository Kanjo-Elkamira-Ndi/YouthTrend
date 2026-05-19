import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Pin, Eye, EyeOff, MessageCircle, Hand } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, unwrapPaginated } from "@/lib/api";
import type { Post } from "@/types/post";
import { InlineError } from "@/components/common/InlineError";
import { FeedSkeleton } from "@/components/common/Skeletons";
import { toast } from "sonner";

const StatusBadge = ({ status }: { status: string }) => {
  const map: Record<string, string> = {
    published: "bg-primary/15 text-primary border-primary/20",
    draft: "bg-muted text-muted-foreground border-border",
    taken_down: "bg-red-500/10 text-red-500 border-red-500/20",
    pinned: "bg-primary/15 text-primary border-primary/20",
  };
  return <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${map[status] ?? ""}`}>{status}</span>;
};

const CampusAdminContent = () => {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("recent");
  const queryClient = useQueryClient();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['moderation', 'campus', 'posts', search, sort],
    queryFn: () => {
      const params = new URLSearchParams({ perPage: '50', sort });
      if (search) params.set('search', search);
      return api.get('/moderation/campus/posts?' + params.toString()).then(unwrapPaginated<Post>);
    },
  });

  const pinPost = useMutation({
    mutationFn: ({ id, pinned }: { id: string; pinned: boolean }) =>
      api.patch('/moderation/campus/posts/' + id + '/pin', { pinned }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['moderation', 'campus', 'posts'] });
      toast.success('Post pin status updated.');
    },
    onError: () => toast.error('Failed to update pin.'),
  });

  const takedownPost = useMutation({
    mutationFn: (id: string) =>
      api.patch('/moderation/campus/posts/' + id + '/takedown'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['moderation', 'campus', 'posts'] });
      toast.success('Post taken down.');
    },
    onError: () => toast.error('Failed to take down post.'),
  });

  const posts = data?.data ?? [];
  const pinnedCount = posts.filter((p) => p.is_pinned).length;

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="p-4 lg:p-8 max-w-[1400px] mx-auto w-full space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-extrabold">Posts</h2>
          <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-primary/10 text-primary border border-primary/20">{posts.length}</span>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search posts..." className="pl-8 w-full sm:w-56" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="w-full sm:w-44"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Newest</SelectItem>
              <SelectItem value="claps">Most Claps</SelectItem>
              <SelectItem value="comments">Most Comments</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {pinnedCount > 0 && (
        <div className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 flex items-center gap-3 text-sm">
          <Pin className="h-4 w-4 text-primary" />
          <span><strong>{pinnedCount} posts</strong> pinned to campus feed</span>
        </div>
      )}

      {isLoading ? (
        <FeedSkeleton />
      ) : isError ? (
        <InlineError message="Couldn't load posts." onRetry={refetch} />
      ) : (
        <div className="yt-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-secondary/40">
                <tr className="text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="text-left font-semibold px-5 py-3">Title</th>
                  <th className="text-left font-semibold px-2 py-3">Author</th>
                  <th className="text-left font-semibold px-2 py-3">Category</th>
                  <th className="text-left font-semibold px-2 py-3">Stats</th>
                  <th className="text-left font-semibold px-2 py-3">Status</th>
                  <th className="text-left font-semibold px-2 py-3">Date</th>
                  <th className="text-right font-semibold px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {posts.map((p, i) => (
                  <tr key={p.id} className={i % 2 === 1 ? "bg-muted/30" : ""}>
                    <td className="px-5 py-3 max-w-[280px]">
                      <div className="font-semibold truncate">{p.title}</div>
                      <div className="text-xs text-muted-foreground line-clamp-2">{p.subtitle}</div>
                    </td>
                    <td className="px-2 py-3">
                      <div className="flex items-center gap-2">
                        <img src={p.author_avatar_url ?? ''} alt="" className="h-7 w-7 rounded-full" />
                        <span className="text-xs font-medium truncate max-w-[110px]">{p.author_name}</span>
                      </div>
                    </td>
                    <td className="px-2 py-3"><Badge variant="secondary">{p.category}</Badge></td>
                    <td className="px-2 py-3">
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1"><Hand className="h-3.5 w-3.5" />{p.clap_count}</span>
                        <span className="inline-flex items-center gap-1"><MessageCircle className="h-3.5 w-3.5" />{p.comment_count}</span>
                      </div>
                    </td>
                    <td className="px-2 py-3"><StatusBadge status={p.status} /></td>
                    <td className="px-2 py-3 text-xs text-muted-foreground">{p.published_at ? new Date(p.published_at).toLocaleDateString() : '-'}</td>
                    <td className="px-5 py-3 text-right">
                      <div className="inline-flex items-center gap-0.5">
                        <button
                          title={p.is_pinned ? "Unpin" : "Pin"}
                          className={`h-8 w-8 inline-flex items-center justify-center rounded-md hover:bg-secondary ${p.is_pinned ? "text-primary" : ""}`}
                          onClick={() => pinPost.mutate({ id: p.id, pinned: !p.is_pinned })}
                        >
                          <Pin className={`h-4 w-4 ${p.is_pinned ? "fill-current" : ""}`} />
                        </button>
                        <a href={`/post/${p.campus_slug}/${p.slug}`} target="_blank" rel="noreferrer" title="View" className="h-8 w-8 inline-flex items-center justify-center rounded-md hover:bg-secondary">
                          <Eye className="h-4 w-4" />
                        </a>
                        <button
                          title="Take down"
                          className="h-8 w-8 inline-flex items-center justify-center rounded-md hover:bg-secondary"
                          onClick={() => takedownPost.mutate(p.id)}
                        >
                          <EyeOff className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default CampusAdminContent;
