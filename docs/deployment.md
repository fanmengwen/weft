# Deployment

Weft builds to a static site. No Node server is required in production.

## Build

```bash
npm install
npm run build
```

Output directory: `dist/`

## Cloudflare Pages (recommended)

| Setting | Value |
| --- | --- |
| Production branch | `main` |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Root directory | *(repo root)* |
| Node version | `20` |

No environment variables are required for a static deploy. Users configure AI keys inside the app.

## Other static hosts

Works on Vercel, Netlify, or any static file host:

1. Install command: `npm install`
2. Build command: `npm run build`
3. Publish directory: `dist`

## Optional: docs site

The monorepo includes a `docs-site/` workspace (Astro). Build with:

```bash
npm run build --workspace=docs-site
```

Publish `docs-site/dist` as a separate site if you maintain product documentation there.