import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Pin, Eye, EyeOff, Trash2, MessageCircle, Hand } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CategoryPills } from "@/components/feed/CategoryPills";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { mockRecentPosts } from "@/mock/campusAdmin";
import { Link } from "react-router-dom";

const StatusBadge = ({ s }: { s: string }) => {
  const map: Record<string, string> = {
    Published: "bg-primary/15 text-primary border-primary/20",
    Draft: "bg-muted text-muted-foreground border-border",
    "Taken Down": "bg-red-500/10 text-red-500 border-red-500/20",
    Pinned: "bg-primary/15 text-primary border-primary/20",
  };
  return <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${map[s] ?? ""}`}>{s}</span>;
};

const CampusAdminContent = () => {
  const [filter, setFilter] = useState("All");
  const pinnedCount = mockRecentPosts.filter((p) => p.pinned).length;

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="p-4 lg:p-8 max-w-[1400px] mx-auto w-full space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-extrabold">Posts</h2>
          <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-primary/10 text-primary border border-primary/20">{mockRecentPosts.length}</span>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search posts..." className="pl-8 w-full sm:w-56" />
          </div>
          <Select defaultValue="newest">
            <SelectTrigger className="w-full sm:w-44"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="claps">Most Claps</SelectItem>
              <SelectItem value="comments">Most Comments</SelectItem>
              <SelectItem value="reported">Most Reported</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <CategoryPills active={filter} onChange={setFilter} options={["Published", "Draft", "Taken Down", "Pinned"]} />

      {pinnedCount > 0 && (
        <div className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 flex items-center gap-3 text-sm">
          <Pin className="h-4 w-4 text-primary" />
          <span><strong>{pinnedCount} posts</strong> pinned to campus feed</span>
          <Link to="#" className="ml-auto text-xs font-semibold text-primary hover:underline">Manage Pins →</Link>
        </div>
      )}

      <div className="yt-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary/40">
              <tr className="text-xs uppercase tracking-wider text-muted-foreground">
                <th className="text-left font-semibold px-5 py-3">Cover</th>
                <th className="text-left font-semibold px-2 py-3">Title</th>
                <th className="text-left font-semibold px-2 py-3">Author</th>
                <th className="text-left font-semibold px-2 py-3">Category</th>
                <th className="text-left font-semibold px-2 py-3">Stats</th>
                <th className="text-left font-semibold px-2 py-3">Status</th>
                <th className="text-left font-semibold px-2 py-3">Date</th>
                <th className="text-right font-semibold px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {mockRecentPosts.map((p, i) => (
                <tr key={p.id} className={i % 2 === 1 ? "bg-muted/30" : ""}>
                  <td className="px-5 py-3">
                    <img src={p.cover} alt="" className="h-12 w-12 rounded-md object-cover" />
                  </td>
                  <td className="px-2 py-3 max-w-[280px]">
                    <div className="font-semibold truncate">{p.title}</div>
                    <div className="text-xs text-muted-foreground line-clamp-2">{p.excerpt}</div>
                  </td>
                  <td className="px-2 py-3">
                    <div className="flex items-center gap-2">
                      <img src={p.author.avatar} alt="" className="h-7 w-7 rounded-full" />
                      <span className="text-xs font-medium truncate max-w-[110px]">{p.author.name}</span>
                    </div>
                  </td>
                  <td className="px-2 py-3"><Badge variant="secondary">{p.category}</Badge></td>
                  <td className="px-2 py-3">
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1"><Hand className="h-3.5 w-3.5" />{p.claps}</span>
                      <span className="inline-flex items-center gap-1"><MessageCircle className="h-3.5 w-3.5" />{p.comments}</span>
                    </div>
                  </td>
                  <td className="px-2 py-3"><StatusBadge s={p.status} /></td>
                  <td className="px-2 py-3 text-xs text-muted-foreground">{p.date}</td>
                  <td className="px-5 py-3 text-right">
                    <div className="inline-flex items-center gap-0.5">
                      <button title={p.pinned ? "Unpin" : "Pin"} className={`h-8 w-8 inline-flex items-center justify-center rounded-md hover:bg-secondary ${p.pinned ? "text-primary" : ""}`}>
                        <Pin className={`h-4 w-4 ${p.pinned ? "fill-current" : ""}`} />
                      </button>
                      <a href={`/post/${p.id}`} target="_blank" rel="noreferrer" title="View" className="h-8 w-8 inline-flex items-center justify-center rounded-md hover:bg-secondary"><Eye className="h-4 w-4" /></a>
                      <button title="Take down" className="h-8 w-8 inline-flex items-center justify-center rounded-md hover:bg-secondary"><EyeOff className="h-4 w-4" /></button>
                      <button title="Delete" className="h-8 w-8 inline-flex items-center justify-center rounded-md hover:bg-red-500/10 text-red-500"><Trash2 className="h-4 w-4" /></button>
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

export default CampusAdminContent;
