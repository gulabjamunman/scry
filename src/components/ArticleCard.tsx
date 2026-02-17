import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { SpectrumBar } from './SpectrumBar';
import { HeatBar } from './HeatBar';
import { WarningIndicator } from './WarningIndicator';
import type { Article } from '@/lib/types';
import { Calendar, Building2 } from 'lucide-react';

interface ArticleCardProps {
  article: Article;
  className?: string;
}

export function ArticleCard({ article, className }: ArticleCardProps) {
  return (
    <Link
      to={`/article/${article.id}`}
      className={cn(
        "group block rounded-lg border bg-card p-5 shadow-sm transition-all hover:shadow-md hover:border-primary/20",
        className
      )}
    >
      <h3 className="font-semibold text-card-foreground group-hover:text-primary transition-colors line-clamp-2">
        {article.headline}
      </h3>
      <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Building2 className="h-3 w-3" />
          {article.publisher}
        </span>
        <span className="flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          {new Date(article.date).toLocaleDateString()}
        </span>
      </div>

      <div className="mt-4 space-y-3">
        <SpectrumBar value={article.politicalLeaning} height="sm" />
        <HeatBar value={article.emotionalIntensity} label="Emotional Intensity" />
        <WarningIndicator level={article.tribalActivation} label={`Tribal Activation: ${Math.round(article.tribalActivation * 100)}%`} />
      </div>
    </Link>
  );
}
