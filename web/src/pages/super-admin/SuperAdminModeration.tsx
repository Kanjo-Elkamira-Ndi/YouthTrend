import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Clock, CheckCircle, XCircle, ArrowUpRight, ShieldAlert, TriangleAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, unwrap, unwrapPaginated } from "@/lib/api";
import type { Report } from "@/types/moderation";
import { InlineError } from "@/components/common/InlineError";
import { FeedSkeleton } from "@/components/common/Skeletons";
import { toast } from "sonner";

const REASON_LABELS: Record<string, string> = {
  hate_speech: "Hate Speech",
  misinformation: "Misinformation",
  spam: "Spam",
  explicit_content: "Explicit Content",
  harassment: "Harassment",
  other: "Other",
};

const TABS = ["All", "Pending", "Escalated", "Taken Down", "Dismissed"] as const;

const SuperAdminModeration = () => {
  const [tab, setTab] = useState<typeof TABS[number]>("All");
  const queryClient = useQueryClient();

  const statusFilter = tab === "All" ? undefined : tab === "Escalated" ? "escalated" : tab.toLowerCase();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['moderation', 'admin', 'queue', statusFilter],
    queryFn: () => {
      const params = new URLSearchParams({ perPage: '50' });
      if (statusFilter) params.set('status', statusFilter);
      return api.get('/moderation/admin/queue?' + params.toString()).then(unwrapPaginated<Report>);
    },
  });

  const actionReport = useMutation({
    mutationFn: ({ id, action }: { id: string; action: string }) =>
      api.patch('/moderation/admin/reports/' + id + '/action', { action }).then(unwrap),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['moderation', 'admin'] });
      toast.success('Report action completed.');
    },
    onError: () => toast.error('Failed to process report.'),
  });

  const takedownPlatform = useMutation({
    mutationFn: (id: string) =>
      api.patch('/moderation/admin/posts/' + id + '/takedown').then(unwrap),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['moderation', 'admin'] });
      toast.success('Post taken down platform-wide.');
    },
    onError: () => toast.error('Failed to take down post.'),
  });

  const reports = data?.data ?? [];

  const stats = useMemo(() => {
    const all = reports;
    return {
      pending: all.filter((r) => r.status === 'pending').length,
      taken_down: all.filter((r) => r.status === 'taken_down').length,
      dismissed: all.filter((r) => r.status === 'dismissed').length,
      escalated: all.filter((r) => r.status === 'escalated').length,
    };
  }, [reports]);

  const STATS = [
    { label: "Pending",         value: stats.pending, icon: Clock,         tone: "text-amber-400 bg-amber-500/10" },
    { label: "Taken Down",      value: stats.taken_down, icon: CheckCircle,   tone: "text-primary bg-primary/10" },
    { label: "Dismissed",       value: stats.dismissed, icon: XCircle,       tone: "text-muted-foreground bg-secondary" },
    { label: "Escalated",       value: stats.escalated, icon: ArrowUpRight,  tone: "text-amber-400 bg-amber-500/10" },
  ];

  const filtered = useMemo(() => {
    if (tab === "All") return reports;
    if (tab === "Escalated") return reports.filter((r) => r.status === 'escalated');
    return reports.filter((r) => r.status === tab.toLowerCase());
  }, [reports, tab]);

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="p-4 lg:p-6 space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {STATS.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="yt-card border-primary/30 p-4">
            <div className="flex items-center gap-3">
              <div className={`h-10 w-10 rounded-lg inline-flex items-center justify-center ${s.tone}`}><s.icon className="h-5 w-5" /></div>
              <div>
                <div className="text-2xl font-bold">{s.value}</div>
                <div className="text-xs text-muted-foreground">{s.label}</div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as typeof TABS[number])}>
        <TabsList>{TABS.map((t) => <TabsTrigger key={t} value={t}>{t}</TabsTrigger>)}</TabsList>
      </Tabs>

      {isLoading ? (
        <FeedSkeleton />
      ) : isError ? (
        <InlineError message="Couldn't load reports." onRetry={refetch} />
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-sm text-muted-foreground">No reports to review.</div>
      ) : (
        <div className="space-y-3">
          {filtered.map((r, i) => (
            <motion.div key={r.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className="yt-card p-4 space-y-3">
              <div className="flex flex-wrap items-start gap-3">
                <div className="h-10 w-10 rounded-lg bg-red-500/10 text-red-400 inline-flex items-center justify-center"><ShieldAlert className="h-5 w-5" /></div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold">{REASON_LABELS[r.reason] ?? r.reason}</span>
                    {r.campus_name && <Badge variant="secondary">{r.campus_name}</Badge>}
                    <Badge className={
                      r.status === 'pending'   ? "bg-amber-500/15 text-amber-400 hover:bg-amber-500/15" :
                      r.status === 'taken_down'  ? "bg-primary/15 text-primary hover:bg-primary/15" :
                      r.status === 'escalated' ? "bg-red-500/15 text-red-400 hover:bg-red-500/15" :
                                                 "bg-secondary text-muted-foreground"
                    }>{r.status}</Badge>
                  </div>
                  <div className="text-sm mt-1">Reported: <span className="font-medium">{r.target_title ?? 'Unknown'}</span></div>
                  <div className="text-xs text-muted-foreground mt-0.5">By {r.reporter_name ?? 'Unknown'} · {new Date(r.created_at).toLocaleDateString()}</div>
                </div>
              </div>
              {r.description && (
                <div className="rounded-md border-l-2 border-amber-500 bg-amber-500/5 px-3 py-2 text-xs italic text-amber-300/90">
                  <span className="font-semibold not-italic">Reporter note: </span>{r.description}
                </div>
              )}
              {r.status === 'pending' || r.status === 'escalated' ? (
                <div className="flex flex-wrap gap-2">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" className="bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20">Take Down Platform-Wide</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader><AlertDialogTitle className="flex items-center gap-2"><TriangleAlert className="h-5 w-5 text-red-400" /> Take down platform-wide?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone without manual restoration.</AlertDialogDescription></AlertDialogHeader>
                      <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction className="bg-red-500 hover:bg-red-600" onClick={() => actionReport.mutate({ id: r.id, action: 'take_down_platform' })}>Take Down</AlertDialogAction></AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                  <Button variant="outline" onClick={() => actionReport.mutate({ id: r.id, action: 'return_to_campus' })}>Return to Campus Admin</Button>
                  <Button variant="ghost" onClick={() => actionReport.mutate({ id: r.id, action: 'dismiss' })}>Dismiss</Button>
                </div>
              ) : (
                <div className="rounded-md bg-secondary text-muted-foreground text-xs px-3 py-2">
                  {r.status === 'taken_down' ? 'Taken down platform-wide' : 'Dismissed'}
                  {r.moderator_name ? ` by ${r.moderator_name}` : ''}
                  {r.actioned_at ? ` · ${new Date(r.actioned_at).toLocaleDateString()}` : ''}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default SuperAdminModeration;
