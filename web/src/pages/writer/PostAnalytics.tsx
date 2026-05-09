import { useState } from "react";
import { useParams } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { posts } from "@/mock";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { Eye, Hand, MessageSquare, Share2, TrendingUp, UserPlus } from "lucide-react";

const RANGE_DAYS = { "7d": 7, "30d": 30, "90d": 90 } as const;
type RangeKey = keyof typeof RANGE_DAYS;

const seedSeries = (n: number, base: number, jitter = 0.4) =>
  Array.from({ length: n }, (_, i) => ({
    day: `D${i + 1}`,
    views: Math.round(base * (1 + Math.sin(i / 2) * jitter + Math.random() * jitter)),
    claps: Math.round(base * 0.18 * (1 + Math.random() * jitter)),
  }));

const SOURCES = [
  { name: "Campus Feed", value: 48 },
  { name: "Search", value: 22 },
  { name: "Profile", value: 16 },
  { name: "External", value: 14 },
];

const COLORS = ["hsl(var(--primary))", "#22c55e", "#f59e0b", "#ef4444"];

const PostAnalytics = () => {
  const { id } = useParams();
  const post = posts.find((p) => p.id === id) ?? posts[0];
  const [range, setRange] = useState<RangeKey>("30d");
  const data = seedSeries(RANGE_DAYS[range], 320);

  const totalViews = data.reduce((a, b) => a + b.views, 0);
  const totalClaps = data.reduce((a, b) => a + b.claps, 0);

  return (
    <AppShell hideRight>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Post analytics</p>
          <h1 className="text-2xl md:text-3xl font-extrabold line-clamp-1">{post.title}</h1>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <Badge variant="outline">{post.category}</Badge>
            <Badge variant="secondary">{post.campus}</Badge>
            <span className="text-xs text-muted-foreground">{post.publishedAt} · {post.readMinutes} min read</span>
          </div>
        </div>
        <Select value={range} onValueChange={(v) => setRange(v as RangeKey)}>
          <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <Stat icon={Eye} label="Views" value={totalViews} delta="+12.4%" />
        <Stat icon={Hand} label="Claps" value={totalClaps} delta="+6.1%" />
        <Stat icon={MessageSquare} label="Comments" value={post.comments} delta="+3" />
        <Stat icon={UserPlus} label="New followers" value={48} delta="+8" />
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
                <AreaChart data={data}>
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
                  <Pie data={SOURCES} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={3}>
                    {SOURCES.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <ul className="mt-2 space-y-1 text-sm">
              {SOURCES.map((s, i) => (
                <li key={s.name} className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: COLORS[i] }} />
                    {s.name}
                  </span>
                  <span className="text-muted-foreground">{s.value}%</span>
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
                <BarChart data={[
                  { campus: "UY1", readers: 1240 },
                  { campus: "UB", readers: 880 },
                  { campus: "IUBS", readers: 320 },
                  { campus: "Other", readers: 210 },
                ]}>
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
            <h3 className="font-semibold mb-3">Claps & comments</h3>
            <div className="h-72">
              <ResponsiveContainer>
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                  <Bar dataKey="claps" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3 text-center">
              <Mini label="Avg read time" value="4m 12s" />
              <Mini label="Completion rate" value="68%" />
              <Mini label="Shares" value="124" icon={Share2} />
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </AppShell>
  );
};

const Stat = ({ icon: Icon, label, value, delta }: any) => (
  <Card className="p-4">
    <div className="flex items-center gap-3">
      <div className="h-10 w-10 rounded-lg bg-primary/15 inline-flex items-center justify-center">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <div>
        <div className="text-xl font-extrabold">{value.toLocaleString()}</div>
        <div className="text-xs text-muted-foreground">{label} <span className="text-primary">{delta}</span></div>
      </div>
    </div>
  </Card>
);

const Mini = ({ label, value, icon: Icon }: any) => (
  <div className="rounded-lg bg-muted/40 p-3">
    <div className="text-lg font-bold inline-flex items-center gap-1.5">
      {Icon && <Icon className="h-4 w-4 text-primary" />} {value}
    </div>
    <div className="text-xs text-muted-foreground">{label}</div>
  </div>
);

export default PostAnalytics;
