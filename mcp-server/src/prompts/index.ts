import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

/**
 * Prompts are reusable templates that MCP clients can offer users as
 * starting points. They steer the model toward the right Weft tool
 * with the right arguments.
 */
export function registerPrompts(server: McpServer): void {
  server.registerPrompt(
    'flowchart_from_description',
    {
      title: 'Create a flowchart from a description',
      description:
        'Guides the assistant to write Weft DSL itself, validate it, and create a viewer URL.',
      argsSchema: {
        description: z
          .string()
          .describe('What the flowchart should represent (e.g. "checkout flow with promo code branch").'),
      },
    },
    ({ description }) => ({
      messages: [
        {
          role: 'user' as const,
          content: {
            type: 'text' as const,
            text:
              `Read \`weft://docs/dsl-cheatsheet\`, then write Weft DSL yourself for this flowchart.\n\n` +
              `Description:\n${description}\n\n` +
              `Call \`validate_openflow_dsl\` on your DSL. Fix any errors. Then call \`create_viewer_url\` and return the final DSL, lint status, and viewer URL.`,
          },
        },
      ],
    })
  );

  server.registerPrompt(
    'convert_mermaid_to_openflow',
    {
      title: 'Convert a Mermaid diagram to Weft DSL',
      description: 'Guides the assistant to convert Mermaid to Weft DSL itself and validate it.',
      argsSchema: {
        mermaidSource: z.string().describe('The Mermaid diagram to convert.'),
      },
    },
    ({ mermaidSource }) => ({
      messages: [
        {
          role: 'user' as const,
          content: {
            type: 'text' as const,
            text:
              `Read \`weft://docs/dsl-cheatsheet\`, then convert this Mermaid source into Weft DSL yourself.\n\n` +
              `Mermaid source:\n\`\`\`mermaid\n${mermaidSource}\n\`\`\`\n\n` +
              `Preserve direction, node labels, edge labels, and edge emphasis where possible. Call \`validate_openflow_dsl\`, fix any errors, then call \`create_viewer_url\`. Return the final DSL, lint status, and viewer URL.`,
          },
        },
      ],
    })
  );

  server.registerPrompt(
    'architecture_from_codebase',
    {
      title: 'Draft an architecture diagram from a local codebase',
      description: 'Guides the assistant to scan a local project, write Weft DSL itself, and validate it.',
      argsSchema: {
        rootPath: z.string().describe('Absolute path to the project root.'),
      },
    },
    ({ rootPath }) => ({
      messages: [
        {
          role: 'user' as const,
          content: {
            type: 'text' as const,
            text:
              `Call \`analyze_codebase\` on rootPath=\`${rootPath}\`, then read \`weft://docs/dsl-cheatsheet\`.\n\n` +
              `Write a Weft DSL architecture diagram yourself from the scan. Use \`find_icon\` before assigning architecture icon slugs. Call \`validate_openflow_dsl\`, fix any errors, then call \`create_viewer_url\`.\n\n` +
              `Return the final DSL, lint status, viewer URL, and a short architecture summary.`,
          },
        },
      ],
    })
  );
}
