const MICROSERVICE_URL = "https://fast-api-liart-nine.vercel.app"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ endpoint: string }> }
) {
  const { endpoint } = await params
  const { searchParams } = new URL(request.url)
  
  // Construir URL con parámetros
  const url = new URL(`${MICROSERVICE_URL}/costs/${endpoint}`)
  
  // Para el endpoint CAC, agregar start_date obligatorio (inicio del año 2026)
  if (endpoint === "cac") {
    const startDate = searchParams.get("start_date") || "2026-01-01T00:00:00.000"
    url.searchParams.set("start_date", startDate)
    
    // Parámetros opcionales
    const endDate = searchParams.get("end_date")
    if (endDate) url.searchParams.set("end_date", endDate)
    
    const acumulado = searchParams.get("acumulado")
    if (acumulado) url.searchParams.set("acumulado", acumulado)
  }
  
  try {
    const response = await fetch(url.toString(), {
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
    console.error(`Error fetching /costs/${endpoint}:`, error)
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
