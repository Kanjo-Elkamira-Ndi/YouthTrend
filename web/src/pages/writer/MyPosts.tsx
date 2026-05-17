import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { EmptyState } from "@/components/common/EmptyState";
import { Eye, PenSquare, Search, Trash2, FileText, Undo2 } from "lucide-react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, unwrapPaginated } from "@/lib/api";
import { FeedSkeleton } from "@/components/common/Skeletons";
import type { Post } from "@/types/post";

type Status = "published" | "draft" | "scheduled" | "taken_down";

const MyPosts = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Status>("published");
  const [q, setQ] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ['my-posts', tab],
    queryFn: () => api.get('/posts/me', { params: { status: tab } }).then(unwrapPaginated<Post>),
  });

  const deleteMutation = useMutation({
    mutationFn: (postId: string) => api.delete('/posts/' + postId),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['my-posts'] }); toast.success('Post deleted.'); },
    onError: () => toast.error('Failed to delete post.'),
  });

  const unpublishMutation = useMutation({
    mutationFn: (postId: string) => api.post('/posts/' + postId + '/unpublish'),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['my-posts'] }); toast.success('Post unpublished.'); },
    onError: () => toast.error('Failed to unpublish post.'),
  });

  const posts = (data?.data ?? []).filter((p) =>
    p.title.toLowerCase().includes(q.toLowerCase()),
  );

  const statusLabel: Record<Status, string> = {
    published: "Published",
    draft: "Drafts",
    scheduled: "Scheduled",
    taken_down: "Taken Down",
  };

  return (
    <AppShell hideRight>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold">My Posts</h1>
          <p className="text-sm text-muted-foreground">Manage your drafts, published stories, and scheduled posts.</p>
        </div>
        <Link to="/write">
          <Button><PenSquare className="h-4 w-4" /> New post</Button>
        </Link>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as Status)}>
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <TabsList>
            <TabsTrigger value="published">Published</TabsTrigger>
            <TabsTrigger value="draft">Drafts</TabsTrigger>
            <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
            <TabsTrigger value="taken_down">Taken Down</TabsTrigger>
          </TabsList>
          <div className="relative w-full sm:w-72">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search your posts" className="pl-9" />
          </div>
        </div>

        <TabsContent value={tab} className="mt-5">
          {isLoading ? <FeedSkeleton /> : posts.length === 0 ? (
            <EmptyState
              icon={FileText}
              heading={`No ${statusLabel[tab].toLowerCase()} yet`}
              subtext={tab === "draft" ? "Start a draft and come back to finish it whenever inspiration strikes." : `Your ${statusLabel[tab].toLowerCase()} stories will show up here.`}
              action={{ label: "Write your first post", href: "/write", icon: PenSquare }}
            />
          ) : (
            <div className="space-y-3">
              {posts.map((p) => (
                <div key={p.id} className="yt-card p-3 sm:p-4 flex flex-col sm:flex-row gap-4">
                  {p.cover_url && (
                    <img src={p.cover_url} alt={p.title} className="w-full sm:w-40 h-28 object-cover rounded-lg" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant={p.status === "published" ? "default" : "secondary"} className="capitalize">{p.status}</Badge>
                      <Badge variant="outline">{p.category}</Badge>
                      <span className="text-xs text-muted-foreground">{p.published_at ? new Date(p.published_at).toLocaleDateString() : ''}</span>
                    </div>
                    <h3 className="mt-2 font-bold line-clamp-1">{p.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">{p.subtitle || p.body.replace(/[*#>\n]+/g, ' ').trim().slice(0, 120)}</p>
                    <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                      <span>{p.view_count.toLocaleString()} views</span>
                      <span>{p.comment_count} comments</span>
                      <span>{p.clap_count} claps</span>
                    </div>
                  </div>
                  <div className="flex sm:flex-col gap-2 sm:justify-center">
                    <Link to={`/write/${p.id}`}><Button size="sm" variant="outline" className="w-full"><Eye className="h-4 w-4" /> Edit</Button></Link>
                    {p.status === 'published' && (
                      <Button size="sm" variant="outline" className="w-full" onClick={() => unpublishMutation.mutate(p.id)}>
                        <Undo2 className="h-4 w-4" /> Unpublish
                      </Button>
                    )}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="outline" className="w-full text-red-500 hover:text-red-500"><Trash2 className="h-4 w-4" /> Delete</Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete this post?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently remove "<span className="font-medium text-foreground">{p.title}</span>". This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-red-500 hover:bg-red-600"
                            onClick={() => deleteMutation.mutate(p.id)}
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </AppShell>
  );
};

export default MyPosts;
