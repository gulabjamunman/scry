import { useEffect, useState } from 'react';
import { getDashboardStats } from '@/lib/api';
import { MetricCard } from '@/components/MetricCard';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  Cell
} from 'recharts';


interface UIStats {

  totalArticles: number;

  totalReviews: number;

  reviewerCount: number;

  avgSensationalism: number;

  avgTribalActivation: number;

  avgPoliticalLeaning: number;

  timelineData: {
    date: string;
    articles: number;
  }[];

  biasDistribution: {
    label: string;
    value: number;
    color: string;
  }[];

}


export default function HomePage() {


  const [stats, setStats] = useState<UIStats>({
    totalArticles: 0,
    totalReviews: 0,
    reviewerCount: 0,
    avgSensationalism: 0,
    avgTribalActivation: 0,
    avgPoliticalLeaning: 0,
    timelineData: [],
    biasDistribution: []
  });


  useEffect(() => {

    async function loadStats() {

      const data = await getDashboardStats();
     	

      if (!data) return;

      // biasDistribution is now an array of { label, value, color } from api.ts
      const biasDistribution = (data.biasDistribution || []) as {
        label: string;
        value: number;
        color: string;
      }[];

      // timelineData entries use the `articles` key from api.ts
      const timelineData = (data.timelineData || []).map((entry: any) => ({
        date: entry.date,
        articles: entry.articles || 0
      }));


      setStats({

        totalArticles: data.totalArticles ?? 0,

        totalReviews: data.totalReviews ?? 0,

        reviewerCount: data.reviewerCount ?? 0,

        avgSensationalism: data.avgSensationalism ?? 0,

        // Fixed: was data.avgTribal — correct field is avgTribalActivation
        avgTribalActivation: data.avgTribalActivation ?? 0,

        // Fixed: was data.avgIdeology — correct field is avgPoliticalLeaning
        avgPoliticalLeaning: data.avgPoliticalLeaning ?? 0,

        timelineData,

        biasDistribution

      });

    }

    loadStats();

  }, []);



  return (

    <div className="space-y-8 p-6 lg:p-8">


      <div>

        <h1 className="text-2xl font-bold tracking-tight">
          SCRY Observatory
        </h1>

        <p className="text-sm text-muted-foreground mt-1">
          Real-time analysis of informational bias patterns
        </p>

      </div>



      {/* METRIC CARDS */}


      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">


        <MetricCard
          title="Avg Sensationalism"
          value={`${Math.round(stats.avgSensationalism * 100)}%`}
        />


        <MetricCard
          title="Avg Us vs Them"
          value={`${Math.round(stats.avgTribalActivation * 100)}%`}
        />


        <MetricCard
          title="Avg Ideological Strength"
          value={`${Math.round(Math.abs(stats.avgPoliticalLeaning) * 100)}%`}
        />


        <MetricCard
          title="Articles Analyzed"
          value={stats.totalArticles.toLocaleString()}
        />


      </div>



      {/* CHARTS */}


      <div className="grid gap-6 lg:grid-cols-2">


        {/* TIMELINE */}


        <div className="rounded-lg border bg-card p-5 shadow-sm">

          <h2 className="mb-4 text-sm font-semibold">
            Articles Over Time
          </h2>


          <ResponsiveContainer width="100%" height={240}>

            <LineChart data={stats.timelineData}>

              <CartesianGrid strokeDasharray="3 3" />

              <XAxis
                dataKey="date"
                tick={{ fontSize: 10 }}
                tickFormatter={(v) =>
                  new Date(v).toLocaleDateString('en', {
                    month: 'short',
                    day: 'numeric'
                  })
                }
              />

              <YAxis tick={{ fontSize: 10 }} />

              <Tooltip />

              <Line
                type="monotone"
                dataKey="articles"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ r: 3 }}
              />

            </LineChart>

          </ResponsiveContainer>

        </div>



        {/* DISTRIBUTION */}


        <div className="rounded-lg border bg-card p-5 shadow-sm">

          <h2 className="mb-4 text-sm font-semibold">
            Ideological Distribution
          </h2>


          <ResponsiveContainer width="100%" height={240}>

            <BarChart data={stats.biasDistribution}>

              <XAxis
                dataKey="label"
                tick={{ fontSize: 10 }}
              />

              <YAxis tick={{ fontSize: 10 }} />

              <Tooltip />

              <Bar
                dataKey="value"
                radius={[4, 4, 0, 0]}
              >
                {stats.biasDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>

            </BarChart>

          </ResponsiveContainer>

        </div>


      </div>


    </div>

  );

}
