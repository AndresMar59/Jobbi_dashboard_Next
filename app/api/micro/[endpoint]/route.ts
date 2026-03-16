const MICROSERVICE_URL = "https://fast-api-liart-nine.vercel.app"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ endpoint: string }> }
) {
  const { endpoint } = await params
  
  try {
    const response = await fetch(`${MICROSERVICE_URL}/micro/${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
      },
      next: { revalidate: 60 }, // Cache por 60 segundos
    })

    if (!response.ok) {
      return Response.json(
        { error: `Error fetching ${endpoint}` },
        { status: response.status }
      )
    }

    const data = await response.json()
    return Response.json(data)
  } catch (error) {
    console.error(`Error fetching /micro/${endpoint}:`, error)
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
