import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getArticleById, getReviewQueue, submitReview } from '@/lib/api';
import type { Article } from '@/lib/types';
import { SpectrumBar } from '@/components/SpectrumBar';
import { HeatBar } from '@/components/HeatBar';
import { ArrowLeft, Send } from 'lucide-react';
import { toast } from 'sonner';

export default function ReviewPage() {
  const { articleId } = useParams<{ articleId: string }>();
  const navigate = useNavigate();
  const [article, setArticle] = useState<Article | null>(null);
  const [political, setPolitical] = useState(0);
  const [intensity, setIntensity] = useState(0.5);
  const [sensationalism, setSensationalism] = useState(0.5);
  const [threat, setThreat] = useState(0.5);
  const [groupConflict, setGroupConflict] = useState(0.5);
  const [comment, setComment] = useState('');
  const [highlighted, setHighlighted] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (articleId) {
      getArticleById(articleId).then(a => {
        if (a) {
          setArticle(a);
          setPolitical(a.politicalLeaning);
          setIntensity(a.emotionalIntensity);
          setSensationalism(a.sensationalism);
          setThreat(a.threatSignal);
          setGroupConflict(a.groupConflict);
        }
      });
    } else {
      // Show the queue if no article selected
      getReviewQueue().then(q => {
        if (q.length > 0) navigate(`/review/${q[0].article.id}`, { replace: true });
      });
    }
  }, [articleId, navigate]);

  const handleSubmit = async () => {
    if (!article) return;
    setSubmitting(true);
    await submitReview({
      articleId: article.id,
      reviewerId: 'r1',
      political,
      intensity,
      sensationalism,
      threat,
      groupConflict,
      comment,
      highlightedSentence: highlighted,
    });
    toast.success('Review submitted successfully');
    setSubmitting(false);
    navigate('/reviewer');
  };

  if (!article) {
    return <div className="flex h-full items-center justify-center text-muted-foreground">Loading...</div>;
  }

  const SliderField = ({ label, value, onChange, min = 0, max = 1, step = 0.05 }: {
    label: string; value: number; onChange: (v: number) => void; min?: number; max?: number; step?: number;
  }) => (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label className="text-xs font-medium text-muted-foreground">{label}</label>
        <span className="text-xs font-semibold text-foreground">{value.toFixed(2)}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        className="w-full accent-primary h-1.5"
      />
    </div>
  );

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-5xl">
      <button onClick={() => navigate('/reviewer')} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to Dashboard
      </button>

      <h1 className="text-xl font-bold tracking-tight">Review Article</h1>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <div className="rounded-lg border bg-card p-5 shadow-sm">
            <h2 className="font-semibold text-card-foreground">{article.headline}</h2>
            <p className="text-xs text-muted-foreground mt-1">{article.publisher} · {new Date(article.date).toLocaleDateString()}</p>
            <div className="mt-3 whitespace-pre-line text-sm leading-relaxed text-muted-foreground max-h-[400px] overflow-y-auto">
              {article.content}
            </div>
          </div>

          <div className="rounded-lg border bg-card p-5 shadow-sm space-y-3">
            <h3 className="text-sm font-semibold text-card-foreground">AI Analysis</h3>
            <SpectrumBar value={article.politicalLeaning} height="sm" />
            <HeatBar value={article.emotionalIntensity} label="Emotional Intensity" />
            <HeatBar value={article.tribalActivation} label="Tribal Activation" color="red" />
          </div>
        </div>

        <div className="rounded-lg border bg-card p-5 shadow-sm space-y-5">
          <h3 className="text-sm font-semibold text-card-foreground">Your Review</h3>

          <SliderField label="Political Leaning (-1 Left → 1 Right)" value={political} onChange={setPolitical} min={-1} max={1} step={0.05} />
          <SliderField label="Emotional Intensity" value={intensity} onChange={setIntensity} />
          <SliderField label="Sensationalism" value={sensationalism} onChange={setSensationalism} />
          <SliderField label="Threat Signal" value={threat} onChange={setThreat} />
          <SliderField label="Group Conflict" value={groupConflict} onChange={setGroupConflict} />

          <div>
            <label className="text-xs font-medium text-muted-foreground">Comment</label>
            <textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              rows={3}
              placeholder="Your analysis of this article's bias..."
              className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground">Highlighted Sentence</label>
            <input
              type="text"
              value={highlighted}
              onChange={e => setHighlighted(e.target.value)}
              placeholder="Paste a key sentence from the article..."
              className="mt-1 w-full rounded-lg border bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Send className="h-4 w-4" /> {submitting ? 'Submitting...' : 'Submit Review'}
          </button>
        </div>
      </div>
    </div>
  );
}
