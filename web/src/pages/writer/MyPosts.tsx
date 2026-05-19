import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { EmptyState } from "@/components/common/EmptyState";
import { Eye, PenSquare, Search, Trash2, FileText, Undo2, BarChart3, Users } from "lucide-react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, unwrap, unwrapPaginated } from "@/lib/api";
import { FeedSkeleton } from "@/components/common/Skeletons";
import type { Post } from "@/types/post";
import type { WriterAnalyticsResponse } from "@/types/analytics";

type Status = "published" | "draft" | "scheduled" | "taken_down";

const MyPosts = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Status>("published");
  const [q, setQ] = useState("");

  const { data: analytics } = useQuery({
    queryKey: ['writer-analytics'],
    queryFn: () => api.get('/analytics/me').then(unwrap<WriterAnalyticsResponse>),
  });

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

      {analytics && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
          <StatCard icon={FileText} label="Total posts" value={analytics.totalPosts} />
          <StatCard icon={Eye} label="Total views" value={analytics.totalViews} />
          <StatCard icon={BarChart3} label="Total claps" value={analytics.totalClaps} />
          <StatCard icon={Users} label="Followers" value={analytics.totalFollowers} />
          <StatCard icon={BarChart3} label="Avg claps/post" value={analytics.avgClapsPerPost} />
        </div>
      )}

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
                        <Link to={`/writer/analytics/${p.id}`} className="inline-flex items-center gap-1 text-primary hover:underline">
                        <BarChart3 className="h-3 w-3" /> Analytics
                      </Link>
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

const StatCard = ({ icon: Icon, label, value }: { icon: any; label: string; value: number }) => (
  <Card className="p-3 flex items-center gap-3">
    <div className="h-9 w-9 rounded-lg bg-primary/10 inline-flex items-center justify-center shrink-0">
      <Icon className="h-4 w-4 text-primary" />
    </div>
    <div className="min-w-0">
      <div className="text-lg font-extrabold">{typeof value === 'number' ? value.toLocaleString() : value}</div>
      <div className="text-[11px] text-muted-foreground truncate">{label}</div>
    </div>
  </Card>
);

export default MyPosts;
