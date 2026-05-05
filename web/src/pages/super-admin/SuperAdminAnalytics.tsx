import { useState } from "react";
import { motion } from "framer-motion";
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, Legend, LineChart, Line,
} from "recharts";
import { mockAnalyticsData } from "@/mock/superAdmin";

const RANGES = ["Last 7 Days", "Last 30 Days", "Last 90 Days", "All Time"];
const LINE_COLORS = ["#1A6E3C", "#27AE60", "#2ECC71", "#58D68D", "#82E0AA"];

const Card = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="yt-card border-primary/30 p-4">
    <h3 className="text-sm font-bold mb-3">{title}</h3>
    <div className="h-64">{children}</div>
  </div>
);

const SuperAdminAnalytics = () => {
  const [range, setRange] = useState("Last 30 Days");
  const d = mockAnalyticsData;

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
            <AreaChart data={d.growth}>
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
            <BarChart data={d.postsDaily}>
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
              <Pie data={d.byCategory} dataKey="value" nameKey="name" outerRadius={70}>
                {d.byCategory.map((c, i) => <Cell key={i} fill={c.fill} />)}
              </Pie>
              <Legend wrapperStyle={{ fontSize: 10 }} />
            </PieChart>
          </ResponsiveContainer>
        </Card>
        <Card title="Campus Activity">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={d.campusComparison}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
              <Bar dataKey="posts">{d.campusComparison.map((c, i) => <Cell key={i} fill={c.fill} />)}</Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
        <Card title="Engagement Rate by Campus">
          <div className="h-full flex flex-col justify-center gap-3">
            {d.engagement.map((e) => (
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
          <LineChart data={d.weeklyActive}>
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
          { label: "Avg posts / user / month", value: "2.3" },
          { label: "Avg read time / session",  value: "4m 12s" },
          { label: "Most active campus",       value: "UY1" },
          { label: "Peak activity time",       value: "8PM – 10PM" },
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
