# Changelog - Sesion de Desarrollo

## Archivos Eliminados

Los siguientes archivos fueron eliminados por no estar en uso:

| Archivo | Razon |
|---------|-------|
| `components/dashboard/chart-bar.tsx` | Componente generico de barras no usado. Los graficos usan Recharts directamente. |
| `components/dashboard/chart-line.tsx` | Componente generico de lineas no usado. Los graficos usan Recharts directamente. |
| `components/dashboard/kpi-card.tsx` | Version antigua de KPI card. Reemplazada por `kpi-card-clean.tsx` y componentes dinamicos. |
| `components/dashboard/mvp-double-line-chart.tsx` | Componente MVP de prototipo no usado en produccion. |
| `components/dashboard/mvp-filters.tsx` | Filtros MVP reemplazados por `dashboard-filters.tsx` con contexto global. |
| `components/dashboard/mvp-kpi-card.tsx` | KPI card MVP reemplazada por componentes dinamicos conectados a APIs. |
| `components/dashboard/mvp-multi-line-bar-chart.tsx` | Grafico MVP no usado en produccion. |
| `components/dashboard/mvp-single-bar-chart.tsx` | Grafico MVP no usado en produccion. |
| `lib/hooks/use-chartmogul.ts` | Hook para ChartMogul API no implementado. Se usa microservicio propio. |
| `lib/hooks/use-google-sheets.ts` | Hook para Google Sheets no implementado. Se usa microservicio propio. |

---

## Cambios Realizados en esta Sesion

### 1. Capa de API (`lib/api/`)

#### `lib/api/types.ts` - Tipos TypeScript
Se crearon/actualizaron los tipos para todos los endpoints:

**Endpoints de Metricas (`/micro/`):**
- `MRRResponse` / `MRRProcessed` - MRR con estructura `{ Plan > Mes > { mrr, companies } }`
- `MRRNewResponse` / `MRRNewProcessed` - New MRR con estructura `{ Plan > Mes > { new_mrr } }`
- `ChurnMRRResponse` / `ChurnMRRProcessed` - Churn MRR con estructura `{ Plan > Mes > { churned_MRR } }`
- `ARPUResponse` / `ARPUProcessed` - ARPU con estructura `{ Plan > Mes > { arpu, users } }`
- `LTVResponse` / `LTVProcessed` - LTV con estructura `{ Plan > { ltv, churn_rate, arpu } }`
- `TicketPromedioResponse` / `TicketPromedioProcessed` - Ticket promedio `{ Mes > { Prom_ticket } }`
- `TasaRetentionResponse` / `TasaRetentionProcessed` - Tasa retencion `{ Mes > retention_rate }`
- `TasaChurnResponse` / `TasaChurnProcessed` - Tasa churn con estructura por plan/mes
- `RevenueChurnResponse` / `RevenueChurnProcessed` - Revenue churn por plan/mes
- `UsuariosActivosResponse` / `UsuariosActivosProcessed` - Usuarios activos `{ Mes > Plan > { companies[] } }`
- `UsuariosNuevosResponse` / `UsuariosNuevosProcessed` - Usuarios nuevos por mes
- `UsuariosChurnedResponse` / `UsuariosChurnedProcessed` - Usuarios churned `{ Mes > Plan > { companies[], churned_users } }`

**Endpoints de Costos (`/costs/`):**
- `CACResponse` / `CACProcessed` - CAC con estructura `{ Mes > cac_value }` (requiere `start_date` y `acumulado=true`)
- `UnitEconomicsResponse` / `UnitEconomicsProcessed` - DCPA con estructura `{ Mes > dcpa_value }`
- `ExpensesResponse` / `ExpensesProcessed` - Gastos por mes
- `IncomeResponse` / `IncomeProcessed` - Ingresos por mes

**Metricas Calculadas (no vienen de API, se calculan en frontend):**
- `CACRatioProcessed` - Formula: `(New MRR x 70%) / Marketing Cost`
- `CACPaybackCalculatedProcessed` - Formula: `CAC / (ARPU x 70%)`
- `NewARRProcessed` - Formula: `New MRR x 12` con proyeccion anual
- `ChurnARRProcessed` - Formula: `Churn MRR x 12` con proyeccion anual

#### `lib/api/client.ts` - Cliente HTTP
- `fetchFromMicroservice(endpoint)` - Funcion base para llamar a la API interna `/api/micro/[endpoint]`
- `fetchFromCosts(endpoint)` - Funcion base para llamar a la API interna `/api/costs/[endpoint]`

#### `lib/api/metrics.ts` - Funciones de Procesamiento
Contiene funciones "Raw" (datos crudos) y funciones de procesamiento:

```typescript
// Ejemplo de estructura
getMRRRaw()      // Retorna datos crudos del endpoint
getMRR()         // Retorna datos procesados y normalizados
```

Cada funcion de procesamiento:
1. Llama a la funcion Raw
2. Transforma la estructura de la API a una estructura normalizada
3. Calcula valores derivados (current, previous, totals)
4. Ordena datos cronologicamente

#### `lib/api/index.ts` - Exportaciones Centralizadas
Exporta todos los tipos y funciones desde un solo punto de entrada:
```typescript
import { getMRR, MRRProcessed } from "@/lib/api"
```

---

### 2. Route Handlers (`app/api/`)

#### `app/api/micro/[endpoint]/route.ts`
Proxy para endpoints `/micro/*` del microservicio externo.
- URL base: `https://fast-api-liart-nine.vercel.app`
- Cache: 60 segundos con `next: { revalidate: 60 }`

#### `app/api/costs/[endpoint]/route.ts`
Proxy para endpoints `/costs/*` del microservicio externo.
- Para `cac` y `ue`: agrega automaticamente `start_date=2026-01-01T00:00:00.000` y `acumulado=true`
- Cache: 60 segundos

---

### 3. Sistema de Filtros Globales

#### `lib/contexts/filters-context.tsx`
Context de React que provee filtros globales a toda la aplicacion:

```typescript
interface Filters {
  year: string      // Ej: "2026"
  month: string     // Ej: "Todos", "01", "02", etc.
  plan: string      // Ej: "Todos", "Free", "Starter", etc.
}
```

**Hook `useFilters()`:**
```typescript
const { filters, setFilters, updateFilter } = useFilters()

// Actualizar un filtro individual
updateFilter("year", "2025")

// Actualizar multiples filtros
setFilters({ year: "2026", month: "01", plan: "Starter" })
```

#### `components/dashboard/dashboard-filters.tsx`
Componente de UI que renderiza los selectores de filtros y los botones de meses.
Se conecta al contexto de filtros para sincronizar toda la aplicacion.

---

### 4. Componentes KPI Dinamicos

Se crearon componentes KPI que se conectan a las APIs:

| Componente | Endpoint | Descripcion |
|------------|----------|-------------|
| `mrr-kpi-card.tsx` | `/micro/mrr` | MRR actual con % cambio vs mes anterior |
| `arpu-kpi-card.tsx` | `/micro/arpu` | ARPU actual con % cambio vs mes anterior |
| `company-activos-kpi-card.tsx` | `/micro/usuarios_activos` | Companies activas contando arrays |
| `churn-kpi-card.tsx` | `/micro/usuarios_churned` | Usuarios churned (bajada = verde) |
| `mrr-percent-kpi-card.tsx` | `/micro/mrr` | % de cambio del MRR |
| `dollar-churn-kpi-card.tsx` | `/micro/churn_mrr` | MRR perdido por churn en dolares |
| `tasa-retencion-kpi-card.tsx` | `/micro/tasa_retention` | Tasa de retencion % |

**Caracteristicas comunes:**
- Usan `useSWR` para fetch y cache de datos
- Se suscriben a `useFilters()` para filtros globales
- Calculan % de cambio vs mes anterior
- Muestran skeleton mientras cargan
- Colores: verde para tendencia positiva, rojo para negativa

---

### 5. Graficos Conectados a APIs

| Componente | Endpoints | Descripcion |
|------------|-----------|-------------|
| `mrr-2025-chart.tsx` | `/micro/mrr` | Grafico de lineas MRR por mes/plan |
| `arpa-clientes-chart.tsx` | `/micro/arpu` + `/micro/usuarios_activos` | Doble eje Y: ARPA y clientes |
| `dcpa-mrpa-chart.tsx` | `/costs/ue` + `/micro/mrr` | Barras comparando DCPA vs MRR |
| `cac-payback-chart.tsx` | `/costs/cac` + `/micro/arpu` | Linea de CAC Payback (meses) |
| `cac-ltv-chart.tsx` | `/costs/cac` + `/micro/ltv` | Barras CAC vs LTV con filtro plan |
| `ticket-promedio-chart.tsx` | `/costs/cac` + `/micro/ticket_promedio` | Lineas CAC vs Ticket Promedio |

---

### 6. Constantes y Configuracion

```typescript
// Margen bruto fijo usado en calculos
const GROSS_MARGIN = 0.70  // 70%

// Meses del año para proyecciones
const ALL_MONTHS = ["01", "02", ..., "12"]

// URL del microservicio
const MICROSERVICE_URL = "https://fast-api-liart-nine.vercel.app"
```

---

## Metricas Calculadas - Formulas

### CAC Ratio
```
CAC Ratio = (New MRR x Margen Bruto) / Marketing Cost
          = (New MRR x 0.70) / CAC
```
- Si Marketing Cost es 0, el ratio es 0

### CAC Payback
```
CAC Payback = CAC / (ARPU x Margen Bruto)
            = CAC / (ARPU x 0.70)
```
- Resultado en meses
- Si ARPU es 0, el payback es 0

### New ARR (Anualizado con Proyeccion)
```
New ARR = New MRR x 12
```
- Para meses sin datos, usa el valor del ultimo mes real
- `isProjected: true` indica datos proyectados

### Churn ARR (Anualizado con Proyeccion)
```
Churn ARR = Churn MRR x 12
```
- Misma logica de proyeccion que New ARR
