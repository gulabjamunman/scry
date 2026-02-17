import { useEffect, useState } from 'react';
import { getArticles } from '@/lib/api';
import type { Article } from '@/lib/types';
import { ScatterChart, Scatter, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function IdeologicalMapPage() {
  const [articles, setArticles] = useState<Article[]>([]);

  useEffect(() => {
    getArticles().then(setArticles);
  }, []);

  const data = articles.map(a => ({
    x: a.politicalLeaning,
    y: a.emotionalIntensity,
    name: a.headline,
    publisher: a.publisher,
  }));

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Ideological Map</h1>
        <p className="text-sm text-muted-foreground mt-1">Articles plotted by political leaning vs emotional intensity</p>
      </div>

      <div className="rounded-lg border bg-card p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-6 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bias-left" /> Left</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bias-center" /> Center</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bias-right" /> Right</span>
        </div>
        <ResponsiveContainer width="100%" height={450}>
          <ScatterChart margin={{ top: 10, right: 20, bottom: 30, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              type="number"
              dataKey="x"
              domain={[-1, 1]}
              tick={{ fontSize: 10 }}
              stroke="hsl(var(--muted-foreground))"
              label={{ value: 'Political Leaning (Left → Right)', position: 'bottom', fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
            />
            <YAxis
              type="number"
              dataKey="y"
              domain={[0, 1]}
              tick={{ fontSize: 10 }}
              stroke="hsl(var(--muted-foreground))"
              label={{ value: 'Emotional Intensity', angle: -90, position: 'insideLeft', fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
            />
            <Tooltip
              content={({ payload }) => {
                if (!payload?.length) return null;
                const d = payload[0].payload;
                return (
                  <div className="rounded-lg border bg-card p-3 shadow-md text-xs max-w-[240px]">
                    <p className="font-semibold text-card-foreground">{d.name}</p>
                    <p className="text-muted-foreground">{d.publisher}</p>
                    <p className="mt-1 text-muted-foreground">Leaning: {d.x.toFixed(2)} | Intensity: {(d.y * 100).toFixed(0)}%</p>
                  </div>
                );
              }}
            />
            <Scatter data={data} fill="hsl(var(--primary))" fillOpacity={0.7} r={6} />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
