import { useEffect, useState } from "react"

import { useNavigate } from "react-router-dom"

import {
  ClipboardCheck,
  Flame,
  LogOut,
  Building2,
  Brain
} from "lucide-react"

import { signOut } from "@/lib/auth"

import { getReviewerAnalytics } from "@/lib/api"



type Analytics = {

  reviewed: number
  total: number

  streak: number

  avgPolitical: number
  avgIntensity: number
  avgThreat: number
  avgSensationalism: number
  avgGroupConflict: number

  publishers: {
    publisher: string
    count: number
  }[]

  dominantType: string

  ideologyBias: string

}



export default function ReviewerDashboardPage() {

  const navigate = useNavigate()

  const [analytics, setAnalytics] =
    useState<Analytics | null>(null)

  const [loggingOut, setLoggingOut] =
    useState(false)



  useEffect(() => {

    getReviewerAnalytics()
      .then(setAnalytics)

  }, [])



  async function handleLogout() {

    setLoggingOut(true)

    await signOut()

    navigate("/login")

  }



  if (!analytics) {

    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        Loading dashboard...
      </div>
    )

  }



  const progress =
    analytics.total === 0
      ? 0
      : (analytics.reviewed / analytics.total) * 100



  function aiInterpretation() {

    return `
You appear to be a ${analytics.dominantType}.
Your ideological detection pattern suggests: ${analytics.ideologyBias}.

Your emotional intensity sensitivity score is ${analytics.avgIntensity.toFixed(2)}.
Your threat sensitivity score is ${analytics.avgThreat.toFixed(2)}.

This indicates how your perceptual system prioritizes narrative signals.
    `

  }



  return (

    <div className="p-6 lg:p-8 space-y-6 max-w-5xl">

      {/* Header */}

      <div className="flex justify-between items-center">

        <div>

          <h1 className="text-2xl font-bold">
            Reviewer Dashboard
          </h1>

          <p className="text-sm text-muted-foreground">
            Your perceptual telemetry and activity profile
          </p>

        </div>


        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="flex items-center gap-2 border px-3 py-2 rounded-lg hover:bg-muted transition"
        >

          <LogOut className="h-4 w-4" />

          {loggingOut ? "Logging out..." : "Logout"}

        </button>

      </div>



      {/* Progress */}

      <div className="border rounded-lg p-5 bg-card space-y-3">

        <div className="flex items-center gap-2 font-semibold">

          <ClipboardCheck className="h-4 w-4" />

          Review Progress

        </div>

        <div className="text-sm">

          {analytics.reviewed} / {analytics.total} articles reviewed

        </div>

        <div className="w-full bg-muted rounded-full h-2">

          <div
            className="bg-primary h-2 rounded-full"
            style={{ width: `${progress}%` }}
          />

        </div>

      </div>



      {/* Streak */}

      <div className="border rounded-lg p-5 bg-card space-y-2">

        <div className="flex items-center gap-2 font-semibold">

          <Flame className="h-4 w-4 text-orange-500" />

          Review Streak

        </div>

        <div className="text-lg font-bold">

          {analytics.streak} days

        </div>

      </div>



      {/* Publisher distribution */}

      <div className="border rounded-lg p-5 bg-card space-y-3">

        <div className="flex items-center gap-2 font-semibold">

          <Building2 className="h-4 w-4" />

          Most Reviewed Publishers

        </div>

        <div className="space-y-1">

          {analytics.publishers.length === 0 && (
            <div className="text-sm text-muted-foreground">
              No reviews yet
            </div>
          )}

          {analytics.publishers.map(p => (

            <div
              key={p.publisher}
              className="flex justify-between text-sm"
            >

              <span>{p.publisher}</span>

              <span className="font-semibold">
                {p.count}
              </span>

            </div>

          ))}

        </div>

      </div>



      {/* Perceptual averages */}

      <div className="border rounded-lg p-5 bg-card space-y-3">

        <div className="font-semibold">
          Your Perceptual Profile
        </div>

        <div className="text-sm space-y-1">

          <div>
            Emotional sensitivity:
            {" "}
            {analytics.avgIntensity.toFixed(2)}
          </div>

          <div>
            Threat sensitivity:
            {" "}
            {analytics.avgThreat.toFixed(2)}
          </div>

          <div>
            Sensationalism sensitivity:
            {" "}
            {analytics.avgSensationalism.toFixed(2)}
          </div>

          <div>
            Ideological sensitivity:
            {" "}
            {analytics.avgPolitical.toFixed(2)}
          </div>

        </div>

      </div>



      {/* AI interpretation */}

      <div className="border rounded-lg p-5 bg-card space-y-3">

        <div className="flex items-center gap-2 font-semibold">

          <Brain className="h-4 w-4" />

          AI Interpretation of Your Review Pattern

        </div>

        <div className="text-sm whitespace-pre-line">

          {aiInterpretation()}

        </div>

      </div>



    </div>

  )

}
