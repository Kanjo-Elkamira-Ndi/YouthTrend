import { useState } from "react";
import { motion } from "framer-motion";
import { Clock, CheckCircle, XCircle, ExternalLink, ArrowRight, Flag } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
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
  explicit_content: "Explicit",
  harassment: "Harassment",
  other: "Other",
};

const REASON_CLASSES: Record<string, string> = {
  hate_speech: "bg-red-500/10 text-red-500 border-red-500/20",
  misinformation: "bg-amber-500/15 text-amber-600 border-amber-500/20",
  spam: "bg-muted text-muted-foreground border-border",
  explicit_content: "bg-red-500/10 text-red-500 border-red-500/20",
  harassment: "bg-red-500/10 text-red-500 border-red-500/20",
  other: "bg-muted text-muted-foreground border-border",
};

const CampusAdminModeration = () => {
  const [tab, setTab] = useState("all");
  const queryClient = useQueryClient();

  const statusFilter = tab === "all" ? undefined : tab;

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['moderation', 'campus', 'queue', statusFilter],
    queryFn: () => {
      const params = new URLSearchParams({ perPage: '100' });
      if (statusFilter) params.set('status', statusFilter);
      return api.get('/moderation/campus/queue?' + params.toString()).then(unwrapPaginated<Report>);
    },
  });

  const actionReport = useMutation({
    mutationFn: ({ id, action, moderatorNote }: { id: string; action: string; moderatorNote?: string }) =>
      api.patch('/moderation/campus/reports/' + id + '/action', { action, moderatorNote }).then(unwrap),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['moderation', 'campus'] });
      toast.success('Report updated.');
    },
    onError: () => toast.error('Failed to update report.'),
  });

  const reports = data?.data ?? [];
  const pendingCount = reports.filter((r) => r.status === 'pending').length;

  return (
    <div className="p-4 lg:p-8 max-w-[1100px] mx-auto w-full space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { icon: Clock, label: "Pending Review", value: pendingCount, color: "text-amber-500 bg-amber-500/10" },
          { icon: CheckCircle, label: "Total Loaded", value: reports.length, color: "text-primary bg-primary/10" },
          { icon: XCircle, label: "Taken Down", value: reports.filter((r) => r.status === 'taken_down').length, color: "text-red-500 bg-red-500/10" },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="yt-card p-4 flex items-center gap-3">
            <div className={`h-10 w-10 inline-flex items-center justify-center rounded-lg ${s.color}`}>
              <s.icon className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xl font-extrabold">{isLoading ? '...' : s.value}</div>
              <div className="text-xs text-muted-foreground">{s.label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="taken_down">Taken Down</TabsTrigger>
          <TabsTrigger value="dismissed">Dismissed</TabsTrigger>
          <TabsTrigger value="escalated">Escalated</TabsTrigger>
        </TabsList>
      </Tabs>

      {isLoading ? (
        <FeedSkeleton />
      ) : isError ? (
        <InlineError message="Couldn't load reports." onRetry={refetch} />
      ) : reports.length === 0 ? (
        <div className="text-center py-12 text-sm text-muted-foreground">No reports to review.</div>
      ) : (
        <div className="space-y-4">
          {reports.map((r, i) => (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="yt-card p-5 space-y-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="h-8 w-8 rounded-full bg-red-500/10 inline-flex items-center justify-center">
                    <Flag className="h-4 w-4 text-red-500" />
                  </div>
                  <div className="text-sm min-w-0">
                    <div className="truncate"><span className="text-muted-foreground">Reported by</span> <strong>{r.reporter_name ?? 'Unknown'}</strong></div>
                    <div className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</div>
                  </div>
                </div>
                <span className={`shrink-0 inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${REASON_CLASSES[r.reason] ?? ''}`}>
                  {REASON_LABELS[r.reason] ?? r.reason}
                </span>
              </div>

              <div className="rounded-lg border border-border bg-muted/30 p-4">
                <div className="text-sm">
                  <div className="font-semibold">{r.target_title ?? 'Untitled'}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {r.target_type === 'post' ? 'Post' : 'Comment'} · {r.target_author_name ?? 'Unknown'}
                  </div>
                </div>
                {r.description && (
                  <p className="text-sm text-foreground/90 mt-2 line-clamp-3">{r.description}</p>
                )}
                <a href="#" className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline">
                  View Full Content <ArrowRight className="h-3 w-3" />
                </a>
              </div>

              {r.status !== 'pending' ? (
                <div className="rounded-md bg-secondary text-muted-foreground text-xs px-3 py-2">
                  {r.status === 'taken_down' ? `Taken down` : r.status === 'dismissed' ? `Dismissed` : `Escalated`}
                  {r.moderator_name ? ` by ${r.moderator_name}` : ''}
                  {r.actioned_at ? ` · ${new Date(r.actioned_at).toLocaleDateString()}` : ''}
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" className="bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20" onClick={() => actionReport.mutate({ id: r.id, action: 'take_down' })}>
                    Take Down
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => actionReport.mutate({ id: r.id, action: 'dismiss' })}>
                    Dismiss
                  </Button>
                  <Button size="sm" variant="ghost" className="gap-1.5" onClick={() => actionReport.mutate({ id: r.id, action: 'escalate' })}>
                    Escalate to Super Admin <ExternalLink className="h-3.5 w-3.5" />
                  </Button>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CampusAdminModeration;
