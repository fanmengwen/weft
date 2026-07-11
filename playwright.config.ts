import { defineConfig, devices } from '@playwright/test';
import { loadEnv } from 'vite';

// Derive the e2e port from the worktree dev port so parallel worktrees don't
// share 4173 (reuseExistingServer would otherwise silently cross-wire them).
const env = loadEnv('development', process.cwd(), 'WEFT_');
const e2ePort = env.WEFT_DEV_PORT ? Number(env.WEFT_DEV_PORT) + 1000 : 4173;
const e2eUrl = `http://127.0.0.1:${e2ePort}`;

export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : 2,
  reporter: 'html',
  use: {
    baseURL: e2eUrl,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: `npm run dev -- --host 127.0.0.1 --port ${e2ePort}`,
    url: e2eUrl,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
