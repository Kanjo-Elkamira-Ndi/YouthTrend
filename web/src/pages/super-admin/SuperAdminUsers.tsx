import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Search, Download, Eye, ShieldCheck, UserX, Ban, Trash2, TriangleAlert } from "lucide-react";
import { Link } from "react-router-dom";
import { mockAllUsers } from "@/mock/superAdmin";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

const CAMPUSES = ["All", "UY1", "UB", "IUBS", "UDL", "UB2", "Platform"];
const ROLES = ["All", "Super Admin", "Campus Admin", "Moderator", "Writer", "Reader"];
const STATUSES = ["All", "Active", "Suspended", "Banned"];

const ROLE_COLOR: Record<string, string> = {
  "Super Admin":  "bg-primary/15 text-primary",
  "Campus Admin": "bg-amber-500/15 text-amber-400",
  "Moderator":    "bg-blue-500/15 text-blue-400",
  "Writer":       "bg-secondary text-foreground",
  "Reader":       "bg-secondary text-muted-foreground",
};

const SuperAdminUsers = () => {
  const [q, setQ] = useState("");
  const [campus, setCampus] = useState("All");
  const [role, setRole] = useState("All");
  const [status, setStatus] = useState("All");
  const [selected, setSelected] = useState<typeof mockAllUsers[number] | null>(null);

  const rows = useMemo(() =>
    mockAllUsers.filter((u) => {
      if (q && !`${u.name} ${u.email}`.toLowerCase().includes(q.toLowerCase())) return false;
      if (campus !== "All" && u.campus !== campus) return false;
      if (role !== "All" && u.role !== role) return false;
      if (status !== "All" && u.status !== status) return false;
      return true;
    }), [q, campus, role, status]);

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="p-4 lg:p-6 space-y-5">
      {/* Top */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-3">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold">All Users</h2>
          <Badge variant="secondary">{mockAllUsers.length.toLocaleString()}</Badge>
        </div>
        <div className="lg:ml-auto flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="h-4 w-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Name or email…" className="pl-8 h-9 w-60" />
          </div>
          <Select value={campus} onValueChange={setCampus}><SelectTrigger className="w-[120px] h-9"><SelectValue /></SelectTrigger><SelectContent>{CAMPUSES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select>
          <Select value={role} onValueChange={setRole}><SelectTrigger className="w-[150px] h-9"><SelectValue /></SelectTrigger><SelectContent>{ROLES.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent></Select>
          <Select value={status} onValueChange={setStatus}><SelectTrigger className="w-[120px] h-9"><SelectValue /></SelectTrigger><SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select>
          <Button variant="outline" className="h-9"><Download className="h-4 w-4 mr-1.5" /> Export CSV</Button>
        </div>
      </div>

      <div className="yt-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary/50 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left">User</th>
                <th className="px-4 py-3 text-left">Campus</th>
                <th className="px-4 py-3 text-left">Role</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-right">Posts</th>
                <th className="px-4 py-3 text-left">Joined</th>
                <th className="px-4 py-3 text-left">Last active</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((u) => (
                <tr key={u.id} className="border-t border-border hover:bg-secondary/40 cursor-pointer" onClick={() => setSelected(u)}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <img src={u.avatar} alt="" className="h-8 w-8 rounded-full" />
                      <div>
                        <div className="font-semibold">{u.name}</div>
                        <div className="text-xs text-muted-foreground">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3"><Badge variant="secondary">{u.campus}</Badge></td>
                  <td className="px-4 py-3"><Badge className={`${ROLE_COLOR[u.role] ?? ""} hover:${ROLE_COLOR[u.role] ?? ""}`}>{u.role}</Badge></td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1.5 text-xs">
                      <span className={`h-1.5 w-1.5 rounded-full ${u.status === "Active" ? "bg-primary" : u.status === "Suspended" ? "bg-amber-400" : "bg-red-500"}`} />
                      {u.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">{u.posts}</td>
                  <td className="px-4 py-3 text-muted-foreground">{u.joined}</td>
                  <td className="px-4 py-3 text-muted-foreground">{u.lastActive}</td>
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1">
                      <Tooltip><TooltipTrigger asChild><Link to={`/profile/${u.name.toLowerCase().replace(/\s+/g, ".")}`} className="h-8 w-8 inline-flex items-center justify-center rounded-md hover:bg-secondary"><Eye className="h-4 w-4" /></Link></TooltipTrigger><TooltipContent>View profile</TooltipContent></Tooltip>
                      <Popover>
                        <Tooltip><TooltipTrigger asChild><PopoverTrigger asChild><button className="h-8 w-8 inline-flex items-center justify-center rounded-md hover:bg-secondary"><ShieldCheck className="h-4 w-4" /></button></PopoverTrigger></TooltipTrigger><TooltipContent>Change role</TooltipContent></Tooltip>
                        <PopoverContent className="w-56">
                          <div className="text-xs font-semibold mb-2">Change role</div>
                          <Select defaultValue={u.role}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{ROLES.filter((r) => r !== "All").map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent></Select>
                          <Button size="sm" className="w-full mt-2">Apply</Button>
                        </PopoverContent>
                      </Popover>
                      <AlertDialog>
                        <Tooltip><TooltipTrigger asChild><AlertDialogTrigger asChild><button className="h-8 w-8 inline-flex items-center justify-center rounded-md hover:bg-amber-500/10 text-amber-400"><UserX className="h-4 w-4" /></button></AlertDialogTrigger></TooltipTrigger><TooltipContent>Suspend</TooltipContent></Tooltip>
                        <AlertDialogContent>
                          <AlertDialogHeader><AlertDialogTitle>Suspend {u.name}?</AlertDialogTitle><AlertDialogDescription>The user will be unable to post or comment until reinstated.</AlertDialogDescription></AlertDialogHeader>
                          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction>Suspend</AlertDialogAction></AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                      <AlertDialog>
                        <Tooltip><TooltipTrigger asChild><AlertDialogTrigger asChild><button className="h-8 w-8 inline-flex items-center justify-center rounded-md bg-red-500/10 text-red-400 hover:bg-red-500/20"><Ban className="h-4 w-4" /></button></AlertDialogTrigger></TooltipTrigger><TooltipContent>Platform ban</TooltipContent></Tooltip>
                        <AlertDialogContent>
                          <AlertDialogHeader><AlertDialogTitle className="flex items-center gap-2"><TriangleAlert className="h-5 w-5 text-red-400" /> Ban {u.name} platform-wide?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone. The user will be banned from every campus on YouthTrend.</AlertDialogDescription></AlertDialogHeader>
                          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction className="bg-red-500 hover:bg-red-600">Ban Permanently</AlertDialogAction></AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                      <AlertDialog>
                        <Tooltip><TooltipTrigger asChild><AlertDialogTrigger asChild><button className="h-8 w-8 inline-flex items-center justify-center rounded-md bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20"><Trash2 className="h-4 w-4" /></button></AlertDialogTrigger></TooltipTrigger><TooltipContent>Delete account</TooltipContent></Tooltip>
                        <AlertDialogContent>
                          <AlertDialogHeader><AlertDialogTitle className="flex items-center gap-2"><TriangleAlert className="h-5 w-5 text-red-400" /> Delete account?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone. All posts, comments and data for {u.name} will be permanently removed.</AlertDialogDescription></AlertDialogHeader>
                          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction className="bg-red-500 hover:bg-red-600">Delete Permanently</AlertDialogAction></AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between px-4 py-3 border-t border-border text-xs text-muted-foreground">
          <span>Showing 1–{rows.length} of {mockAllUsers.length}</span>
          <div className="flex gap-1.5">
            <Button variant="outline" size="sm" disabled>Previous</Button>
            <Button variant="outline" size="sm">Next</Button>
          </div>
        </div>
      </div>

      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          {selected && (
            <>
              <SheetHeader><SheetTitle>User Details</SheetTitle></SheetHeader>
              <div className="mt-4 space-y-5">
                <div className="flex items-center gap-3">
                  <img src={selected.avatar} alt="" className="h-14 w-14 rounded-full" />
                  <div>
                    <div className="font-bold">{selected.name}</div>
                    <div className="text-xs text-muted-foreground">{selected.email}</div>
                    <div className="flex gap-1.5 mt-1">
                      <Badge variant="secondary">{selected.campus}</Badge>
                      <Badge className={`${ROLE_COLOR[selected.role]} hover:${ROLE_COLOR[selected.role]}`}>{selected.role}</Badge>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="yt-card p-3"><div className="text-muted-foreground">Joined</div><div className="font-semibold">{selected.joined}</div></div>
                  <div className="yt-card p-3"><div className="text-muted-foreground">Last active</div><div className="font-semibold">{selected.lastActive}</div></div>
                </div>
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="yt-card p-2"><div className="text-lg font-bold">{selected.posts}</div><div className="text-[10px] text-muted-foreground">Posts</div></div>
                  <div className="yt-card p-2"><div className="text-lg font-bold">{selected.posts * 14}</div><div className="text-[10px] text-muted-foreground">Claps</div></div>
                  <div className="yt-card p-2"><div className="text-lg font-bold">{selected.posts * 2}</div><div className="text-[10px] text-muted-foreground">Comments</div></div>
                  <div className="yt-card p-2"><div className="text-lg font-bold text-red-400">0</div><div className="text-[10px] text-muted-foreground">Reports</div></div>
                </div>
                <div>
                  <div className="text-sm font-semibold mb-2">Recent posts</div>
                  <div className="space-y-1.5">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="yt-card p-2.5 flex items-center justify-between">
                        <div className="text-sm">Sample post title {i + 1}</div>
                        <div className="text-[10px] text-muted-foreground">Apr {20 - i}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="border-t border-red-500/20 pt-4 grid grid-cols-3 gap-2">
                  <Button variant="outline" className="bg-amber-500/10 border-amber-500/20 text-amber-400">Suspend</Button>
                  <Button variant="outline" className="bg-red-500/10 border-red-500/20 text-red-400">Ban</Button>
                  <Button variant="outline" className="bg-red-500/10 border-red-500/20 text-red-400">Delete</Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </motion.div>
  );
};

export default SuperAdminUsers;
