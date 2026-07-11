import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { lintOpenFlowDsl } from '../lib/dslLinter.js';
import { buildViewerUrl } from '../lib/viewerUrl.js';

export function registerCreateViewerUrl(server: McpServer): void {
  server.registerTool(
    'create_viewer_url',
    {
      title: 'Create a Weft viewer URL',
      description:
        'Build a shareable Weft viewer URL for agent-authored Weft DSL. ' +
        'No AI provider, network call, account, or API key is required. Always validate ' +
        'the DSL first or inspect the returned lint report before showing the URL.',
      inputSchema: {
        dsl: z.string().min(3).describe('Weft DSL source to encode into a viewer URL.'),
      },
    },
    async (args) => {
      const lint = lintOpenFlowDsl(args.dsl);
      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify(
              {
                viewerUrl: buildViewerUrl(args.dsl),
                lint: {
                  ok: lint.ok,
                  declaredNodeIds: lint.declaredNodeIds,
                  edgeCount: lint.edgeCount,
                  diagnostics: lint.diagnostics,
                },
              },
              null,
              2
            ),
          },
        ],
      };
    }
  );
}
