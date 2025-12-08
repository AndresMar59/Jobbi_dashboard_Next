# Documentación de APIs Utilizadas

## ChartMogul API

### Endpoint Implementado
\`\`\`
GET /api/chartmogul/metrics
\`\`\`

### API de ChartMogul Consumida
\`\`\`
GET https://api.chartmogul.com/v1/metrics/all
\`\`\`

### Parámetros
- **start-date**: 2024-01-01
- **end-date**: 2024-12-31

### Autenticación
- **Método**: Basic Auth
- **Header**: `Authorization: Basic {base64(API_KEY:)}`
- **Variable de entorno**: `CHARTMOGUL_API_KEY`

### Datos Obtenidos
El endpoint `/v1/metrics/all` de ChartMogul devuelve:

1. **MRR (Monthly Recurring Revenue)**: Ingresos recurrentes mensuales
2. **ARR (Annual Recurring Revenue)**: Ingresos recurrentes anuales
3. **Customer Count**: Número total de clientes
4. **Customer Churn Rate**: Tasa de pérdida de clientes
5. **MRR Churn Rate**: Tasa de pérdida de MRR
6. **LTV (Lifetime Value)**: Valor del tiempo de vida del cliente
7. **ARPA (Average Revenue Per Account)**: Ingreso promedio por cuenta
8. **ASP (Average Sale Price)**: Precio de venta promedio

### Estructura de Respuesta
\`\`\`json mmm
{
  "entries": [
    {
      "date": "2024-01-01",
      "mrr": 50000,
      "arr": 600000,
      "customer-count": 150,
      "customer-churn-rate": 5.2,
      "mrr-churn-rate": 3.8,
      "ltv": 15000,
      "arpa": 333.33,
      "asp": 500
    }
  ]
}
\`\`\`

---

## Google Sheets API

### Endpoint Implementado
\`\`\`
GET /api/sheets?spreadsheetId={id}&range={range}
\`\`\`

### API de Google Sheets Consumida
\`\`\`
GET https://sheets.googleapis.com/v4/spreadsheets/{spreadsheetId}/values/{range}
\`\`\`

### Parámetros
- **spreadsheetId**: ID del Google Sheet (por defecto usa `GOOGLE_SHEET_ID` de env)
- **range**: Rango de celdas a leer (por defecto: `Sheet1!A1:Z1000`)
- **key**: API Key de Google Cloud

### Autenticación
- **Método**: API Key en query parameter
- **Variable de entorno**: `GOOGLE_SHEETS_API_KEY`

### Datos Obtenidos
El endpoint devuelve un arreglo bidimensional con los valores de las celdas especificadas:

\`\`\`json
{
  "range": "Sheet1!A1:Z1000",
  "majorDimension": "ROWS",
  "values": [
    ["Fecha", "Ingresos", "Usuarios", "Conversión"],
    ["2024-01-01", "15000", "120", "3.5"],
    ["2024-02-01", "18000", "145", "4.2"],
    ...
  ]
}
\`\`\`

### Formato Esperado en el Sheet
Para que los datos se integren correctamente con el dashboard, el Google Sheet debe tener:

**Columnas sugeridas:**
- **Columna A**: Fecha (formato: YYYY-MM-DD)
- **Columna B**: Ingresos totales
- **Columna C**: Nuevos usuarios
- **Columna D**: Tasa de conversión (%)
- **Columna E**: Tickets de soporte
- **Columna F**: Otros KPIs personalizados

---

## Integración en el Dashboard

### Hook: `useChartMogulMetrics`
- **Archivo**: `lib/hooks/use-chartmogul.ts`
- **Frecuencia de actualización**: Cada 30 segundos (SWR)
- **Uso**: Obtiene métricas de ChartMogul para KPIs y gráficos

### Hook: `useGoogleSheets`
- **Archivo**: `lib/hooks/use-google-sheets.ts`
- **Frecuencia de actualización**: Cada 30 segundos (SWR)
- **Uso**: Obtiene datos personalizados desde Google Sheets

### Componentes Actualizados
- **KPICard**: Muestra métricas en tiempo real desde ChartMogul
- **ChartLine**: Visualiza tendencias de ingresos mensuales
- **ChartBar**: Muestra crecimiento de usuarios

---

## Variables de Entorno Requeridas

\`\`\`env
CHARTMOGUL_API_KEY=tu_api_key_de_chartmogul
GOOGLE_SHEETS_API_KEY=tu_api_key_de_google_cloud
GOOGLE_SHEET_ID=id_de_tu_google_sheet
\`\`\`

Estas variables ya están configuradas en tu proyecto de v0.

---

## Notas Adicionales

1. **Rate Limits**:
   - ChartMogul: Verificar límites en tu plan
   - Google Sheets: 100 requests por 100 segundos por usuario

2. **Error Handling**:
   - Ambos endpoints tienen manejo de errores con fallback a datos de ejemplo
   - Los errores se logean en consola con prefijo `[v0]`

3. **Caché**:
   - SWR maneja el caché automáticamente
   - Los datos se revalidan cada 30 segundos
