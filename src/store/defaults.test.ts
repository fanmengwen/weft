import { describe, expect, it } from 'vitest';
import { buildDefaultAISettings, resolveDefaultAIProvider } from './defaults';

describe('resolveDefaultAIProvider', () => {
  it('returns the provider when it is a known AI provider', () => {
    expect(resolveDefaultAIProvider('custom')).toBe('custom');
    expect(resolveDefaultAIProvider('claude')).toBe('claude');
    expect(resolveDefaultAIProvider('gemini')).toBe('gemini');
  });

  it('falls back to gemini for unset values', () => {
    expect(resolveDefaultAIProvider(undefined)).toBe('gemini');
    expect(resolveDefaultAIProvider('')).toBe('gemini');
  });

  it('falls back to gemini for unknown or non-string values', () => {
    expect(resolveDefaultAIProvider('not-a-provider')).toBe('gemini');
    expect(resolveDefaultAIProvider(123)).toBe('gemini');
    expect(resolveDefaultAIProvider(null)).toBe('gemini');
  });
});

describe('buildDefaultAISettings', () => {
  it('defaults to gemini with no custom fields when env is empty', () => {
    const settings = buildDefaultAISettings({});
    expect(settings.provider).toBe('gemini');
    expect(settings.customBaseUrl).toBeUndefined();
    expect(settings.model).toBeUndefined();
    expect(settings.apiKey).toBeUndefined();
  });

  it('hydrates the custom OpenAI-compatible endpoint from VITE_CUSTOM_AI_*', () => {
    const settings = buildDefaultAISettings({
      VITE_DEFAULT_AI_PROVIDER: 'custom',
      VITE_CUSTOM_AI_BASE_URL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
      VITE_CUSTOM_AI_MODEL: 'qwen-plus',
      VITE_CUSTOM_AI_API_KEY: 'sk-test',
    });
    expect(settings.provider).toBe('custom');
    expect(settings.customBaseUrl).toBe('https://dashscope.aliyuncs.com/compatible-mode/v1');
    expect(settings.model).toBe('qwen-plus');
    expect(settings.apiKey).toBe('sk-test');
  });

  it('only hydrates custom fields for the custom provider', () => {
    const settings = buildDefaultAISettings({
      VITE_DEFAULT_AI_PROVIDER: 'gemini',
      VITE_CUSTOM_AI_BASE_URL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
      VITE_CUSTOM_AI_MODEL: 'qwen-plus',
    });
    expect(settings.provider).toBe('gemini');
    expect(settings.customBaseUrl).toBeUndefined();
    expect(settings.model).toBeUndefined();
  });

  it('leaves custom fields undefined when their env vars are absent', () => {
    const settings = buildDefaultAISettings({ VITE_DEFAULT_AI_PROVIDER: 'custom' });
    expect(settings.provider).toBe('custom');
    expect(settings.customBaseUrl).toBeUndefined();
    expect(settings.model).toBeUndefined();
  });
});