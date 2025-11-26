import useSWR from "swr"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function useChartMogulMetrics() {
  const { data, error, isLoading } = useSWR("/api/chartmogul/metrics", fetcher, {
    refreshInterval: 30000, // Refresca cada 30 segundos
    revalidateOnFocus: true,
  })

  return {
    metrics: data,
    isLoading,
    isError: error,
  }
}
