import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getArticleById, getReviewQueue, submitReview } from "@/lib/api";
import type { Article } from "@/lib/types";
import { SpectrumBar } from "@/components/SpectrumBar";
import { HeatBar } from "@/components/HeatBar";
import { ArrowLeft, Send, SkipForward, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";


const MIN_CONTENT_LENGTH = 200;


export default function ReviewPage() {

  const { articleId } = useParams<{ articleId: string }>();

  const navigate = useNavigate();

  const { user, loading } = useAuth();


  const [article, setArticle] = useState<Article | null>(null);

  const [submitting, setSubmitting] = useState(false);

  const [loadingArticle, setLoadingArticle] = useState(true);


  const [intensity, setIntensity] = useState(3);

  const [sensationalism, setSensationalism] = useState(3);

  const [threat, setThreat] = useState(3);

  const [groupConflict, setGroupConflict] = useState(3);


  const [comment, setComment] = useState("");

  const [highlighted, setHighlighted] = useState("");



  /* ============================================
     LOAD ARTICLE OR REDIRECT TO NEXT IN QUEUE
  ============================================ */

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

        setArticle(fetched);

      }
      catch (err) {

        console.error(err);
        toast.error("Failed to load article");

      }
      finally {

        setLoadingArticle(false);

      }

    }

    loadArticle();

  }, [articleId, user, loading]);



  /* ============================================
     LOAD NEXT ARTICLE FROM QUEUE
  ============================================ */

  async function loadNextFromQueue() {

    if (!user) return;

    try {

      setArticle(null);

      const queue = await getReviewQueue(user.id);

      if (!queue || queue.length === 0) {

        navigate("/reviewer", { replace: true });
        return;

      }

      const nextId = queue[0].article.id;

      navigate(`/review/${nextId}`, { replace: true });

    }
    catch (err) {

      console.error(err);
      toast.error("Failed to load review queue");

    }

  }



  /* ============================================
     CONTENT VALIDATION
  ============================================ */

  const contentLength =
    article?.content?.trim().length || 0;

  const isContentValid =
    contentLength >= MIN_CONTENT_LENGTH;



  /* ============================================
     SUBMIT REVIEW
  ============================================ */

  async function handleSubmit() {

    if (!article || !user)
      return;

    if (!isContentValid) {

      toast.error("Article too short. Please skip.");
      return;

    }

    setSubmitting(true);

    try {

      await submitReview({

        article_id: article.id,

        reviewer_id: user.id,

        political: 0,

        intensity,

        sensational: sensationalism,

        threat,

        group_conflict: groupConflict,

        comment,

        highlighted_sentence: highlighted,

      });

      toast.success("Review submitted");

      await loadNextFromQueue();

    }
    catch (err) {

      console.error(err);

      toast.error("Submission failed");

    }
    finally {

      setSubmitting(false);

    }

  }



  /* ============================================
     SKIP ARTICLE
  ============================================ */

  async function handleSkip() {

    toast.info("Article skipped");

    await loadNextFromQueue();

  }



  /* ============================================
     LOADING STATE
  ============================================ */

  if (loading || loadingArticle || !article) {

    return (

      <div className="flex h-full items-center justify-center text-muted-foreground">

        Loading article...

      </div>

    );

  }



  /* ============================================
     SLIDER COMPONENT
  ============================================ */

  function SliderField({

    label,
    value,
    onChange,

  }: {

    label: string;
    value: number;
    onChange: (v:number)=>void;

  }) {

    return (

      <div>

        <div className="flex justify-between mb-1">

          <label className="text-xs text-muted-foreground">

            {label}

          </label>

          <span className="text-xs font-semibold">

            {value}

          </span>

        </div>

        <input
          type="range"
          min={1}
          max={5}
          step={1}
          value={value}
          onChange={(e)=>onChange(parseInt(e.target.value))}
          className="w-full cursor-pointer"
        />

      </div>

    );

  }



  /* ============================================
     UI
  ============================================ */

  return (

    <div className="p-6 max-w-5xl space-y-6">

      <button
        onClick={()=>navigate("/reviewer")}
        className="flex items-center gap-1 text-sm text-muted-foreground"
      >

        <ArrowLeft className="h-4 w-4"/>

        Back

      </button>



      <div className="grid lg:grid-cols-2 gap-6">



        {/* ARTICLE PANEL */}

        <div className="space-y-4">

          <div className="border rounded-lg p-5">

            <h2 className="font-semibold">

              {article.headline}

            </h2>

            <p className="text-xs text-muted-foreground">

              {article.publisher}

            </p>



            {!isContentValid && (

              <div className="text-yellow-600 flex gap-2 mt-3 text-sm">

                <AlertTriangle className="h-4 w-4"/>

                Article too short ({contentLength} chars). Please skip.

              </div>

            )}



            <div className="mt-3 text-sm whitespace-pre-line max-h-[400px] overflow-y-auto">

              {article.content}

            </div>

          </div>



          <div className="border rounded-lg p-5 space-y-2">

            <SpectrumBar value={article.politicalLeaning}/>

            <HeatBar value={article.emotionalIntensity} label="Intensity"/>

            <HeatBar value={article.tribalActivation} label="Us vs Them"/>

          </div>

        </div>



        {/* REVIEW PANEL */}

        <div className="border rounded-lg p-5 space-y-4">

          <SliderField label="Emotional Intensity" value={intensity} onChange={setIntensity}/>

          <SliderField label="Sensationalism" value={sensationalism} onChange={setSensationalism}/>

          <SliderField label="Threat Signal" value={threat} onChange={setThreat}/>

          <SliderField label="Group Conflict" value={groupConflict} onChange={setGroupConflict}/>



          <textarea
            value={comment}
            onChange={(e)=>setComment(e.target.value)}
            className="w-full border rounded p-2"
            placeholder="Optional comment"
          />



          <div className="flex gap-2">

            <button
              onClick={handleSkip}
              className="flex-1 border rounded py-2 flex gap-2 justify-center items-center"
            >

              <SkipForward className="h-4 w-4"/>

              Skip

            </button>



            <button
              onClick={handleSubmit}
              disabled={!isContentValid || submitting}
              className="flex-1 bg-primary text-white rounded py-2 flex gap-2 justify-center items-center"
            >

              <Send className="h-4 w-4"/>

              {submitting ? "Submitting..." : "Submit"}

            </button>

          </div>

        </div>



      </div>

    </div>

  );

}
