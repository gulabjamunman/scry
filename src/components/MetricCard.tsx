import { cn } from '@/lib/utils';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  className?: string;
}

export function MetricCard({ title, value, subtitle, icon, trend, className }: MetricCardProps) {
  return (
    <div className={cn(
      "rounded-lg border bg-card p-5 shadow-sm transition-shadow hover:shadow-md",
      className
    )}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold tracking-tight text-card-foreground">{value}</p>
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>
        {icon && (
          <div className="rounded-md bg-muted p-2 text-muted-foreground">
            {icon}
          </div>
        )}
      </div>
      {trend && (
        <div className={cn(
          "mt-2 text-xs font-medium",
          trend === 'up' && 'text-safe',
          trend === 'down' && 'text-tribal',
          trend === 'neutral' && 'text-muted-foreground',
        )}>
          {trend === 'up' ? '↑ Trending up' : trend === 'down' ? '↓ Trending down' : '→ Stable'}
        </div>
      )}
    </div>
  );
}
