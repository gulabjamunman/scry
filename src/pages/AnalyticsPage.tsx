import { useEffect, useState } from 'react';
import { getDashboardStats } from '@/lib/api';
import type { DashboardStats } from '@/lib/types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from 'recharts';

const PIE_COLORS = ['hsl(145, 60%, 42%)', 'hsl(215, 50%, 65%)', 'hsl(30, 90%, 55%)', 'hsl(0, 50%, 65%)', 'hsl(0, 85%, 48%)'];

export default function AnalyticsPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    getDashboardStats().then(setStats);
  }, []);

  if (!stats) return <div className="flex h-full items-center justify-center text-muted-foreground">Loading...</div>;

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Analytics Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Aggregated bias and intensity metrics</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border bg-card p-5 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold text-card-foreground">Bias Distribution</h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={stats.biasDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="label" tick={{ fontSize: 9 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {stats.biasDistribution.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-lg border bg-card p-5 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold text-card-foreground">Emotional Intensity Distribution</h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={stats.intensityDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="range" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="count" fill="hsl(var(--intensity-orange))" radius={[4, 4, 0, 0]} fillOpacity={0.8} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-lg border bg-card p-5 shadow-sm lg:col-span-2">
          <h2 className="mb-4 text-sm font-semibold text-card-foreground">Tribal Activation Distribution</h2>
          <div className="flex flex-col md:flex-row items-center gap-6">
            <ResponsiveContainer width={260} height={260}>
              <PieChart>
                <Pie data={stats.tribalDistribution} dataKey="count" nameKey="level" cx="50%" cy="50%" outerRadius={100} strokeWidth={2} stroke="hsl(var(--card))">
                  {stats.tribalDistribution.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2">
              {stats.tribalDistribution.map((item, i) => (
                <div key={item.level} className="flex items-center gap-2 text-sm">
                  <span className="h-3 w-3 rounded-sm shrink-0" style={{ backgroundColor: PIE_COLORS[i] }} />
                  <span className="text-muted-foreground">{item.level}:</span>
                  <span className="font-semibold text-card-foreground">{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
