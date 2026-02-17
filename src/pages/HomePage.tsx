import { useEffect, useState } from 'react';
import { getDashboardStats } from '@/lib/api';
import type { DashboardStats } from '@/lib/types';
import { MetricCard } from '@/components/MetricCard';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';
import { Newspaper, Users, BarChart3, Activity } from 'lucide-react';

export default function HomePage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    getDashboardStats().then(setStats);
  }, []);

  if (!stats) {
    return <div className="flex h-full items-center justify-center text-muted-foreground">Loading...</div>;
  }

  return (
    <div className="space-y-8 p-6 lg:p-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">News Bias Observatory</h1>
        <p className="text-sm text-muted-foreground mt-1">Real-time analysis of media bias patterns</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard title="Articles Analyzed" value={stats.totalArticles.toLocaleString()} icon={<Newspaper className="h-4 w-4" />} trend="up" />
        <MetricCard title="Reviews Submitted" value={stats.totalReviews.toLocaleString()} icon={<BarChart3 className="h-4 w-4" />} trend="up" />
        <MetricCard title="Active Reviewers" value={stats.reviewerCount} icon={<Users className="h-4 w-4" />} trend="neutral" />
        <MetricCard
          title="Avg Emotional Intensity"
          value={`${Math.round(stats.avgEmotionalIntensity * 100)}%`}
          icon={<Activity className="h-4 w-4" />}
          subtitle="Across all sources"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border bg-card p-5 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold text-card-foreground">Articles Over Time</h2>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={stats.timelineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => new Date(v).toLocaleDateString('en', { month: 'short', day: 'numeric' })} />
              <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} />
              <Line type="monotone" dataKey="articles" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-lg border bg-card p-5 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold text-card-foreground">Ideological Distribution</h2>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={stats.biasDistribution}>
              <XAxis dataKey="label" tick={{ fontSize: 9 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]} fill="hsl(var(--primary))">
                {stats.biasDistribution.map((entry, i) => (
                  <rect key={i} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
