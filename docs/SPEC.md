# AI Site Auditor — Spec v1

## Objetivo

Que cualquiera (con perfil técnico) entienda en minutos la salud de un sitio
web y sepa qué arreglar primero. El diferencial frente a correr Lighthouse a
mano no es medir más cosas, es traducir el resultado crudo en una
priorización clara + explicación del porqué importa.

## Audiencia v1

Desarrolladores. El reporte incluye snippets de código (actual vs.
sugerido), no solo lenguaje de impacto de negocio.

## Alcance del análisis

- Crawl del sitio: homepage + hasta 5 links internos (same-origin).
- Por qué el límite: Lighthouse tarda ~15-30s por página; sin tope, un
  crawl completo es impracticable en un audit on-demand.
- Categorías evaluadas: Performance (Core Web Vitals), Accesibilidad, SEO,
  Seguridad/Buenas prácticas.

## Estructura del reporte

1. Resumen general: score agregado por categoría + página más crítica.
2. Por categoría: issues con severidad, páginas afectadas, snippet actual
   vs. sugerido, explicación técnica.
3. Priorización global (IA): top 5-10 fixes de todo el sitio, ordenados por
   impacto/esfuerzo, separados en quick wins vs. estructurales.
4. Detalle por página (expandible).
5. Exportables: JSON crudo descargable + link compartible.

## Páginas que requieren login

No se manejan credenciales de terceros en la v1.

- El crawler detecta paredes de login (401/403, redirect a rutas tipo
  `/login`, o un `<input type="password">` en el HTML) — ver
  `server/src/audit/loginWall.js`.
- Esas páginas se excluyen del audit y se marcan en el reporte como
  "Requiere autenticación — fuera del alcance".
- v2 (futuro, si el producto necesita auditar paneles privados): el
  usuario se loguea en su propio navegador y exporta el estado de sesión
  (cookies/localStorage, al estilo `storageState` de Playwright). La app
  nunca ve ni guarda la contraseña real, solo un token de sesión temporal
  y descartable.

## Costo: IA local, no API paga

La priorización (sección 3 de arriba) corre contra un modelo open-source
servido localmente con [Ollama](https://ollama.com) (`qwen2.5:7b` por
defecto), no contra una API paga (Claude, OpenAI, etc.).

- Por qué: el proyecto tiene que poder correr y mostrarse sin ningún costo
  recurrente ni tarjeta de crédito de por medio.
- Cómo: `server/src/ai/prioritize.js` le pega a `http://localhost:11434`
  (la API HTTP de Ollama corriendo en la misma máquina), pidiendo salida
  restringida a un JSON schema. Configurable via `OLLAMA_BASE_URL` /
  `OLLAMA_MODEL` si se quiere correr en otra máquina o con otro modelo.
- Trade-off aceptado: en CPU (sin GPU dedicada) cada llamada tarda
  ~30-40s, bastante más lento que una API paga. Para un audit on-demand
  de portfolio esto es aceptable; si en algun momento se necesita
  velocidad, la opción es un modelo mas chico (ej. `llama3.2:3b`) o
  correr Ollama con GPU.
- Requisito para correr el proyecto: tener Ollama instalado y corriendo
  (`ollama serve`, o la app en background) con el modelo bajado
  (`ollama pull qwen2.5:7b`).

## No-goals de la v1

- No auto-corrige código.
- No es testing funcional (no reemplaza Cypress/Playwright).
- No monitorea en el tiempo (sin alertas ni historial).
- No compara contra competidores.

## Roadmap post-v1 (si se convierte en producto)

- Historial de scores por URL (requiere DB, ej. Postgres).
- Alertas cuando el score baja.
- Reportes de marca blanca para agencias.
- Soporte de sesión autenticada (ver sección de login arriba).
