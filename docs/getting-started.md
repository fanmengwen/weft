# Getting Started

Weft is a browser-based AI diagramming canvas. Open the app, add your API key, and start generating editable diagrams from natural language.

## Prerequisites

- Node.js 20+
- npm

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## AI provider keys (BYOK)

Weft does not host models. Keys are stored in your browser and sent directly to the provider you choose (OpenAI, Anthropic, Google, and others supported in Settings).

No `.env` file is required for local development.

## Verify the install

```bash
npm run lint
npm run build
npm run test -- --run
```

## Next steps

- [Architecture](./architecture.md) — how the app is structured
- [Deployment](./deployment.md) — static hosting on Cloudflare Pages or similar