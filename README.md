# AI Site Auditor

Audita un sitio web (performance, accesibilidad, SEO, seguridad) y usa IA
local (sin costo, sin API paga) para traducir el resultado crudo en un
reporte priorizado y explicado.

Ver [docs/SPEC.md](docs/SPEC.md) para el detalle de qué ofrece el reporte,
el alcance de la v1, cómo se manejan las páginas con login, y por qué la
IA corre local en vez de contra una API paga.

## Estructura

- `server/` — API en Node/Express. Endpoint `POST /audit` recibe una URL,
  crawlea el sitio (homepage + hasta 5 links internos), corre Lighthouse
  por página y prioriza los fixes con un modelo local via Ollama.
- `client/` — Frontend en React + Vite + TypeScript.

## Requisitos

- [Ollama](https://ollama.com) instalado y corriendo, con el modelo bajado:
  ```bash
  ollama pull qwen2.5:7b
  ```

## Desarrollo

```bash
# backend
cd server
npm run dev   # http://localhost:4000

# frontend
cd client
npm run dev   # http://localhost:5173
```

## Estado actual

Funcional de punta a punta: crawler con detección de login wall, audit
real con Lighthouse (scores + issues + snippet actual/sugerido), capa de
priorización con IA local (Ollama), y frontend que visualiza todo el
reporte. Pendiente: hosting público (si se decide publicarlo, con límite
de uso diario para no depender de recursos ilimitados de una sola
máquina).
