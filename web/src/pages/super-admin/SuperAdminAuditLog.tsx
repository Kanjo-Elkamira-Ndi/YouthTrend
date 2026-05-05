import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Download } from "lucide-react";
import { mockAuditLog } from "@/mock/superAdmin";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const ROLES = ["All", "Super Admin", "Campus Admin", "Moderator"];
const ACTIONS = ["All", "User Management", "Content", "Moderation", "Settings", "Campus"];
const CAMPUSES = ["All", "UY1", "UB", "IUBS", "UDL", "UB2", "Platform"];

const ROLE_COLOR: Record<string, string> = {
  "Super Admin":  "bg-primary/15 text-primary",
  "Campus Admin": "bg-amber-500/15 text-amber-400",
  "Moderator":    "bg-blue-500/15 text-blue-400",
};

const ACTION_COLOR: Record<string, string> = {
  content:     "text-foreground",
  user:        "text-blue-400",
  moderation:  "text-foreground",
  destructive: "text-red-400",
  settings:    "text-amber-400",
  campus:      "text-primary",
};

const SuperAdminAuditLog = () => {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [role, setRole] = useState("All");
  const [action, setAction] = useState("All");
  const [campus, setCampus] = useState("All");

  const rows = useMemo(() => mockAuditLog.filter((l) => {
    if (role !== "All" && l.actor.role !== role) return false;
    if (campus !== "All" && l.campus !== campus) return false;
    return true;
  }), [role, campus, action, from, to]);

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="p-4 lg:p-6 space-y-5">
      <div className="flex flex-col lg:flex-row lg:items-center gap-3">
        <h2 className="text-xl font-bold">Audit Log</h2>
        <div className="lg:ml-auto flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-muted-foreground">From</span>
            <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="h-9 w-[140px]" />
            <span className="text-muted-foreground">To</span>
            <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="h-9 w-[140px]" />
          </div>
          <Select value={role} onValueChange={setRole}><SelectTrigger className="w-[140px] h-9"><SelectValue /></SelectTrigger><SelectContent>{ROLES.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent></Select>
          <Select value={action} onValueChange={setAction}><SelectTrigger className="w-[150px] h-9"><SelectValue /></SelectTrigger><SelectContent>{ACTIONS.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}</SelectContent></Select>
          <Select value={campus} onValueChange={setCampus}><SelectTrigger className="w-[120px] h-9"><SelectValue /></SelectTrigger><SelectContent>{CAMPUSES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select>
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
              {rows.map((l) => (
                <tr key={l.id} className="border-t border-border hover:bg-secondary/40">
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground whitespace-nowrap">{l.timestamp}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <img src={l.actor.avatar} alt="" className="h-7 w-7 rounded-full" />
                      <div>
                        <div className="text-xs font-medium">{l.actor.name}</div>
                        <Badge className={`${ROLE_COLOR[l.actor.role] ?? ""} hover:${ROLE_COLOR[l.actor.role] ?? ""} text-[10px]`}>{l.actor.role}</Badge>
                      </div>
                    </div>
                  </td>
                  <td className={`px-4 py-3 ${ACTION_COLOR[l.actionType] ?? ""}`}>{l.action}</td>
                  <td className="px-4 py-3 text-muted-foreground">{l.target}</td>
                  <td className="px-4 py-3"><Badge variant="secondary">{l.campus}</Badge></td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{l.ip}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between px-4 py-3 border-t border-border text-xs text-muted-foreground">
          <span>Showing 1–{rows.length} of {mockAuditLog.length}</span>
          <div className="flex gap-1.5">
            <Button variant="outline" size="sm" disabled>Previous</Button>
            <Button variant="outline" size="sm">Next</Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default SuperAdminAuditLog;
