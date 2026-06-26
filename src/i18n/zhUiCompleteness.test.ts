import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

type JsonMap = Record<string, unknown>;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const LOCALES_DIR = path.join(__dirname, 'locales');

/** UI namespaces that must differ from English in zh (excluding intentional English product names). */
const ZH_UI_KEY_PATHS = [
  'settingsModal.canvas.title',
  'settingsModal.canvas.showGrid',
  'settingsModal.canvas.showGridDesc',
  'settingsModal.ai.temperature.label',
  'settingsModal.ai.keyStorage.label',
  'settingsModal.ai.privacyTitle',
  'mcp.pageTitle',
  'mcp.visualCaption',
  'mcpSettings.toolGroups.author',
  'mcpSettings.toolGroups.validateDsl',
  'shareEmbed.title',
  'lintRules.title',
  'studioPlayback.title',
  'flowEditor.viewShortcuts',
  'common.clearSelection',
  'export.exportDiagram',
] as const;

function loadLocale(locale: 'en' | 'zh'): JsonMap {
  const localePath = path.join(LOCALES_DIR, locale, 'translation.json');
  return JSON.parse(fs.readFileSync(localePath, 'utf8')) as JsonMap;
}

function getByPath(obj: JsonMap, dotPath: string): unknown {
  return dotPath.split('.').reduce<unknown>((current, segment) => {
    if (!current || typeof current !== 'object') {
      return undefined;
    }
    return (current as JsonMap)[segment];
  }, obj);
}

describe('zh UI completeness', () => {
  it('has translated zh values for core UI key paths', () => {
    const enDict = loadLocale('en');
    const zhDict = loadLocale('zh');

    for (const keyPath of ZH_UI_KEY_PATHS) {
      const enValue = getByPath(enDict, keyPath);
      const zhValue = getByPath(zhDict, keyPath);
      expect(typeof zhValue, `zh.${keyPath} should exist`).toBe('string');
      expect(zhValue, `zh.${keyPath} should differ from English`).not.toBe(enValue);
      expect((zhValue as string).trim().length, `zh.${keyPath} should not be empty`).toBeGreaterThan(0);
    }
  });
});
