import { describe, expect, it } from 'vitest';
import { getGeminiSystemInstruction } from './geminiSystemInstruction';

describe('getGeminiSystemInstruction', () => {
  it('teaches the seven-type DSL vocabulary', () => {
    const instruction = getGeminiSystemInstruction('create');

    expect(instruction).toContain('[io]');
    expect(instruction).toContain('[database]');
    expect(instruction).not.toContain('[system]');
    expect(instruction).not.toContain('[architecture]');
    expect(instruction).not.toContain('[browser]');
    expect(instruction).not.toContain('[mobile]');
    expect(instruction).toContain('cyan');
  });
});
