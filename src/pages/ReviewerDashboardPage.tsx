import { useEffect, useState } from 'react';
import { getReviewer, getReviewQueue } from '@/lib/api';
import type { Reviewer, ReviewQueueItem } from '@/lib/types';
import { MetricCard } from '@/components/MetricCard';
import { SpectrumBar } from '@/components/SpectrumBar';
import { HeatBar } from '@/components/HeatBar';
import { WarningIndicator } from '@/components/WarningIndicator';
import { Link } from 'react-router-dom';
import { ClipboardCheck, Star, Target, Building2 } from 'lucide-react';

export default function ReviewerDashboardPage() {
  const [reviewer, setReviewer] = useState<Reviewer | null>(null);
  const [queue, setQueue] = useState<ReviewQueueItem[]>([]);

  useEffect(() => {
    getReviewer().then(setReviewer);
    getReviewQueue().then(setQueue);
  }, []);

  if (!reviewer) {
    return <div className="flex h-full items-center justify-center text-muted-foreground">Loading...</div>;
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Welcome back, {reviewer.name}</h1>
        <p className="text-sm text-muted-foreground mt-1">Your review dashboard</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <MetricCard title="Reviews Completed" value={reviewer.reviewCount} icon={<ClipboardCheck className="h-4 w-4" />} />
        <MetricCard title="Accuracy Score" value={`${Math.round(reviewer.accuracy * 100)}%`} icon={<Target className="h-4 w-4" />} />
        <MetricCard title="Member Since" value={new Date(reviewer.joinedAt).toLocaleDateString('en', { month: 'short', year: 'numeric' })} icon={<Star className="h-4 w-4" />} />
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-3">Review Queue</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {queue.map(item => (
            <Link
              key={item.id}
              to={`/review/${item.article.id}`}
              className="group rounded-lg border bg-card p-5 shadow-sm transition-all hover:shadow-md hover:border-primary/20"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-card-foreground group-hover:text-primary transition-colors line-clamp-2 text-sm">
                    {item.article.headline}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    <Building2 className="h-3 w-3" /> {item.article.publisher}
                  </p>
                </div>
                <span className={`ml-2 shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                  item.priority === 'high' ? 'bg-destructive/10 text-tribal' :
                  item.priority === 'medium' ? 'bg-muted text-intensity' :
                  'bg-muted text-muted-foreground'
                }`}>
                  {item.priority}
                </span>
              </div>
              <div className="mt-3 space-y-2">
                <SpectrumBar value={item.aiPolitical} height="sm" showLabels={false} />
                <HeatBar value={item.aiIntensity} label="AI Intensity" />
                <WarningIndicator level={item.aiTribal} />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
