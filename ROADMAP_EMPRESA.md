# Roadmap Estratégico — Trivai Business

**Versión:** 2.0 · Marzo 2026  
**Alcance:** Módulo Empresa (Expo + Supabase + Google Places híbrido)  
**Propósito:** Guía de producto para escalar Trivai Business como principal fuente de ingresos, sin oficinas locales y en cualquier país.

**Documentos relacionados:** `ARCHITECTURE_ROLES.md`, `BUSINESS_SUBSCRIPTIONS.md`  
**Próximo documento recomendado:** `BUSINESS_EVENTS_ARCHITECTURE.md` (detalle técnico del sistema de eventos)

---

## Resumen ejecutivo

Trivai Business tiene una **base arquitectónica sólida**: separación Turista/Empresa, Claim ≠ Suscripción, modelo híbrido Google + Supabase, gating por plan y flujo post-claim definido.

**Cambio estratégico v2.0:** Trivai Business debe dejar de ser un panel de administración y convertirse en una **plataforma que demuestra valor real**. Antes de cobrar, el negocio debe responder:

> **¿Qué hizo Trivai por mi negocio hoy?**

Por tanto, la prioridad del MVP **no es la pasarela de pago**, sino la **cadena de valor demostrable**:

```
Persistencia real → Eventos → Dashboard honesto → ROI visible → Pago
```

La ventaja competitiva de Trivai no es ser otro directorio — es ser la **capa de conversión turística** sobre Google Maps: descubrimiento + acciones medibles + asistente de crecimiento continuo.

**Tagline interno:** *“Google te encuentra. Trivai te trae clientes.”*

---

# 1. Estado actual

Inventario basado en código desplegado (`master`, post Business Home) y documentación viva.

### Leyenda

| Símbolo | Significado |
|---------|-------------|
| ✅ | Funcional y usable en producción (puede tener deuda menor) |
| 🟡 | Implementado parcialmente: UI, flujo o persistencia incompletos |
| ❌ | No implementado o solo placeholder |

---

### Flujo y onboarding

| Funcionalidad | Estado | Evidencia / notas |
|---------------|--------|-------------------|
| Registro / Login (OAuth) | ✅ | Auth compartido; Google OAuth + sesión Supabase |
| Onboarding turista vs empresa | ✅ | `UserTypeScreen`, rutas `/empresa/onboarding/*` |
| Búsqueda negocio (Google Places) | ✅ | `BusinessSearchScreen`, API híbrida vía backend web |
| Claim (reclamar negocio) | ✅ | `claimBusiness.ts` — persiste `places` + `trivai_business`, `subscription_status: none` |
| Verificación de propietario | 🟡 | Heurística email en cliente; **no persiste** `verification_status` en DB |
| Selección de plan | ✅ | `/empresa/plan`, `ChoosePlanScreen`, persistencia tier sin pago |
| Post-claim → plan (no dashboard) | ✅ | Flujo Claim → Plan → Panel documentado e implementado |
| Completar onboarding empresa | ✅ | `completeBusinessOnboarding()` actualiza `profiles` |

---

### Experiencia Empresa (UI)

| Funcionalidad | Estado | Evidencia / notas |
|---------------|--------|-------------------|
| Home Empresa (separado del turista) | 🟡 | `BusinessHomeScreen` — UX profesional; métricas/actividad **mock** |
| Perfil Empresa (tab) | 🟡 | `BusinessProfileScreen` — hub de secciones; muchos placeholders |
| Panel avanzado `/empresa/[id]` | 🟡 | `CompanyProfileScreen` — tabs con gating por plan |
| Navegación empresa (Inicio · Mapa · Perfil) | ✅ | Tabs condicionales; sin selector Explorar/Mi Negocio |
| Gate sin plan | ✅ | `SubscriptionRequiredGate` |
| Upgrade prompts por plan | ✅ | `UpgradePrompt`, `planFeatures.ts` |
| Multi-negocio (lista) | 🟡 | `MyBusinessScreen`, `useOwnedBusinessesList` — tab oculto; UX no prominente |
| Cambio de negocio activo | 🟡 | `setActiveBusiness()` → `profiles.business_place_id` |

---

### Gestión del negocio

| Funcionalidad | Estado | Evidencia / notas |
|---------------|--------|-------------------|
| Editar información básica | 🟡 | `updatePlaceFromCompany()` — nombre, descripción, teléfono, web; **no** email/dirección Google |
| Horarios | 🟡 | Tier FREE incluye `hours`; onboarding recoge horarios pero **no persisten** en claim |
| Datos de contacto / WhatsApp | 🟡 | Campos en modelo; setup parcialmente conectado |
| Logo (Google / foto principal) | ✅ | Resolución: custom → Google photo → inicial |
| Logo personalizado (PRO+) | 🟡 | Upload Storage + `custom_logo_url`; depende bucket/policies prod |
| Productos CRUD | 🟡 | UI completa; **solo Zustand/AsyncStorage**, sin tabla Supabase |
| Menú | 🟡 | Mismo stack que productos; sin entidad menú separada |
| Galería | 🟡 | Vista desde fotos del place; sin upload ni vídeos |
| Promociones | ❌ | Mock en Home; tier PRO preparado; sin CRUD ni contexto |
| Redes sociales | ❌ | Placeholders en Perfil Empresa |
| Reseñas (lectura en panel) | 🟡 | Panel usa datos locales/demo; **no** unificado con `lib/reviews.ts` |
| Respuestas a reseñas | 🟡 | **Real** en detalle de lugar (`review_responses`); **mock** en panel empresa |
| Dashboard / métricas | 🟡 | UI + gating; números sintéticos (`businessHomeData.ts`, `MOCK_STATS`) |
| Analytics / Business Events | ❌ | Stub `lib/domain/analytics.ts`; sin pipeline de eventos |
| Business Health Score | ❌ | No implementado |
| Centro de Oportunidades | ❌ | No implementado |
| Asistente de Crecimiento | ❌ | No implementado |
| Benchmark ético | ❌ | Mencionado en diferenciales; sin UI |
| Estadísticas semanales (gráfico) | 🟡 | `SimpleBarChart` con datos demo o ceros |
| Configuración negocio | ❌ | Filas estáticas; eliminar negocio sin implementar |
| Notificaciones empresa | ❌ | Icono en header sin destino; notificaciones genéricas de usuario |

---

### Suscripciones y monetización

| Funcionalidad | Estado | Evidencia / notas |
|---------------|--------|-------------------|
| Planes FREE / PRO / PREMIUM | ✅ | Definidos en `planOptions.ts`, `planFeatures.ts` |
| Persistencia tier (sin pago) | ✅ | `subscription_status` en `trivai_business` |
| Pasarela de pago | ❌ | Explícitamente fuera de scope actual — **Fase 7 del roadmap** |
| `/empresa/suscripcion` | 🟡 | Redirige a selector de plan |
| Historial / facturación | ❌ | Placeholder |
| Expiración / downgrade | ❌ | Columna `subscription_expires_at` preparada |

---

### Infraestructura y arquitectura

| Funcionalidad | Estado | Evidencia / notas |
|---------------|--------|-------------------|
| Modelo híbrido Google + Supabase | ✅ | Principio reforzado en código y docs |
| Separación Usuario ≠ Negocio | ✅ | `lib/domain/business.ts`, `permissions.ts` |
| Claim vs Suscripción | ✅ | Implementado y documentado |
| Permisos centralizados por tier | ✅ | `planFeatures.ts` |
| SQL lifecycle (`business-lifecycle.sql`) | 🟡 | Idempotente; requiere aplicación consistente en prod |
| BackOffice admin | ❌ | Tipos preparados; sin UI |
| Mapa modo empresa | ❌ | Mismo mapa turista para usuarios empresa |
| Demo company `co-001` | 🟡 | Seed local que puede confundir en demos |

---

### Matriz mock vs real (síntesis)

```
PERSISTE EN SUPABASE              SOLO LOCAL / MOCK
─────────────────────────────────────────────────────
Claim + ownership                 Productos
Tier suscripción                  Reseñas del panel
Edición básica places             Stats / dashboard / ROI
Logo custom (PRO)                 Actividad del negocio
Lista negocios del owner          Promociones
Respuestas (place detail)         Demo co-001
profiles.business_place_id        Horarios post-onboarding
                                  Business Events (inexistente)
```

---

# 2. Roadmap por prioridad

## Principio de priorización (v2.0)

**Antes de cobrar, demostrar valor.** Un negocio que paga sin ver resultados cancela en 30 días. Un negocio que ve ROI semanal convierte y renueva.

| Orden | Capacidad | Por qué primero |
|-------|-----------|-----------------|
| **1** | Persistencia real de todos los datos | Sin datos reales no hay confianza ni métricas |
| **2** | Sistema de Business Events | Fuente única de verdad para interacciones |
| **3** | Dashboard con datos reales | Primer “aha moment” del dueño |
| **4** | Demostración de ROI | Justifica PRO antes del cobro |
| **5** | Pasarela de pago | Monetización **después** de valor percibido |

> **Nota v1.0 → v2.0:** La pasarela de pago deja de ser P0 inmediato. Pasa a **Fase 7**, una vez demostrado ROI en pilotos.

---

## 🔴 Imprescindible para lanzar (MVP Comercial)

Objetivo del MVP: **un negocio ve en su Dashboard qué hizo Trivai por él esta semana** — con datos reales, acciones concretas y contenido persistido — **antes** de integrar cobro automático.

| # | Funcionalidad | Objetivo | Valor para la empresa | Dependencias | Complejidad | Prioridad |
|---|---------------|----------|------------------------|--------------|-------------|-----------|
| 1 | **Persistencia completa de datos** | Productos, reseñas, horarios, contacto, galería en Supabase | Lo que publico es real y visible al turista | Schemas + RLS; unificar panel con APIs reales | Media | **P0** |
| 2 | **Sistema de Business Events** | Capturar cada interacción turista→negocio | Base de ROI, dashboard y asistente futuro | Ver sección Business Events; `BUSINESS_EVENTS_ARCHITECTURE.md` | Alta | **P0** |
| 3 | **Dashboard con datos reales** | Reemplazar mocks por agregaciones de eventos | Responde “¿qué hizo Trivai hoy?” | #1, #2 | Media | **P0** |
| 4 | **Demostración de ROI** | Resumen orientado a negocio (descubrimientos, contactos, conversiones) | Argumento de venta PRO sin pagar aún | #2, #3 | Media | **P0** |
| 5 | **Unificar reseñas y respuestas** | Panel ↔ `lib/reviews.ts` | Cierre loop reputación | Tabla `review_responses` | Media | **P0** |
| 6 | **Horarios + contacto persistidos** | Setup onboarding → `places` | Perfil completo = más conversiones | Claim/update flow | Baja | **P1** |
| 7 | **Onboarding + empty states pulidos** | Cero pantallas rotas post-claim | Retención día 1 | QA | Baja | **P1** |
| 8 | **Verificación propietario (MVP)** | Persistir `verification_status` | Confianza ecosistema | BackOffice mínimo | Media | **P1** |
| 9 | **Pasarela de pago + suscripción automática** | Cobrar cuando ROI ya es visible | Monetización sostenible | Stripe/MP; webhooks; Fases 1–4 completas | Alta | **P2** *(Fase 7)* |
| 10 | **Multi-negocio UX** | Selector visible | Franquicias, cadenas | `useOwnedBusinessesList` | Baja | **P2** |

**Criterio de “listo para vender” (revisado):** 10 negocios piloto ven **ROI real de 7 días** (no mock), tienen productos y reseñas persistidos, y **≥60% declaran que volverían a pagar** tras trial PRO — **luego** se activa cobro automático.

**Justificación de producto:** Cobrar antes de demostrar ROI genera churn alto y reputación negativa en SMB. El trial con valor demostrado convierte mejor que descuento sin métricas (patrón SaaS B2B vertical: mostrar outcome → cobrar → expandir).

---

## 🟡 Muy importante para los primeros clientes

| Funcionalidad | Por qué después del MVP base | Valor | Complejidad |
|---------------|-------------------------------|-------|-------------|
| **Business Health Score** | Requiere datos de perfil + eventos | Gamificación y urgencia de mejora | Media |
| **Centro de Oportunidades** | Requiere Health Score + eventos | Dashboard como asistente, no panel | Media |
| **Promociones contextuales v1** | Requiere eventos + productos | Diferenciador vs GBP | Alta |
| **Benchmark ético** | Requiere masa crítica agregada | Contexto competitivo sin PII | Media |
| **Notificaciones empresa** | Eventos en tiempo real | Hábito de uso diario | Media |
| **Galería upload PRO** | Storage + límites por plan | Contenido enriquecido | Media |
| **Mapa modo negocio** | Place coords | Contexto espacial | Media |
| **Gestión suscripción completa** | Post Fase 7 | Reduce churn | Media |
| **Exportar métricas (CSV/PDF)** | Dashboard real | Adopción LATAM | Baja |

---

## 🟢 Mejoras futuras

| Funcionalidad | Notas |
|---------------|-------|
| Menú digital QR vinculado al perfil | Extensión natural de productos |
| Plantillas de respuesta a reseñas | Pre-IA |
| Programa de fidelización básico | Cupones recurrentes |
| Integración calendario eventos locales | Alineado con módulo Eventos Trivai |
| White-label para cámaras de comercio | B2B2B, post PMF |
| App nativa features (widgets, shortcuts) | Builds iOS/Android masivos |

---

## 💎 Funcionalidades diferenciales

| Idea | Descripción | Valor | Viabilidad híbrida |
|------|-------------|-------|-------------------|
| **Turista → Acción medible** | Embudo completo vía Business Events | ROI claro vs Google Insights | ✅ `google_place_id` + `place_id` |
| **Promociones contextuales** | Proximidad, horario, eventos, temporada (sin PII) | Conversión in situ | ✅ Coords Google + reglas Trivai |
| **Asistente de Crecimiento** | Recomendaciones accionables diarias | Retención y mejora continua | ✅ Events + Health Score |
| **IA asistida (Premium)** | Respuestas, campañas, predicción | Eficiencia operativa | ✅ Texto en Supabase |
| **Alertas de tendencia local** | “+40% búsquedas brunch en tu zona” | Timing promos | ✅ Agregados anónimos |
| **Pack destino para empresas** | Flujo turístico por barrio | B2B zona turística | ✅ Agregación |
| **Segmentación respetuosa** | Idioma app, franja horaria | Marketing sin PII | ✅ Privacy-by-design |

**Tesis diferencial:** Google optimiza **presencia**. Trivai optimiza **conversión turística medible + mejora continua**.

---

# Visión estratégica del valor

Las siguientes secciones definen **cómo Trivai demuestra valor**, no solo **qué pantallas existen**.

---

## Retorno de inversión para la empresa

### Pregunta central del Dashboard

> **¿Qué hizo Trivai por mi negocio hoy?**

El Dashboard no es un panel de estadísticas técnicas. Es un **informe de impacto** orientado al dueño del negocio.

### Indicadores orientados a negocio (ROI)

| Indicador | Definición para el negocio | Evento(s) fuente |
|-----------|---------------------------|------------------|
| **Personas que descubrieron el negocio** | Vieron el perfil o listing en Trivai | `VIEW_PLACE`, impresiones en descubrimiento |
| **Personas que solicitaron cómo llegar** | Intención de visita física | `DIRECTIONS`, `OPEN_MAP` |
| **Personas que contactaron por WhatsApp** | Lead directo | `WHATSAPP_CLICK` |
| **Personas que llamaron** | Lead telefónico | `PHONE_CLICK` |
| **Personas que visitaron la web** | Tráfico referido | `WEBSITE_CLICK` |
| **Personas que guardaron el negocio** | Interés diferido / retorno | `FAVORITE` |
| **Personas que compartieron el negocio** | Viralidad orgánica | `SHARE` |
| **Reseñas recibidas / respondidas** | Reputación activa | `REVIEW_CREATED`, `REVIEW_RESPONSE` |
| **Conversiones estimadas** | Modelo heurístico (ej. clicks contacto × tasa sector) | Agregación ponderada |

### Presentación ROI (conceptual)

- **Hoy / Esta semana / Este mes** — mismos indicadores, distintos rangos.
- **Resumen en lenguaje humano:** *“Esta semana Trivai generó 23 contactos directos y 41 personas descubrieron tu negocio.”*
- **Comparativa temporal:** vs semana anterior (%).
- **FREE:** resumen básico. **PRO:** desglose + gráficos + export. **PREMIUM:** predicciones y campañas.

### Conversión estimada

Heurística inicial (sin IA): combinar `WHATSAPP_CLICK + PHONE_CLICK + DIRECTIONS` con coeficientes configurables por categoría (gastronomía vs tour). Siempre mostrar como **estimación**, no facturación real.

---

## Business Events

### Propósito

Sistema nervioso de Trivai Business. Cada interacción turista→negocio genera un evento que alimenta Dashboard, ROI, Health Score, Oportunidades, Promociones, Benchmark y (futuro) IA.

**No duplica lugares.** Referencia siempre:
- `place_id` (UUID Supabase / enriquecimiento Trivai)
- `google_place_id` (clave canónica Google)

### Catálogo de eventos (v1)

| Evento | Cuándo se dispara | Valor analítico |
|--------|-------------------|-----------------|
| `VIEW_PLACE` | Apertura perfil / ficha | Descubrimiento |
| `OPEN_MAP` | Ver en mapa | Intención visita |
| `DIRECTIONS` | Cómo llegar | Intención alta |
| `WHATSAPP_CLICK` | Tap WhatsApp | Conversión contacto |
| `PHONE_CLICK` | Tap llamar | Conversión contacto |
| `WEBSITE_CLICK` | Tap web | Tráfico referido |
| `FAVORITE` | Guardar negocio | Retención turista |
| `SHARE` | Compartir perfil | Viralidad |
| `REVIEW_CREATED` | Nueva reseña | Reputación |
| `REVIEW_RESPONSE` | Respuesta del negocio | Engagement |
| `PROMOTION_VIEW` | Ver promo | Interés oferta |
| `PROMOTION_CLICK` | Tap promo | Conversión promo |
| `PRODUCT_VIEW` | Ver producto | Catálogo |

### Estructura conceptual del evento

```text
BusinessEvent {
  id: uuid
  event_type: enum
  place_id: uuid              // Supabase places.id
  google_place_id: string     // redundancia controlada para joins híbridos
  occurred_at: timestamptz
  session_id?: string         // anónimo, rotativo
  user_id?: uuid              // solo si autenticado; nunca exponer a empresa
  metadata?: json             // promo_id, product_id, source_screen, locale
  city?: string               // agregación geográfica
}
```

### Persistencia (principios)

- Tabla append-only `business_events` (o particionada por mes).
- **RLS:** negocio solo lee eventos de sus `place_id` owned.
- **Retención:** raw 90 días; agregados diarios indefinidos.
- **Privacidad:** empresa nunca ve `user_id` ni datos identificables del turista.
- **Agregación nocturna** → `business_metrics_daily` para Dashboard rápido.

### Relación con Google Place ID

Google identifica el lugar; Trivai identifica **interacciones en el ecosistema Trivai**. Los eventos son 100% propiedad Trivai — esto es la **moat** frente a depender solo de Google Insights.

### Uso downstream

| Consumidor | Uso |
|------------|-----|
| Dashboard / ROI | Conteos y tendencias |
| Business Health Score | Actividad reciente |
| Centro de Oportunidades | Detectar gaps (ej. muchas vistas, cero respuestas) |
| Promociones contextuales | Medir `PROMOTION_CLICK` |
| Benchmark | Percentiles agregados por categoría |
| Asistente de Crecimiento | Mensajes accionables |
| IA futura | Entrenamiento señales agregadas |

> **Siguiente paso técnico:** documentar en `BUSINESS_EVENTS_ARCHITECTURE.md` (tablas, índices, pipelines, fórmulas ROI).

---

## Business Health Score

### Objetivo

Un indicador único de **calidad y completitud operativa** del perfil, visible como:

**84 / 100**

No mide popularidad (eso es ROI). Mide **preparación para convertir turistas**.

### Factores considerados (pesos TBD)

| Factor | Señal |
|--------|-------|
| Perfil completo | Campos obligatorios en `places` + Trivai |
| Horarios | `places.hours` completos y actuales |
| Fotografías | Count Google + galería Trivai |
| Descripción | Longitud mínima, keywords |
| Productos | Count activos |
| Datos de contacto | Teléfono, WhatsApp, web |
| Respuesta a reseñas | % respondidas en 7 días |
| Promociones activas | Al menos 1 vigente (PRO) |
| Actividad reciente | Eventos + actualizaciones últimos 30 días |
| Verificación | Badge verificado |

### Utilidad para el negocio

- **Motivación:** subir de 62 → 80 es un juego claro.
- **Upsell:** “Desbloquea +15 puntos con PRO (galería + promos)”.
- **Asistente:** base numérica para recomendaciones.
- **Benchmark:** comparar score propio vs media categoría (anonimizada).

### Arquitectura conceptual

```
ProfileCompletenessService + ReviewMetrics + EventRecency
        ↓
BusinessHealthScoreCalculator (reglas ponderadas, sin ML inicial)
        ↓
Cached score per place_id (refresh daily or on profile change)
```

Algoritmo exacto: **Fase 4** del roadmap. Arquitectura: **desde Fase 1** (campos necesarios persistidos).

---

## Oportunidades de crecimiento

### Objetivo

El Dashboard **sugiere acciones**, no solo muestra números.

### Formato de cada oportunidad

| Campo | Ejemplo |
|-------|---------|
| **Sugerencia** | “Responde tus 3 reseñas pendientes” |
| **Impacto esperado** | “+8 pts Health Score · más confianza turista” |
| **Prioridad** | Alta / Media / Baja |
| **Acción** | Deep link → tab Reseñas |
| **Evidencia** | “Tienes 40 vistas esta semana y 0 respuestas” |

### Ejemplos de oportunidades

- Agrega más fotografías (tienes 2; media categoría: 8).
- Completa tu descripción (actual: 40 caracteres).
- Responde tus últimas reseñas.
- Agrega nuevos productos (catálogo vacío).
- Activa una promoción (temporada alta detectada).
- Actualiza tus horarios (festivo próximo).
- Mejora tu logo (PRO — perfil más profesional).

### Dependencias

- Business Events (evidencia cuantitativa)
- Business Health Score (priorización)
- Estado del perfil (persistencia real)

---

## Loop de crecimiento Trivai

```text
Turista descubre un negocio (Google + Trivai)
        ↓
Interacción (vista, ruta, WhatsApp, favorito…)
        ↓
Business Event registrado
        ↓
Dashboard + ROI actualizados
        ↓
Centro de Oportunidades sugiere mejora
        ↓
La empresa mejora su perfil (fotos, productos, respuestas)
        ↓
Business Health Score ↑
        ↓
Mejor experiencia para el turista
        ↓
Más descubrimiento (ranking, recomendaciones)
        ↓
Más interacciones
        ↓
Más datos
        ↓
Mayor valor demostrado → retención suscripción
        ↓
(ciclo se repite)
```

### Por qué escala orgánicamente

1. **Cada turista alimenta datos** sin costo marginal de contenido.
2. **Cada empresa mejorada eleva calidad** del destino en Trivai.
3. **No requiere oficinas locales** — el loop es digital y self-serve.
4. **Google sigue siendo fuente de lugares**; Trivai acumula señales propias irreplicables por GBP solo.

---

## Promociones (visión ampliada)

### Más allá del CRUD

Las promociones son **herramientas de conversión contextual**, no banners estáticos.

### Arquitectura preparada para contexto

| Dimensión | Ejemplo | Datos necesarios |
|-----------|---------|------------------|
| **Proximidad** | Promo si turista a &lt;500 m | Ubicación aproximada (opt-in) |
| **Horario** | Happy hour 17–19 h | Reloj local + `places.hours` |
| **Eventos locales** | Feria, partido, festival | Módulo Eventos Trivai |
| **Temporada** | Temporada alta / lluvias | Calendario + histórico eventos |
| **Comportamiento agregado** | “Zona con +30% búsquedas gastronomía” | Business Events agregados |

### Modelo conceptual

```text
Promotion {
  id, place_id, title, rules: PromotionRules,
  valid_from, valid_until, status,
  metrics: { views, clicks }
}

PromotionRules {
  geo_radius_m?, time_window?, event_id?,
  category_boost?, min_health_score?
}
```

### Privacidad

- **Nunca** targeting por identidad individual.
- Proximidad = celda geográfica gruesa o geofence anónimo.
- Cumplimiento GDPR/CCPA: consentimiento ubicación explícito en app turista.

### Fases

- **Fase 6:** CRUD + `PROMOTION_CLICK` events.
- **Futuro:** motor de reglas contextuales + A/B agregado.

---

## Benchmark del negocio

### Objetivo

Contexto competitivo **sin mostrar datos identificables** de otros negocios.

### Comparaciones agregadas (ejemplos)

| Métrica | Tu negocio | Media categoría (zona) |
|---------|------------|------------------------|
| Rating Google | 4.6 | 4.2 |
| Fotografías | 3 | 8 |
| % reseñas respondidas | 40% | 65% |
| Completitud perfil | 72% | 68% |
| Actividad (eventos/semana) | 12 | 9 |

### Reglas éticas

- Mínimo **N negocios** en celda (ej. N≥5) para mostrar benchmark.
- Solo percentiles y medias — nunca nombres ni rankings públicos humillantes.
- Zona = grid geográfico + categoría Google normalizada.

### Dependencias

- Business Events agregados por categoría/zona
- Business Health Score
- **Fase 8**

---

## Asistente de Crecimiento Trivai

### Objetivo

Transformar Trivai de **panel de métricas** a **asesor del negocio** — sin IA generativa en v1.

### Ejemplos de mensajes (reglas, no LLM)

- “Tu perfil está al **82%**. Agrega dos fotos para mejorar tu visibilidad.”
- “Tienes **3 reseñas** pendientes de respuesta.”
- “Hoy hubo un **+18%** de búsquedas en tu categoría en la zona.”
- “Tu negocio recibió **más clics que la semana pasada** (+12%).”
- “Activa una promoción: mañana hay evento cerca y tu competencia media tiene 2 promos activas.”

### Arquitectura conceptual

```text
Inputs:
  - Business Events (tendencias)
  - business_metrics_daily
  - Business Health Score
  - Oportunidades pendientes
  - Benchmark (si disponible)

Engine:
  - GrowthAssistantRuleEngine (if/then templates)
  - Priorización por impacto × facilidad

Outputs:
  - Feed en Business Home (“Hoy en tu negocio”)
  - Push notifications (opt-in)
  - Weekly email digest (PRO+)
```

### Evolución

| Etapa | Capacidad |
|-------|-----------|
| **Fase 9** | Reglas + templates |
| **Fase 10** | IA: redacción respuestas, predicción demanda, campañas sugeridas |

### Dependencias

- Business Events operativo
- Health Score + Oportunidades
- Dashboard ROI real

---

# 3. Modelo de negocio

## Planes actuales — evaluación

Los tres tiers siguen siendo válidos. La **secuencia de monetización** cambia: demostrar ROI en FREE/trial → cobrar PRO.

### FREE

| Dimensión | Detalle |
|-----------|---------|
| **Incluye** | Claim, editar básico, horarios, contacto, responder reseñas, **ROI básico** (resumen semanal) |
| **Público** | Validación, microempresa |
| **Limitaciones** | Sin logo custom, productos limitados, sin promos, sin benchmark, sin asistente completo |
| **Conversión a PRO** | “23 contactos esta semana — desbloquea desglose y asistente con PRO” |

### PRO

| Dimensión | Detalle |
|-----------|---------|
| **Incluye** | Todo Free + logo, productos, galería, dashboard completo, promociones, analytics, Health Score, Oportunidades, asistente |
| **Público** | Core revenue — gastronomía, retail turístico |
| **Conversión a Premium** | Campañas, IA, multi-sucursal, reportes avanzados |

### PREMIUM

| Dimensión | Detalle |
|-----------|---------|
| **Incluye** | Todo PRO + IA, campañas automatizadas, benchmark avanzado, soporte prioritario |
| **Estrategia** | Venta relacional + ROI demostrado en PRO primero |

### Recomendaciones (sin precios)

1. **Trial PRO 14 días** tras demostrar ROI en FREE (Fase 7).
2. Cobro solo cuando Dashboard muestra **≥7 días de datos reales**.
3. Límites numéricos visibles (productos, fotos, promos).

---

# 4. Experiencia de usuario

## Flujo actual

```
Registro → Onboarding empresa → Claim → Plan → Home Empresa
  → Dashboard ROI (objetivo) → Oportunidades → Mejora perfil → Más valor
```

## Puntos de fricción detectados

| Etapa | Fricción | Mejora |
|-------|----------|--------|
| Post-claim | Plan sin valor visible | Mostrar ROI placeholder honesto o “activando métricas…” |
| Primer acceso Home | Métricas mock | **Bloqueante comercial** — Fase 3 |
| Productos local-only | Usuario cree que publicó | Persistir (Fase 1) o mensaje honesto |
| Panel vs Home | Dos gestiones | Home = ROI + oportunidades; Panel = edición |

## North Star UX Empresa (actualizada)

> **“En 48 horas sé cuántos turistas me encontraron, cuántos me contactaron, y qué debo mejorar hoy.”**

---

# 5. Escalabilidad internacional

Sin cambios estructurales al modelo híbrido. Añadir:

| Factor | Implicación para Business Events |
|--------|----------------------------------|
| **Multi-país** | `city`, `country_code` en eventos; agregación por mercado |
| **Idiomas** | Asistente i18n; ROI en idioma del dueño |
| **Regulaciones** | Consentimiento analytics; retención limitada; DPA Supabase |
| **Monedas** | Solo en Fase 7 (pagos); ROI no depende de moneda |

**Escala sin oficinas:** Sí — el loop de crecimiento es self-serve si Events + Asistente funcionan.

---

# 6. Competencia

| Plataforma | Gap que Trivai llena |
|------------|---------------------|
| **Google Business Profile** | Insights genéricos; sin contexto turístico destino; sin asistente mejora |
| **TripAdvisor** | Costoso; no loop digital completo para SMB |
| **Yelp** | Menos relevante LATAM |
| **Meta Business Suite** | Social ads, no discovery mapa |

**Posicionamiento:** Capa de **conversión + crecimiento** sobre presencia Google.

---

# 7. Arquitectura recomendada

## Mantener

- Modelo híbrido Google + Supabase
- Claim ≠ Suscripción
- Usuario ≠ Negocio
- Turista ≠ Empresa (experiencias separadas)

## Añadir (priorizado)

| Componente | Fase | Rol |
|------------|------|-----|
| `business_events` | 2 | Fuente de verdad interacciones |
| `business_metrics_daily` | 3 | Dashboard performante |
| `business_products`, `review_responses` | 1 | Persistencia |
| `BusinessHealthScoreCalculator` | 4 | Score |
| `GrowthOpportunityEngine` | 5 | Oportunidades |
| `PromotionRulesEngine` | 6 | Promos contextuales |
| `BenchmarkAggregator` | 8 | Comparativas éticas |
| `GrowthAssistantRuleEngine` | 9 | Asistente |
| `SubscriptionService` | 7 | Pagos |

## Anti-patrones

- Cobrar antes de ROI visible
- Métricas mock en producción comercial
- Duplicar catálogo Google en Supabase
- Exponer PII turista al negocio

---

# 8. Riesgos

| Categoría | Riesgo | Mitigación |
|-----------|--------|------------|
| **Producto** | Cobrar antes de valor → churn | Fase 7 después de ROI |
| **Producto** | Dashboard mock destruye confianza | Fases 2–3 obligatorias pre-venta |
| **Técnico** | Events mall diseñados | `BUSINESS_EVENTS_ARCHITECTURE.md` primero |
| **Legal** | Analytics sin consentimiento | Opt-in; agregados; política privacidad |
| **Terceros** | Dependencia Google | Events propios = moat |
| **Monetización** | FREE demasiado generoso | Límites + upsell contextual |

---

# 9. Próximos pasos — Roadmap por fases

Horizonte sugerido: **10 fases**. No iniciar Fase 7 (pagos) hasta completar Fases 1–4 en pilotos.

---

## Fase 1 — Persistencia completa

| | |
|---|---|
| **Objetivo** | Todo lo que el negocio edita persiste en Supabase y es visible al turista |
| **Beneficio empresa** | Confianza: “lo que publico es real” |
| **Entregables** | `business_products`; reseñas unificadas; horarios/contacto; galería base; eliminar demo `co-001` en prod |
| **Dependencias** | `business-lifecycle.sql` aplicado |
| **Riesgos** | Migración datos local existentes |
| **Criterio de cierre** | 5 negocios con productos + respuestas 100% en Supabase |

---

## Fase 2 — Sistema de eventos

| | |
|---|---|
| **Objetivo** | Business Events capturando interacciones reales |
| **Beneficio empresa** | Base para “¿qué hizo Trivai?” |
| **Entregables** | `BUSINESS_EVENTS_ARCHITECTURE.md`; tabla `business_events`; instrumentación place detail + acciones |
| **Dependencias** | Fase 1 estable |
| **Riesgos** | Volumen, coste storage, consentimiento |
| **Criterio de cierre** | ≥1.000 eventos/día en piloto; 0 PII expuesto a negocios |

---

## Fase 3 — Dashboard real

| | |
|---|---|
| **Objetivo** | Reemplazar mocks por agregaciones de eventos |
| **Beneficio empresa** | ROI visible hoy / semana / mes |
| **Entregables** | `business_metrics_daily`; Business Home con datos reales; resumen ROI en lenguaje humano |
| **Dependencias** | Fase 2 |
| **Riesgos** | Performance queries |
| **Criterio de cierre** | Dashboard = logs de eventos (audit match) |

---

## Fase 4 — Business Health Score

| | |
|---|---|
| **Objetivo** | Score 0–100 de calidad de perfil |
| **Beneficio empresa** | Saber qué falta y gamificación |
| **Entregables** | Calculator + UI en Home; desglose por factor |
| **Dependencias** | Fase 1 (datos perfil), Fase 3 (actividad) |
| **Riesgos** | Peso de factores discutible — iterar con pilotos |
| **Criterio de cierre** | Score correlaciona con completitud verificable |

---

## Fase 5 — Centro de Oportunidades

| | |
|---|---|
| **Objetivo** | Sugerencias accionables con impacto y prioridad |
| **Beneficio empresa** | Dashboard → asistente de crecimiento |
| **Entregables** | `GrowthOpportunityEngine`; feed en Home; deep links |
| **Dependencias** | Fase 4 |
| **Riesgos** | Ruido (demasiadas sugerencias) |
| **Criterio de cierre** | ≥1 acción completada por negocio/semana en piloto |

---

## Fase 6 — Promociones

| | |
|---|---|
| **Objetivo** | CRUD + medición + base para contexto |
| **Beneficio empresa** | Conversión medible; diferenciador vs GBP |
| **Entregables** | Schema promos; UI; `PROMOTION_*` events; reglas simples (horario) |
| **Dependencias** | Fase 2, productos (Fase 1) |
| **Riesgos** | Scope creep contexto — v1 solo CRUD + horario |
| **Criterio de cierre** | 3 promos activas medidas en piloto |

---

## Fase 7 — Suscripciones y pagos

| | |
|---|---|
| **Objetivo** | Cobro automático PRO/Premium |
| **Beneficio Trivai** | Ingresos recurrentes |
| **Beneficio empresa** | Paga **después** de ver ROI |
| **Entregables** | Stripe/MP; webhooks; `/empresa/suscripcion`; trial; límites por plan |
| **Dependencias** | Fases 1–4 completas; NPS piloto ≥30 |
| **Riesgos** | Churn si se activa demasiado pronto |
| **Criterio de cierre** | 5 pagos recurrentes; churn &lt;15% mes 1 |

---

## Fase 8 — Benchmark

| | |
|---|---|
| **Objetivo** | Comparativas agregadas anónimas |
| **Beneficio empresa** | Contexto sin espiar competidores |
| **Entregables** | `BenchmarkAggregator`; UI comparativa; umbral N≥5 |
| **Dependencias** | Masa crítica eventos (Fase 2–3) |
| **Riesgos** | Celda muy pequeña → no mostrar |
| **Criterio de cierre** | Benchmark visible en ≥3 categorías con datos |

---

## Fase 9 — Asistente de Crecimiento

| | |
|---|---|
| **Objetivo** | Feed inteligente basado en reglas |
| **Beneficio empresa** | Asesor diario; retención |
| **Entregables** | `GrowthAssistantRuleEngine`; notificaciones; digest semanal |
| **Dependencias** | Fases 4–5, 8 opcional |
| **Riesgos** | Fatiga notificaciones |
| **Criterio de cierre** | DAU empresa +20% vs solo dashboard |

---

## Fase 10 — IA avanzada

| | |
|---|---|
| **Objetivo** | IA generativa donde aporta (Premium) |
| **Beneficio empresa** | Eficiencia escala |
| **Entregables** | Sugerencia respuestas; campañas sugeridas; predicción demanda |
| **Dependencias** | Fases 1–9; volumen datos |
| **Riesgos** | Coste, alucinaciones, compliance |
| **Criterio de cierre** | Feature Premium con adopción ≥30% suscriptores Premium |

---

### Recomendación operativa

**Detener nuevas funcionalidades de UI** hasta completar **Fase 1 + diseño de `BUSINESS_EVENTS_ARCHITECTURE.md`**. Esa capa evita rehacer Dashboard, Health Score y Asistente cuando Trivai escale.

---

# Respuestas a criterios de éxito

| Pregunta | Respuesta |
|----------|-----------|
| **¿Qué tiene hoy Trivai Business?** | Flujo claim→plan, UX empresa separada, gating, edición básica — pero datos de negocio y métricas largely mock/local. |
| **¿Qué falta para venderlo?** | Persistencia + Events + Dashboard ROI real — **antes** que pagos. |
| **¿Imprescindible para lanzamiento?** | Fases 1–4 (datos, eventos, dashboard, health score mínimo). |
| **¿Qué puede esperar?** | Benchmark, asistente completo, IA, promos contextuales avanzadas. |
| **¿Diferencia vs Google/TripAdvisor?** | Loop de crecimiento medible + asistente; no otro listado. |
| **¿Escalar internacional?** | Sí — Events agregados + self-serve; Google por país; pagos localizados en Fase 7. |
| **¿Plan próximos meses?** | 10 fases; pagos en Fase 7; diseñar Events **ahora**. |

---

*Documento vivo v2.0. Actualizar al cierre de cada fase. Próximo artefacto: `BUSINESS_EVENTS_ARCHITECTURE.md`.*
