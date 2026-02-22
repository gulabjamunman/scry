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
  const [skipping, setSkipping] = useState(false);
  const [loadingArticle, setLoadingArticle] = useState(true);

  // Political direction + intensity combine into a -5 to +5 value stored in `political`
  const [politicalLeaning, setPoliticalLeaning] = useState<PoliticalLeaning | null>(null);
  const [politicalIntensity, setPoliticalIntensity] = useState(3);

  // Maps to: intensity (int4)
  const [languageIntensity, setLanguageIntensity] = useState(3);
  // Maps to: sensational (int4)
  const [sensationalism, setSensationalism] = useState(3);
  // Maps to: threat (int4)
  const [threat, setThreat] = useState(3);
  // Maps to: group_conflict (int4)
  const [groupConflict, setGroupConflict] = useState(3);

  const [highlighted, setHighlighted] = useState("");

  // Skipped IDs persist across article navigations — never reset on article load
  const [skippedArticleIds, setSkippedArticleIds] = useState<string[]>([]);

  // Combines direction and intensity into a single -5 to +5 integer for `political`
  // Neutral always returns 0 regardless of intensity
  function computePoliticalValue(): number {
    if (!politicalLeaning || politicalLeaning === "neutral") return 0;
    const direction = politicalLeaning === "left" ? -1 : 1;
    return direction * politicalIntensity;
  }

  const loadNextFromQueue = useCallback(async (
    excludeId: string,           // the article we're moving away from — always exclude this
    overrideSkipped?: string[]   // synchronously-built skip list to avoid stale state
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

      // Only exclude: articles already skipped this session + the one we just left
      const excludedIds = new Set([
        ...skippedToUse,
        excludeId,
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
  }, [navigate, skippedArticleIds, user]);

  useEffect(() => {
    if (loading) return;

    if (!user) {
      navigate("/login");
      return;
    }

    async function loadArticle() {
      setLoadingArticle(true);

      try {
        // No articleId — pick the first available article from queue
        if (!articleId) {
          const queue = await getReviewQueue(user!.id);
          if (!queue || queue.length === 0) {
            navigate("/reviewer", { replace: true });
            return;
          }
          const first = queue.find(
            (item) => !skippedArticleIds.includes(String(item.article.id))
          );
          if (!first) {
            navigate("/reviewer", { replace: true });
            return;
          }
          navigate(`/review/${first.article.id}`, { replace: true });
          return;
        }

        const fetched = await getArticleById(articleId);

        if (!fetched) {
          toast.error("Article not found");
          navigate("/reviewer", { replace: true });
          return;
        }

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
        setPoliticalIntensity(3);
        setLanguageIntensity(3);
        setSensationalism(3);
        setThreat(3);
        setGroupConflict(3);
        setHighlighted("");
      } catch (err) {
        console.error(err);
        toast.error("Failed to load article");
      } finally {
        setLoadingArticle(false);
        setSkipping(false);
      }
    }

    loadArticle();
  }, [articleId, user, loading, navigate, loadNextFromQueue]);

  async function handleSubmit() {
    if (!article || !user) return;

    if (!politicalLeaning) {
      toast.error("Select political direction before submitting");
      return;
    }

    setSubmitting(true);

    try {
      await submitReview({
        article_id:    article.id,
        reviewer_id:   user.id,
        political:     computePoliticalValue(), // -5 to +5
        intensity:     languageIntensity,       // → intensity
        sensational:   sensationalism,          // → sensational
        threat:        threat,                  // → threat
        group_conflict:groupConflict,           // → group_conflict
        highlight:     highlighted || null,     // → highlight
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
    if (!article || skipping) return;

    setSkipping(true);
    toast.info("Article skipped");

    const newSkipped = [...skippedArticleIds, String(article.id)];
    setSkippedArticleIds(newSkipped);
    await loadNextFromQueue(article.id, newSkipped);
  }

  // Unified busy state — blocks all interaction while skipping or submitting
  const isBusy = skipping || submitting;

  if (loading || loadingArticle || !article) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        Loading article...
      </div>
    );
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
          className="w-full cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
        />
      </div>
    );
  }

  return (
    <div className="max-w-5xl space-y-6 p-6">
      <button
        onClick={() => navigate("/reviewer")}
        disabled={isBusy}
        className="flex items-center gap-1 text-sm text-muted-foreground disabled:opacity-40"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      {/* Fades and blocks all interaction while skipping or submitting */}
      <div className={`grid gap-6 lg:grid-cols-2 transition-opacity duration-150 ${isBusy ? "pointer-events-none opacity-40" : ""}`}>

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

          {/* Political Direction + Intensity → stored as direction × intensity in `political` */}
          <div className="space-y-3">
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
                    disabled={isBusy}
                    className={`rounded border py-2 text-sm transition-colors ${
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

            {/* Intensity slider — only shown when Left or Right is selected */}
            {politicalLeaning && politicalLeaning !== "neutral" && (
              <div>
                <div className="mb-1 flex justify-between">
                  <label className="text-xs text-muted-foreground">
                    {politicalLeaning === "left" ? "Left" : "Right"} Intensity
                  </label>
                  <span className="text-xs font-semibold">
                    {politicalLeaning === "left" ? "-" : "+"}{politicalIntensity}
                  </span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={5}
                  step={1}
                  value={politicalIntensity}
                  onChange={(e) => setPoliticalIntensity(parseInt(e.target.value, 10))}
                  disabled={isBusy}
                  className="w-full cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
                />
                <div className="mt-1 flex justify-between text-xs text-muted-foreground">
                  <span>Mild</span>
                  <span>Strong</span>
                </div>
              </div>
            )}

            {/* Show the computed value that will be stored */}
            {politicalLeaning && (
              <p className="text-xs text-muted-foreground">
                Stored value: <span className="font-semibold">{computePoliticalValue()}</span>
                {" "}(range: −5 to +5)
              </p>
            )}
          </div>

          {/* Language Intensity → intensity */}
          <SliderField
            label="Language Intensity"
            value={languageIntensity}
            onChange={setLanguageIntensity}
            disabled={isBusy}
          />

          {/* Sensationalism → sensational */}
          <SliderField
            label="Sensationalism"
            value={sensationalism}
            onChange={setSensationalism}
            disabled={isBusy}
          />

          {/* Threat Signal → threat */}
          <SliderField
            label="Threat Signal"
            value={threat}
            onChange={setThreat}
            disabled={isBusy}
          />

          {/* Group Conflict → group_conflict */}
          <SliderField
            label="Group Conflict"
            value={groupConflict}
            onChange={setGroupConflict}
            disabled={isBusy}
          />



          <div className="flex gap-2">
            <button
              onClick={handleSkip}
              disabled={isBusy}
              className="flex flex-1 items-center justify-center gap-2 rounded border py-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <SkipForward className="h-4 w-4" />
              {skipping ? "Skipping..." : "Skip"}
            </button>

            <button
              onClick={handleSubmit}
              disabled={isBusy || !politicalLeaning}
              className="flex flex-1 items-center justify-center gap-2 rounded bg-primary py-2 text-white disabled:cursor-not-allowed disabled:opacity-60"
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
