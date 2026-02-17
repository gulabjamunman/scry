import { supabase } from "./supabase"

import type {
  Article,
  DashboardStats,
  Reviewer,
  ReviewQueueItem
} from "./types"



/* ============================================================
ARTICLE MAPPER
============================================================ */

function mapArticle(row: any): Article {

  return {

    id: row.id,

    headline: row.headline || "",

    publisher: row.publisher_name || row.publisher || "",

    date: row.publication_datetime || "",

    content: row.content || row.body || "",


    politicalLeaning: Number(row.ai_framing_direction) || 0,

    emotionalIntensity: Number(row.ai_emotional_intensity) || 0,

    tribalActivation: Number(row.ai_us_vs_them_score) || 0,

    threatSignal: Number(row.ai_threat_signal) || 0,

    sensationalism: Number(row.ai_sensationalism) || 0,

    groupConflict: Number(row.ai_us_vs_them_score) || 0,


    biasExplanation: row.bias_explanation || "",

    behaviouralAnalysis: row.behavioural_analysis || "",

    highlightedSentences: row.highlighted_sentences || []

  }

}



/* ============================================================
ARTICLES
============================================================ */

export async function getArticles(): Promise<Article[]> {

  const { data, error } = await supabase
    .from("processed_articles")
    .select("*")
    .order("publication_datetime", { ascending: false })

  if (error) {

    console.error(error)

    return []

  }

  return (data || []).map(mapArticle)

}



export async function getArticleById(id: string): Promise<Article | null> {

  const { data, error } = await supabase
    .from("processed_articles")
    .select("*")
    .eq("id", id)
    .single()

  if (error || !data) {

    console.error(error)

    return null

  }

  return mapArticle(data)

}



/* ============================================================
REVIEWER
============================================================ */

export async function getReviewer(id: string): Promise<Reviewer | null> {

  const { data, error } = await supabase
    .from("reviewers")
    .select("*")
    .eq("id", id)
    .single()

  if (error || !data) {

    console.error(error)

    return null

  }

  return {

    id: data.id,

    name: data.name,

    email: data.email ?? "",

    reviewCount: data.review_count ?? 0,

    accuracy: data.accuracy ?? 0,

    joinedAt: data.created_at ?? ""

  }

}



/* ============================================================
REVIEW QUEUE
============================================================ */

export async function getReviewQueue(
  reviewerId: string
): Promise<ReviewQueueItem[]> {

  const { data: reviewed } = await supabase
    .from("human_reviews")
    .select("article_id")
    .eq("reviewer_id", reviewerId)

  const reviewedIds = reviewed?.map(r => r.article_id) ?? []


  let query = supabase
    .from("processed_articles")
    .select("*")
    .order("publication_datetime", { ascending: false })


  if (reviewedIds.length > 0) {

    query = query.not("id", "in", `(${reviewedIds.join(",")})`)

  }


  const { data, error } = await query


  if (error) {

    console.error(error)

    return []

  }


  return (data || []).map(row => ({

    id: row.id,

    article: mapArticle(row),

    aiPolitical: Number(row.ai_framing_direction) || 0,

    aiIntensity: Number(row.ai_emotional_intensity) || 0,

    aiTribal: Number(row.ai_us_vs_them_score) || 0,

    priority:
      Number(row.ai_us_vs_them_score) > 0.7
        ? "high"
        : Number(row.ai_us_vs_them_score) > 0.4
        ? "medium"
        : "low"

  }))

}



/* ============================================================
SUBMIT REVIEW
============================================================ */

export async function submitReview(review: any): Promise<void> {

  const { error } = await supabase
    .from("human_reviews")
    .insert(review)

  if (error) console.error(error)

}



/* ============================================================
DASHBOARD STATS
============================================================ */

export async function getDashboardStats(): Promise<DashboardStats> {

  const { data: rows, error } = await supabase
    .from("processed_articles")
    .select(`
      ai_framing_direction,
      ai_emotional_intensity,
      ai_us_vs_them_score,
      ai_sensationalism,
      publication_datetime
    `)


  if (error || !rows) {

    console.error(error)

    return {

      totalArticles: 0,
      totalReviews: 0,
      reviewerCount: 0,

      avgPoliticalLeaning: 0,
      avgEmotionalIntensity: 0,
      avgTribalActivation: 0,
      avgSensationalism: 0,

      biasDistribution: [],
      intensityDistribution: [],
      tribalDistribution: [],
      timelineData: []

    }

  }


  const articles = rows.map(r => ({

    ideology: Number(r.ai_framing_direction),

    tribal: Number(r.ai_us_vs_them_score),

    sensationalism: Number(r.ai_sensationalism),

    date: r.publication_datetime

  }))


  const totalArticles = articles.length


  const avgPoliticalLeaning =
    articles.reduce((s, a) => s + Math.abs(a.ideology || 0), 0) / totalArticles


  const avgTribalActivation =
    articles.reduce((s, a) => s + (a.tribal || 0), 0) / totalArticles


  const avgSensationalism =
    articles.reduce((s, a) => s + (a.sensationalism || 0), 0) / totalArticles



  /* TIMELINE */

  const timelineMap: any = {}

  articles.forEach(a => {

    if (!a.date) return

    const d = a.date.slice(0, 10)

    if (!timelineMap[d])
      timelineMap[d] = { date: d, articles: 0, avgBias: 0 }

    timelineMap[d].articles++
    timelineMap[d].avgBias += a.ideology || 0

  })

  const timelineData = Object.values(timelineMap)



  /* BIAS DISTRIBUTION — bucketed into Left / Center / Right
     ai_framing_direction is assumed to be in range [-1, 1]
     Left:   < -0.2
     Center: -0.2 to 0.2
     Right:  > 0.2
  */

  const buckets: Record<string, number> = { Left: 0, Center: 0, Right: 0 }

  articles.forEach(a => {

    const v = a.ideology || 0

    if (v < -0.2)      buckets["Left"]++
    else if (v > 0.2)  buckets["Right"]++
    else               buckets["Center"]++

  })

  const biasDistribution = [
    { label: "Left",   value: buckets["Left"],   color: "#3b82f6" },
    { label: "Center", value: buckets["Center"],  color: "#6b7280" },
    { label: "Right",  value: buckets["Right"],   color: "#ef4444" }
  ]



  /* REVIEWER COUNTS */

  const { count: totalReviews } =
    await supabase
    .from("human_reviews")
    .select("*", { count: "exact", head: true })


  const { count: reviewerCount } =
    await supabase
    .from("reviewers")
    .select("*", { count: "exact", head: true })



  return {

    totalArticles,

    totalReviews: totalReviews || 0,

    reviewerCount: reviewerCount || 0,


    avgPoliticalLeaning,

    avgEmotionalIntensity: 0,

    avgTribalActivation,

    avgSensationalism,


    biasDistribution,

    intensityDistribution: [],

    tribalDistribution: [],

    timelineData

  }

}