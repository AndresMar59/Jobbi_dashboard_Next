# Arquitectura de la Capa de API

Este documento explica como funciona el sistema de consumo de endpoints, calculo de metricas, el sistema de filtros globales, y como agregar nuevas metricas.

---

## 1. Vision General

```
┌──────────────────────────────────────────────────────────────────┐
│                       FRONTEND (Next.js)                          │
├──────────────────────────────────────────────────────────────────┤
│                                                                    │
│  Componentes UI (KPI Cards, Charts, Tables)                       │
│       │ importan hooks                                             │
│       ▼                                                            │
│  ┌────────────────────────────────────────────┐                    │
│  │  HOOKS (lib/hooks/)                         │                   │
│  │                                             │                   │
│  │  use-api-data.ts    → Hooks de APIs         │                   │
│  │    useMRRData()       Cada hook:            │                   │
│  │    useARPUData()      1. Fetch via SWR      │                   │
│  │    useLTVData()       2. Filtra por año/    │                   │
│  │    useCACData()          mes/plan           │                   │
│  │    ...                3. Continuidad (0s)   │                   │
│  │                                             │                   │
│  │  use-metric-data.ts → Hooks de Metricas     │                   │
│  │    useCACRatioData()  Cada hook:            │                   │
│  │    useNewARRData()    1. Fetch multi-API    │                   │
│  │    useChurnARRData()  2. Calcula formula    │                   │
│  │    useCACPaybackData()3. Filtra resultado   │                   │
│  └───────┬──────────────────┬──────────────────┘                   │
│          │                  │                                      │
│          │ SWR fetch        │ Funciones puras                      │
│          ▼                  ▼                                      │
│  ┌───────────────┐  ┌────────────────────────┐                     │
│  │ Route Handlers │  │ lib/api/metrics.ts      │                    │
│  │ /api/micro/*   │  │  calculateCACRatio()    │                    │
│  │ /api/costs/*   │  │  calculateNewARR()      │                    │
│  │  (proxy+cache) │  │  calculateChurnARR()    │                    │
│  └───────┬────────┘  │  calculateCACPayback()  │                    │
│          │           └────────────────────────┘                     │
│          ▼                                                         │
│  ┌─────────────────────────────────────────┐                       │
│  │ lib/api/types.ts                         │                      │
│  │  Interfaces de respuesta de APIs         │                      │
│  │  Interfaces de metricas calculadas       │                      │
│  └─────────────────────────────────────────┘                       │
├──────────────────────────────────────────────────────────────────┤
│  FiltersContext (lib/contexts/filters-context.tsx)                 │
│  Estado global: { year, month, plan }                             │
│  Los componentes leen filtros → pasan a hooks como opciones       │
├──────────────────────────────────────────────────────────────────┤
│                       BACKEND                                      │
│  Microservicio: https://fast-api-liart-nine.vercel.app            │
│  /micro/mrr, /micro/arpu, /costs/cac, etc.                       │
└──────────────────────────────────────────────────────────────────┘
```

---

## 2. Estructura de Archivos

```
lib/
├── api/
│   ├── client.ts        # Cliente HTTP generico (apiClient, api.get/post)
│   ├── types.ts         # Interfaces de respuesta + metricas calculadas
│   ├── metrics.ts       # Fetcher SWR + funciones de calculo de metricas
│   └── index.ts         # Re-exporta todo para imports limpios
├── hooks/
│   ├── use-api-data.ts  # Hooks para TODAS las APIs (14 hooks)
│   └── use-metric-data.ts # Hooks para metricas calculadas (4 hooks)
└── contexts/
    └── filters-context.tsx # Estado global de filtros (año, mes, plan)
```

---

## 3. Distincion: APIs vs Metricas

### APIs (ya calculadas en backend)
- Los datos vienen listos del microservicio
- Solo se filtran en el UI (año, mes, plan)
- NO se hacen calculos adicionales
- Si falta un mes o plan → se muestra como 0 (continuidad)

### Metricas (calculadas en frontend)
- Combinan datos de 2+ APIs
- Aplican formulas de negocio
- Cada metrica define su nivel de segregacion
- Ejemplos: CAC Ratio, New ARR, Churn ARR, CAC Payback

---

## 4. APIs Disponibles

### Estructura con niveles: plan > mes > nivel_id
| Endpoint | Hook | Filtros | Key valores |
|----------|------|---------|-------------|
| `/micro/mrr` | `useMRRData()` | año, mes, plan | mrr, subscriptions |
| `/micro/mrr_new` | `useMRRNewData()` | año, mes, plan | new_MRR, subscriptions |
| `/micro/churn_mrr` | `useChurnMRRData()` | año, mes, plan | Chur_MRR, subscriptions |
| `/micro/arpu` | `useARPUData()` | año, mes, plan | arpu, users |

### Estructura: mes > plan
| Endpoint | Hook | Filtros | Key valores |
|----------|------|---------|-------------|
| `/micro/usuarios_activos` | `useUsuariosActivosData()` | año, mes, plan | active_users, companies[] |
| `/micro/usuarios_nuevos` | `useUsuariosNuevosData()` | año, mes, plan | new_users, companies[] |
| `/micro/usuarios_churned` | `useUsuariosChurnedData()` | año, mes, plan | churned_users, companies[] |

### Estructura: solo fecha (sin plan)
| Endpoint | Hook | Filtros | Valor |
|----------|------|---------|-------|
| `/micro/tasa_retention` | `useTasaRetentionData()` | año, mes | porcentaje |
| `/micro/tasa_churn` | `useTasaChurnData()` | año, mes | porcentaje |
| `/micro/revenue_churn` | `useRevenueChurnData()` | año, mes | dolares |
| `/micro/ticket_promedio` | `useTicketPromedioData()` | año, mes | prom_ticket |
| `/costs/cac` | `useCACData()` | año, mes | dolares (acumulado) |
| `/costs/ue` | `useUnitEconomicsData()` | año, mes | dolares (acumulado) |

### Estructura: solo plan (sin fecha)
| Endpoint | Hook | Filtros | Valores |
|----------|------|---------|---------|
| `/micro/ltv` | `useLTVData()` | plan | ltv, total_revenue, companies |

---

## 5. Metricas Calculadas

| Metrica | Hook | Formula | APIs fuente | Nivel |
|---------|------|---------|-------------|-------|
| CAC Ratio | `useCACRatioData()` | (New MRR * 0.70) / CAC | mrr_new + cac | solo fecha |
| New ARR | `useNewARRData()` | New MRR * 12 | mrr_new | plan + fecha |
| Churn ARR | `useChurnARRData()` | Churn MRR * 12 | churn_mrr | plan + fecha |
| CAC Payback | `useCACPaybackData()` | CAC / (ARPU avg * 0.70) | cac + arpu | solo fecha |

### Reglas especiales:
- **CAC Ratio**: Si New MRR = 0, ratio = 0. Si CAC = 0, usar 1 como divisor.
- **New ARR / Churn ARR**: Proyeccion del ultimo mes real para los meses restantes del anio.
- **CAC Payback**: ARPU se promedia entre todos los planes (NO basarse en users).
- **Margen Bruto**: Constante fija del 70% (GROSS_MARGIN = 0.70)

---

## 6. Sistema de Filtros Globales

### FiltersContext
```tsx
// Estado global
interface FiltersState {
  year: string   // "2026"
  month: string  // "Todos" | "Ene" | "Feb" | ...
  plan: string   // "Todos" | "Free" | "Starter" | ...
}
```

### Flujo de filtrado
```
1. Usuario selecciona filtros en DashboardFilters
2. FiltersContext actualiza el estado
3. Componentes leen filtros via useFilters()
4. Pasan filtros como opciones a los hooks
5. Hooks filtran la data cruda del SWR

Componente:
  const { filters } = useFilters()
  const { chartData, currentMRR } = useMRRData({
    year: filters.year,
    month: filters.month,
    plan: filters.plan,
  })
```

### Mapeo de meses
Los filtros usan etiquetas ("Ene", "Feb") y la data usa "01", "02".
Los hooks hacen la conversion automaticamente:
```
"Ene" → "01"  |  "Jul" → "07"
"Feb" → "02"  |  "Ago" → "08"
"Mar" → "03"  |  "Sep" → "09"
"Abr" → "04"  |  "Oct" → "10"
"May" → "05"  |  "Nov" → "11"
"Jun" → "06"  |  "Dic" → "12"
```

### Continuidad
Cuando un mes no tiene datos, se rellena con 0.
Los hooks generan los 12 meses del anio siempre,
independientemente de cuantos meses tenga la data real.

---

## 7. Route Handlers (Proxy)

### /api/micro/[endpoint]/route.ts
- Proxy generico: recibe `endpoint` de la URL, llama a `MICROSERVICE_URL/micro/{endpoint}`
- Cache: `next: { revalidate: 60 }` (60 segundos)
- No requiere parametros especiales

### /api/costs/[endpoint]/route.ts
- Proxy generico para endpoints de costos
- Para `cac` y `ue`: agrega automaticamente `start_date=2025-12-31T23:59:59.999` y `acumulado=true`
- Cache: 60 segundos

---

## 8. Uso de SWR

Todos los hooks usan SWR con configuracion compartida:
```ts
const SWR_CONFIG = {
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
  refreshInterval: 60000, // 60 segundos
}
```

**Deduplicacion**: Si multiples componentes usan el mismo hook (ej: `useMRRData`), SWR hace una sola peticion HTTP porque comparten la misma key (`"/api/micro/mrr"`).

**Cache**: La data se cachea en el cliente y se refresca cada 60s. El route handler tambien cachea 60s en el server.

---

## 9. Como agregar un nuevo endpoint

### Paso 1: Agregar tipo en types.ts
```ts
export interface NuevoEndpointResponse {
  [month: string]: { valor: number }
}
```

### Paso 2: Agregar hook en use-api-data.ts
```ts
export function useNuevoEndpointData(options: FilterOptions = {}) {
  const { year = "2026", month = "Todos" } = options
  const { data, error, isLoading } = useSWR<NuevoEndpointResponse>(
    "/api/micro/nuevo_endpoint", fetcher, SWR_CONFIG
  )
  // ... filtrar y retornar
}
```

### Paso 3: Exportar tipo en index.ts (opcional)
```ts
export type { NuevoEndpointResponse } from "./types"
```

### Paso 4: Usar en componente
```tsx
const { filters } = useFilters()
const { chartData, isLoading } = useNuevoEndpointData({
  year: filters.year,
  month: filters.month,
})
```

---

## 10. Como agregar una nueva metrica calculada

### Paso 1: Agregar tipos resultado en types.ts
```ts
export interface NuevaMetricaResult {
  currentValue: number
  previousValue: number
  dataByMonth: { month: string; value: number }[]
}
```

### Paso 2: Agregar funcion de calculo en metrics.ts
```ts
export function calculateNuevaMetrica(
  api1Data: API1Response,
  api2Data: API2Response
): NuevaMetricaResult {
  // Formula pura, sin fetch
}
```

### Paso 3: Agregar hook en use-metric-data.ts
```ts
export function useNuevaMetricaData(options = {}) {
  const { data: api1 } = useSWR("/api/micro/api1", fetcher, SWR_CONFIG)
  const { data: api2 } = useSWR("/api/micro/api2", fetcher, SWR_CONFIG)

  const result = useMemo(() => {
    if (!api1 || !api2) return null
    return calculateNuevaMetrica(api1, api2)
  }, [api1, api2])

  return { ...result, isLoading, error }
}
```

### Paso 4: Exportar en index.ts
```ts
export { calculateNuevaMetrica } from "./metrics"
export type { NuevaMetricaResult } from "./types"
```
