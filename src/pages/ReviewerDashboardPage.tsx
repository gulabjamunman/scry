import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

import {
  ClipboardCheck,
  Flame,
  LogOut,
  Building2,
  Brain
} from "lucide-react"

import { signOut, useAuth } from "@/lib/auth"
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

  const { user, loading: authLoading } = useAuth()

  const [analytics, setAnalytics] =
    useState<Analytics | null>(null)

  const [loading, setLoading] =
    useState(true)

  const [loggingOut, setLoggingOut] =
    useState(false)



  /* ============================
     LOAD ANALYTICS SAFELY
  ============================ */

  useEffect(() => {

    async function load() {

      try {

        // wait until auth finishes resolving
        if (authLoading)
          return

        // if no user, redirect to login
        if (!user) {

          navigate("/login")
          return

        }

        const data =
          await getReviewerAnalytics()

        if (!data) {

          setAnalytics({

            reviewed: 0,
            total: 0,

            streak: 0,

            avgPolitical: 0,
            avgIntensity: 0,
            avgThreat: 0,
            avgSensationalism: 0,
            avgGroupConflict: 0,

            publishers: [],

            dominantType: "New reviewer",

            ideologyBias: "No pattern detected"

          })

        }
        else {

          setAnalytics(data)

        }

      }
      catch (err) {

        console.error("Dashboard load error:", err)

        setAnalytics({

          reviewed: 0,
          total: 0,

          streak: 0,

          avgPolitical: 0,
          avgIntensity: 0,
          avgThreat: 0,
          avgSensationalism: 0,
          avgGroupConflict: 0,

          publishers: [],

          dominantType: "Error loading profile",

          ideologyBias: "Unavailable"

        })

      }

      setLoading(false)

    }

    load()

  }, [user, authLoading, navigate])



  /* ============================
     LOGOUT
  ============================ */

  async function handleLogout() {

    setLoggingOut(true)

    await signOut()

    navigate("/login")

  }



  /* ============================
     LOADING STATE
  ============================ */

  if (loading || authLoading) {

    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        Loading dashboard...
      </div>
    )

  }



  if (!analytics) {

    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        Failed to load dashboard
      </div>
    )

  }



  /* ============================
     PROGRESS CALCULATION
  ============================ */

  const progress =
    analytics.total === 0
      ? 0
      : (analytics.reviewed / analytics.total) * 100



  /* ============================
     AI INTERPRETATION TEXT
  ============================ */

  function aiInterpretation() {

    return `
You appear to be a ${analytics.dominantType}.

Your ideological detection pattern suggests:
${analytics.ideologyBias}.

Your emotional sensitivity score:
${analytics.avgIntensity.toFixed(2)} / 5

Your threat sensitivity score:
${analytics.avgThreat.toFixed(2)} / 5

Your sensationalism sensitivity score:
${analytics.avgSensationalism.toFixed(2)} / 5

This profile represents how your cognitive system detects narrative signals.
`

  }



  /* ============================
     COMPONENT UI
  ============================ */

  return (

    <div className="p-6 lg:p-8 space-y-6 max-w-5xl">


      {/* HEADER */}

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



      {/* PROGRESS */}

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
            className="bg-primary h-2 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />

        </div>

      </div>



      {/* STREAK */}

      <div className="border rounded-lg p-5 bg-card space-y-2">

        <div className="flex items-center gap-2 font-semibold">

          <Flame className="h-4 w-4 text-orange-500" />

          Review Streak

        </div>

        <div className="text-lg font-bold">

          {analytics.streak} days

        </div>

      </div>



      {/* PUBLISHERS */}

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

          {analytics.publishers.map((p, i) => (

            <div
              key={`${p.publisher}-${i}`}
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



      {/* PERCEPTUAL PROFILE */}

      <div className="border rounded-lg p-5 bg-card space-y-3">

        <div className="font-semibold">
          Your Perceptual Profile
        </div>

        <div className="text-sm space-y-1">

          <div>
            Emotional sensitivity:
            {" "}
            {analytics.avgIntensity.toFixed(2)} / 5
          </div>

          <div>
            Threat sensitivity:
            {" "}
            {analytics.avgThreat.toFixed(2)} / 5
          </div>

          <div>
            Sensationalism sensitivity:
            {" "}
            {analytics.avgSensationalism.toFixed(2)} / 5
          </div>

          <div>
            Ideological sensitivity:
            {" "}
            {analytics.avgPolitical.toFixed(2)} / 5
          </div>

        </div>

      </div>



      {/* AI INTERPRETATION */}

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
