import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const spreadsheetId = process.env.GOOGLE_SHEET_ID
    const sheetName = searchParams.get("sheet") || "V0"
    const range = `${sheetName}!A:C`
    const apiKey = process.env.GOOGLE_SHEETS_API_KEY

    if (!apiKey || !spreadsheetId) {
      return NextResponse.json({ error: "Google Sheets credentials not configured" }, { status: 500 })
    }

    console.log("[v0] Fetching Google Sheets data:", { spreadsheetId, range })

    const encodedRange = encodeURIComponent(range)
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodedRange}?key=${apiKey}`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[v0] Google Sheets API error:", errorText)
      throw new Error(`Google Sheets API error: ${response.statusText}`)
    }

    const data = await response.json()

    if (!data.values || data.values.length < 2) {
      return NextResponse.json({ error: "No data found in sheet" }, { status: 404 })
    }                                        

    const [headers, ...rows] = data.values
    console.log("[v0] Headers:", headers)
    console.log("[v0] First few rows:", rows.slice(0, 5))

    const expenses = rows
      .filter((row: string[]) => row[0] && row[1] && row[2]) // Solo filas con los 3 campos
      .map((row: string[]) => {
        const costoStr = row[2]?.replace(/[$,]/g, "") || "0"
        return {
          tipo: row[0].trim(),
          mes: Number.parseInt(row[1]) || 0,
          costo: Number.parseFloat(costoStr) || 0,
        }
      })

    console.log("[v0] Processed expenses:", expenses.slice(0, 5))
    console.log("[v0] Total expenses found:", expenses.length)

    return NextResponse.json({
      headers,
      expenses,
      totalExpenses: expenses.reduce((sum: number, exp: { costo: number }) => sum + exp.costo, 0),
    })
  } catch (error) {
    console.error("[v0] Google Sheets API error:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch Google Sheets data",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
