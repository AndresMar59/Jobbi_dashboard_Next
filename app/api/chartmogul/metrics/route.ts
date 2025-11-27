import { NextResponse } from "next/server"

export async function GET() {
  try {
    const apiKey = process.env.CHARTMOGUL_API_KEY

    if (!apiKey) {
      return NextResponse.json({ error: "ChartMogul API key not configured" }, { status: 500 })
    }

    console.log("[v0] Fetching ChartMogul metrics")

    const response = await fetch(
      "https://api.chartmogul.com/v1/metrics/all?start-date=2024-01-01&end-date=2024-12-31&interval=month",
      {
        headers: {
          Authorization: `Basic ${Buffer.from(apiKey + ":").toString("base64")}`,
          "Content-Type": "application/json",
        },
      },
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[v0] ChartMogul API error:", response.status, errorText)
      throw new Error(`ChartMogul API error: ${response.statusText}`)
    }

    const data = await response.json()
    console.log("[v0] ChartMogul data received:", Object.keys(data))

    return NextResponse.json(data)
  } catch (error) {
    console.error("[v0] ChartMogul API error:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch ChartMogul data",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
