import useSWR from "swr"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

interface UseGoogleSheetsOptions {
  spreadsheetId?: string
  range?: string
  refreshInterval?: number
}

export function useGoogleSheets(options: UseGoogleSheetsOptions = {}) {
  const { spreadsheetId, range, refreshInterval = 60000 } = options

  const params = new URLSearchParams()
  if (spreadsheetId) params.append("spreadsheetId", spreadsheetId)
  if (range) params.append("range", range)

  const url = `/api/sheets?${params.toString()}`

  const { data, error, isLoading } = useSWR(url, fetcher, {
    refreshInterval, // Refresca cada 1 minuto por defecto
    revalidateOnFocus: true,
  })

  return {
    data: data?.values || [],
    isLoading,
    isError: error,
  }
}
