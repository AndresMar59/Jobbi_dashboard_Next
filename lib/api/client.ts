/**
 * Cliente base para conexión con el microservicio
 * URL Base: https://fast-api-liart-nine.vercel.app/
 */

const API_BASE_URL = "https://fast-api-liart-nine.vercel.app"

interface FetchOptions extends RequestInit {
  params?: Record<string, string | number | boolean>
}

/**
 * Cliente HTTP genérico para el microservicio
 */
export async function apiClient<T>(
  endpoint: string,
  options: FetchOptions = {}
):
 Promise<T> {
  const { params, ...fetchOptions } = options

  // Construir URL con query params si existen
  let url = `${API_BASE_URL}${endpoint}` 
  if (params) {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      searchParams.append(key, String(value))
    })
    url += `?${searchParams.toString()}`
  }

  const response = await fetch(url, {
    ...fetchOptions,
    headers: {
      "Content-Type": "application/json",
      ...fetchOptions.headers,
    },
  })

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`)
  }

  return response.json()
}


/**
 * Métodos de conveniencia para diferentes tipos de peticiones
 */
export const api = {
  get: <T>(endpoint: string, params?: Record<string, string | number | boolean>) =>
    apiClient<T>(endpoint, { method: "GET", params }),

  post: <T>(endpoint: string, data?: unknown) =>
    apiClient<T>(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    }),

  put: <T>(endpoint: string, data?: unknown) =>
    apiClient<T>(endpoint, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    }),

  delete: <T>(endpoint: string) =>
    apiClient<T>(endpoint, { method: "DELETE" }),
}
