import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Search, Eye, EyeOff, Trash2, TriangleAlert, ChevronLeft, ChevronRight } from "lucide-react";
import { CATEGORIES } from "@/lib/constants";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { FeedSkeleton } from "@/components/common/Skeletons";
import { InlineError } from "@/components/common/InlineError";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, unwrapPaginated } from "@/lib/api";
import type { GlobalContentRow } from "@/types/analytics";

const CAMPUSES = ["All", "UY1", "UB", "IUBS", "UDL", "UB2"];
const STATUSES = ["All", "published", "draft", "taken_down"];
const SORTS = ["newest", "most_viewed", "most_reported", "most_claps"];

const STATUS_LABEL: Record<string, string> = {
  published: "Published",
  draft: "Draft",
  taken_down: "Taken Down",
};

const STATUS_COLOR: Record<string, string> = {
  published: "bg-primary/15 text-primary",
  draft: "bg-secondary text-muted-foreground",
  taken_down: "bg-red-500/15 text-red-400",
};

const SuperAdminContent = () => {
  const queryClient = useQueryClient();
  const [q, setQ] = useState("");
  const [campus, setCampus] = useState("All");
  const [category, setCategory] = useState("All");
  const [status, setStatus] = useState("All");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);

  const params = useMemo(() => {
    const p: Record<string, string> = { page: String(page), perPage: '15' };
    if (q) p.q = q;
    if (campus !== "All") p.campusId = campus;
    if (category !== "All") p.category = category;
    if (status !== "All") p.status = status;
    if (sort === "most_viewed") p.sort = "views";
    else if (sort === "most_reported") p.sort = "reports";
    else if (sort === "most_claps") p.sort = "claps";
    return p;
  }, [q, campus, category, status, sort, page]);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin', 'content', params],
    queryFn: () => api.get('/super-admin/content', { params }).then(unwrapPaginated<GlobalContentRow>),
  });

  const takedownMutation = useMutation({
    mutationFn: (postId: string) =>
      api.patch(`/moderation/admin/posts/${postId}/takedown`, { note: 'Super Admin takedown' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'content'] });
      toast.success('Post taken down platform-wide.');
    },
    onError: () => toast.error('Failed to take down post.'),
  });

  const deleteMutation = useMutation({
    mutationFn: (postId: string) => api.delete('/posts/' + postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'content'] });
      toast.success('Post permanently deleted.');
    },
    onError: () => toast.error('Failed to delete post.'),
  });

  if (isLoading) return <div className="p-6"><FeedSkeleton /></div>;
  if (isError) return <div className="p-6"><InlineError message="Failed to load content" /></div>;

  const rows = data?.data ?? [];
  const meta = data?.meta;

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="p-4 lg:p-6 space-y-5">
      <div className="flex flex-col lg:flex-row lg:items-center gap-3">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold">All Content</h2>
          <Badge variant="secondary">{meta?.total.toLocaleString() ?? rows.length}</Badge>
        </div>
        <div className="lg:ml-auto flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="h-4 w-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} placeholder="Search posts…" className="pl-8 h-9 w-60" />
          </div>
          <Select value={campus} onValueChange={(v) => { setCampus(v); setPage(1); }}><SelectTrigger className="w-[120px] h-9"><SelectValue /></SelectTrigger><SelectContent>{CAMPUSES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select>
          <Select value={category} onValueChange={(v) => { setCategory(v); setPage(1); }}><SelectTrigger className="w-[140px] h-9"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="All">All</SelectItem>{CATEGORIES.map((c) => {
              const Icon = c.icon;
              return <SelectItem key={c.name} value={c.name}><Icon className="mr-2 h-3.5 w-3.5 inline" />{c.name}</SelectItem>;
            })}</SelectContent></Select>
          <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1); }}><SelectTrigger className="w-[140px] h-9"><SelectValue /></SelectTrigger><SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s}>{STATUS_LABEL[s] ?? s}</SelectItem>)}</SelectContent></Select>
          <Select value={sort} onValueChange={(v) => { setSort(v); setPage(1); }}><SelectTrigger className="w-[150px] h-9"><SelectValue /></SelectTrigger><SelectContent>{SORTS.map((s) => <SelectItem key={s} value={s}>{s.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}</SelectItem>)}</SelectContent></Select>
        </div>
      </div>

      <div className="yt-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary/50 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left" colSpan={2}>Post</th>
                <th className="px-4 py-3 text-left">Author</th>
                <th className="px-4 py-3 text-left">Campus</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-right">Reports</th>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-12 text-center text-muted-foreground">No content found.</td></tr>
              ) : rows.map((p) => (
                <tr key={p.id} className="border-t border-border hover:bg-secondary/40">
                  <td className="px-4 py-3 max-w-xs">
                    <div className="font-semibold line-clamp-1">{p.title}</div>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{p.slug}</td>
                  <td className="px-4 py-3">
                    <div className="text-xs font-medium">{p.author_name ?? 'Unknown'}</div>
                  </td>
                  <td className="px-4 py-3"><Badge variant="secondary" className="text-[10px]">{p.campus_short_code ?? p.campus_name ?? '—'}</Badge></td>
                  <td className="px-4 py-3"><Badge className={`${STATUS_COLOR[p.status] ?? ''} hover:${STATUS_COLOR[p.status] ?? ''}`}>{STATUS_LABEL[p.status] ?? p.status}</Badge></td>
                  <td className={`px-4 py-3 text-right tabular-nums ${p.report_count > 0 ? "text-red-400 font-semibold" : "text-muted-foreground"}`}>{p.report_count}</td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{p.created_at ? new Date(p.created_at).toLocaleDateString() : '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Tooltip><TooltipTrigger asChild><button className="h-8 w-8 inline-flex items-center justify-center rounded-md hover:bg-secondary"><Eye className="h-4 w-4" /></button></TooltipTrigger><TooltipContent>View</TooltipContent></Tooltip>
                      <AlertDialog>
                        <Tooltip><TooltipTrigger asChild><AlertDialogTrigger asChild><button className="h-8 w-8 inline-flex items-center justify-center rounded-md hover:bg-amber-500/10 text-amber-400"><EyeOff className="h-4 w-4" /></button></AlertDialogTrigger></TooltipTrigger><TooltipContent>Take down</TooltipContent></Tooltip>
                        <AlertDialogContent>
                          <AlertDialogHeader><AlertDialogTitle>Take down post?</AlertDialogTitle><AlertDialogDescription>The post will be hidden platform-wide. This is a Super Admin override.</AlertDialogDescription></AlertDialogHeader>
                          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => takedownMutation.mutate(p.id)}>Take Down</AlertDialogAction></AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                      <AlertDialog>
                        <Tooltip><TooltipTrigger asChild><AlertDialogTrigger asChild><button className="h-8 w-8 inline-flex items-center justify-center rounded-md bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20"><Trash2 className="h-4 w-4" /></button></AlertDialogTrigger></TooltipTrigger><TooltipContent>Hard delete</TooltipContent></Tooltip>
                        <AlertDialogContent>
                          <AlertDialogHeader><AlertDialogTitle className="flex items-center gap-2"><TriangleAlert className="h-5 w-5 text-red-400" /> Delete post?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone. The post and all its comments will be permanently removed.</AlertDialogDescription></AlertDialogHeader>
                          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction className="bg-red-500 hover:bg-red-600" onClick={() => deleteMutation.mutate(p.id)}>Delete Permanently</AlertDialogAction></AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {meta && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border text-xs text-muted-foreground">
            <span>Page {meta.page} of {meta.totalPages} ({meta.total} total)</span>
            <div className="flex gap-1.5">
              <Button variant="outline" size="sm" disabled={!meta.hasPrev} onClick={() => setPage((p) => p - 1)}><ChevronLeft className="h-4 w-4" /></Button>
              <Button variant="outline" size="sm" disabled={!meta.hasNext} onClick={() => setPage((p) => p + 1)}><ChevronRight className="h-4 w-4" /></Button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default SuperAdminContent;
