import useSWR from "swr"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

interface ChartMogulEntry {
  date: string
  mrr: number
  customers: number
  arpu: number
  arr: number
  ltv?: number
  [key: string]: any
}

interface ChartMogulData {
  entries: ChartMogulEntry[]
  summary?: any
}

export function useChartMogulMetrics() {
  const { data, error, isLoading } = useSWR<ChartMogulData>("/api/chartmogul/metrics", fetcher, {
    refreshInterval: 30000, // Refresca cada 30 segundos
    revalidateOnFocus: true,
  })

  return {
    metrics: data,
    isLoading,
    isError: error,
  }
}
