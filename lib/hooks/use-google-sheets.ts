import useSWR from "swr"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

interface Expense {
  tipo: string
  mes: number
  costo: number
}

interface GoogleSheetsData {
  headers: string[]
  expenses: Expense[]
  raw: string[][]
}

interface UseGoogleSheetsOptions {
  range?: string
  refreshInterval?: number
}

export function useGoogleSheets(options: UseGoogleSheetsOptions = {}) {
  const { range, refreshInterval = 60000 } = options

  const params = new URLSearchParams()
  if (range) params.append("range", range)

  const url = `/api/sheets${params.toString() ? "?" + params.toString() : ""}`

  const { data, error, isLoading } = useSWR<GoogleSheetsData>(url, fetcher, {
    refreshInterval, // Refresca cada 1 minuto por defecto
    revalidateOnFocus: true,
  })

  return {
    data: data?.expenses || [],
    headers: data?.headers || [],
    raw: data?.raw || [],
    isLoading,
    isError: error,
  }
}
