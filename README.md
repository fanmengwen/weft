<div align="center">

# Weft

### AI diagramming canvas — and a runnable AI-workflow builder, on one surface.

Turn natural language into editable diagrams, then drag-build and run AI agent pipelines on the same canvas. Local-first, no signup.

<sub></sub>

</div>

---

## Status

Weft is under active, phased development — details coming soon.

| Capability | State |
| --- | --- |
| AI diagram generation (NL → streamed, editable diagrams) | ✅ works (inherited, being extended) |
| Incremental edit + one-step undo, 10-provider BYOK | ✅ works |
| Export (PNG / SVG / PDF / Mermaid / PlantUML / JSON / MP4) | ✅ works |
| Mode shell (Chart \| Workflow) | 🚧 building |
| Node backend (LLM proxy / SSE) | 🚧 building |
| Document RAG (doc → grounded diagram) | 🚧 building |
| Workflow mode (build + run AI agent pipelines, event-driven engine) | 🚧 building |

## What it does today

- **Generate diagrams from natural language** — describe a system, get an editable diagram (flowchart, architecture, mind map, and more) streamed onto the canvas, then auto-laid-out.
- **Edit visually** — drag, connect, restyle; every AI change is a single undo.
- **Bring your own key** — 10 providers incl. Anthropic Claude, OpenAI, Gemini, and local Ollama.
- **Export anywhere** — PNG, SVG, PDF, Mermaid, PlantUML, JSON, MP4.

## Quick start

```bash
npm install
npm run dev      # http://localhost:3000
```

> AI provider keys are entered in the in-app settings (BYOK) — nothing in `.env`. A backend (for RAG + workflow execution) lands in a later phase.

## Tech stack

| Layer | Tech |
| --- | --- |
| Frontend | React 19 · TypeScript · Vite 6 |
| Canvas | React Flow (XYFlow) · ELK auto-layout |
| State / styling | Zustand · Tailwind CSS |
| Backend (planned) | Node · Fastify · Vercel AI SDK |
| Vector store (planned) | ChromaDB |
| Testing | Vitest · Playwright |

## Development

```bash
npm run lint     # ESLint (--max-warnings 0)
npm run test     # Vitest
npm run e2e      # Playwright
npm run build    # tsc -b && vite build (includes typecheck)
```



***REMOVED***

***REMOVED***

MIT Licensed.
