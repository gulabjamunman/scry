import { supabase } from "./supabase"

import type {
  Article,
  DashboardStats,
  Reviewer,
  ReviewQueueItem
} from "./types"

import { getCurrentUser } from "./auth"



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
PERCENTILE ENGINE
============================================================ */

function percentileBuckets(rows: any[], field: string): number[] {

  const values =
    rows.map(r => Number(r[field]) || 0)
        .sort((a,b)=>a-b)

  const n = values.length

  if (!n) return [0,0,0,0,0]

  const p10 = values[Math.floor(n*0.1)]
  const p30 = values[Math.floor(n*0.3)]
  const p70 = values[Math.floor(n*0.7)]
  const p90 = values[Math.floor(n*0.9)]

  const buckets = [0,0,0,0,0]

  rows.forEach(r=>{

    const v = Number(r[field]) || 0

    if(v<=p10) buckets[0]++
    else if(v<=p30) buckets[1]++
    else if(v<=p70) buckets[2]++
    else if(v<=p90) buckets[3]++
    else buckets[4]++

  })

  return buckets
}



/* ============================================================
ARTICLES
============================================================ */

export async function getArticles(): Promise<Article[]> {

  const { data, error } =
    await supabase
      .from("processed_articles")
      .select("*")
      .order("publication_datetime",{ascending:false})

  if(error){

    console.error(error)
    return []

  }

  return (data||[]).map(mapArticle)
}



export async function getArticleById(id:string):Promise<Article|null>{

  const { data, error } =
    await supabase
      .from("processed_articles")
      .select("*")
      .eq("id",id)
      .single()

  if(error||!data){

    console.error(error)
    return null

  }

  return mapArticle(data)
}



/* ============================================================
REVIEWER
============================================================ */

export async function getReviewer(id:string):Promise<Reviewer|null>{

  const { data,error } =
    await supabase
      .from("reviewers")
      .select("*")
      .eq("id",id)
      .single()

  if(error||!data){

    console.error(error)
    return null

  }

  return {

    id:data.id,
    name:data.name||"",
    email:data.email||"",
    reviewCount:data.review_count||0,
    accuracy:data.accuracy||0,
    joinedAt:data.created_at||""

  }
}



/* ============================================================
REVIEW QUEUE
============================================================ */

export async function getReviewQueue(
  reviewerId:string
):Promise<ReviewQueueItem[]>{

  const { data:reviewed } =
    await supabase
      .from("human_reviews")
      .select("article_id")
      .eq("reviewer_id",reviewerId)

  const reviewedIds =
    reviewed?.map(r=>r.article_id)||[]

  let query =
    supabase
      .from("processed_articles")
      .select("*")
      .order("publication_datetime",{ascending:false})

  if(reviewedIds.length)
    query=query.not(
      "id",
      "in",
      `(${reviewedIds.join(",")})`
    )

  const { data,error } = await query

  if(error){

    console.error(error)
    return []

  }

  return (data||[]).map(row=>({

    id:row.id,
    article:mapArticle(row),
    aiPolitical:Number(row.ai_framing_direction)||0,
    aiIntensity:Number(row.ai_emotional_intensity)||0,
    aiTribal:Number(row.ai_us_vs_them_score)||0,

    priority:
      row.ai_us_vs_them_score>0.7
        ?"high"
        :row.ai_us_vs_them_score>0.4
        ?"medium"
        :"low"

  }))
}



/* ============================================================
SUBMIT REVIEW
============================================================ */

export async function submitReview(review:any):Promise<void>{

  // Only include columns that exist in human_reviews:
  // id, article_id, reviewer_id, political, intensity, sensational,
  // threat, group_conflict, highlight, created_at (auto), ai_* (populated separately)
  const payload = {
    article_id:    review.article_id,
    reviewer_id:   review.reviewer_id,
    political:     review.political,
    intensity:     review.intensity,
    sensational:   review.sensational,
    threat:        review.threat,
    group_conflict:review.group_conflict,
    highlight:     review.highlight || null,
  }

  const { error } =
    await supabase
      .from("human_reviews")
      .insert(payload)

  if(error)
    console.error("submitReview error:", error)
}



/* ============================================================
DASHBOARD STATS
============================================================ */

export async function getDashboardStats():Promise<DashboardStats>{

  const { data:rows,error } =
    await supabase
      .from("processed_articles")
      .select(`
        ai_framing_direction,
        ai_emotional_intensity,
        ai_us_vs_them_score,
        ai_sensationalism,
        publication_datetime
      `)

  if(error||!rows)
    throw error

  const totalArticles = rows.length

  const avgPoliticalLeaning =
    rows.reduce((s,r)=>s+Math.abs(r.ai_framing_direction||0),0)
    /totalArticles

  const avgEmotionalIntensity =
    rows.reduce((s,r)=>s+(r.ai_emotional_intensity||0),0)
    /totalArticles

  const avgTribalActivation =
    rows.reduce((s,r)=>s+(r.ai_us_vs_them_score||0),0)
    /totalArticles

  const avgSensationalism =
   rows.reduce((s,r)=>s+(r.ai_sensationalism||0),0)
   /totalArticles

  const biasBuckets={Left:0,Center:0,Right:0}

  rows.forEach(r=>{

    if(r.ai_framing_direction<-0.2)
      biasBuckets.Left++
    else if(r.ai_framing_direction>0.2)
      biasBuckets.Right++
    else
      biasBuckets.Center++

  })


  const biasDistribution=[

    {label:"Left",value:biasBuckets.Left,color:"#3b82f6"},
    {label:"Center",value:biasBuckets.Center,color:"#6b7280"},
    {label:"Right",value:biasBuckets.Right,color:"#ef4444"}

  ]


  const sensBuckets =
    percentileBuckets(rows,"ai_sensationalism")

  const intensityDistribution =
    ["Very Low","Low","Medium","High","Very High"]
      .map((range,i)=>({range,count:sensBuckets[i]}))


  const tribalBuckets =
    percentileBuckets(rows,"ai_us_vs_them_score")

  const tribalDistribution =
    ["Very Low","Low","Medium","High","Very High"]
      .map((level,i)=>({level,count:tribalBuckets[i]}))


  const timelineMap:any={}

  rows.forEach(r=>{

    if(!r.publication_datetime) return

    const d=r.publication_datetime.slice(0,10)

    if(!timelineMap[d])
      timelineMap[d]={date:d,articles:0,avgBias:0}

    timelineMap[d].articles++
    timelineMap[d].avgBias+=r.ai_framing_direction

  })


  const timelineData =
    Object.values(timelineMap)
      .map((d:any)=>({

        date:d.date,
        articles:d.articles,
        avgBias:d.avgBias/d.articles

      }))


  const { count:totalReviews } =
    await supabase
      .from("human_reviews")
      .select("*",{count:"exact",head:true})

  const { count:reviewerCount } =
    await supabase
      .from("reviewers")
      .select("*",{count:"exact",head:true})


  return{

    totalArticles,
    totalReviews:totalReviews||0,
    reviewerCount:reviewerCount||0,

    avgPoliticalLeaning,
    avgEmotionalIntensity,
    avgTribalActivation,
    avgSensationalism,

    biasDistribution,
    intensityDistribution,
    tribalDistribution,
    timelineData

  }
}


/* ============================================================
REVIEWER ANALYTICS
============================================================ */

export async function getReviewerAnalytics(){

  const user=await getCurrentUser()

  if(!user) return null

  const { data:reviews,error } =
    await supabase
      .from("human_reviews")
      .select("*")
      .eq("reviewer_id",user.id)

  if(error||!reviews?.length)
    return null

  const avg=(f:string)=>
    reviews.reduce((s:any,r:any)=>s+r[f],0)
    /reviews.length

  const avgThreat=avg("threat")
  const avgIntensity=avg("intensity")
  const avgPolitical=avg("political")

  let dominantType="Balanced reviewer"

  if(avgThreat>=4)
    dominantType="Threat-sensitive reviewer"
  else if(avgIntensity>=4)
    dominantType="Emotion-sensitive reviewer"
  else if(avgPolitical>=4)
    dominantType="Ideology-sensitive reviewer"

  return{

    reviewed:reviews.length,
    avgThreat,
    avgIntensity,
    avgPolitical,
    dominantType

  }
}
