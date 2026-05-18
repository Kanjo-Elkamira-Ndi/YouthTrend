import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Building2, UsersRound, FileText, Eye, ShieldAlert, TrendingUp, TrendingDown,
  UserPlus, UserX, Settings2, Megaphone, ArrowRight,
} from "lucide-react";
import { ResponsiveContainer, LineChart, Line } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { api, unwrap } from "@/lib/api";
import { FeedSkeleton } from "@/components/common/Skeletons";
import { InlineError } from "@/components/common/InlineError";
import type { PlatformStats, CampusHealth } from "@/types/analytics";

const STAT_ICONS: Record<string, any> = {
  campuses: Building2, users: UsersRound, posts: FileText, views: Eye, reports: ShieldAlert, growth: TrendingUp,
};

const ACT_ICONS: Record<string, any> = {
  UserPlus, FileText, ShieldAlert, UserX, Building2, Settings2, Megaphone,
};

const TONE: Record<string, string> = {
  green: "text-primary bg-primary/10",
  red:   "text-red-400 bg-red-500/10",
  muted: "text-muted-foreground bg-secondary",
};

const mockActivityFeed = [
  { id: 1, type: "campus",   icon: "UserPlus",    tone: "green" as const, text: "New campus registered: UDL",                  time: "10m ago" },
  { id: 2, type: "content",  icon: "FileText",    tone: "green" as const, text: "847 posts published today",                   time: "1h ago" },
  { id: 3, type: "report",   icon: "ShieldAlert", tone: "red" as const,   text: "6 new reports since yesterday",               time: "3h ago" },
  { id: 4, type: "user",     icon: "UserX",       tone: "red" as const,   text: "User banned: Linda Etoundi · UDL",            time: "5h ago" },
  { id: 5, type: "campus",   icon: "Building2",   tone: "green" as const, text: "Campus activated: IUBS",                      time: "Yesterday" },
  { id: 6, type: "settings", icon: "Settings2",   tone: "muted" as const, text: "Platform settings updated",                   time: "Yesterday" },
  { id: 7, type: "announce", icon: "Megaphone",   tone: "green" as const, text: "System announcement sent to all campuses",    time: "2d ago" },
  { id: 8, type: "user",     icon: "UserPlus",    tone: "green" as const, text: "312 new users this week",                     time: "2d ago" },
  { id: 9, type: "report",   icon: "ShieldAlert", tone: "red" as const,   text: "Escalation from UB: hate speech",             time: "3d ago" },
  { id: 10,type: "content",  icon: "FileText",    tone: "green" as const, text: "New category proposed: Tech",                 time: "4d ago" },
];

const SA_CAMPUS_EMOJIS: Record<string, string> = {
  uy1: "\u{1F3EB}", ub: "\u{1F30A}", iubs: "\u{1F4DA}", udl: "\u{1F393}", ub2: "\u{1F3D4}\uFE0F",
};

const spark = (seed: number) =>
  Array.from({ length: 7 }, (_, i) => ({
    d: i,
    v: Math.round(40 + Math.sin(i + seed) * 12 + (i * (seed % 5))),
  }));

const SuperAdminDashboard = () => {
  const { data: stats, isLoading: statsLoading, isError: statsError } = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: () => api.get('/admin/stats').then(unwrap<PlatformStats>),
  });

  const { data: campusHealth } = useQuery({
    queryKey: ['admin', 'campus-health'],
    queryFn: () => api.get('/admin/campus-health').then(unwrap<CampusHealth[]>),
  });

  if (statsLoading) return <div className="p-6"><FeedSkeleton /></div>;
  if (statsError || !stats) return <div className="p-6"><InlineError message="Failed to load stats" /></div>;

  const statCards = [
    { key: "campuses", label: "Total Campuses", value: stats.totalCampuses.toString(), trend: "+0 this month", dir: "up" as const },
    { key: "users",    label: "Total Users",    value: stats.totalUsers.toLocaleString(),  trend: "+0 this week", dir: "up" as const },
    { key: "posts",    label: "Total Posts",    value: stats.totalPosts.toLocaleString(),  trend: "+0 this week", dir: "up" as const },
    { key: "views",    label: "Total Views",    value: (stats.totalViews / 1000).toFixed(1) + "k", trend: "+0%", dir: "up" as const },
    { key: "reports",  label: "Open Reports",   value: stats.openReports.toString(),        trend: "+0",          dir: stats.openReports > 0 ? "up" : "down" as const },
    { key: "growth",   label: "Platform Growth",value: stats.platformGrowth,                trend: "vs last month", dir: "up" as const },
  ];

  const healthData = campusHealth ?? [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="p-4 lg:p-6 space-y-6"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((s, i) => {
          const Icon = STAT_ICONS[s.key] ?? TrendingUp;
          const TrendIcon = s.dir === "up" ? TrendingUp : TrendingDown;
          return (
            <motion.div
              key={s.key}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="yt-card border-primary/30 p-5"
            >
              <div className="flex items-start justify-between">
                <div className="h-10 w-10 rounded-lg bg-primary/10 inline-flex items-center justify-center">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <span className={`inline-flex items-center gap-1 text-xs font-semibold ${s.dir === "up" ? "text-primary" : "text-red-400"}`}>
                  <TrendIcon className="h-3 w-3" /> {s.trend}
                </span>
              </div>
              <div className="mt-4 text-3xl font-extrabold tracking-tight">{s.value}</div>
              <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">Campus Overview</h2>
            <Link to="/super-admin/campuses" className="text-sm text-primary hover:underline inline-flex items-center gap-1">
              Manage Campuses <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {healthData.map((c, i) => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className="yt-card yt-card-hover p-4 flex flex-col gap-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xl leading-none">{SA_CAMPUS_EMOJIS[c.id] ?? "\u{1F3EB}"}</span>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold truncate">{c.name}</div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{c.short_code}</span>
                    </div>
                  </div>
                  <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold ${c.status === "active" ? "text-primary" : "text-red-400"}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${c.status === "active" ? "bg-primary" : "bg-red-500"}`} />
                    {c.status === "active" ? "Active" : c.status}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div><div className="text-sm font-bold">{c.member_count.toLocaleString()}</div><div className="text-[10px] text-muted-foreground">Users</div></div>
                  <div><div className="text-sm font-bold">{c.post_count.toLocaleString()}</div><div className="text-[10px] text-muted-foreground">Posts</div></div>
                  <div><div className={`text-sm font-bold ${c.open_report_count > 0 ? "text-red-400" : ""}`}>{c.open_report_count}</div><div className="text-[10px] text-muted-foreground">Reports</div></div>
                </div>
                <div className="h-12 -mx-1">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={spark(i + 1)}>
                      <Line type="monotone" dataKey="v" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <Link
                  to="/campus-admin/dashboard"
                  className="text-xs font-semibold inline-flex items-center justify-center h-8 rounded-md border border-border hover:bg-secondary transition-colors"
                >
                  Manage →
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-1 space-y-3">
          <h2 className="text-lg font-bold">Recent Activity</h2>
          <div className="yt-card p-2 max-h-[640px] overflow-y-auto">
            {mockActivityFeed.map((a, i) => {
              const Icon = ACT_ICONS[a.icon] ?? FileText;
              return (
                <motion.div
                  key={a.id}
                  initial={{ opacity: 0, x: 6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="flex items-start gap-3 px-3 py-2.5 border-b border-border last:border-0"
                >
                  <div className={`h-8 w-8 shrink-0 rounded-md inline-flex items-center justify-center ${TONE[a.tone]}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm leading-snug">{a.text}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{a.time}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default SuperAdminDashboard;
