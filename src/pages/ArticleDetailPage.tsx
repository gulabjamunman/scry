import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getArticleById } from '@/lib/api';
import type { Article } from '@/lib/types';
import { SpectrumBar } from '@/components/SpectrumBar';
import { HeatBar } from '@/components/HeatBar';
import { WarningIndicator } from '@/components/WarningIndicator';
import { ArrowLeft, Building2, Calendar } from 'lucide-react';
import { ArticleHighlighter } from '@/components/ArticleHighlighter';


// ============================
// SECTION FORMATTER
// ============================

function formatAnalysis(text: string) {

  if (!text) return [];

  // Headers arrive in ALL CAPS from the database, e.g. "FRAMING", "LANGUAGE INTENSITY"
  const sections = text.split(
    /(FRAMING|LANGUAGE INTENSITY|SENSATIONALISM|OVERALL INTERPRETATION|ATTENTION AND SALIENCE|ATTENTION & SALIENCE|EMOTIONAL TRIGGERS|SOCIAL & IDENTITY CUES|SOCIAL AND IDENTITY CUES|MOTIVATION & ACTION SIGNALS|MOTIVATION AND ACTION SIGNALS|OVERALL BEHAVIOURAL INTERPRETATION)/g
  );

  const result: { title: string; content: string }[] = [];

  for (let i = 1; i < sections.length; i += 2) {

    result.push({
      title: sections[i],
      content: sections[i + 1]?.trim() || ""
    });

  }

  return result;

}



export default function ArticleDetailPage() {

  const { id } = useParams<{ id: string }>();

  const [article, setArticle] = useState<Article | null>(null);


  useEffect(() => {

    if (id) {

      getArticleById(id).then(a => setArticle(a || null));

    }

  }, [id]);


  if (!article) {

    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        Loading...
      </div>
    );

  }


  const biasSections = formatAnalysis(article.biasExplanation);

  const behaviouralSections = formatAnalysis(article.behaviouralAnalysis);


  return (

    <div className="p-6 lg:p-8 max-w-4xl space-y-6">


      <Link
        to="/explorer"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Explorer
      </Link>


      <div>

        <h1 className="text-2xl font-bold tracking-tight">
          {article.headline}
        </h1>

        <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">

          <span className="flex items-center gap-1">
            <Building2 className="h-3.5 w-3.5" />
            {article.publisher}
          </span>

          <span className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            {new Date(article.date).toLocaleDateString()}
          </span>

        </div>

      </div>



      {/* ARTICLE BODY WITH INFLUENCE HIGHLIGHTING */}

      <ArticleHighlighter article={article} />



      {/* SCORES */}

      <div className="grid gap-4 md:grid-cols-2">

        <div className="rounded-lg border bg-card p-5 shadow-sm space-y-4">

          <h2 className="text-sm font-semibold text-card-foreground">
            Analysis Scores
          </h2>

          <SpectrumBar value={article.politicalLeaning} height="lg" />

          <HeatBar value={article.emotionalIntensity} label="Emotional Intensity" />

          <HeatBar value={article.tribalActivation} label="Us vs Them Activation" color="red" />

          <HeatBar value={article.threatSignal} label="Threat Signal" color="red" />

          <HeatBar value={article.sensationalism} label="Sensationalism" color="orange" />

          <HeatBar value={article.groupConflict} label="Group Conflict" color="red" />

        </div>



        <div className="space-y-4">


          {/* RISK */}

          <div className="rounded-lg border bg-card p-5 shadow-sm">

            <h2 className="text-sm font-semibold text-card-foreground mb-2">
              Risk Assessment
            </h2>

            <div className="space-y-2">

              <WarningIndicator
                level={article.tribalActivation}
                label={`Us vs Them: ${Math.round(article.tribalActivation * 100)}%`}
              />

              <WarningIndicator
                level={article.threatSignal}
                label={`Threat Signal: ${Math.round(article.threatSignal * 100)}%`}
              />

              <WarningIndicator
                level={article.groupConflict}
                label={`Group Conflict: ${Math.round(article.groupConflict * 100)}%`}
              />

            </div>

          </div>



          {/* BIAS EXPLANATION */}

          <div className="rounded-lg border bg-card p-5 shadow-sm">

            <h2 className="text-sm font-semibold text-card-foreground mb-3">
              Bias Explanation
            </h2>

            <div className="space-y-4">

              {biasSections.length > 0 ? (

                biasSections.map((section, i) => (

                  <div key={i}>

                    <div className="text-xs font-semibold uppercase text-primary mb-1">
                      {section.title}
                    </div>

                    <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                      {section.content}
                    </div>

                  </div>

                ))

              ) : (

                <div className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {article.biasExplanation || "No bias explanation available."}
                </div>

              )}

            </div>

          </div>



          {/* BEHAVIOURAL ANALYSIS */}

          <div className="rounded-lg border bg-card p-5 shadow-sm">

            <h2 className="text-sm font-semibold text-card-foreground mb-3">
              Behavioural Analysis
            </h2>

            <div className="space-y-4">

              {behaviouralSections.length > 0 ? (

                behaviouralSections.map((section, i) => (

                  <div key={i}>

                    <div className="text-xs font-semibold uppercase text-primary mb-1">
                      {section.title}
                    </div>

                    <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                      {section.content}
                    </div>

                  </div>

                ))

              ) : (

                <div className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {article.behaviouralAnalysis || "No behavioural analysis available."}
                </div>

              )}

            </div>

          </div>


        </div>

      </div>



      {/* KEY SENTENCES */}

      {article.highlightedSentences?.length > 0 && (

        <div className="rounded-lg border bg-card p-5 shadow-sm">

          <h2 className="text-sm font-semibold text-card-foreground mb-3">
            Key Sentences
          </h2>

          <div className="space-y-2">

            {article.highlightedSentences.map((s, i) => (

              <div
                key={i}
                className="rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground border-l-2 border-primary"
              >
                "{s}"
              </div>

            ))}

          </div>

        </div>

      )}

    </div>

  );

}