import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getArticleById, getReviewQueue, submitReview } from "@/lib/api";
import type { Article } from "@/lib/types";
import { SpectrumBar } from "@/components/SpectrumBar";
import { HeatBar } from "@/components/HeatBar";
import { ArrowLeft, Send, SkipForward } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";

type PoliticalDirection = "left" | "neutral" | "right" | null;

export default function ReviewPage() {
  const { articleId } = useParams<{ articleId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [article, setArticle] = useState<Article | null>(null);

  const [politicalDirection, setPoliticalDirection] = useState<PoliticalDirection>(null);
  const [politicalIntensity, setPoliticalIntensity] = useState(3);

  const [intensity, setIntensity] = useState(3);
  const [sensationalism, setSensationalism] = useState(3);
  const [threat, setThreat] = useState(3);
  const [groupConflict, setGroupConflict] = useState(3);

  const [comment, setComment] = useState("");
  const [highlighted, setHighlighted] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (articleId) {
      getArticleById(articleId).then((a) => {
        if (a) setArticle(a);
      });
    } else {
      getReviewQueue().then((q) => {
        if (q.length > 0) {
          navigate(`/review/${q[0].article.id}`, { replace: true });
        }
      });
    }
  }, [articleId, navigate]);

  function computePoliticalScore() {
    if (!politicalDirection) return 0;
    if (politicalDirection === "neutral") return 0;

    const magnitude = politicalIntensity / 5;

    return politicalDirection === "left"
      ? -magnitude
      : magnitude;
  }

  const handleSubmit = async () => {
    if (!article || !user) {
      toast.error("Authentication error");
      return;
    }

    setSubmitting(true);

    try {
      await submitReview({
        articleId: article.id,
        reviewerId: user.id,
        political: computePoliticalScore(),
        intensity,
        sensationalism,
        threat,
        groupConflict,
        comment,
        highlightedSentence: highlighted,
      });

      toast.success("Review submitted");

      const queue = await getReviewQueue();

      if (queue.length > 0) {
        navigate(`/review/${queue[0].article.id}`);
      } else {
        navigate("/reviewer");
      }

    } catch (e) {
      toast.error("Submission failed");
    }

    setSubmitting(false);
  };

  const handleSkip = async () => {
    toast.info("Article skipped");

    const queue = await getReviewQueue();

    if (queue.length > 0) {
      navigate(`/review/${queue[0].article.id}`);
    } else {
      navigate("/reviewer");
    }
  };

  if (!article) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        Loading...
      </div>
    );
  }

  const SliderField = ({
    label,
    value,
    onChange,
  }: {
    label: string;
    value: number;
    onChange: (v: number) => void;
  }) => (
    <div>
      <div className="flex justify-between mb-1">
        <label className="text-xs font-medium text-muted-foreground">
          {label}
        </label>
        <span className="text-xs font-semibold">{value}</span>
      </div>

      <input
        type="range"
        min={1}
        max={5}
        step={1}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full h-2 accent-primary cursor-pointer"
      />

      <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
        <span>Low</span>
        <span>High</span>
      </div>
    </div>
  );

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-5xl">

      <button
        onClick={() => navigate("/reviewer")}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </button>

      <h1 className="text-xl font-bold">Review Article</h1>

      <div className="grid gap-6 lg:grid-cols-2">

        {/* Article */}
        <div className="space-y-4">

          <div className="rounded-lg border bg-card p-5">

            <h2 className="font-semibold">{article.headline}</h2>

            <p className="text-xs text-muted-foreground mt-1">
              {article.publisher} · {new Date(article.date).toLocaleDateString()}
            </p>

            <div className="mt-3 whitespace-pre-line text-sm max-h-[400px] overflow-y-auto">
              {article.content}
            </div>

          </div>

          <div className="rounded-lg border bg-card p-5 space-y-3">

            <h3 className="text-sm font-semibold">AI Analysis</h3>

            <SpectrumBar value={article.politicalLeaning} height="sm" />

            <HeatBar value={article.emotionalIntensity} label="Emotional Intensity" />

            <HeatBar value={article.tribalActivation} label="Tribal Activation" color="red" />

          </div>

        </div>

        {/* Review */}
        <div className="rounded-lg border bg-card p-5 space-y-5">

          <h3 className="text-sm font-semibold">Your Review</h3>

          {/* Political Direction */}
          <div>
            <label className="text-xs font-medium text-muted-foreground">
              Political Direction
            </label>

            <div className="flex gap-2 mt-2">

              {["left", "neutral", "right"].map((dir) => (
                <button
                  key={dir}
                  onClick={() => setPoliticalDirection(dir as PoliticalDirection)}
                  className={`px-3 py-1 rounded border text-sm ${
                    politicalDirection === dir
                      ? "bg-primary text-white"
                      : "bg-background"
                  }`}
                >
                  {dir.toUpperCase()}
                </button>
              ))}

            </div>
          </div>

          {/* Political Intensity */}
          {politicalDirection && (
            <SliderField
              label="Political Intensity"
              value={politicalIntensity}
              onChange={setPoliticalIntensity}
            />
          )}

          <SliderField label="Emotional Intensity" value={intensity} onChange={setIntensity} />

          <SliderField label="Sensationalism" value={sensationalism} onChange={setSensationalism} />

          <SliderField label="Threat Signal" value={threat} onChange={setThreat} />

          <SliderField label="Group Conflict" value={groupConflict} onChange={setGroupConflict} />

          {/* Comment */}
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Optional comment"
            className="w-full border rounded p-2 text-sm"
          />

          {/* Buttons */}
          <div className="flex gap-2">

            <button
              onClick={handleSkip}
              className="flex-1 border rounded px-3 py-2 flex items-center justify-center gap-2"
            >
              <SkipForward className="h-4 w-4" />
              Skip
            </button>

            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-1 bg-primary text-white rounded px-3 py-2 flex items-center justify-center gap-2"
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
