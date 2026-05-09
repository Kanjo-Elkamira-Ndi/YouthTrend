import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { posts, currentUser } from "@/mock";
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
import { BarChart3, Eye, MessageSquare, PenSquare, Search, Trash2, FileText } from "lucide-react";
import { toast } from "sonner";

type Status = "all" | "published" | "drafts" | "scheduled";

const MyPosts = () => {
  const [tab, setTab] = useState<Status>("all");
  const [q, setQ] = useState("");

  const mine = useMemo(() => posts.filter((p) => p.author.id === currentUser.id || true).slice(0, 6), []);
  const drafts = mine.slice(0, 2).map((p) => ({ ...p, _status: "draft" as const }));
  const published = mine.map((p) => ({ ...p, _status: "published" as const }));
  const scheduled: typeof published = [];

  const all = [...published, ...drafts, ...scheduled];
  const list = (tab === "all" ? all : tab === "drafts" ? drafts : tab === "scheduled" ? scheduled : published)
    .filter((p) => p.title.toLowerCase().includes(q.toLowerCase()));

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
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="published">Published</TabsTrigger>
            <TabsTrigger value="drafts">Drafts</TabsTrigger>
            <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
          </TabsList>
          <div className="relative w-full sm:w-72">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search your posts" className="pl-9" />
          </div>
        </div>

        <TabsContent value={tab} className="mt-5">
          {list.length === 0 ? (
            <EmptyState
              icon={FileText}
              heading={tab === "drafts" ? "No drafts yet" : tab === "scheduled" ? "Nothing scheduled" : "No posts yet"}
              subtext={tab === "drafts" ? "Start a draft and come back to finish it whenever inspiration strikes." : "Your published stories will show up here."}
              action={{ label: "Write your first post", href: "/write", icon: PenSquare }}
            />
          ) : (
            <div className="space-y-3">
              {list.map((p) => (
                <div key={p.id + p._status} className="yt-card p-3 sm:p-4 flex flex-col sm:flex-row gap-4">
                  <img src={p.cover} alt={p.title} className="w-full sm:w-40 h-28 object-cover rounded-lg" />
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant={p._status === "published" ? "default" : "secondary"} className="capitalize">{p._status}</Badge>
                      <Badge variant="outline">{p.category}</Badge>
                      <span className="text-xs text-muted-foreground">{p.publishedAt}</span>
                    </div>
                    <h3 className="mt-2 font-bold line-clamp-1">{p.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">{p.excerpt}</p>
                    <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1"><Eye className="h-3.5 w-3.5" /> {(p.claps * 7).toLocaleString()} views</span>
                      <span className="inline-flex items-center gap-1"><MessageSquare className="h-3.5 w-3.5" /> {p.comments}</span>
                      <span>{p.readMinutes} min read</span>
                    </div>
                  </div>
                  <div className="flex sm:flex-col gap-2 sm:justify-center">
                    <Link to={`/post/${p.id}`}><Button size="sm" variant="outline" className="w-full"><Eye className="h-4 w-4" /> View</Button></Link>
                    <Link to="/writer/analytics"><Button size="sm" variant="outline" className="w-full"><BarChart3 className="h-4 w-4" /> Stats</Button></Link>
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
                            onClick={() => toast.success("Post deleted", { description: p.title })}
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
