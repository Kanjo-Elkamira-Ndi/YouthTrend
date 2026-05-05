import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Clock, CheckCircle, XCircle, ArrowUpRight, ShieldAlert, TriangleAlert } from "lucide-react";
import { mockGlobalReports } from "@/mock/superAdmin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

const STATS = [
  { label: "Pending",         value: "24", icon: Clock,         tone: "text-amber-400 bg-amber-500/10" },
  { label: "Resolved Today",  value: "11", icon: CheckCircle,   tone: "text-primary bg-primary/10" },
  { label: "Dismissed Today", value: "7",  icon: XCircle,       tone: "text-muted-foreground bg-secondary" },
  { label: "Escalated to SA", value: "6",  icon: ArrowUpRight,  tone: "text-amber-400 bg-amber-500/10" },
];

const TABS = ["All", "Pending", "Escalated", "Resolved", "Dismissed"] as const;

const SuperAdminModeration = () => {
  const [tab, setTab] = useState<typeof TABS[number]>("All");

  const reports = useMemo(() => mockGlobalReports.filter((r) => {
    if (tab === "All") return true;
    if (tab === "Escalated") return !!r.escalatedBy;
    return r.status === tab;
  }), [tab]);

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

      <div className="space-y-3">
        {reports.map((r, i) => (
          <motion.div key={r.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className="yt-card p-4 space-y-3">
            <div className="flex flex-wrap items-start gap-3">
              <div className="h-10 w-10 rounded-lg bg-red-500/10 text-red-400 inline-flex items-center justify-center"><ShieldAlert className="h-5 w-5" /></div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold">{r.reason}</span>
                  <Badge variant="secondary">{r.targetCampus}</Badge>
                  {r.escalatedBy && <Badge className="bg-amber-500/15 text-amber-400 hover:bg-amber-500/15">Escalated by {r.escalatedBy}</Badge>}
                  <Badge className={
                    r.status === "Pending"   ? "bg-amber-500/15 text-amber-400 hover:bg-amber-500/15" :
                    r.status === "Resolved"  ? "bg-primary/15 text-primary hover:bg-primary/15" :
                                               "bg-secondary text-muted-foreground"
                  }>{r.status}</Badge>
                </div>
                <div className="text-sm mt-1">Reported: <span className="font-medium">{r.targetTitle}</span></div>
                <div className="text-xs text-muted-foreground mt-0.5">By {r.reporter} · {r.time}</div>
              </div>
            </div>
            {r.note && (
              <div className="rounded-md border-l-2 border-amber-500 bg-amber-500/5 px-3 py-2 text-xs italic text-amber-300/90">
                <span className="font-semibold not-italic">Campus moderator note: </span>{r.note}
              </div>
            )}
            <div className="flex flex-wrap gap-2">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20">Take Down Platform-Wide</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader><AlertDialogTitle className="flex items-center gap-2"><TriangleAlert className="h-5 w-5 text-red-400" /> Take down platform-wide?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone without manual restoration.</AlertDialogDescription></AlertDialogHeader>
                  <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction className="bg-red-500 hover:bg-red-600">Take Down</AlertDialogAction></AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              <Button variant="outline">Return to Campus Admin</Button>
              <Button variant="ghost">Dismiss</Button>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default SuperAdminModeration;
