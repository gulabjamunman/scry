import { useEffect, useState } from "react"
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts"
import { getArticles } from "@/lib/api"
import type { Article } from "@/lib/types"

interface Point {
  x: number
  y: number
  headline: string
  publisher: string
  date: string
  color: string
}

export default function IdeologicalMapPage() {

  const [data, setData] = useState<Point[]>([])

  useEffect(() => {

    getArticles().then((articles: Article[]) => {

      const mapped = articles.map(article => ({

        x: article.politicalLeaning ?? 0,

        // prevent log scale crash at zero
        y: Math.max(article.emotionalIntensity ?? 0.001, 0.001),

        headline: article.headline,

        publisher: article.publisher,

        date: article.date,

        color: getColor(article.politicalLeaning ?? 0)

      }))

      setData(mapped)

    })

  }, [])


  function getColor(leaning: number) {

    if (leaning < -0.2) return "#3b82f6"  // Left: blue

    if (leaning > 0.2) return "#ef4444"   // Right: red

    return "#6b7280"                      // Center: gray

  }


  function CustomDot(props: any) {

    const { cx, cy, payload } = props

    return (
      <circle
        cx={cx}
        cy={cy}
        r={6}
        fill={payload.color}
        opacity={0.85}
      />
    )

  }


  function CustomTooltip({ active, payload }: any) {

    if (!active || !payload?.length) return null

    const p = payload[0].payload

    return (

      <div className="bg-card border rounded p-3 shadow text-sm">

        <div className="font-semibold">{p.headline}</div>

        <div className="text-muted-foreground text-xs mt-1">
          {p.publisher} • {new Date(p.date).toLocaleDateString()}
        </div>

        <div className="mt-2 text-xs">
          Leaning: {p.x.toFixed(2)}<br/>
          Emotional intensity: {(p.y * 100).toFixed(1)}%
        </div>

      </div>

    )

  }


  return (

    <div className="space-y-6 p-6">

      <div>

        <h1 className="text-2xl font-bold">Ideological Map</h1>

        <p className="text-muted-foreground text-sm mt-1">
          Political leaning vs emotional intensity (log-scaled)
        </p>

      </div>


      {/* Legend */}

      <div className="flex gap-6 text-sm">

        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500"/>
          Left
        </div>

        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-gray-500"/>
          Center
        </div>

        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500"/>
          Right
        </div>

      </div>


      <div className="border rounded-lg bg-card p-4">

        <ResponsiveContainer width="100%" height={500}>

          <ScatterChart>

            <CartesianGrid strokeDasharray="3 3" />

            <XAxis
              type="number"
              dataKey="x"
              domain={[-1, 1]}
              tickFormatter={(v) =>
                v < -0.2 ? "Left"
                : v > 0.2 ? "Right"
                : "Center"
              }
              label={{
                value: "Political Leaning",
                position: "insideBottom",
                offset: -5
              }}
            />

            <YAxis
              type="number"
              dataKey="y"
              scale="log"
              domain={[0.001, 1]}
              tickFormatter={(v) => `${Math.round(v * 100)}%`}
              label={{
                value: "Emotional Intensity (log)",
                angle: -90,
                position: "insideLeft"
              }}
            />

            <Tooltip content={<CustomTooltip />} />

            <Scatter
              data={data}
              shape={<CustomDot />}
            />

          </ScatterChart>

        </ResponsiveContainer>

      </div>

    </div>

  )

}
