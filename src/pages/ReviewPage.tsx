import { useCallback, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getArticleById, getReviewQueue, submitReview } from "@/lib/api";
import type { Article } from "@/lib/types";
import { SpectrumBar } from "@/components/SpectrumBar";
import { HeatBar } from "@/components/HeatBar";
import { ArrowLeft, Send, SkipForward } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";

const MIN_CONTENT_LENGTH = 120;

type PoliticalLeaning = "left" | "neutral" | "right";

export default function ReviewPage() {
  const { articleId } = useParams<{ articleId: string }>();
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  const [article, setArticle] = useState<Article | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [loadingArticle, setLoadingArticle] = useState(true);

  // Maps to: political (int -1 | 0 | 1)
  const [politicalLeaning, setPoliticalLeaning] = useState<PoliticalLeaning | null>(null);
  // Maps to: intensity (int4)
  const [languageIntensity, setLanguageIntensity] = useState(3);
  // Maps to: sensational (int4)
  const [sensationalism, setSensationalism] = useState(3);
  // Maps to: threat (int4)
  const [threat, setThreat] = useState(3);
  // Maps to: group_conflict (int4)
  const [groupConflict, setGroupConflict] = useState(3);

  const [comment, setComment] = useState("");
  const [highlighted, setHighlighted] = useState("");

  // Skipped IDs live outside the effect so they persist across article navigations
  const [skippedArticleIds, setSkippedArticleIds] = useState<string[]>([]);

  const loadNextFromQueue = useCallback(async (
    skipArticleId?: string,
    overrideSkipped?: string[]
  ) => {
    if (!user) return;

    try {
      setArticle(null);

      const queue = await getReviewQueue(user.id);

      if (!queue || queue.length === 0) {
        navigate("/reviewer", { replace: true });
        return;
      }

      const skippedToUse = overrideSkipped ?? skippedArticleIds;

      const excludedIds = new Set([
        ...skippedToUse,
        ...(skipArticleId ? [String(skipArticleId)] : []),
        ...(articleId ? [String(articleId)] : []),
      ]);

      const nextArticle = queue.find((item) => !excludedIds.has(String(item.article.id)));

      if (!nextArticle) {
        navigate("/reviewer", { replace: true });
        return;
      }

      navigate(`/review/${nextArticle.article.id}`, { replace: true });
    } catch (err) {
      console.error(err);
      toast.error("Failed to load review queue");
    }
  }, [articleId, navigate, skippedArticleIds, user]);

  useEffect(() => {
    if (loading) return;

    if (!user) {
      navigate("/login");
      return;
    }

    async function loadArticle() {
      setLoadingArticle(true);

      try {
        if (!articleId) {
          await loadNextFromQueue();
          return;
        }

        const fetched = await getArticleById(articleId);

        if (!fetched) {
          await loadNextFromQueue();
          return;
        }

        const fetched = await getArticleById(articleId);
        console.log({
          id: fetched?.id,
          contentLength: fetched?.content?.trim().length,
          contentPreview: fetched?.content?.slice(0, 150),
          rawContent: fetched?.content,
        });
        
        // Auto-skip articles that are too short
        const contentLength = fetched.content?.trim().length || 0;
        if (contentLength < MIN_CONTENT_LENGTH) {
          toast.info("Article too short — auto-skipped");
          const newSkipped = [...skippedArticleIds, String(fetched.id)];
          setSkippedArticleIds(newSkipped);
          await loadNextFromQueue(fetched.id, newSkipped);
          return;
        }

        setArticle(fetched);

        // Reset form fields only — do NOT reset skippedArticleIds here
        setPoliticalLeaning(null);
        setLanguageIntensity(3);
        setSensationalism(3);
        setThreat(3);
        setGroupConflict(3);
        setComment("");
        setHighlighted("");
      } catch (err) {
        console.error(err);
        toast.error("Failed to load article");
      } finally {
        setLoadingArticle(false);
      }
    }

    loadArticle();
  }, [articleId, user, loading, navigate, loadNextFromQueue]);

  function mapPoliticalValue(value: PoliticalLeaning): -1 | 0 | 1 {
    if (value === "left") return -1;
    if (value === "right") return 1;
    return 0;
  }

  async function handleSubmit() {
    if (!article || !user) return;

    if (!politicalLeaning) {
      toast.error("Select political leaning before submitting");
      return;
    }

    setSubmitting(true);

    try {
      await submitReview({
        article_id:       article.id,
        reviewer_id:      user.id,
        political:        mapPoliticalValue(politicalLeaning), // political
        intensity:        languageIntensity,                   // intensity
        sensational:      sensationalism,                      // sensational
        threat:           threat,                              // threat
        group_conflict:   groupConflict,                       // group_conflict
        comment,
        highlighted_sentence: highlighted,
      });

      toast.success("Review submitted");
      await loadNextFromQueue(article.id);
    } catch (err) {
      console.error(err);
      toast.error("Submission failed");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSkip() {
    if (!article) return;

    toast.info("Article skipped");

    const newSkipped = [...skippedArticleIds, String(article.id)];
    setSkippedArticleIds(newSkipped);
    await loadNextFromQueue(article.id, newSkipped);
  }

  if (loading || loadingArticle || !article) {
    return <div className="flex h-full items-center justify-center text-muted-foreground">Loading article...</div>;
  }

  function SliderField({
    label,
    value,
    onChange,
    disabled,
  }: {
    label: string;
    value: number;
    onChange: (v: number) => void;
    disabled?: boolean;
  }) {
    return (
      <div>
        <div className="mb-1 flex justify-between">
          <label className="text-xs text-muted-foreground">{label}</label>
          <span className="text-xs font-semibold">{value}</span>
        </div>
        <input
          type="range"
          min={1}
          max={5}
          step={1}
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value, 10))}
          disabled={disabled}
          className="w-full cursor-pointer disabled:cursor-not-allowed"
        />
      </div>
    );
  }

  return (
    <div className="max-w-5xl space-y-6 p-6">
      <button onClick={() => navigate("/reviewer")} className="flex items-center gap-1 text-sm text-muted-foreground">
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left column — article content + AI scores */}
        <div className="space-y-4">
          <div className="rounded-lg border p-5">
            <h2 className="font-semibold">{article.headline}</h2>
            <p className="text-xs text-muted-foreground">{article.publisher}</p>
            <div className="mt-3 max-h-[400px] overflow-y-auto whitespace-pre-line text-sm">{article.content}</div>
          </div>

          <div className="space-y-2 rounded-lg border p-5">
            <SpectrumBar value={article.politicalLeaning} />
            <HeatBar value={article.emotionalIntensity} label="Intensity" />
            <HeatBar value={article.tribalActivation} label="Us vs Them" />
          </div>
        </div>

        {/* Right column — review form */}
        <div className="space-y-4 rounded-lg border p-5">

          {/* 1. Political Direction → political */}
          <div className="space-y-2">
            <label className="text-xs text-muted-foreground">Political Direction</label>
            <div className="grid grid-cols-3 gap-2">
              {([
                { key: "left",    label: "Left"    },
                { key: "neutral", label: "Neutral" },
                { key: "right",   label: "Right"   },
              ] as const).map((option) => (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => setPoliticalLeaning(option.key)}
                  className={`rounded border py-2 text-sm ${
                    politicalLeaning === option.key ? "bg-primary text-white" : "bg-background"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
            {!politicalLeaning && (
              <p className="text-xs text-muted-foreground">Please select a political direction.</p>
            )}
          </div>

          {/* 2. Language Intensity → intensity */}
          <SliderField
            label="Language Intensity"
            value={languageIntensity}
            onChange={setLanguageIntensity}
          />

          {/* 3. Sensationalism → sensational */}
          <SliderField
            label="Sensationalism"
            value={sensationalism}
            onChange={setSensationalism}
          />

          {/* 4. Threat Signal → threat */}
          <SliderField
            label="Threat Signal"
            value={threat}
            onChange={setThreat}
          />

          {/* 5. Group Conflict → group_conflict */}
          <SliderField
            label="Group Conflict"
            value={groupConflict}
            onChange={setGroupConflict}
          />

          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full rounded border p-2"
            placeholder="Optional comment"
          />

          <div className="flex gap-2">
            <button
              onClick={handleSkip}
              className="flex flex-1 items-center justify-center gap-2 rounded border py-2"
            >
              <SkipForward className="h-4 w-4" />
              Skip
            </button>

            <button
              onClick={handleSubmit}
              disabled={submitting || !politicalLeaning}
              className="flex flex-1 items-center justify-center gap-2 rounded bg-primary py-2 text-white disabled:opacity-60"
            >
              <Send className="h-4 w-4" />
              {submitting ? "Submitting..." : "Submit"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
