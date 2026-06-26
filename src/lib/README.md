# @vrun-design/openflowkit-core

Framework-agnostic parsers, types, and brand utilities used by Weft. Usable standalone in other React apps that need diagram DSL parsing.

## What's included

| Export | Description |
|--------|-------------|
| `parseMermaid(dsl)` | Parse Mermaid flowchart / state diagram DSL into React Flow–compatible nodes and edges |
| `parseOpenFlowDSL(dsl)` | Parse diagram DSL V2 (explicit IDs, groups, edge styling) |
| `generatePalette(primaryColor)` | Generate harmonious brand palettes from a single hex color |
| Type exports | `FlowNode`, `FlowEdge`, `NodeData`, `EdgeData`, `DesignSystem`, `NodeType`, and more |

## Install

```bash
npm install @vrun-design/openflowkit-core
```

> **Peer dependencies:** `react >=18`, `react-dom >=18`, `reactflow >=11`

## License

MIT