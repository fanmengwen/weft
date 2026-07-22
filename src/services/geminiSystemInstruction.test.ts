import { describe, expect, it } from 'vitest';
import i18n from '@/i18n/config';
import { getGeminiSystemInstruction, normalizePromptLanguage } from './geminiSystemInstruction';

describe('getGeminiSystemInstruction', () => {
  it('teaches the seven-type DSL vocabulary', () => {
    const instruction = getGeminiSystemInstruction('create', 'en');

    expect(instruction).toContain('[io]');
    expect(instruction).toContain('[database]');
    expect(instruction).not.toContain('[system]');
    expect(instruction).not.toContain('[architecture]');
    expect(instruction).not.toContain('[browser]');
    expect(instruction).not.toContain('[mobile]');
    expect(instruction).toContain('cyan');
  });

  it('localizes directive, examples and branch labels for chinese', () => {
    const instruction = getGeminiSystemInstruction('create', 'zh');

    expect(instruction).toContain('Chinese (Simplified)');
    expect(instruction).toContain('flow: 用户认证流程');
    expect(instruction).toContain('->|是|');
    expect(instruction).toContain('->|否|');
    expect(instruction).not.toContain('flow: User Authentication');
  });

  it('keeps ascii ids inside the chinese examples', () => {
    const instruction = getGeminiSystemInstruction('create', 'zh');

    expect(instruction).toContain('[process] login: 登录表单');
    expect(instruction).toContain('[start] start: 开始');
  });

  it('keeps english examples but directs output language for other locales', () => {
    const instruction = getGeminiSystemInstruction('create', 'ja');

    expect(instruction).toContain('in Japanese');
    expect(instruction).toContain('flow: User Authentication');
    expect(instruction).toContain('output text must still be in Japanese');
  });

  it('falls back to english for unknown locales', () => {
    const instruction = getGeminiSystemInstruction('create', 'xx-YY');

    expect(instruction).toContain('in English');
    expect(instruction).toContain('flow: User Authentication');
  });

  it('follows the current app language when no locale is passed', () => {
    expect(getGeminiSystemInstruction('create')).toBe(getGeminiSystemInstruction('create', i18n.language));
  });

  it('tells edit mode to match the existing diagram language', () => {
    const instruction = getGeminiSystemInstruction('edit', 'zh');

    expect(instruction).toContain('same language as the existing diagram');
  });
});

describe('normalizePromptLanguage', () => {
  it('maps region variants to their base language', () => {
    expect(normalizePromptLanguage('zh-CN')).toBe('zh');
    expect(normalizePromptLanguage('en-US')).toBe('en');
  });

  it('falls back to english for unsupported or missing locales', () => {
    expect(normalizePromptLanguage('ko')).toBe('en');
    expect(normalizePromptLanguage(undefined)).toBe('en');
  });
});
