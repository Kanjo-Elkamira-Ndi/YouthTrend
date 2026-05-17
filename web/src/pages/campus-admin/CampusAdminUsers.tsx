import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Plus, MoreHorizontal, UserCheck, ShieldCheck, UserX, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, unwrapPaginated, unwrap } from "@/lib/api";
import { toast } from "sonner";
import type { UserListItem } from "@/types/user";
import { TableSkeleton } from "@/components/common/Skeletons";

const roleClass: Record<string, string> = {
  writer: "bg-primary/15 text-primary border-primary/20",
  reader: "bg-secondary text-secondary-foreground border-border",
  moderator: "bg-amber-500/15 text-amber-600 border-amber-500/20",
  suspended: "bg-red-500/10 text-red-500 border-red-500/20",
};

const CampusAdminUsers = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState("all");
  const [q, setQ] = useState("");

  const filters: Record<string, unknown> = { page };
  if (filter !== "all") filters.role = filter;
  if (q) filters.search = q;

  const { data, isLoading, isError } = useQuery({
    queryKey: ['campus-users', filters],
    queryFn: () => api.get('/users/campus/list', { params: filters }).then(unwrapPaginated<UserListItem>),
  });

  const roleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: string }) =>
      api.patch('/users/campus/' + userId + '/role', { role }).then(unwrap),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['campus-users'] }); toast.success('Role updated.'); },
    onError: () => toast.error('Failed to update role.'),
  });

  const statusMutation = useMutation({
    mutationFn: ({ userId, status }: { userId: string; status: string }) =>
      api.patch('/users/campus/' + userId + '/status', { status }).then(unwrap),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['campus-users'] }); toast.success('Status updated.'); },
    onError: () => toast.error('Failed to update status.'),
  });

  const inviteMutation = useMutation({
    mutationFn: ({ emails, role }: { emails: string[]; role: string }) =>
      api.post('/users/campus/invite', { emails, role }).then(unwrap),
    onSuccess: () => toast.success('Invitations sent.'),
    onError: () => toast.error('Failed to send invitations.'),
  });

  const users = data?.data ?? [];
  const meta = data?.meta;

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="p-4 lg:p-8 max-w-[1400px] mx-auto w-full space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-extrabold">Users</h2>
          <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-primary/10 text-primary border border-primary/20">{meta?.total ?? 0}</span>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 lg:items-center">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} placeholder="Search users..." className="pl-8 w-full sm:w-56" />
          </div>
          <Select value={filter} onValueChange={(v) => { setFilter(v); setPage(1); }}>
            <SelectTrigger className="w-full sm:w-44"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="writer">Writers</SelectItem>
              <SelectItem value="reader">Readers</SelectItem>
              <SelectItem value="moderator">Moderators</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
            </SelectContent>
          </Select>
          <InviteUserDialog onInvite={(emails, role) => inviteMutation.mutate({ emails, role })} />
        </div>
      </div>

      {isLoading ? <TableSkeleton /> : isError ? (
        <div className="text-center py-12 text-muted-foreground">Failed to load users.</div>
      ) : (
        <div className="yt-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-secondary/40">
                <tr className="text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="text-left font-semibold px-5 py-3">User</th>
                  <th className="text-left font-semibold px-2 py-3">Role</th>
                  <th className="text-left font-semibold px-2 py-3">Campus</th>
                  <th className="text-left font-semibold px-2 py-3">Joined</th>
                  <th className="text-left font-semibold px-2 py-3">Status</th>
                  <th className="text-right font-semibold px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u, i) => (
                  <tr key={u.id} className={i % 2 === 1 ? "bg-muted/30" : ""}>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <img src={u.avatar_url ?? ''} alt="" className="h-9 w-9 rounded-full object-cover ring-1 ring-border" />
                        <div className="min-w-0">
                          <div className="font-semibold truncate">{u.full_name}</div>
                          <div className="text-xs text-muted-foreground truncate">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-2 py-3">
                      <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${roleClass[u.role] ?? ''}`}>{u.role}</span>
                    </td>
                    <td className="px-2 py-3 text-muted-foreground">{u.campus_name}</td>
                    <td className="px-2 py-3 text-muted-foreground text-xs">{new Date(u.created_at).toLocaleDateString()}</td>
                    <td className="px-2 py-3">
                      <div className="inline-flex items-center gap-2 text-xs">
                        <span className={`h-2 w-2 rounded-full ${u.status === 'active' ? 'bg-primary' : 'bg-red-500'}`} />
                        {u.status}
                      </div>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger className="h-8 w-8 inline-flex items-center justify-center rounded-md hover:bg-secondary">
                          <MoreHorizontal className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-52">
                          <DropdownMenuItem onClick={() => statusMutation.mutate({ userId: u.id, status: 'active' })}>
                            <UserCheck className="h-4 w-4 mr-2" /> Approve / Activate
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => roleMutation.mutate({ userId: u.id, role: 'moderator' })}>
                            <ShieldCheck className="h-4 w-4 mr-2" /> Promote to Moderator
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => statusMutation.mutate({ userId: u.id, status: 'suspended' })}>
                            <UserX className="h-4 w-4 mr-2" /> Suspend
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-500 focus:text-red-500">
                            <Trash2 className="h-4 w-4 mr-2" /> Remove from campus
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {meta && (
        <div className="flex items-center justify-between text-sm">
          <div className="text-muted-foreground">Showing {((meta.page - 1) * meta.perPage) + 1}-{Math.min(meta.page * meta.perPage, meta.total)} of {meta.total} users</div>
          <div className="flex items-center gap-1">
            <Button size="sm" variant="outline" disabled={!meta.hasPrev} onClick={() => setPage(p => p - 1)}><ChevronLeft className="h-4 w-4" /></Button>
            {Array.from({ length: meta.totalPages }, (_, i) => i + 1).slice(0, 4).map((p) => (
              <Button key={p} size="sm" variant={p === page ? "default" : "outline"} onClick={() => setPage(p)}>{p}</Button>
            ))}
            <Button size="sm" variant="outline" disabled={!meta.hasNext} onClick={() => setPage(p => p + 1)}><ChevronRight className="h-4 w-4" /></Button>
          </div>
        </div>
      )}
    </motion.div>
  );
};

const InviteUserDialog = ({ onInvite }: { onInvite: (emails: string[], role: string) => void }) => {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [bulkEmails, setBulkEmails] = useState("");
  const [role, setRole] = useState("reader");

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-1.5"><Plus className="h-4 w-4" /> Invite User</Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Invite a new user</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold">Email address</label>
            <Input placeholder="student@uy1.cm" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold">Role</label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="reader">Reader</SelectItem>
                <SelectItem value="writer">Writer</SelectItem>
                <SelectItem value="moderator">Moderator</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button className="w-full" onClick={() => { onInvite([email], role); setOpen(false); }}>Send Invite</Button>

          <div className="border-t border-border pt-4">
            <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Bulk invite</div>
            <Textarea rows={3} placeholder="comma,separated,emails@uy1.cm" value={bulkEmails} onChange={(e) => setBulkEmails(e.target.value)} />
            <div className="mt-2 flex gap-2">
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger className="flex-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="reader">Reader</SelectItem>
                  <SelectItem value="writer">Writer</SelectItem>
                  <SelectItem value="moderator">Moderator</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={() => {
                const emails = bulkEmails.split(',').map(e => e.trim()).filter(Boolean);
                if (emails.length) { onInvite(emails, role); setOpen(false); }
              }}>Send All</Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CampusAdminUsers;
