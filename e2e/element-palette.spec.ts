import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.clear();
    localStorage.setItem('hasSeenWelcome_v1', 'true');
    // Pin the UI locale: the app now defaults to Chinese, but these specs assert
    // English text. Locale pinning keeps them deterministic against the source locale.
    localStorage.setItem('weftLang', 'en');
  });
});

async function createNewFlow(page: import('@playwright/test').Page) {
  await page.goto('/#/home');
  await expect(page.getByTestId('home-create-new-main')).toBeVisible({ timeout: 15000 });
  await page.getByTestId('home-create-new-main').click();
  await expect(page).toHaveURL(/#\/flow\/[^?]+(?:\?.*)?$/);
  await expect(page.getByTestId('flow-page-tab').first()).toBeVisible({ timeout: 15000 });
  await expect(page.getByTestId('topnav-menu-toggle')).toBeVisible({ timeout: 15000 });
}

const ELEMENT_IDS = ['start', 'end', 'process', 'decision', 'io', 'database', 'annotation'] as const;

for (const id of ELEMENT_IDS) {
  test(`adds ${id} node from palette`, async ({ page }) => {
    await createNewFlow(page);
    await expect(page.locator('.react-flow__node')).toHaveCount(0);
    await expect(page.getByTestId('toolbar-add')).toBeVisible({ timeout: 15000 });
    await page.getByTestId('toolbar-add').click();
    await page.getByTestId(`element-palette-item-${id}`).click();
    await expect(page.locator('.react-flow__node')).toHaveCount(1);
  });
}

test('adds process node via drag-drop from palette', async ({ page }) => {
  await createNewFlow(page);
  await expect(page.locator('.react-flow__node')).toHaveCount(0);

  await expect(page.getByTestId('toolbar-add')).toBeVisible({ timeout: 15000 });
  await page.getByTestId('toolbar-add').click();

  const dataTransfer = await page.evaluateHandle(() => new DataTransfer());
  const item = page.getByTestId('element-palette-item-process');
  const canvas = page.locator('.react-flow__pane');

  await item.dispatchEvent('dragstart', { dataTransfer });
  await canvas.dispatchEvent('dragover', { dataTransfer });
  await canvas.dispatchEvent('drop', { dataTransfer });

  await expect(page.locator('.react-flow__node')).toHaveCount(1);
});
