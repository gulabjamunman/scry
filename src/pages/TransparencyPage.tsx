import { MetricCard } from '@/components/MetricCard';
import { Shield, Eye, Scale, FileText } from 'lucide-react';

export default function TransparencyPage() {
  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Transparency & Methodology</h1>
        <p className="text-sm text-muted-foreground mt-1">How we analyze and score media bias</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard title="Analysis Model" value="v2.4" icon={<Shield className="h-4 w-4" />} subtitle="Last updated Feb 2026" />
        <MetricCard title="Accuracy Rate" value="91.3%" icon={<Eye className="h-4 w-4" />} subtitle="Human-AI agreement" />
        <MetricCard title="Sources Tracked" value="847" icon={<FileText className="h-4 w-4" />} subtitle="News publishers" />
        <MetricCard title="Reviewer Consensus" value="87.6%" icon={<Scale className="h-4 w-4" />} subtitle="Inter-rater reliability" />
      </div>

      <div className="space-y-6">
        <section className="rounded-lg border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-card-foreground mb-3">Political Leaning Analysis</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Political leaning is scored on a continuous scale from -1 (far left) to +1 (far right), with 0 representing center. The analysis considers word choice, framing, source selection, topic emphasis, and narrative structure. Multiple NLP models are ensembled to reduce individual model bias, and scores are calibrated against human reviewer assessments on a rolling basis.
          </p>
        </section>

        <section className="rounded-lg border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-card-foreground mb-3">Emotional Intensity Scoring</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Emotional intensity measures the degree to which an article uses emotionally charged language, alarming framing, or appeals to fear, anger, or moral outrage. Scores range from 0 (neutral, factual tone) to 1 (highly emotional). The metric is derived from sentiment analysis, lexical intensity mapping, and rhetorical pattern detection.
          </p>
        </section>

        <section className="rounded-lg border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-card-foreground mb-3">Tribal Activation Index</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            The Tribal Activation Index measures how strongly an article creates or reinforces in-group/out-group dynamics. It evaluates us-vs-them framing, identity-based appeals, dehumanizing language, and group-blame narratives. High scores indicate content that may promote social polarization regardless of political direction. This metric is particularly important for identifying content that could contribute to societal division.
          </p>
        </section>

        <section className="rounded-lg border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-card-foreground mb-3">Human Review Process</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            All AI-generated scores are subject to human review by trained analysts. Reviewers provide independent assessments across all metrics, and significant disagreements between AI and human scores trigger additional review. Our reviewer pool is balanced across political perspectives to minimize systematic bias in the review process itself.
          </p>
        </section>
      </div>
    </div>
  );
}
