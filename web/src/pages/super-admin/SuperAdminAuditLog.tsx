import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Download, ChevronLeft, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FeedSkeleton } from "@/components/common/Skeletons";
import { InlineError } from "@/components/common/InlineError";
import { useQuery } from "@tanstack/react-query";
import { api, unwrapPaginated } from "@/lib/api";
import type { AuditLogRow } from "@/types/analytics";

const ROLES = ["All", "super_admin", "campus_admin", "moderator"];
const ACTIONS = ["All", "post.takedown", "post.delete", "user.suspend", "user.ban", "user.role_change", "campus.create", "platform.settings_update", "report.dismiss"];
const CAMPUSES = ["All", "UY1", "UB", "IUBS", "UDL", "UB2", "Platform"];

const ROLE_LABEL: Record<string, string> = {
  super_admin: "Super Admin",
  campus_admin: "Campus Admin",
  moderator: "Moderator",
};

const ROLE_COLOR: Record<string, string> = {
  super_admin:  "bg-primary/15 text-primary",
  campus_admin: "bg-amber-500/15 text-amber-400",
  moderator:    "bg-blue-500/15 text-blue-400",
};

const CAMPUS_SHORT_TO_ID: Record<string, string> = {
  UY1: "uy1", UB: "ub", IUBS: "iubs", UDL: "udl", UB2: "ub2", Platform: "platform",
};

const SuperAdminAuditLog = () => {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [role, setRole] = useState("All");
  const [action, setAction] = useState("All");
  const [campus, setCampus] = useState("All");
  const [page, setPage] = useState(1);

  const params = useMemo(() => {
    const p: Record<string, string> = { page: String(page), perPage: '20' };
    if (role !== "All") p.actorRole = role;
    if (action !== "All") p.action = action;
    if (campus !== "All") p.campusId = CAMPUS_SHORT_TO_ID[campus] ?? campus;
    if (from) p.from = from;
    if (to) p.to = to;
    return p;
  }, [role, action, campus, from, to, page]);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin', 'audit-log', params],
    queryFn: () => api.get('/super-admin/audit-log', { params }).then(unwrapPaginated<AuditLogRow>),
  });

  if (isLoading) return <div className="p-6"><FeedSkeleton /></div>;
  if (isError) return <div className="p-6"><InlineError message="Failed to load audit log" /></div>;

  const rows = data?.data ?? [];
  const meta = data?.meta;

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="p-4 lg:p-6 space-y-5">
      <div className="flex flex-col lg:flex-row lg:items-center gap-3">
        <h2 className="text-xl font-bold">Audit Log</h2>
        <div className="lg:ml-auto flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-muted-foreground">From</span>
            <Input type="date" value={from} onChange={(e) => { setFrom(e.target.value); setPage(1); }} className="h-9 w-[140px]" />
            <span className="text-muted-foreground">To</span>
            <Input type="date" value={to} onChange={(e) => { setTo(e.target.value); setPage(1); }} className="h-9 w-[140px]" />
          </div>
          <Select value={role} onValueChange={(v) => { setRole(v); setPage(1); }}><SelectTrigger className="w-[140px] h-9"><SelectValue /></SelectTrigger><SelectContent>{ROLES.map((r) => <SelectItem key={r} value={r}>{ROLE_LABEL[r] ?? r}</SelectItem>)}</SelectContent></Select>
          <Select value={action} onValueChange={(v) => { setAction(v); setPage(1); }}><SelectTrigger className="w-[180px] h-9"><SelectValue /></SelectTrigger><SelectContent>{ACTIONS.map((a) => <SelectItem key={a} value={a}>{a.replace(/_/g, ' ').replace(/\./g, ' — ').replace(/\b\w/g, (l) => l.toUpperCase())}</SelectItem>)}</SelectContent></Select>
          <Select value={campus} onValueChange={(v) => { setCampus(v); setPage(1); }}><SelectTrigger className="w-[120px] h-9"><SelectValue /></SelectTrigger><SelectContent>{CAMPUSES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select>
          <Button variant="outline" className="h-9"><Download className="h-4 w-4 mr-1.5" /> Export Log</Button>
        </div>
      </div>

      <div className="yt-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary/50 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left">Timestamp</th>
                <th className="px-4 py-3 text-left">Actor</th>
                <th className="px-4 py-3 text-left">Action</th>
                <th className="px-4 py-3 text-left">Target</th>
                <th className="px-4 py-3 text-left">Campus</th>
                <th className="px-4 py-3 text-left">IP</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">No audit log entries found.</td></tr>
              ) : rows.map((l) => (
                <tr key={l.id} className="border-t border-border hover:bg-secondary/40">
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground whitespace-nowrap">{new Date(l.created_at).toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div>
                        <div className="text-xs font-medium">{l.actor_name ?? 'Unknown'}</div>
                        <Badge className={`${ROLE_COLOR[l.actor_role] ?? ''} hover:${ROLE_COLOR[l.actor_role] ?? ''} text-[10px]`}>{ROLE_LABEL[l.actor_role] ?? l.actor_role}</Badge>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">{l.action}</td>
                  <td className="px-4 py-3 text-muted-foreground">{l.target_type ? `${l.target_type} ${l.target_id ? `(${l.target_id.slice(0, 8)})` : ''}` : '—'}</td>
                  <td className="px-4 py-3"><Badge variant="secondary">{l.campus_id ?? 'Platform'}</Badge></td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{l.ip_address ?? '—'}</td>
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

export default SuperAdminAuditLog;
