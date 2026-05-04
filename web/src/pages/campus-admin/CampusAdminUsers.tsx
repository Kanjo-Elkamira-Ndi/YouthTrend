import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Plus, MoreHorizontal, UserCheck, ShieldCheck, UserX, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { mockUsers, AdminUserRole } from "@/mock/campusAdmin";

const roleClass: Record<AdminUserRole, string> = {
  Writer: "bg-primary/15 text-primary border-primary/20",
  Reader: "bg-secondary text-secondary-foreground border-border",
  Moderator: "bg-amber-500/15 text-amber-600 border-amber-500/20",
  Suspended: "bg-red-500/10 text-red-500 border-red-500/20",
};

const CampusAdminUsers = () => {
  const [filter, setFilter] = useState("all");
  const [q, setQ] = useState("");

  const filtered = mockUsers.filter((u) => {
    if (filter !== "all" && u.role.toLowerCase() !== filter) return false;
    if (q && !`${u.name} ${u.email}`.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="p-4 lg:p-8 max-w-[1400px] mx-auto w-full space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-extrabold">Users</h2>
          <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-primary/10 text-primary border border-primary/20">{mockUsers.length}</span>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 lg:items-center">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search users..." className="pl-8 w-full sm:w-56" />
          </div>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-full sm:w-44"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="writer">Writers</SelectItem>
              <SelectItem value="reader">Readers</SelectItem>
              <SelectItem value="moderator">Moderators</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
            </SelectContent>
          </Select>
          <InviteUserDialog />
        </div>
      </div>

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
              {filtered.map((u, i) => (
                <tr key={u.id} className={i % 2 === 1 ? "bg-muted/30" : ""}>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <img src={u.avatar} alt="" className="h-9 w-9 rounded-full object-cover ring-1 ring-border" />
                      <div className="min-w-0">
                        <div className="font-semibold truncate">{u.name}</div>
                        <div className="text-xs text-muted-foreground truncate">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-2 py-3">
                    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${roleClass[u.role]}`}>{u.role}</span>
                  </td>
                  <td className="px-2 py-3 text-muted-foreground">{u.campus}</td>
                  <td className="px-2 py-3 text-muted-foreground text-xs">{u.joined}</td>
                  <td className="px-2 py-3">
                    <div className="inline-flex items-center gap-2 text-xs">
                      <span className={`h-2 w-2 rounded-full ${u.status === "Active" ? "bg-primary" : "bg-red-500"}`} />
                      {u.status}
                    </div>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger className="h-8 w-8 inline-flex items-center justify-center rounded-md hover:bg-secondary">
                        <MoreHorizontal className="h-4 w-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-52">
                        <DropdownMenuItem><UserCheck className="h-4 w-4 mr-2" /> Approve / Activate</DropdownMenuItem>
                        <DropdownMenuItem><ShieldCheck className="h-4 w-4 mr-2" /> Promote to Moderator</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem><UserX className="h-4 w-4 mr-2" /> Suspend</DropdownMenuItem>
                        <DropdownMenuItem className="text-red-500 focus:text-red-500"><Trash2 className="h-4 w-4 mr-2" /> Remove from campus</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm">
        <div className="text-muted-foreground">Showing 1–{filtered.length} of 84 users</div>
        <div className="flex items-center gap-1">
          <Button size="sm" variant="outline"><ChevronLeft className="h-4 w-4" /></Button>
          {[1, 2, 3, 4].map((p) => (
            <Button key={p} size="sm" variant={p === 1 ? "default" : "outline"}>{p}</Button>
          ))}
          <Button size="sm" variant="outline"><ChevronRight className="h-4 w-4" /></Button>
        </div>
      </div>
    </motion.div>
  );
};

const InviteUserDialog = () => (
  <Dialog>
    <DialogTrigger asChild>
      <Button className="gap-1.5"><Plus className="h-4 w-4" /> Invite User</Button>
    </DialogTrigger>
    <DialogContent className="max-w-md">
      <DialogHeader><DialogTitle>Invite a new user</DialogTitle></DialogHeader>
      <div className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold">Email address</label>
          <Input placeholder="student@uy1.cm" />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold">Role</label>
          <Select defaultValue="reader">
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="reader">Reader</SelectItem>
              <SelectItem value="writer">Writer</SelectItem>
              <SelectItem value="moderator">Moderator</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button className="w-full">Send Invite</Button>

        <div className="border-t border-border pt-4">
          <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Bulk invite</div>
          <Textarea rows={3} placeholder="comma,separated,emails@uy1.cm" />
          <div className="mt-2 flex gap-2">
            <Select defaultValue="reader">
              <SelectTrigger className="flex-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="reader">Reader</SelectItem>
                <SelectItem value="writer">Writer</SelectItem>
                <SelectItem value="moderator">Moderator</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">Send All</Button>
          </div>
        </div>
      </div>
    </DialogContent>
  </Dialog>
);

export default CampusAdminUsers;
