import { NextResponse } from "next/server"

const API_BASE_URL = "https://fast-api-liart-nine.vercel.app"

export async function GET() {
  try {
    console.log("[v0] API Route - Fetching MRR from:", `${API_BASE_URL}/micro/mrr`)
    
    const response = await fetch(`${API_BASE_URL}/micro/mrr`, {
      headers: {
        "Content-Type": "application/json",
      },
      next: { revalidate: 60 }, // Cache por 60 segundos
    })

    if (!response.ok) {
      console.log("[v0] API Route - Error status:", response.status)
      return NextResponse.json(
        { error: "Error fetching MRR data" },
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log("[v0] API Route - Data fetched successfully")
    
    return NextResponse.json(data)
  } catch (error) {
    console.log("[v0] API Route - Exception:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
