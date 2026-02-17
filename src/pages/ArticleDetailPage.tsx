import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getArticleById } from '@/lib/api';
import type { Article } from '@/lib/types';
import { SpectrumBar } from '@/components/SpectrumBar';
import { HeatBar } from '@/components/HeatBar';
import { WarningIndicator } from '@/components/WarningIndicator';
import { ArrowLeft, Building2, Calendar } from 'lucide-react';

export default function ArticleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [article, setArticle] = useState<Article | null>(null);

  useEffect(() => {
    if (id) getArticleById(id).then(a => setArticle(a || null));
  }, [id]);

  if (!article) {
    return <div className="flex h-full items-center justify-center text-muted-foreground">Loading...</div>;
  }

  return (
    <div className="p-6 lg:p-8 max-w-4xl space-y-6">
      <Link to="/explorer" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to Explorer
      </Link>

      <div>
        <h1 className="text-2xl font-bold tracking-tight">{article.headline}</h1>
        <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1"><Building2 className="h-3.5 w-3.5" />{article.publisher}</span>
          <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{new Date(article.date).toLocaleDateString()}</span>
        </div>
      </div>

      <div className="rounded-lg border bg-card p-5 shadow-sm">
        <div className="whitespace-pre-line text-sm leading-relaxed text-card-foreground">
          {article.content}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border bg-card p-5 shadow-sm space-y-4">
          <h2 className="text-sm font-semibold text-card-foreground">Analysis Scores</h2>
          <SpectrumBar value={article.politicalLeaning} height="lg" />
          <HeatBar value={article.emotionalIntensity} label="Emotional Intensity" />
          <HeatBar value={article.tribalActivation} label="Tribal Activation" color="red" />
          <HeatBar value={article.threatSignal} label="Threat Signal" color="red" />
          <HeatBar value={article.sensationalism} label="Sensationalism" color="orange" />
          <HeatBar value={article.groupConflict} label="Group Conflict" color="red" />
        </div>

        <div className="space-y-4">
          <div className="rounded-lg border bg-card p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-card-foreground mb-2">Risk Assessment</h2>
            <div className="space-y-2">
              <WarningIndicator level={article.tribalActivation} label={`Tribal Activation: ${Math.round(article.tribalActivation * 100)}%`} />
              <WarningIndicator level={article.threatSignal} label={`Threat Signal: ${Math.round(article.threatSignal * 100)}%`} />
              <WarningIndicator level={article.groupConflict} label={`Group Conflict: ${Math.round(article.groupConflict * 100)}%`} />
            </div>
          </div>

          <div className="rounded-lg border bg-card p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-card-foreground mb-2">Bias Explanation</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">{article.biasExplanation}</p>
          </div>

          <div className="rounded-lg border bg-card p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-card-foreground mb-2">Behavioural Analysis</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">{article.behaviouralAnalysis}</p>
          </div>
        </div>
      </div>

      {article.highlightedSentences.length > 0 && (
        <div className="rounded-lg border bg-card p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-card-foreground mb-3">Key Sentences</h2>
          <div className="space-y-2">
            {article.highlightedSentences.map((s, i) => (
              <div key={i} className="rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground border-l-2 border-intensity">
                "{s}"
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
