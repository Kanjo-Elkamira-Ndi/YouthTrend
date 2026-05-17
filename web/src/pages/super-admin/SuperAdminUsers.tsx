import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Search, Download, Eye, ShieldCheck, UserX, Ban, Trash2, TriangleAlert } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, unwrapPaginated, unwrap } from "@/lib/api";
import { toast } from "sonner";
import { TableSkeleton } from "@/components/common/Skeletons";
import type { UserListItem } from "@/types/user";

const CAMPUSES = ["All", "UY1", "UB", "IUBS", "UDL", "UB2", "Platform"];
const ROLES = ["All", "super_admin", "campus_admin", "moderator", "writer", "reader"];
const STATUSES = ["All", "active", "suspended", "banned"];

const ROLE_COLOR: Record<string, string> = {
  super_admin: "bg-primary/15 text-primary",
  campus_admin: "bg-amber-500/15 text-amber-400",
  moderator: "bg-blue-500/15 text-blue-400",
  writer: "bg-secondary text-foreground",
  reader: "bg-secondary text-muted-foreground",
};

const SuperAdminUsers = () => {
  const queryClient = useQueryClient();
  const [q, setQ] = useState("");
  const [campus, setCampus] = useState("All");
  const [role, setRole] = useState("All");
  const [status, setStatus] = useState("All");
  const [selected, setSelected] = useState<UserListItem | null>(null);
  const [page, setPage] = useState(1);

  const params: Record<string, unknown> = { page };
  if (q) params.search = q;
  if (campus !== "All") params.campusId = campus;
  if (role !== "All") params.role = role;
  if (status !== "All") params.status = status;

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['super-admin-users', params],
    queryFn: () => api.get('/users/admin/list', { params }).then(unwrapPaginated<UserListItem>),
  });

  const roleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: string }) =>
      api.patch('/users/admin/' + userId + '/role', { role }).then(unwrap),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['super-admin-users'] }); toast.success('Role updated.'); },
    onError: () => toast.error('Failed to update role.'),
  });

  const banMutation = useMutation({
    mutationFn: (userId: string) => api.patch('/users/admin/' + userId + '/ban').then(unwrap),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['super-admin-users'] }); toast.success('User banned.'); },
    onError: () => toast.error('Failed to ban user.'),
  });

  const deleteMutation = useMutation({
    mutationFn: (userId: string) => api.delete('/users/admin/' + userId, { data: { confirm: 'DELETE' } }).then(unwrap),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['super-admin-users'] }); toast.success('User deleted.'); },
    onError: () => toast.error('Failed to delete user.'),
  });

  const users = data?.data ?? [];
  const meta = data?.meta;

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="p-4 lg:p-6 space-y-5">
      <div className="flex flex-col lg:flex-row lg:items-center gap-3">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold">All Users</h2>
          <Badge variant="secondary">{meta?.total ?? 0}</Badge>
        </div>
        <div className="lg:ml-auto flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="h-4 w-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} placeholder="Name or email…" className="pl-8 h-9 w-60" />
          </div>
          <Select value={campus} onValueChange={(v) => { setCampus(v); setPage(1); }}><SelectTrigger className="w-[120px] h-9"><SelectValue /></SelectTrigger><SelectContent>{CAMPUSES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select>
          <Select value={role} onValueChange={(v) => { setRole(v); setPage(1); }}><SelectTrigger className="w-[150px] h-9"><SelectValue /></SelectTrigger><SelectContent>{ROLES.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent></Select>
          <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1); }}><SelectTrigger className="w-[120px] h-9"><SelectValue /></SelectTrigger><SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select>
          <Button variant="outline" className="h-9"><Download className="h-4 w-4 mr-1.5" /> Export CSV</Button>
        </div>
      </div>

      {isLoading ? <TableSkeleton /> : isError ? (
        <div className="text-center py-12 text-muted-foreground">Failed to load users. <Button variant="link" onClick={() => refetch()}>Retry</Button></div>
      ) : (
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
                {users.map((u) => (
                  <tr key={u.id} className="border-t border-border hover:bg-secondary/40 cursor-pointer" onClick={() => setSelected(u)}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <img src={u.avatar_url ?? ''} alt="" className="h-8 w-8 rounded-full" />
                        <div>
                          <div className="font-semibold">{u.full_name}</div>
                          <div className="text-xs text-muted-foreground">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3"><Badge variant="secondary">{u.campus_short_code ?? 'Platform'}</Badge></td>
                    <td className="px-4 py-3"><Badge className={`${ROLE_COLOR[u.role] ?? ''}`}>{u.role}</Badge></td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1.5 text-xs">
                        <span className={`h-1.5 w-1.5 rounded-full ${u.status === 'active' ? 'bg-primary' : u.status === 'suspended' ? 'bg-amber-400' : 'bg-red-500'}`} />
                        {u.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">{u.post_count}</td>
                    <td className="px-4 py-3 text-muted-foreground">{new Date(u.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-muted-foreground">{u.last_active_at ? new Date(u.last_active_at).toLocaleDateString() : 'Never'}</td>
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <Tooltip><TooltipTrigger asChild><button className="h-8 w-8 inline-flex items-center justify-center rounded-md hover:bg-secondary"><Eye className="h-4 w-4" /></button></TooltipTrigger><TooltipContent>View profile</TooltipContent></Tooltip>
                        <Popover>
                          <Tooltip><TooltipTrigger asChild><PopoverTrigger asChild><button className="h-8 w-8 inline-flex items-center justify-center rounded-md hover:bg-secondary"><ShieldCheck className="h-4 w-4" /></button></PopoverTrigger></TooltipTrigger><TooltipContent>Change role</TooltipContent></Tooltip>
                          <PopoverContent className="w-56">
                            <div className="text-xs font-semibold mb-2">Change role</div>
                            <Select onValueChange={(v) => roleMutation.mutate({ userId: u.id, role: v })}>
                              <SelectTrigger><SelectValue placeholder={u.role} /></SelectTrigger>
                              <SelectContent>{ROLES.filter((r) => r !== "All").map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                            </Select>
                          </PopoverContent>
                        </Popover>
                        <AlertDialog>
                          <Tooltip><TooltipTrigger asChild><AlertDialogTrigger asChild><button className="h-8 w-8 inline-flex items-center justify-center rounded-md bg-red-500/10 text-red-400 hover:bg-red-500/20"><Ban className="h-4 w-4" /></button></AlertDialogTrigger></TooltipTrigger><TooltipContent>Platform ban</TooltipContent></Tooltip>
                          <AlertDialogContent>
                            <AlertDialogHeader><AlertDialogTitle className="flex items-center gap-2"><TriangleAlert className="h-5 w-5 text-red-400" /> Ban {u.full_name} platform-wide?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone. The user will be banned from every campus.</AlertDialogDescription></AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction className="bg-red-500 hover:bg-red-600" onClick={() => banMutation.mutate(u.id)}>Ban Permanently</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                        <AlertDialog>
                          <Tooltip><TooltipTrigger asChild><AlertDialogTrigger asChild><button className="h-8 w-8 inline-flex items-center justify-center rounded-md bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20"><Trash2 className="h-4 w-4" /></button></AlertDialogTrigger></TooltipTrigger><TooltipContent>Delete account</TooltipContent></Tooltip>
                          <AlertDialogContent>
                            <AlertDialogHeader><AlertDialogTitle className="flex items-center gap-2"><TriangleAlert className="h-5 w-5 text-red-400" /> Delete account?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone. All data for {u.full_name} will be permanently removed.</AlertDialogDescription></AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction className="bg-red-500 hover:bg-red-600" onClick={() => deleteMutation.mutate(u.id)}>Delete Permanently</AlertDialogAction>
                            </AlertDialogFooter>
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
            <span>Showing 1–{users.length} of {meta?.total ?? 0}</span>
            <div className="flex gap-1.5">
              <Button variant="outline" size="sm" disabled={!meta?.hasPrev} onClick={() => setPage(p => p - 1)}>Previous</Button>
              <Button variant="outline" size="sm" disabled={!meta?.hasNext} onClick={() => setPage(p => p + 1)}>Next</Button>
            </div>
          </div>
        </div>
      )}

      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          {selected && (
            <>
              <SheetHeader><SheetTitle>User Details</SheetTitle></SheetHeader>
              <div className="mt-4 space-y-5">
                <div className="flex items-center gap-3">
                  <img src={selected.avatar_url ?? ''} alt="" className="h-14 w-14 rounded-full" />
                  <div>
                    <div className="font-bold">{selected.full_name}</div>
                    <div className="text-xs text-muted-foreground">{selected.email}</div>
                    <div className="flex gap-1.5 mt-1">
                      <Badge variant="secondary">{selected.campus_short_code ?? 'Platform'}</Badge>
                      <Badge className={ROLE_COLOR[selected.role]}>{selected.role}</Badge>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="yt-card p-3"><div className="text-muted-foreground">Joined</div><div className="font-semibold">{new Date(selected.created_at).toLocaleDateString()}</div></div>
                  <div className="yt-card p-3"><div className="text-muted-foreground">Last active</div><div className="font-semibold">{selected.last_active_at ? new Date(selected.last_active_at).toLocaleDateString() : 'Never'}</div></div>
                </div>
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="yt-card p-2"><div className="text-lg font-bold">{selected.post_count}</div><div className="text-[10px] text-muted-foreground">Posts</div></div>
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
