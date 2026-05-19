import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FeedSkeleton } from "@/components/common/Skeletons";
import { InlineError } from "@/components/common/InlineError";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { Eye, Hand, MessageSquare, Share2, TrendingUp, ArrowLeft } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api, unwrap } from "@/lib/api";
import type { PostAnalyticsResponse } from "@/types/analytics";

const RANGE_OPTIONS = [
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "all", label: "All time" },
] as const;

const COLORS = ["hsl(var(--primary))", "#22c55e", "#f59e0b", "#ef4444"];

const PostAnalytics = () => {
  const { id } = useParams();
  const [range, setRange] = useState("30d");

  const { data, isLoading, isError } = useQuery({
    queryKey: ['post-analytics', id, range],
    queryFn: () => api.get(`/analytics/posts/${id}`, { params: { period: range } }).then(unwrap<PostAnalyticsResponse>),
    enabled: !!id,
  });

  if (isLoading) return <AppShell hideRight><div className="p-6"><FeedSkeleton /></div></AppShell>;
  if (isError || !data) return <AppShell hideRight><div className="p-6"><InlineError message="Failed to load analytics" /></div></AppShell>;

  const { summary, dailyViews, dailyClaps, trafficSources, topReaderCampuses } = data;
  const totalViews = summary.totalViews;
  const totalClaps = summary.totalClaps;

  const viewsData = dailyViews.map((d) => ({ day: d.date.slice(5), views: d.count }));
  const clapsData = dailyClaps.map((d) => ({ day: d.date.slice(5), claps: d.count }));
  const engagementData = viewsData.map((v, i) => ({
    day: v.day,
    views: v.views,
    claps: clapsData[i]?.claps ?? 0,
  }));

  return (
    <AppShell hideRight>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
        <div className="min-w-0">
          <Link to="/my-posts" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-2">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to My Posts
          </Link>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Post analytics</p>
          <h1 className="text-2xl md:text-3xl font-extrabold line-clamp-1">Analytics</h1>
        </div>
        <Select value={range} onValueChange={(v) => setRange(v)}>
          <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
          <SelectContent>
            {RANGE_OPTIONS.map((r) => (
              <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <Stat icon={Eye} label="Views" value={totalViews} />
        <Stat icon={Hand} label="Claps" value={totalClaps} />
        <Stat icon={MessageSquare} label="Comments" value={summary.totalComments} />
        <Stat icon={Share2} label="Shares" value={summary.totalShares} />
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="audience">Audience</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4 grid lg:grid-cols-3 gap-4">
          <Card className="lg:col-span-2 p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Views over time</h3>
              <span className="inline-flex items-center gap-1 text-xs text-primary"><TrendingUp className="h-3.5 w-3.5" /> Trending</span>
            </div>
            <div className="h-64">
              <ResponsiveContainer>
                <AreaChart data={viewsData}>
                  <defs>
                    <linearGradient id="vw" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.5} />
                      <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                  <Area type="monotone" dataKey="views" stroke="hsl(var(--primary))" fill="url(#vw)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="font-semibold mb-3">Traffic sources</h3>
            <div className="h-64">
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={trafficSources} dataKey="percentage" nameKey="source" innerRadius={50} outerRadius={80} paddingAngle={3}>
                    {trafficSources.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <ul className="mt-2 space-y-1 text-sm">
              {trafficSources.map((s, i) => (
                <li key={s.source} className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                    {s.source}
                  </span>
                  <span className="text-muted-foreground">{s.percentage}%</span>
                </li>
              ))}
            </ul>
          </Card>
        </TabsContent>

        <TabsContent value="audience" className="mt-4 grid md:grid-cols-2 gap-4">
          <Card className="p-5">
            <h3 className="font-semibold mb-3">Readers by campus</h3>
            <div className="h-64">
              <ResponsiveContainer>
                <BarChart data={topReaderCampuses.map((c) => ({ campus: c.shortCode, readers: c.viewCount }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="campus" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                  <Bar dataKey="readers" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="font-semibold mb-3">Reader breakdown</h3>
            <ul className="space-y-3 text-sm">
              {[
                { l: "Followers", v: "62%" },
                { l: "Non-followers", v: "38%" },
                { l: "Returning readers", v: "41%" },
                { l: "New readers", v: "59%" },
              ].map((r) => (
                <li key={r.l} className="flex justify-between border-b border-border pb-2 last:border-none">
                  <span className="text-muted-foreground">{r.l}</span>
                  <span className="font-semibold">{r.v}</span>
                </li>
              ))}
            </ul>
          </Card>
        </TabsContent>

        <TabsContent value="engagement" className="mt-4">
          <Card className="p-5">
            <h3 className="font-semibold mb-3">Views & claps</h3>
            <div className="h-72">
              <ResponsiveContainer>
                <BarChart data={engagementData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                  <Bar dataKey="views" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="claps" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </AppShell>
  );
};

const Stat = ({ icon: Icon, label, value }: { icon: any; label: string; value: number }) => (
  <Card className="p-4">
    <div className="flex items-center gap-3">
      <div className="h-10 w-10 rounded-lg bg-primary/15 inline-flex items-center justify-center">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <div>
        <div className="text-xl font-extrabold">{value.toLocaleString()}</div>
        <div className="text-xs text-muted-foreground">{label}</div>
      </div>
    </div>
  </Card>
);

export default PostAnalytics;
