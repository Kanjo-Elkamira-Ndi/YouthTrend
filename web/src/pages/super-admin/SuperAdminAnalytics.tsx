import { useState } from "react";
import { motion } from "framer-motion";
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, Legend, LineChart, Line,
} from "recharts";
import { useQuery } from "@tanstack/react-query";
import { api, unwrap } from "@/lib/api";
import { FeedSkeleton } from "@/components/common/Skeletons";
import { InlineError } from "@/components/common/InlineError";
import type { PlatformStats, CampusHealth } from "@/types/analytics";

const RANGES = ["Last 7 Days", "Last 30 Days", "Last 90 Days", "All Time"];
const LINE_COLORS = ["#1A6E3C", "#27AE60", "#2ECC71", "#58D68D", "#82E0AA"];

const Card = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="yt-card border-primary/30 p-4">
    <h3 className="text-sm font-bold mb-3">{title}</h3>
    <div className="h-64">{children}</div>
  </div>
);

const dayLabel = (i: number) => {
  const d = new Date(2026, 3, 1 + i);
  return `${d.getMonth() + 1}/${d.getDate()}`;
};

const SuperAdminAnalytics = () => {
  const [range, setRange] = useState("Last 30 Days");

  const { data: stats, isLoading, isError } = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: () => api.get('/super-admin/stats').then(unwrap<PlatformStats>),
  });

  const { data: campusHealth } = useQuery({
    queryKey: ['admin', 'campus-health'],
    queryFn: () => api.get('/super-admin/campus-health').then(unwrap<CampusHealth[]>),
  });

  if (isLoading) return <div className="p-6"><FeedSkeleton /></div>;
  if (isError || !stats) return <div className="p-6"><InlineError message="Failed to load analytics" /></div>;

  const rangeDays = range === "Last 7 Days" ? 7 : range === "Last 30 Days" ? 30 : range === "Last 90 Days" ? 90 : 30;

  // TODO B15: generate real time-series when backend supports it
  const growth = Array.from({ length: rangeDays }, (_, i) => ({
    name: dayLabel(i),
    users: Math.round(4200 + i * 70 + Math.sin(i / 3) * 40),
  }));

  const postsDaily = Array.from({ length: rangeDays }, (_, i) => ({
    name: dayLabel(i),
    posts: Math.round(20 + Math.abs(Math.sin(i / 2)) * 35 + (i % 5) * 4),
  }));

  const weeklyActive = Array.from({ length: Math.min(rangeDays, 12) }, (_, i) => ({
    name: `W${i + 1}`,
    UY1:  900  + i * 30 + (i % 3) * 20,
    UB:   620  + i * 22 + (i % 4) * 15,
    IUBS: 480  + i * 18 + (i % 2) * 12,
    UDL:  700  + i * 25 + (i % 3) * 17,
    UB2:  220  + i * 8,
  }));

  const healthData = campusHealth ?? [];
  const byCategory = [
    { name: "Gist",      value: 3210, fill: "#1A6E3C" },
    { name: "News",      value: 2780, fill: "#27AE60" },
    { name: "Sports",    value: 2105, fill: "#2ECC71" },
    { name: "Academics", value: 1980, fill: "#58D68D" },
    { name: "Events",    value: 1640, fill: "#82E0AA" },
    { name: "Culture",   value: 1520, fill: "#A9DFBF" },
    { name: "Opinion",   value: 1485, fill: "#D5F5E3" },
  ];

  const campusComparison = healthData.map((c, i) => ({
    name: c.short_code,
    posts: c.post_count,
    fill: LINE_COLORS[i % LINE_COLORS.length],
  }));

  const engagement = healthData.map((c) => ({
    name: c.short_code,
    value: c.post_count > 0 ? Math.min(100, Math.round((c.member_count / c.post_count) * 20)) : 0,
  }));

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="p-4 lg:p-6 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-bold">Analytics</h2>
        <div className="inline-flex rounded-md border border-border p-0.5 text-xs">
          {RANGES.map((r) => (
            <button key={r}
              onClick={() => setRange(r)}
              className={`px-3 h-8 rounded-sm font-medium ${range === r ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card title="Platform Growth">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={growth}>
              <defs>
                <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="#1A6E3C" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#1A6E3C" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
              <Area type="monotone" dataKey="users" stroke="#1A6E3C" strokeWidth={2} fill="url(#g1)" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
        <Card title="Posts Published">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={postsDaily}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
              <Bar dataKey="posts" fill="#1A6E3C" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card title="Content by Category">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={byCategory} dataKey="value" nameKey="name" outerRadius={70}>
                {byCategory.map((c, i) => <Cell key={i} fill={c.fill} />)}
              </Pie>
              <Legend wrapperStyle={{ fontSize: 10 }} />
            </PieChart>
          </ResponsiveContainer>
        </Card>
        <Card title="Campus Activity">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={campusComparison}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
              <Bar dataKey="posts">{campusComparison.map((c, i) => <Cell key={i} fill={c.fill} />)}</Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
        <Card title="Engagement Rate by Campus">
          <div className="h-full flex flex-col justify-center gap-3">
            {engagement.map((e) => (
              <div key={e.name} className="flex items-center gap-3 text-xs">
                <span className="w-12 font-semibold">{e.name}</span>
                <div className="flex-1 h-2.5 rounded-full bg-secondary overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: `${e.value}%` }} />
                </div>
                <span className="w-10 text-right font-semibold tabular-nums">{e.value}%</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card title="Weekly Active Users — All Campuses">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={weeklyActive}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="name" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
            <Legend wrapperStyle={{ fontSize: 10 }} />
            {["UY1", "UB", "IUBS", "UDL", "UB2"].map((k, i) => (
              <Line key={k} type="monotone" dataKey={k} stroke={LINE_COLORS[i]} strokeWidth={2} dot={false} />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </Card>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Total Campuses",  value: stats.totalCampuses.toString() },
          { label: "Total Users",     value: stats.totalUsers.toLocaleString() },
          { label: "Total Posts",     value: stats.totalPosts.toLocaleString() },
          { label: "Growth Rate",     value: stats.platformGrowth },
        ].map((s) => (
          <div key={s.label} className="yt-card border-primary/30 p-4">
            <div className="text-xs text-muted-foreground">{s.label}</div>
            <div className="text-xl font-bold mt-1">{s.value}</div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default SuperAdminAnalytics;
