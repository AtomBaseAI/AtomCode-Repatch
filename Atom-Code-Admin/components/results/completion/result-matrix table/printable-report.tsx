"use client"

import * as React from "react"
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { CheckCircle, TrendingUp, AlertCircle, Clock } from "lucide-react"

// Re-declare types and helper functions needed for this component
type ResultTableModuleType = {
  modulename: string
  totalscore: number
  maxscore: number
  errors: number
  compiles: number
  time: number
}

// Function to format minutes into HH:MM
const formatMinutesToHHMM = (minutes: number) => {
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = Math.round(minutes % 60)
  return `${String(hours).padStart(2, "0")}:${String(remainingMinutes).padStart(2, "0")}`
}

// Function to format hours (decimal) into HH:MM
const formatHoursToHHMM = (hours: number) => {
  const totalMinutes = hours * 60
  return formatMinutesToHHMM(totalMinutes)
}

const CustomXAxisTick = (props: any) => {
  const { x, y, payload } = props
  if (!payload || !payload.value) {
    return null
  }
  const text = payload.value.toString()
  const words = text.split(/[\s:]+/).filter((word: any) => word.length > 0)
  return (
    <g transform={`translate(${x},${y})`}>
      <text x={0} y={0} dy={16} textAnchor="middle" fill="#666" fontSize="12">
        {words.map((word: string, index: number) => (
          <tspan key={index} x="0" dy={index === 0 ? "1.2em" : "1.2em"}>
            {word}
          </tspan>
        ))}
      </text>
    </g>
  )
}

const CustomTimeTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const timeValue = payload[0].value
    const timeFormatted = formatHoursToHHMM(timeValue)
    return (
      <div className="bg-background border rounded-lg shadow-lg p-3">
        <p className="font-medium">{label}</p>
        <p className="text-sm">
          <span className="inline-block w-3 h-3 rounded-full mr-2" style={{ backgroundColor: payload[0].color }}></span>
          Time: {timeFormatted}
        </p>
      </div>
    )
  }
  return null
}

const CustomOverallTooltip = ({ active, payload, label, config }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border rounded-lg shadow-lg p-3">
        <p className="font-medium">{label}</p>
        {payload.map((entry: any, index: number) => {
          const { dataKey, value, color } = entry
          const itemConfig = config[dataKey]
          let displayValue = value

          if (dataKey === "time") {
            displayValue = formatHoursToHHMM(value)
          }

          return (
            <p key={`item-${index}`} className="text-sm">
              <span className="inline-block w-3 h-3 rounded-full mr-2" style={{ backgroundColor: color }}></span>
              {itemConfig?.label || dataKey}: {displayValue}
            </p>
          )
        })}
      </div>
    )
  }
  return null
}

interface PrintableReportProps {
  mdata: ResultTableModuleType[]
  processedMdata: ResultTableModuleType[]
  scoreData: any[]
  performanceData: any[]
  timeData: any[]
  name: string
  rollnumber: string
  averageScore: number
  totalModules: number
  totalErrors: number
  totalTimeFormatted: string
  scoreChartConfig: ChartConfig
  performanceChartConfig: ChartConfig
  timeChartConfig: ChartConfig
  overallChartConfig: ChartConfig
}

const PrintableReport = React.forwardRef<HTMLDivElement, PrintableReportProps>(
  (
    {
      mdata,
      processedMdata,
      scoreData,
      performanceData,
      timeData,
      name,
      rollnumber,
      averageScore,
      totalModules,
      totalErrors,
      totalTimeFormatted,
      scoreChartConfig,
      performanceChartConfig,
      timeChartConfig,
      overallChartConfig,
    },
    ref,
  ) => {
    return (
      <div ref={ref} className="p-6 bg-white">
        {/* Page 1: Overview */}
        <div className="print-page-break mb-8">
          <CardHeader className="flex flex-row justify-between items-center">
            <div>
              <CardTitle className="text-2xl">
                {name} : {rollnumber}
              </CardTitle>
              <CardDescription className="text-lg">Performance Analysis Dashboard - Overview</CardDescription>
            </div>
          </CardHeader>
          <div className="px-6 pb-4">
            <div className="grid grid-cols-4 gap-4 mb-6">
              <Card className="h-full w-full flex justify-center items-center py-6">
                <CardContent className="p-0 h-full w-full flex items-center justify-center gap-2">
                  <div className="h-full w-[65%] flex items-center justify-center flex-row gap-4">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                    <p className="text-xl w-1/2">Avg Score</p>
                  </div>
                  <div className="h-full w-[35%] flex items-center justify-start px-4">
                    <p className="text-2xl font-semibold text-green-600 w-1/2">{averageScore.toFixed(1)}%</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="h-full w-full flex justify-center items-center py-6">
                <CardContent className="p-0 h-full w-full flex items-center justify-center gap-2">
                  <div className="h-full w-[65%] flex items-center justify-center flex-row gap-4">
                    <TrendingUp className="h-8 w-8 text-blue-600" />
                    <p className="text-xl w-1/2">Modules</p>
                  </div>
                  <div className="h-full w-[35%] flex items-center justify-end px-4 ">
                    <p className="text-2xl font-semibold text-blue-600 w-1/2">{totalModules}</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="h-full w-full flex justify-center items-center py-6">
                <CardContent className="p-0 h-full w-full flex items-center justify-center gap-2">
                  <div className="h-full w-[65%] flex items-center justify-center flex-row gap-4">
                    <AlertCircle className="h-8 w-8 text-red-600" />
                    <p className="text-xl w-1/2">Total Errors</p>
                  </div>
                  <div className="h-full w-[35%] flex items-center justify-end px-4 ">
                    <p className="text-2xl font-semibold text-red-600 w-1/2">{totalErrors}</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="h-full w-full flex justify-center items-center py-6">
                <CardContent className="p-0 h-full w-full flex items-center justify-center gap-2">
                  <div className="h-full w-[65%] flex items-center justify-center flex-row gap-4">
                    <Clock className="h-8 w-8 text-cyan-600" />
                    <p className="text-xl w-1/2">Total Time</p>
                  </div>
                  <div className="h-full w-[35%] flex items-center justify-start px-4 ">
                    <p className="text-2xl font-semibold text-cyan-600 w-1/2">{totalTimeFormatted}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Performance Trends</h3>
              <ChartContainer config={overallChartConfig} className="h-96 w-full">
                <LineChart
                  accessibilityLayer={true}
                  data={processedMdata}
                  margin={{
                    left: 50,
                    right: 50,
                    top: 20,
                    bottom: 60,
                  }}
                >
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="modulename" axisLine={true} tickMargin={8} tick={<CustomXAxisTick />} interval={0} />
                  <YAxis domain={[0, Math.max(...processedMdata.map((d) => d.maxscore))]} />
                  <ChartTooltip cursor={false} content={<CustomOverallTooltip config={overallChartConfig} />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Line
                    dataKey="totalscore"
                    type="natural"
                    stroke="var(--color-totalscore)"
                    strokeWidth={2}
                    dot={{
                      fill: "var(--color-totalscore)",
                    }}
                    activeDot={{
                      r: 6,
                    }}
                  />
                  <Line
                    dataKey="errors"
                    type="natural"
                    stroke="var(--color-errors)"
                    strokeWidth={2}
                    dot={{
                      fill: "var(--color-errors)",
                    }}
                    activeDot={{
                      r: 6,
                    }}
                  />
                  <Line
                    dataKey="compiles"
                    type="natural"
                    stroke="var(--color-compiles)"
                    strokeWidth={2}
                    dot={{
                      fill: "var(--color-compiles)",
                    }}
                    activeDot={{
                      r: 6,
                    }}
                  />
                  <Line
                    dataKey="time"
                    type="natural"
                    stroke="var(--color-time)"
                    strokeWidth={2}
                    dot={{
                      fill: "var(--color-time)",
                    }}
                    activeDot={{
                      r: 6,
                    }}
                  />
                </LineChart>
              </ChartContainer>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Performance Comparison</h3>
              <ChartContainer config={overallChartConfig} className="h-96 w-full">
                <BarChart
                  accessibilityLayer={true}
                  data={processedMdata}
                  margin={{
                    left: 50,
                    right: 50,
                    top: 10,
                    bottom: 60,
                  }}
                >
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="modulename"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={true}
                    tick={<CustomXAxisTick />}
                    interval={0}
                  />
                  <YAxis domain={[0, Math.max(...processedMdata.map((d) => d.maxscore))]} />
                  <ChartTooltip cursor={false} content={<CustomOverallTooltip config={overallChartConfig} />} />
                  <ChartLegend content={<ChartLegendContent />} className="mt-4" />
                  <Bar dataKey="totalscore" fill="var(--color-totalscore)" radius={4} />
                  <Bar dataKey="errors" fill="var(--color-errors)" radius={4} />
                  <Bar dataKey="compiles" fill="var(--color-compiles)" radius={4} />
                  <Bar dataKey="time" fill="var(--color-time)" radius={4} />
                </BarChart>
              </ChartContainer>
            </div>
          </div>
        </div>

        {/* Page 2: Score Analysis */}
        <div className="print-page-break mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">Score Analysis</CardTitle>
            <CardDescription className="text-lg">Detailed breakdown of scores per module.</CardDescription>
          </CardHeader>
          <CardContent className="w-full space-y-6">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Score Comparison</h3>
              <ChartContainer config={scoreChartConfig} className="h-80 w-full">
                <BarChart
                  accessibilityLayer={true}
                  data={scoreData}
                  margin={{ left: 20, right: 20, top: 20, bottom: 60 }}
                >
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="modulename"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={true}
                    tick={<CustomXAxisTick />}
                    interval={0}
                  />
                  <YAxis />
                  <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dashed" />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Bar dataKey="maxscore" fill="var(--color-maxscore)" radius={4} name="Maximum Score" />
                  <Bar dataKey="totalscore" fill="var(--color-totalscore)" radius={4} name="Score Achieved" />
                </BarChart>
              </ChartContainer>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Score Percentage Trend</h3>
              <ChartContainer config={scoreChartConfig} className="h-80 w-full">
                <LineChart
                  accessibilityLayer={true}
                  data={scoreData}
                  margin={{ left: 20, right: 20, top: 20, bottom: 60 }}
                >
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="modulename" axisLine={true} tickMargin={8} tick={<CustomXAxisTick />} interval={0} />
                  <YAxis domain={[0, 100]} />
                  <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Line
                    dataKey="percentage"
                    type="monotone"
                    stroke="var(--color-percentage)"
                    strokeWidth={3}
                    dot={{ fill: "var(--color-percentage)", r: 6 }}
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ChartContainer>
            </div>
          </CardContent>
        </div>

        {/* Page 3: Error Analysis */}
        <div className="print-page-break mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">Error Analysis</CardTitle>
            <CardDescription className="text-lg">Insights into compilation errors and success rates.</CardDescription>
          </CardHeader>
          <CardContent className="w-full space-y-6">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Compilation Performance</h3>
              <ChartContainer config={performanceChartConfig} className="h-80 w-full">
                <BarChart
                  accessibilityLayer={true}
                  data={performanceData}
                  margin={{ left: 20, right: 20, top: 20, bottom: 60 }}
                >
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="modulename"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={true}
                    tick={<CustomXAxisTick />}
                    interval={0}
                  />
                  <YAxis />
                  <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dashed" />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Bar dataKey="compiles" fill="var(--color-compiles)" radius={4} name="Total Attempts" />
                  <Bar dataKey="errors" fill="var(--color-errors)" radius={4} name="Errors" />
                </BarChart>
              </ChartContainer>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Success Rate Trend</h3>
              <ChartContainer config={performanceChartConfig} className="h-80 w-full">
                <AreaChart
                  accessibilityLayer={true}
                  data={performanceData}
                  margin={{ left: 20, right: 20, top: 20, bottom: 60 }}
                >
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="modulename" axisLine={true} tickMargin={8} tick={<CustomXAxisTick />} interval={0} />
                  <YAxis domain={[0, 100]} />
                  <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                  <Area
                    dataKey="successRate"
                    type="monotone"
                    fill="var(--color-successRate)"
                    fillOpacity={0.4}
                    stroke="var(--color-successRate)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ChartContainer>
            </div>
          </CardContent>
        </div>

        {/* Page 4: Time Analysis */}
        <div className="print-page-break">
          <CardHeader>
            <CardTitle className="text-2xl">Time Analysis</CardTitle>
            <CardDescription className="text-lg">Time spent on each module in hours.</CardDescription>
          </CardHeader>
          <CardContent className="w-full space-y-6">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Time Spent per Module (Hours)</h3>
              <ChartContainer config={timeChartConfig} className="h-80 w-full">
                <BarChart
                  accessibilityLayer={true}
                  data={timeData}
                  margin={{ left: 20, right: 20, top: 20, bottom: 60 }}
                >
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="modulename"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={true}
                    tick={<CustomXAxisTick />}
                    interval={0}
                  />
                  <YAxis tickFormatter={formatHoursToHHMM} />
                  <ChartTooltip cursor={false} content={<CustomTimeTooltip />} />
                  <Bar dataKey="time" fill="var(--color-time)" radius={4} name="Time (hours)" />
                </BarChart>
              </ChartContainer>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Time Progression</h3>
              <ChartContainer config={timeChartConfig} className="h-80 w-full">
                <LineChart
                  accessibilityLayer={true}
                  data={timeData}
                  margin={{ left: 20, right: 20, top: 20, bottom: 60 }}
                >
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="modulename" axisLine={true} tickMargin={8} tick={<CustomXAxisTick />} interval={0} />
                  <YAxis tickFormatter={formatHoursToHHMM} />
                  <ChartTooltip cursor={false} content={<CustomTimeTooltip />} />
                  <Line
                    dataKey="time"
                    type="monotone"
                    stroke="var(--color-time)"
                    strokeWidth={3}
                    dot={{ fill: "var(--color-time)", r: 6 }}
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ChartContainer>
            </div>
          </CardContent>
        </div>
      </div>
    )
  },
)

PrintableReport.displayName = "PrintableReport"

export default PrintableReport
