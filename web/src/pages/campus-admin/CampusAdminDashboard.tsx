import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  UsersRound, FileText, ShieldAlert, Eye, TrendingUp, TrendingDown,
  AlertTriangle, MoreHorizontal, Pin, EyeOff, Trash2,
} from "lucide-react";
import {
  mockCampusStats, mockRecentPosts, mockTopWriters, mockActivityData,
} from "@/mock/campusAdmin";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  BarChart, Bar, XAxis, ResponsiveContainer, Tooltip,
} from "recharts";

const STAT_ICONS = { students: UsersRound, posts: FileText, reports: ShieldAlert, views: Eye } as const;

const StatusBadge = ({ s }: { s: string }) => {
  const map: Record<string, string> = {
    Published: "bg-primary/15 text-primary border-primary/20",
    Draft: "bg-muted text-muted-foreground border-border",
    "Taken Down": "bg-red-500/10 text-red-500 border-red-500/20",
    Pinned: "bg-primary/15 text-primary border-primary/20",
  };
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${map[s] ?? ""}`}>
      {s}
    </span>
  );
};

const CampusAdminDashboard = () => {
  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-[1400px] mx-auto w-full">
      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {mockCampusStats.map((s, i) => {
          const Icon = STAT_ICONS[s.key as keyof typeof STAT_ICONS];
          const TrendIcon = s.dir === "up" ? TrendingUp : TrendingDown;
          const trendColor = s.dir === "up" ? "text-primary" : "text-red-500";
          return (
            <motion.div
              key={s.key}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              className="yt-card p-5"
            >
              <div className="flex items-start justify-between">
                <div className="h-10 w-10 rounded-lg bg-primary/10 inline-flex items-center justify-center text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <div className={`flex items-center gap-1 text-xs font-semibold ${trendColor}`}>
                  <TrendIcon className="h-3.5 w-3.5" />
                  {s.trend}%
                </div>
              </div>
              <div className="mt-4 text-2xl font-extrabold tracking-tight">{s.value}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{s.label} · <span className="text-muted-foreground/70">{s.sub}</span></div>
            </motion.div>
          );
        })}
      </div>

      {/* Moderation alert banner */}
      <motion.div
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-l-4 border-amber-500 bg-amber-500/10 p-4 flex flex-col sm:flex-row sm:items-center gap-3"
      >
        <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
        <div className="text-sm text-amber-700 dark:text-amber-400 flex-1">
          You have <strong>12 posts</strong> pending moderation review.
        </div>
        <Button asChild size="sm" className="bg-amber-600 hover:bg-amber-700 text-white">
          <Link to="/campus-admin/moderation">Review Now →</Link>
        </Button>
      </motion.div>

      {/* Recent posts + top writers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="yt-card p-5 lg:col-span-2 overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold">Recent Posts</h2>
            <Link to="/campus-admin/content" className="text-xs font-semibold text-primary hover:underline">View All →</Link>
          </div>
          <div className="overflow-x-auto -mx-5">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="text-left font-semibold px-5 py-2">Author</th>
                  <th className="text-left font-semibold px-2 py-2">Title</th>
                  <th className="text-left font-semibold px-2 py-2">Category</th>
                  <th className="text-left font-semibold px-2 py-2">Status</th>
                  <th className="text-left font-semibold px-2 py-2">Date</th>
                  <th className="text-right font-semibold px-5 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {mockRecentPosts.slice(0, 5).map((p, i) => (
                  <tr key={p.id} className={i % 2 === 1 ? "bg-muted/40" : ""}>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <img src={p.author.avatar} alt="" className="h-7 w-7 rounded-full object-cover" />
                        <span className="font-medium truncate max-w-[120px]">{p.author.name}</span>
                      </div>
                    </td>
                    <td className="px-2 py-3 max-w-[280px]">
                      <div className="font-medium truncate">{p.title}</div>
                    </td>
                    <td className="px-2 py-3"><Badge variant="secondary">{p.category}</Badge></td>
                    <td className="px-2 py-3"><StatusBadge s={p.status} /></td>
                    <td className="px-2 py-3 text-muted-foreground text-xs">{p.date}</td>
                    <td className="px-5 py-3 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button className="h-8 w-8 inline-flex items-center justify-center rounded-md hover:bg-secondary"><Eye className="h-4 w-4" /></button>
                        <DropdownMenu>
                          <DropdownMenuTrigger className="h-8 w-8 inline-flex items-center justify-center rounded-md hover:bg-secondary">
                            <MoreHorizontal className="h-4 w-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem><Pin className="h-4 w-4 mr-2" /> Pin</DropdownMenuItem>
                            <DropdownMenuItem><EyeOff className="h-4 w-4 mr-2" /> Take Down</DropdownMenuItem>
                            <DropdownMenuItem className="text-red-500 focus:text-red-500"><Trash2 className="h-4 w-4 mr-2" /> Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="yt-card p-5">
          <h2 className="text-base font-bold mb-4">Top Writers This Month</h2>
          <ul className="space-y-1">
            {mockTopWriters.map((w) => (
              <li key={w.rank} className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/60 transition-colors">
                <span className="w-5 text-center text-sm font-extrabold text-primary">{w.rank}</span>
                <img src={w.avatar} alt="" className="h-9 w-9 rounded-full object-cover ring-1 ring-border" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold truncate">{w.name}</div>
                  <div className="text-[11px] text-muted-foreground truncate">{w.department}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-semibold">{w.posts} posts</div>
                  <div className="text-[11px] text-muted-foreground">{w.claps.toLocaleString()} claps</div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Activity chart */}
      <div className="yt-card p-5">
        <h2 className="text-base font-bold mb-4">Posts Published — Last 30 Days</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={mockActivityData}>
              <XAxis dataKey="date" tick={{ fontSize: 10 }} interval={3} stroke="hsl(var(--muted-foreground))" />
              <Tooltip
                contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
                cursor={{ fill: "hsl(var(--secondary))", opacity: 0.4 }}
              />
              <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default CampusAdminDashboard;
