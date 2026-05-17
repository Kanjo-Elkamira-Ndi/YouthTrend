import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Plus, Search, Settings2, PowerOff, Trash2, TriangleAlert, X } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { InlineError } from "@/components/common/InlineError";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { api, unwrap } from "@/lib/api";
import { toast } from "sonner";
import type { CampusRow } from "@/types/campus";

const STATUS_FILTERS = ["All", "Active", "Inactive"] as const;
const CAMPUS_EMOJI = ["🏫", "🌊", "📚", "🎓", "🏔️", "🏛️", "🌴", "🏗️"];

const SuperAdminCampuses = () => {
  const queryClient = useQueryClient();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<typeof STATUS_FILTERS[number]>("All");
  const [domains, setDomains] = useState<string[]>([]);
  const [domainInput, setDomainInput] = useState("");
  const [selected, setSelected] = useState<CampusRow | null>(null);
  const [createName, setCreateName] = useState("");
  const [createShort, setCreateShort] = useState("");
  const [createDesc, setCreateDesc] = useState("");

  const { data: campusesData, isLoading, isError, refetch } = useQuery({
    queryKey: ["campuses", "all"],
    queryFn: () => api.get("/campuses?includeInactive=true").then(unwrap) as Promise<CampusRow[]>,
  });

  const createMutation = useMutation({
    mutationFn: (data: { name: string; shortCode: string; description?: string; allowedDomains?: string[] }) =>
      api.post("/campuses", data).then(unwrap),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campuses"] });
      toast.success("Campus created");
      setCreateName(""); setCreateShort(""); setCreateDesc(""); setDomains([]);
    },
    onError: () => toast.error("Failed to create campus"),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, newStatus }: { id: string; newStatus: "active" | "inactive" }) =>
      api.patch(`/campuses/${id}/status`, { status: newStatus }).then(unwrap),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campuses"] });
      toast.success("Status updated");
    },
    onError: () => toast.error("Failed to update status"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/campuses/${id}`, { data: { confirm: "DELETE" } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campuses"] });
      toast.success("Campus deleted");
      setSelected(null);
    },
    onError: () => toast.error("Failed to delete campus"),
  });

  const rows = useMemo(() => {
    if (!campusesData) return [];
    return campusesData.filter((c) => {
      if (status !== "All" && c.status !== status.toLowerCase()) return false;
      if (q && !`${c.name} ${c.short_code}`.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [campusesData, q, status]);

  const addDomain = () => {
    const v = domainInput.trim().toLowerCase();
    if (v && !domains.includes(v)) setDomains([...domains, v]);
    setDomainInput("");
  };

  const getEmoji = (idx: number) => CAMPUS_EMOJI[idx % CAMPUS_EMOJI.length];

  if (isLoading) {
    return (
      <div className="p-4 lg:p-6 space-y-5">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-4 lg:p-6">
        <InlineError message="Failed to load campuses" onRetry={refetch} />
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="p-4 lg:p-6 space-y-5">
      <div className="flex flex-col lg:flex-row lg:items-center gap-3">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold">Campus Management</h2>
          <Badge variant="secondary">{campusesData?.length ?? 0}</Badge>
        </div>
        <div className="lg:ml-auto flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="h-4 w-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search campuses…" className="pl-8 h-9 w-56" />
          </div>
          <div className="inline-flex rounded-md border border-border p-0.5 text-xs">
            {STATUS_FILTERS.map((s) => (
              <button key={s}
                onClick={() => setStatus(s)}
                className={`px-3 h-8 rounded-sm font-medium ${status === s ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                {s}
              </button>
            ))}
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="h-9"><Plus className="h-4 w-4 mr-1" /> Add Campus</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Campus</DialogTitle>
                <DialogDescription>Onboard a new university to YouthTrend.</DialogDescription>
              </DialogHeader>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold">Campus Name</label>
                  <Input placeholder="University of Bamenda" value={createName} onChange={(e) => setCreateName(e.target.value)} />
                </div>
                <div>
                  <label className="text-xs font-semibold">Short Code</label>
                  <Input placeholder="UBA" maxLength={6} className="uppercase" value={createShort} onChange={(e) => setCreateShort(e.target.value)} />
                </div>
                <div>
                  <label className="text-xs font-semibold">Description</label>
                  <Textarea placeholder="Brief description of the campus…" value={createDesc} onChange={(e) => setCreateDesc(e.target.value)} />
                </div>
                <div>
                  <label className="text-xs font-semibold">Allowed Email Domains</label>
                  <div className="flex flex-wrap gap-1.5 mt-1.5 mb-2">
                    {domains.map((d) => (
                      <span key={d} className="inline-flex items-center gap-1 px-2 h-6 rounded-full bg-secondary text-xs">
                        {d}
                        <button onClick={() => setDomains(domains.filter((x) => x !== d))}><X className="h-3 w-3" /></button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input value={domainInput} onChange={(e) => setDomainInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addDomain())} placeholder="ub.cm" />
                    <Button type="button" variant="outline" onClick={addDomain}>Add</Button>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  disabled={!createName || !createShort || createMutation.isPending}
                  onClick={() => createMutation.mutate({ name: createName, shortCode: createShort, description: createDesc || undefined, allowedDomains: domains.length > 0 ? domains : undefined })}
                >
                  {createMutation.isPending ? "Creating..." : "Create Campus"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="yt-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary/50 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left">Campus</th>
                <th className="px-4 py-3 text-left">Short</th>
                <th className="px-4 py-3 text-right">Users</th>
                <th className="px-4 py-3 text-right">Posts</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Joined</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((c, idx) => (
                <tr key={c.id} className="border-t border-border hover:bg-secondary/40 cursor-pointer" onClick={() => setSelected(c)}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{getEmoji(idx)}</span>
                      <div className="font-semibold">{c.name}</div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="secondary" className="text-[10px]">{c.short_code}</Badge>
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">{(c.member_count ?? 0).toLocaleString()}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{(c.post_count ?? 0).toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <Badge className={c.status === "active" ? "bg-primary/15 text-primary hover:bg-primary/15" : "bg-red-500/15 text-red-400 hover:bg-red-500/15"}>
                      {c.status === "active" ? "Active" : "Inactive"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{new Date(c.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1">
                      <Tooltip><TooltipTrigger asChild><button className="h-8 w-8 inline-flex items-center justify-center rounded-md hover:bg-secondary"><Settings2 className="h-4 w-4" /></button></TooltipTrigger><TooltipContent>Manage settings</TooltipContent></Tooltip>
                      <AlertDialog>
                        <Tooltip><TooltipTrigger asChild><AlertDialogTrigger asChild><button className="h-8 w-8 inline-flex items-center justify-center rounded-md hover:bg-amber-500/10 text-amber-400"><PowerOff className="h-4 w-4" /></button></AlertDialogTrigger></TooltipTrigger><TooltipContent>{c.status === "active" ? "Deactivate" : "Activate"}</TooltipContent></Tooltip>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>{c.status === "active" ? "Deactivate" : "Activate"} {c.name}?</AlertDialogTitle>
                            <AlertDialogDescription>
                              {c.status === "active"
                                ? "Users on this campus will not be able to post until re-activated."
                                : "Users on this campus will regain access to posting."}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => statusMutation.mutate({ id: c.id, newStatus: c.status === "active" ? "inactive" : "active" })}>
                              {c.status === "active" ? "Deactivate" : "Activate"}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                      <AlertDialog>
                        <Tooltip><TooltipTrigger asChild><AlertDialogTrigger asChild><button className="h-8 w-8 inline-flex items-center justify-center rounded-md bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20"><Trash2 className="h-4 w-4" /></button></AlertDialogTrigger></TooltipTrigger><TooltipContent>Delete</TooltipContent></Tooltip>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle className="flex items-center gap-2"><TriangleAlert className="h-5 w-5 text-red-400" /> Delete {c.name}?</AlertDialogTitle>
                            <AlertDialogDescription>This action cannot be undone. All users, posts and data tied to this campus will be permanently removed.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction className="bg-red-500 hover:bg-red-600" onClick={() => deleteMutation.mutate(c.id)}>Delete Permanently</AlertDialogAction>
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
      </div>

      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          {selected && (
            <>
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <span className="text-2xl">{getEmoji(campusesData?.indexOf(selected) ?? 0)}</span>
                  {selected.name}
                </SheetTitle>
              </SheetHeader>
              <div className="mt-4 space-y-5">
                <div className="h-32 rounded-lg bg-gradient-to-br from-primary/30 to-primary/5 border border-border flex items-center justify-center text-5xl">
                  {getEmoji(campusesData?.indexOf(selected) ?? 0)}
                </div>
                <p className="text-sm text-muted-foreground">{selected.description || "No description"}</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="yt-card p-3"><div className="text-xs text-muted-foreground">Users</div><div className="text-xl font-bold">{(selected.member_count ?? 0).toLocaleString()}</div></div>
                  <div className="yt-card p-3"><div className="text-xs text-muted-foreground">Posts</div><div className="text-xl font-bold">{(selected.post_count ?? 0).toLocaleString()}</div></div>
                </div>
                <div className="text-xs text-muted-foreground">Created: {new Date(selected.created_at).toLocaleDateString()}</div>
                <Button variant="outline" className="w-full">Open Campus Admin Panel →</Button>
                <div className="border-t border-red-500/20 pt-4 space-y-2">
                  <Button
                    variant="outline"
                    className="w-full bg-amber-500/10 border-amber-500/20 text-amber-400 hover:bg-amber-500/20"
                    onClick={() => {
                      statusMutation.mutate({ id: selected.id, newStatus: selected.status === "active" ? "inactive" : "active" });
                      setSelected(null);
                    }}
                  >
                    {selected.status === "active" ? "Deactivate" : "Activate"}
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20"
                    onClick={() => deleteMutation.mutate(selected.id)}
                  >
                    Delete Campus
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </motion.div>
  );
};

export default SuperAdminCampuses;
