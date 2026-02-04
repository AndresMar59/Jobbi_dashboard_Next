# Arquitectura de la Capa de API

Este documento explica como funciona el sistema de consumo de endpoints, calculo de metricas, el archivo index, y el sistema de filtros globales.

---

## 1. Vision General

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (Next.js)                        │
├─────────────────────────────────────────────────────────────────┤
│  Componentes UI                                                  │
│  (KPI Cards, Charts)                                            │
│       │                                                          │
│       ▼                                                          │
│  Hooks (useSWR)  ◄──────► FiltersContext (año, mes, plan)       │
│       │                                                          │
│       ▼                                                          │
│  lib/api/metrics.ts  (procesamiento de datos)                   │
│       │                                                          │
│       ▼                                                          │
│  lib/api/client.ts   (fetch HTTP)                               │
│       │                                                          │
│       ▼                                                          │
│  Route Handlers (/api/micro/*, /api/costs/*)                    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    MICROSERVICIO EXTERNO                         │
│            https://fast-api-liart-nine.vercel.app               │
├─────────────────────────────────────────────────────────────────┤
│  /micro/mrr                                                      │
│  /micro/arpu                                                     │
│  /micro/ltv                                                      │
│  /costs/cac                                                      │
│  /costs/ue                                                       │
│  ... (16 endpoints total)                                        │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Estructura de Archivos

```
lib/
├── api/
│   ├── index.ts      # Exportaciones centralizadas
│   ├── types.ts      # Tipos TypeScript (Request/Response/Processed)
│   ├── client.ts     # Funciones HTTP para llamar a los route handlers
│   └── metrics.ts    # Funciones de procesamiento de datos
├── contexts/
│   └── filters-context.tsx  # Context de filtros globales
└── hooks/
    ├── use-mrr-data.ts      # Hook especifico para MRR
    └── use-arpu-data.ts     # Hook especifico para ARPU

app/api/
├── micro/
│   └── [endpoint]/route.ts  # Proxy para /micro/*
└── costs/
    └── [endpoint]/route.ts  # Proxy para /costs/*
```

---

## 3. Flujo de Datos Detallado

### Paso 1: Componente solicita datos

```typescript
// Ejemplo: components/dashboard/mrr-kpi-card.tsx

import useSWR from "swr"
import { getMRR } from "@/lib/api"
import { useFilters } from "@/lib/contexts/filters-context"

export function MRRKPICard() {
  const { filters } = useFilters()
  
  // useSWR maneja cache, revalidacion, y loading states
  const { data, error, isLoading } = useSWR("mrr", getMRR)
  
  // Filtrar datos segun los filtros globales
  const filteredData = filterByYearAndPlan(data, filters)
  
  return <Card>{/* render */}</Card>
}
```

### Paso 2: Funcion de API procesa la solicitud

```typescript
// lib/api/metrics.ts

// 1. Funcion Raw - obtiene datos crudos
async function getMRRRaw(): Promise<MRRResponse> {
  return fetchFromMicroservice("mrr")
}

// 2. Funcion Procesada - normaliza y calcula
export async function getMRR(): Promise<MRRProcessed> {
  const rawData = await getMRRRaw()
  
  // Transformar estructura del API a estructura normalizada
  const mrrByMonth = []
  const mrrByPlanAndMonth = []
  
  for (const [plan, months] of Object.entries(rawData)) {
    for (const [month, data] of Object.entries(months)) {
      mrrByPlanAndMonth.push({
        plan,
        month,
        mrr: data.mrr,
        companies: data.companies
      })
    }
  }
  
  // Ordenar cronologicamente
  mrrByMonth.sort((a, b) => a.month.localeCompare(b.month))
  
  // Calcular valores derivados
  const currentMRR = mrrByMonth[mrrByMonth.length - 1]?.mrr || 0
  const previousMRR = mrrByMonth[mrrByMonth.length - 2]?.mrr || 0
  
  return {
    currentMRR,
    previousMRR,
    totalMRR,
    mrrByMonth,
    mrrByPlanAndMonth,
    plans
  }
}
```

### Paso 3: Cliente HTTP hace la llamada

```typescript
// lib/api/client.ts

const API_BASE = "/api"

export async function fetchFromMicroservice(endpoint: string) {
  const response = await fetch(`${API_BASE}/micro/${endpoint}`)
  
  if (!response.ok) {
    throw new Error(`Error fetching ${endpoint}`)
  }
  
  return response.json()
}
```

### Paso 4: Route Handler proxea al microservicio

```typescript
// app/api/micro/[endpoint]/route.ts

const MICROSERVICE_URL = "https://fast-api-liart-nine.vercel.app"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ endpoint: string }> }
) {
  const { endpoint } = await params
  
  const response = await fetch(`${MICROSERVICE_URL}/micro/${endpoint}`, {
    headers: { "Content-Type": "application/json" },
    next: { revalidate: 60 }  // Cache por 60 segundos
  })
  
  const data = await response.json()
  return Response.json(data)
}
```

---

## 4. Sistema de Tipos

### Patron de Nombrado

```typescript
// Para cada endpoint hay 2-3 tipos:

// 1. Response - estructura exacta del API externo
interface MRRResponse {
  [plan: string]: {
    [month: string]: {
      mrr: number
      companies: string[]
    }
  }
}

// 2. Processed - estructura normalizada para el frontend
interface MRRProcessed {
  currentMRR: number           // Valor del ultimo mes
  previousMRR: number          // Valor del mes anterior (para calcular %)
  totalMRR: number             // Suma total
  mrrByMonth: Array<{...}>     // Array ordenado por mes
  mrrByPlanAndMonth: Array<{...}>  // Array con plan+mes
  plans: string[]              // Lista de planes disponibles
}

// 3. DataPoint (opcional) - para puntos individuales
interface MRRDataPoint {
  month: string
  mrr: number
}
```

### Beneficios de esta Estructura

1. **Type Safety**: TypeScript valida que usemos los datos correctamente
2. **Autocompletado**: El IDE sugiere propiedades disponibles
3. **Documentacion**: Los tipos sirven como documentacion del API
4. **Refactoring**: Cambios en la estructura se detectan en compile-time

---

## 5. Archivo Index (`lib/api/index.ts`)

El archivo index centraliza todas las exportaciones:

```typescript
// Exportar tipos
export type {
  // Metricas base
  MRRResponse,
  MRRProcessed,
  MRRDataPoint,
  
  // Costos
  CACResponse,
  CACProcessed,
  
  // Metricas calculadas
  CACRatioProcessed,
  CACPaybackCalculatedProcessed,
  // ... etc
} from "./types"

// Exportar funciones
export {
  // Metricas base
  getMRR,
  getARPU,
  getLTV,
  
  // Costos
  getCAC,
  getUnitEconomics,
  
  // Metricas calculadas
  getCACRatio,
  getCACPaybackCalculated,
  getNewARR,
  getChurnARR,
  // ... etc
} from "./metrics"
```

### Uso en Componentes

```typescript
// ANTES (sin index): imports multiples
import { getMRR } from "@/lib/api/metrics"
import { MRRProcessed } from "@/lib/api/types"
import { fetchFromMicroservice } from "@/lib/api/client"

// DESPUES (con index): import unico
import { getMRR, MRRProcessed } from "@/lib/api"
```

---

## 6. Sistema de Filtros Globales

### Estructura del Context

```typescript
// lib/contexts/filters-context.tsx

interface Filters {
  year: string   // "2024", "2025", "2026"
  month: string  // "Todos", "01", "02", ..., "12"
  plan: string   // "Todos", "Free", "Starter", "Pro", etc.
}

interface FiltersContextType {
  filters: Filters
  setFilters: (filters: Filters) => void
  updateFilter: (key: keyof Filters, value: string) => void
}
```

### Provider en Layout

```typescript
// app/dashboard/page.tsx

import { FiltersProvider } from "@/lib/contexts/filters-context"

export default function DashboardPage() {
  return (
    <FiltersProvider>
      <DashboardFilters />  {/* Controles de filtro */}
      <MRRKPICard />        {/* Se actualiza con filtros */}
      <ARPUKPICard />       {/* Se actualiza con filtros */}
      {/* ... */}
    </FiltersProvider>
  )
}
```

### Uso en Componentes

```typescript
// Componente que usa filtros
export function MRRKPICard() {
  const { filters } = useFilters()
  const { data } = useSWR("mrr", getMRR)
  
  // Filtrar por año
  const yearData = data?.mrrByPlanAndMonth.filter(
    item => item.month.startsWith(filters.year)
  )
  
  // Filtrar por mes (si no es "Todos")
  const monthData = filters.month !== "Todos"
    ? yearData?.filter(item => item.month.endsWith(filters.month))
    : yearData
  
  // Filtrar por plan (si no es "Todos")
  const finalData = filters.plan !== "Todos"
    ? monthData?.filter(item => item.plan === filters.plan)
    : monthData
  
  // Calcular valor actual
  const currentValue = calculateSum(finalData)
  
  return <Card value={currentValue} />
}
```

### Flujo de Actualizacion

```
Usuario cambia filtro "Plan" a "Starter"
         │
         ▼
DashboardFilters llama updateFilter("plan", "Starter")
         │
         ▼
FiltersContext actualiza state
         │
         ▼
React re-renderiza todos los componentes suscritos
         │
         ▼
Cada componente filtra sus datos con el nuevo valor
         │
         ▼
UI actualizada mostrando solo datos de "Starter"
```

---

## 7. Metricas Calculadas

Algunas metricas no vienen directamente del API, se calculan combinando datos:

### CAC Ratio

```typescript
// Formula: (New MRR x Margen Bruto) / CAC
export async function getCACRatio(): Promise<CACRatioProcessed> {
  const [mrrNewData, cacData] = await Promise.all([
    getMRRNew(),
    getCAC()
  ])
  
  const GROSS_MARGIN = 0.70  // 70%
  
  const cacRatioByMonth = []
  
  for (const month of allMonths) {
    const newMRR = mrrNewData.get(month) || 0
    const cac = cacData.get(month) || 0
    
    // Si CAC es 0, ratio es 0 (evitar division por cero)
    const ratio = cac > 0 ? (newMRR * GROSS_MARGIN) / cac : 0
    
    cacRatioByMonth.push({ month, cacRatio: ratio })
  }
  
  return { cacRatioByMonth, currentCACRatio, averageCACRatio }
}
```

### CAC Payback

```typescript
// Formula: CAC / (ARPU x Margen Bruto)
// Resultado en meses
export async function getCACPaybackCalculated() {
  const [cacData, arpuData] = await Promise.all([
    getCAC(),
    getARPU()
  ])
  
  const arpu = arpuData.totalARPU
  const denominator = arpu * GROSS_MARGIN
  
  // Si ARPU es 0, payback es 0
  const cacPayback = denominator > 0 
    ? cacData.currentCAC / denominator 
    : 0
  
  return { currentCACPayback: cacPayback }
}
```

### ARR con Proyeccion

```typescript
// Formula: MRR x 12
// Proyeccion: ultimo mes real se usa para meses futuros
export async function getNewARR(year = "2026") {
  const mrrNewData = await getMRRNew()
  
  // Encontrar ultimo mes con datos reales
  const realMonths = mrrNewData.filter(m => m.month.startsWith(year))
  const lastRealMonth = realMonths[realMonths.length - 1]
  
  const newARRByMonth = []
  
  for (const monthNum of ["01", "02", ..., "12"]) {
    const monthKey = `${year}-${monthNum}`
    
    let newMRR
    let isProjected
    
    if (hasRealData(monthKey)) {
      newMRR = getRealData(monthKey)
      isProjected = false
    } else if (monthKey > lastRealMonth) {
      // Proyectar usando ultimo mes real
      newMRR = lastRealMonth.newMRR
      isProjected = true
    } else {
      newMRR = 0
      isProjected = false
    }
    
    newARRByMonth.push({
      month: monthKey,
      newMRR,
      newARR: newMRR * 12,
      isProjected
    })
  }
  
  return { newARRByMonth, totalNewARR, annualizedNewARR }
}
```

---

## 8. Manejo de Errores y Loading States

### En Componentes con SWR

```typescript
export function MRRKPICard() {
  const { data, error, isLoading } = useSWR("mrr", getMRR)
  
  // Estado de carga
  if (isLoading) {
    return <Skeleton className="h-32 w-full" />
  }
  
  // Estado de error
  if (error) {
    return <Card className="text-red-500">Error cargando datos</Card>
  }
  
  // Datos no disponibles
  if (!data) {
    return <Card>Sin datos</Card>
  }
  
  // Render normal
  return <Card value={data.currentMRR} />
}
```

### En Route Handlers

```typescript
export async function GET(request, { params }) {
  try {
    const response = await fetch(url)
    
    if (!response.ok) {
      return Response.json(
        { error: `Error del microservicio: ${response.status}` },
        { status: response.status }
      )
    }
    
    const data = await response.json()
    return Response.json(data)
    
  } catch (error) {
    return Response.json(
      { error: "Error de conexion con el microservicio" },
      { status: 500 }
    )
  }
}
```

---

## 9. Cache y Revalidacion

### En Route Handlers (Server-side)

```typescript
// Cache por 60 segundos en el servidor
const response = await fetch(url, {
  next: { revalidate: 60 }
})
```

### En Componentes con SWR (Client-side)

```typescript
// SWR maneja cache automaticamente
// - Muestra datos cacheados inmediatamente
// - Revalida en background
// - Actualiza UI cuando llegan datos nuevos

const { data } = useSWR("mrr", getMRR, {
  revalidateOnFocus: true,      // Revalidar al volver a la tab
  revalidateOnReconnect: true,  // Revalidar al reconectar internet
  dedupingInterval: 2000        // Evitar llamadas duplicadas en 2s
})
```

---

## 10. Agregar un Nuevo Endpoint

### Checklist

1. **Agregar tipos en `types.ts`**:
   ```typescript
   export interface NuevoResponse { ... }
   export interface NuevoProcessed { ... }
   ```

2. **Agregar funcion en `metrics.ts`**:
   ```typescript
   async function getNuevoRaw(): Promise<NuevoResponse> {
     return fetchFromMicroservice("nuevo")
   }
   
   export async function getNuevo(): Promise<NuevoProcessed> {
     const rawData = await getNuevoRaw()
     // procesar...
     return processedData
   }
   ```

3. **Exportar en `index.ts`**:
   ```typescript
   export type { NuevoResponse, NuevoProcessed } from "./types"
   export { getNuevo } from "./metrics"
   ```

4. **Si el endpoint necesita parametros especiales**, actualizar el route handler:
   ```typescript
   // app/api/micro/[endpoint]/route.ts o app/api/costs/[endpoint]/route.ts
   if (endpoint === "nuevo") {
     url.searchParams.set("param", "value")
   }
   ```

5. **Crear componente que consume los datos**:
   ```typescript
   import { getNuevo } from "@/lib/api"
   
   export function NuevoCard() {
     const { data } = useSWR("nuevo", getNuevo)
     // render...
   }
   ```
