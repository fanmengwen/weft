import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js';
import { findStarterTemplate, STARTER_TEMPLATES } from '../lib/starterTemplates.js';
import { getAllIcons, getIconProviders, getIconsByProvider } from '../lib/iconCatalog.js';

const DSL_CHEATSHEET = `# Weft DSL Cheatsheet

flow: <Title>            # required header
direction: TB | LR       # default TB

# Nodes (declare before edges)
[start] s1
[end]   e1
[process]      step1: Friendly Label { color: "blue" }
[decision]     branch: Approved?     { color: "amber" }
[system]       api:    Internal API
[architecture] db:     Postgres     { archProvider: "aws", archResourceType: "databases-rds" }
[note]         n:      Latency 200ms

# Edges
s1 -> step1                 # default
step1 ==> api               # primary path
api  --> db                 # secondary
api  ..|error| n            # async / dotted
branch ->|Yes| step1
branch ->|No|  e1

# Architecture icons
# Use the [architecture] node type with archProvider + archResourceType attributes
# to render a real provider icon (AWS, Azure, GCP, CNCF, or developer brand logos).
# Always call the find_icon tool to discover the correct slug; do not guess.
# Providers: aws, azure, gcp, cncf, developer
# Catalog resource: weft://icons (full) or weft://icons/{provider} (per pack)
`;

export function registerResources(server: McpServer): void {
  // Static cheatsheet — agents read it once to learn DSL surface.
  server.registerResource(
    'dsl-cheatsheet',
    'weft://docs/dsl-cheatsheet',
    {
      title: 'Weft DSL Cheatsheet',
      description: 'Quick reference for Weft DSL node types, attributes, and edge styles.',
      mimeType: 'text/markdown',
    },
    async (uri) => ({
      contents: [
        {
          uri: uri.href,
          mimeType: 'text/markdown',
          text: DSL_CHEATSHEET,
        },
      ],
    })
  );

  // Templates exposed both as a catalog and via per-name URI template.
  server.registerResource(
    'templates-catalog',
    'weft://templates',
    {
      title: 'Starter template catalog',
      description: 'JSON list of all available starter templates (name, title, category, summary).',
      mimeType: 'application/json',
    },
    async (uri) => ({
      contents: [
        {
          uri: uri.href,
          mimeType: 'application/json',
          text: JSON.stringify(
            STARTER_TEMPLATES.map(({ name, title, category, summary }) => ({
              name,
              title,
              category,
              summary,
            })),
            null,
            2
          ),
        },
      ],
    })
  );

  // Full icon catalog — agents can read it once and remember slugs, or prefer the
  // find_icon tool for targeted queries.
  server.registerResource(
    'icons-catalog',
    'weft://icons',
    {
      title: 'Provider icon catalog',
      description:
        'Full JSON list of every provider icon available for [architecture] nodes ' +
        '(AWS, Azure, GCP, CNCF, developer brand logos). Each entry has provider, slug, label, category.',
      mimeType: 'application/json',
    },
    async (uri) => ({
      contents: [
        {
          uri: uri.href,
          mimeType: 'application/json',
          text: JSON.stringify(await getAllIcons(), null, 2),
        },
      ],
    })
  );

  server.registerResource(
    'icons-by-provider',
    new ResourceTemplate('weft://icons/{provider}', {
      list: async () => {
        const providers = await getIconProviders();
        return {
          resources: providers.map((provider) => ({
            uri: `weft://icons/${provider}`,
            name: `icons-${provider}`,
            title: `${provider} icons`,
            description: `Icon catalog for the ${provider} provider pack.`,
            mimeType: 'application/json',
          })),
        };
      },
      complete: {
        provider: async (value) => {
          const providers = await getIconProviders();
          return providers.filter((p) => p.startsWith(value.toLowerCase()));
        },
      },
    }),
    {
      title: 'Provider icon catalog (per pack)',
      description: 'JSON list of icons within a single provider pack.',
      mimeType: 'application/json',
    },
    async (uri, variables) => {
      const provider = String(variables.provider ?? '').toLowerCase();
      const icons = await getIconsByProvider(provider);
      return {
        contents: [
          {
            uri: uri.href,
            mimeType: 'application/json',
            text: JSON.stringify(icons, null, 2),
          },
        ],
      };
    }
  );

  server.registerResource(
    'template',
    new ResourceTemplate('weft://templates/{name}', {
      list: async () => ({
        resources: STARTER_TEMPLATES.map((template) => ({
          uri: `weft://templates/${template.name}`,
          name: template.name,
          title: template.title,
          description: template.summary,
          mimeType: 'text/plain',
        })),
      }),
      complete: {
        name: async (value) =>
          STARTER_TEMPLATES.filter((template) =>
            template.name.toLowerCase().startsWith(value.toLowerCase())
          ).map((template) => template.name),
      },
    }),
    {
      title: 'Starter template DSL',
      description: 'Returns the Weft DSL body of the named starter template.',
      mimeType: 'text/plain',
    },
    async (uri, variables) => {
      const name = String(variables.name ?? '');
      const template = findStarterTemplate(name);
      if (!template) {
        throw new Error(`Unknown template "${name}".`);
      }
      return {
        contents: [
          {
            uri: uri.href,
            mimeType: 'text/plain',
            text: template.dsl,
          },
        ],
      };
    }
  );
}
