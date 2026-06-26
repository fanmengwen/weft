<div align="center">

# Weft

### AI diagramming canvas — and a runnable AI-workflow builder, on one surface.

Turn natural language into editable diagrams, then drag-build and run AI agent pipelines on the same canvas. Local-first, no signup.

</div>

---

## Features

| Capability | Status |
| --- | --- |
| AI diagram generation (natural language → streamed, editable diagrams) | Available |
| Incremental edit with one-step undo | Available |
| Multi-provider BYOK (OpenAI, Anthropic, Gemini, Ollama, …) | Available |
| Export PNG / SVG / PDF / Mermaid / PlantUML / JSON / MP4 | Available |
| Glassmorphism UI with cohesive design tokens | Available |
| Chart \| Workflow mode shell | In progress |
| Workflow execution on the canvas | In progress |
| Document RAG for grounded generation | In progress |

## Quick start

```bash
npm install
npm run dev      # http://localhost:3000
```

Add your model API key in **Settings** inside the app (BYOK).

## Tech stack

| Layer | Tech |
| --- | --- |
| Frontend | React 19 · TypeScript · Vite 6 |
| Canvas | React Flow (XYFlow) · ELK auto-layout |
| State / styling | Zustand · Tailwind CSS 4 |
| Testing | Vitest · Playwright |

## Development

```bash
npm run lint     # ESLint (--max-warnings 0)
npm run test     # Vitest
npm run e2e      # Playwright
npm run build    # tsc -b && vite build (typecheck + production bundle)
```

## License

MIT — see [LICENSE](LICENSE).