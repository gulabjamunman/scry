import { useEffect, useState } from "react"
import { getDashboardStats } from "@/lib/api"
import type { DashboardStats } from "@/lib/types"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell
} from "recharts"



const PIE_COLORS = [
  "hsl(145, 60%, 42%)",
  "hsl(215, 50%, 65%)",
  "hsl(30, 90%, 55%)",
  "hsl(0, 50%, 65%)",
  "hsl(0, 85%, 48%)"
]



export default function AnalyticsPage() {

  const [stats, setStats] = useState<DashboardStats | null>(null)

  useEffect(() => {

    getDashboardStats()
      .then(setStats)
      .catch(err => {
        console.error("Dashboard stats error:", err)
        setStats(null)
      })

  }, [])


  if (!stats)
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        Loading analytics...
      </div>
    )



  /* ============================================
     SAFE NORMALIZATION LAYER
     Guarantees valid identity + structure
  ============================================ */

  function normalizeDistribution(
    source: any[] | undefined,
    labelKey: string,
    valueKey: string
  ) {

    if (!source || !Array.isArray(source))
      return []

    return source.map((item, i) => ({

      level:
        item?.[labelKey]
        ?? item?.level
        ?? item?.range
        ?? `Level ${i+1}`,

      count:
        Number(item?.[valueKey]
        ?? item?.count
        ?? item?.value
        ?? 0)

    }))

  }



  const sensationalismData =
    normalizeDistribution(
      stats.intensityDistribution,
      "range",
      "count"
    )


  const tribalData =
    normalizeDistribution(
      stats.tribalDistribution,
      "level",
      "count"
    )


  const threatData =
    normalizeDistribution(
      (stats as any).threatDistribution,
      "level",
      "count"
    ).length
      ? normalizeDistribution(
          (stats as any).threatDistribution,
          "level",
          "count"
        )
      : tribalData



  return (

    <div className="p-6 lg:p-8 space-y-6">


      <div>

        <h1 className="text-2xl font-bold tracking-tight">
          Analytics Dashboard
        </h1>

        <p className="text-sm text-muted-foreground mt-1">
          Behavioral signal distributions across analyzed media
        </p>

      </div>



      <div className="grid gap-6 lg:grid-cols-2">


        <DistributionBarChart
          title="Sensationalism Distribution"
          data={sensationalismData}
          color="hsl(var(--intensity-orange))"
        />


        <DistributionBarChart
          title="Threat Signal Distribution"
          data={threatData}
          color="hsl(var(--destructive))"
        />


        <DistributionPieChart
          title="Us vs Them Distribution"
          data={tribalData}
        />


      </div>


    </div>

  )

}



/* ============================================================
BAR CHART COMPONENT
============================================================ */

function DistributionBarChart({
  title,
  data,
  color
}: {
  title: string
  data: { level: string, count: number }[]
  color: string
}) {

  const safeData =
    data.map((item, i) => ({
      level: item.level || `Level ${i+1}`,
      count: Number(item.count) || 0
    }))


  return (

    <div className="rounded-lg border bg-card p-5 shadow-sm">


      <h2 className="mb-4 text-sm font-semibold text-card-foreground">
        {title}
      </h2>


      <ResponsiveContainer width="100%" height={280}>

        <BarChart data={safeData}>

          <CartesianGrid strokeDasharray="3 3" />

          <XAxis
            dataKey="level"
            tick={{ fontSize: 11 }}
          />

          <YAxis allowDecimals={false} />

          <Tooltip />


          <Bar
            dataKey="count"
            fill={color}
            radius={[4,4,0,0]}
            key={`bar-${title}`}
          />


        </BarChart>

      </ResponsiveContainer>


    </div>

  )

}



/* ============================================================
PIE CHART COMPONENT
============================================================ */

function DistributionPieChart({
  title,
  data
}: {
  title: string
  data: { level: string, count: number }[]
}) {

  const safeData =
    data.map((item, i) => ({
      level: item.level || `Level ${i+1}`,
      count: Number(item.count) || 0,
      key: `${title}-${item.level || i}-${i}`
    }))


  return (

    <div className="rounded-lg border bg-card p-5 shadow-sm lg:col-span-2">


      <h2 className="mb-4 text-sm font-semibold text-card-foreground">
        {title}
      </h2>


      <div className="flex flex-col md:flex-row items-center gap-6">


        <ResponsiveContainer width={260} height={260}>

          <PieChart>

            <Pie
              data={safeData}
              dataKey="count"
              nameKey="level"
              cx="50%"
              cy="50%"
              outerRadius={100}
              key={`pie-${title}`}
            >

              {safeData.map((entry, i) => (

                <Cell
                  key={`cell-${entry.key}`}
                  fill={PIE_COLORS[i % PIE_COLORS.length]}
                />

              ))}

            </Pie>


            <Tooltip />


          </PieChart>

        </ResponsiveContainer>



        <div className="space-y-2">

          {safeData.map((item, i) => (

            <div
              key={`legend-${item.key}`}
              className="flex items-center gap-2 text-sm"
            >

              <span
                className="h-3 w-3 rounded-sm"
                style={{
                  backgroundColor:
                    PIE_COLORS[i % PIE_COLORS.length]
                }}
              />

              <span className="text-muted-foreground">
                {item.level}:
              </span>

              <span className="font-semibold">
                {item.count}
              </span>

            </div>

          ))}

        </div>


      </div>


    </div>

  )

}
