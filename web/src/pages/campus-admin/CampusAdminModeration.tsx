import { motion } from "framer-motion";
import { Clock, CheckCircle, XCircle, ExternalLink, ArrowRight } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { mockReports, ReportReason, ReportStatus } from "@/mock/campusAdmin";

const reasonClass: Record<ReportReason, string> = {
  "Hate Speech": "bg-red-500/10 text-red-500 border-red-500/20",
  Misinformation: "bg-amber-500/15 text-amber-600 border-amber-500/20",
  Spam: "bg-muted text-muted-foreground border-border",
  Explicit: "bg-red-500/10 text-red-500 border-red-500/20",
  Other: "bg-muted text-muted-foreground border-border",
};

const statCards = [
  { icon: Clock, label: "Pending Review", value: "12", color: "text-amber-500 bg-amber-500/10" },
  { icon: CheckCircle, label: "Resolved Today", value: "5", color: "text-primary bg-primary/10" },
  { icon: XCircle, label: "Dismissed Today", value: "3", color: "text-muted-foreground bg-secondary" },
];

const CampusAdminModeration = () => {
  return (
    <div className="p-4 lg:p-8 max-w-[1100px] mx-auto w-full space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {statCards.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="yt-card p-4 flex items-center gap-3">
            <div className={`h-10 w-10 inline-flex items-center justify-center rounded-lg ${s.color}`}>
              <s.icon className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xl font-extrabold">{s.value}</div>
              <div className="text-xs text-muted-foreground">{s.label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="resolved">Resolved</TabsTrigger>
          <TabsTrigger value="dismissed">Dismissed</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="space-y-4">
        {mockReports.map((r, i) => (
          <motion.div
            key={r.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className="yt-card p-5 space-y-4"
          >
            {/* Top row */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <img src={r.reporter.avatar} alt="" className="h-8 w-8 rounded-full" />
                <div className="text-sm min-w-0">
                  <div className="truncate"><span className="text-muted-foreground">Reported by</span> <strong>{r.reporter.name}</strong></div>
                  <div className="text-xs text-muted-foreground">{r.time}</div>
                </div>
              </div>
              <span className={`shrink-0 inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${reasonClass[r.reason]}`}>
                {r.reason}
              </span>
            </div>

            {/* Content preview */}
            <div className="rounded-lg border border-border bg-muted/30 p-4">
              <div className="flex items-center gap-2 mb-2">
                <img src={r.target.author.avatar} alt="" className="h-7 w-7 rounded-full" />
                <div className="text-xs">
                  <div className="font-semibold">{r.target.author.name}</div>
                  <div className="text-muted-foreground">
                    {r.target.kind === "post" ? r.target.title : <>Comment on: <em>{r.target.title}</em></>}
                  </div>
                </div>
              </div>
              <p className="text-sm text-foreground/90 line-clamp-3">{r.target.body}</p>
              <a href="#" className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline">
                View Full Post <ArrowRight className="h-3 w-3" />
              </a>
            </div>

            {/* Status banner if resolved/dismissed */}
            {r.status !== "Pending" ? (
              <div className="rounded-md bg-secondary text-muted-foreground text-xs px-3 py-2">
                {r.status === "Resolved" ? `Resolved by ${r.resolvedBy} · ${r.resolvedAt}` : `Dismissed · ${r.resolvedAt}`}
              </div>
            ) : (
              <>
                <Textarea rows={2} placeholder="Add a moderation note (optional)" className="text-sm" />
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" className="bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20">Take Down</Button>
                  <Button size="sm" variant="outline">Dismiss</Button>
                  <Button size="sm" variant="ghost" className="gap-1.5">
                    Escalate to Super Admin <ExternalLink className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default CampusAdminModeration;
