# Weft core library

Framework-agnostic parsers, types, and brand utilities used by the Weft diagramming canvas.

## What's included

| Export | Description |
|--------|-------------|
| `parseMermaid(dsl)` | Parse Mermaid.js flowchart / state diagram DSL into React Flow–compatible `nodes` and `edges` |
| `parseOpenFlowDSL(dsl)` | Parse OpenFlow DSL V2 (type-safe, explicit IDs, groups, edge styling) |
| `generatePalette(primaryColor)` | Generate harmonious brand palettes from a single hex color |
| Type exports | `FlowNode`, `FlowEdge`, `NodeData`, `EdgeData`, `DesignSystem`, `NodeType`, and more |

## Usage

Built as part of the Weft monorepo root app. See `vite.lib.config.ts` for the library build entry.

```ts
import { parseOpenFlowDSL } from '@/lib';
```

## License

MIT
