# Business Health Score — Architecture

**Versión:** 1.0 · Marzo 2026  
**Código:** `lib/domain/business-health/`

---

## Propósito

Indicador único **0–100** que resume la preparación del negocio para convertir turistas. Se recalcula automáticamente cuando cambian datos del perfil, catálogo, galería, horarios o reseñas.

---

## Estructura del dominio

```
lib/domain/business-health/
  types.ts           — BusinessHealthScore, HealthLevel, dimensions
  weights.ts         — Pesos configurables por dimensión (sum = 100)
  rules.ts           — Reglas 0–100 por dimensión
  scoreCalculator.ts — Agregación ponderada + nivel
  businessHealth.ts  — API pública + buildHealthInput()
  index.ts
```

**Presentación:** `HealthScoreCard`, `ProfileStatsBar` en `BusinessHomeScreen`  
**Hook:** `hooks/useBusinessHealth.ts`

---

## Dimensiones y pesos (configurables)

| Dimensión | Peso | Señales |
|-----------|------|---------|
| **Perfil** | 30 | Foto, logo, descripción, contacto, redes, completitud |
| **Productos** | 15 | Count productos + menú |
| **Horarios** | 15 | Schedule completo en `business_enrichment` |
| **Galería** | 20 | Fotos en `business_gallery` |
| **Reputación** | 20 | % reseñas respondidas, promos activas |

Modificar pesos en `weights.ts` sin tocar reglas ni UI.

---

## Niveles

| Score | Nivel | Label UI |
|-------|-------|----------|
| ≥ 85 | `excellent` | Excelente |
| ≥ 70 | `good` | Bueno |
| ≥ 50 | `needs_improvement` | Puede mejorar |
| < 50 | `incomplete` | Incompleto |

---

## Flujo de cálculo

```text
BusinessHealthInput (snapshot desacoplado de UI)
    → rules.ts (percent 0–100 por dimensión)
    → scoreCalculator.ts (weighted sum)
    → BusinessHealthScore + desglose %
```

El hook también consulta `business_events` (última semana) para actividad reciente.

---

## Integración con Oportunidades

`lib/domain/business-opportunities/` consume:

- Dimensiones con `percent < 70` → hints automáticos
- Reglas explícitas (reseñas, galería, horarios…)

Sin acoplar Health a la UI de oportunidades — solo datos.

---

## Escalabilidad futura

| Extensión | Cómo |
|-----------|------|
| **IA / ML** | Nuevo `scoreCalculatorML.ts` que implemente misma interfaz |
| **Benchmark** | Input adicional `categoryPercentiles` en `BusinessHealthInput` |
| **Por categoría** | `weights.ts` → mapa por `category` Google normalizada |
| **Cache** | Columna `health_score_cached` en `business_enrichment` (cron) |

---

## Despliegue

1. Aplicar `supabase/business-profile.sql` (horarios, enrichment).
2. Verificar Business Home muestra score + desglose.
3. Ajustar pesos con pilotos reales.

---

*Documento vivo. Sincronizar con ROADMAP Fase 4.*
