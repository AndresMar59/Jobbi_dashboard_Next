import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const spreadsheetId = searchParams.get("spreadsheetId") || process.env.GOOGLE_SHEET_ID
    const range = searchParams.get("range") || "Sheet1!A1:Z1000"
    const apiKey = process.env.GOOGLE_SHEETS_API_KEY

    if (!apiKey || !spreadsheetId) {
      return NextResponse.json({ error: "Google Sheets credentials not configured" }, { status: 500 })
    }

    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?key=${apiKey}`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    )

    if (!response.ok) {
      throw new Error(`Google Sheets API error: ${response.statusText}`)
    }

    const data = await response.json()

    return NextResponse.json(data)
  } catch (error) {
    console.error("[v0] Google Sheets API error:", error)
    return NextResponse.json({ error: "Failed to fetch Google Sheets data" }, { status: 500 })
  }
}
