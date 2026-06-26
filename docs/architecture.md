# Architecture

Weft is a single-page React application: one shared canvas, two top-level modes (Chart and Workflow), and a local-first data model.

## High-level layout

```
src/
  components/       UI shell, flow canvas, panels, navigation
  services/         AI streaming, export, layout, diagram parsing
  store/            Zustand state (canvas, tabs, AI settings, history)
  diagram-types/    Pluggable diagram plugins (flowchart, architecture, …)
  workflow/         Workflow mode (nodes, engine, RAG) — in progress
```

## Chart mode

1. User prompt (optionally grounded by uploaded documents in a later RAG phase).
2. AI streams a diagram DSL; a parser turns tokens into nodes and edges incrementally.
3. ELK.js lays out the graph; React Flow renders and edits the result.
4. Each AI edit batch is one undo step.

## Workflow mode (roadmap)

Same canvas, different node types: text input, LLM call, web search, output. A client-side executor walks the graph in topological order, streams per-node logs, and highlights run state on the canvas.

## Key technical choices

| Area | Choice |
| --- | --- |
| UI | React 19, TypeScript, Vite |
| Canvas | @xyflow/react (React Flow 12) |
| Layout | ELK.js |
| State | Zustand |
| Styling | Tailwind CSS 4 |
| AI | Multi-provider BYOK via Vercel AI SDK patterns |
| Hosting | Static build (`dist/`), no server required |

## Design system

Global tokens live in `src/index.css` (`:root` CSS variables). The current theme uses light glassmorphism, blue accent, Hanken Grotesk, and large radii — change tokens once to cascade across the UI.

## Testing

- **Unit / integration:** Vitest
- **E2E:** Playwright (`npm run e2e`)