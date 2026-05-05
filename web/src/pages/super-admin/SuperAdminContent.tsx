import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Search, Eye, EyeOff, Flag, Trash2, TriangleAlert } from "lucide-react";
import { mockAllContent } from "@/mock/superAdmin";
import { CATEGORIES } from "@/lib/constants";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

const CAMPUSES = ["All", "UY1", "UB", "IUBS", "UDL", "UB2"];
const STATUSES = ["All", "Published", "Draft", "Taken Down"];
const SORTS = ["Newest", "Most Viewed", "Most Reported", "Most Claps"];

const STATUS_COLOR: Record<string, string> = {
  Published: "bg-primary/15 text-primary",
  Draft: "bg-secondary text-muted-foreground",
  "Taken Down": "bg-red-500/15 text-red-400",
};

const SuperAdminContent = () => {
  const [q, setQ] = useState("");
  const [campus, setCampus] = useState("All");
  const [category, setCategory] = useState("All");
  const [status, setStatus] = useState("All");
  const [sort, setSort] = useState("Newest");

  const rows = useMemo(() => {
    let r = mockAllContent.filter((p) => {
      if (q && !p.title.toLowerCase().includes(q.toLowerCase())) return false;
      if (campus !== "All" && p.campus !== campus) return false;
      if (category !== "All" && p.category !== category) return false;
      if (status !== "All" && p.status !== status) return false;
      return true;
    });
    if (sort === "Most Viewed") r = [...r].sort((a, b) => b.views - a.views);
    if (sort === "Most Reported") r = [...r].sort((a, b) => b.reports - a.reports);
    if (sort === "Most Claps") r = [...r].sort((a, b) => b.claps - a.claps);
    return r;
  }, [q, campus, category, status, sort]);

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="p-4 lg:p-6 space-y-5">
      <div className="flex flex-col lg:flex-row lg:items-center gap-3">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold">All Content</h2>
          <Badge variant="secondary">{mockAllContent.length.toLocaleString()}</Badge>
        </div>
        <div className="lg:ml-auto flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="h-4 w-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search posts…" className="pl-8 h-9 w-60" />
          </div>
          <Select value={campus} onValueChange={setCampus}><SelectTrigger className="w-[120px] h-9"><SelectValue /></SelectTrigger><SelectContent>{CAMPUSES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select>
          <Select value={category} onValueChange={setCategory}><SelectTrigger className="w-[140px] h-9"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="All">All</SelectItem>{CATEGORIES.map((c) => {
              const Icon = c.icon;
              return <SelectItem key={c.name} value={c.name}><Icon className="mr-2 h-3.5 w-3.5 inline" />{c.name}</SelectItem>;
            })}</SelectContent></Select>
          <Select value={status} onValueChange={setStatus}><SelectTrigger className="w-[140px] h-9"><SelectValue /></SelectTrigger><SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select>
          <Select value={sort} onValueChange={setSort}><SelectTrigger className="w-[150px] h-9"><SelectValue /></SelectTrigger><SelectContent>{SORTS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select>
        </div>
      </div>

      <div className="yt-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary/50 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left" colSpan={2}>Post</th>
                <th className="px-4 py-3 text-left">Author</th>
                <th className="px-4 py-3 text-left">Category</th>
                <th className="px-4 py-3 text-right">Stats</th>
                <th className="px-4 py-3 text-right">Reports</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => (
                <tr key={p.id} className="border-t border-border hover:bg-secondary/40">
                  <td className="px-4 py-3 w-14"><img src={p.cover} alt="" className="h-12 w-12 rounded-md object-cover" /></td>
                  <td className="px-4 py-3 max-w-xs">
                    <div className="font-semibold flex items-center gap-2">
                      {p.title}
                      {p.saOverride && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/20">SA OVERRIDE</span>}
                    </div>
                    <div className="text-xs text-muted-foreground line-clamp-1">{p.excerpt}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <img src={p.author.avatar} alt="" className="h-6 w-6 rounded-full" />
                      <div>
                        <div className="text-xs font-medium">{p.author.name}</div>
                        <Badge variant="secondary" className="text-[10px]">{p.campus}</Badge>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3"><Badge variant="secondary">{p.category}</Badge></td>
                  <td className="px-4 py-3 text-right text-xs text-muted-foreground tabular-nums">
                    {p.views.toLocaleString()}v · {p.claps}c · {p.comments}💬
                  </td>
                  <td className={`px-4 py-3 text-right tabular-nums ${p.reports > 0 ? "text-red-400 font-semibold" : "text-muted-foreground"}`}>{p.reports}</td>
                  <td className="px-4 py-3"><Badge className={`${STATUS_COLOR[p.status]} hover:${STATUS_COLOR[p.status]}`}>{p.status}</Badge></td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{p.date}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Tooltip><TooltipTrigger asChild><button className="h-8 w-8 inline-flex items-center justify-center rounded-md hover:bg-secondary"><Eye className="h-4 w-4" /></button></TooltipTrigger><TooltipContent>View</TooltipContent></Tooltip>
                      <AlertDialog>
                        <Tooltip><TooltipTrigger asChild><AlertDialogTrigger asChild><button className="h-8 w-8 inline-flex items-center justify-center rounded-md hover:bg-amber-500/10 text-amber-400"><EyeOff className="h-4 w-4" /></button></AlertDialogTrigger></TooltipTrigger><TooltipContent>Take down</TooltipContent></Tooltip>
                        <AlertDialogContent>
                          <AlertDialogHeader><AlertDialogTitle>Take down post?</AlertDialogTitle><AlertDialogDescription>The post will be hidden platform-wide. This is a Super Admin override.</AlertDialogDescription></AlertDialogHeader>
                          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction>Take Down</AlertDialogAction></AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                      <Tooltip><TooltipTrigger asChild><button className="h-8 w-8 inline-flex items-center justify-center rounded-md hover:bg-secondary"><Flag className="h-4 w-4" /></button></TooltipTrigger><TooltipContent>Escalate</TooltipContent></Tooltip>
                      <AlertDialog>
                        <Tooltip><TooltipTrigger asChild><AlertDialogTrigger asChild><button className="h-8 w-8 inline-flex items-center justify-center rounded-md bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20"><Trash2 className="h-4 w-4" /></button></AlertDialogTrigger></TooltipTrigger><TooltipContent>Hard delete</TooltipContent></Tooltip>
                        <AlertDialogContent>
                          <AlertDialogHeader><AlertDialogTitle className="flex items-center gap-2"><TriangleAlert className="h-5 w-5 text-red-400" /> Delete post?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone. The post and all its comments will be permanently removed.</AlertDialogDescription></AlertDialogHeader>
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
      </div>
    </motion.div>
  );
};

export default SuperAdminContent;
