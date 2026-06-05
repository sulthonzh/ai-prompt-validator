import { describe, it, expect } from 'vitest';
import { PromptValidator } from '../src/validator';
import { PromptRule } from '../src/types';

describe('PromptValidator', () => {
  let validator: PromptValidator;

  beforeEach(() => {
    validator = new PromptValidator();
  });

  describe('Basic validation', () => {
    it('should reject empty prompts', () => {
      const result = validator.validate('');
      expect(result.isValid).toBe(false);
      expect(result.score).toBeLessThan(100);
      expect(result.issues).toHaveLength(1);
      expect(result.issues[0].rule).toBe('empty-prompt');
    });

    it('should accept non-empty prompts', () => {
      const result = validator.validate('Write a function to calculate fibonacci numbers');
      expect(result.isValid).toBe(true);
      expect(result.issues.filter(issue => issue.severity === 'error')).toHaveLength(0);
    });

    it('should warn about very short prompts', () => {
      const result = validator.validate('Hi');
      expect(result.issues.some(issue => issue.rule === 'too-short')).toBe(true);
    });

    it('should warn about very long prompts', () => {
      const longPrompt = 'x'.repeat(2500);
      const result = validator.validate(longPrompt);
      expect(result.issues.some(issue => issue.rule === 'too-long')).toBe(true);
    });
  });

  describe('Context validation', () => {
    it('should detect prompts without context', () => {
      const result = validator.validate('Write a function');
      expect(result.issues.some(issue => issue.rule === 'missing-context')).toBe(true);
    });

    it('should accept prompts with context', () => {
      const result = validator.validate('Given a list of numbers, write a function to calculate the sum');
      expect(result.issues.some(issue => issue.rule === 'missing-context')).toBe(false);
    });
  });

  describe('Instruction validation', () => {
    it('should detect prompts without clear instructions', () => {
      const result = validator.validate('This is about programming');
      expect(result.issues.some(issue => issue.rule === 'missing-instruction')).toBe(true);
    });

    it('should accept prompts with clear instructions', () => {
      const result = validator.validate('Write a function to sort an array');
      expect(result.issues.some(issue => issue.rule === 'missing-instruction')).toBe(false);
    });
  });

  describe('Format validation', () => {
    it('should detect prompts without format specification', () => {
      const result = validator.validate('Write a function');
      expect(result.issues.some(issue => issue.rule === 'missing-format')).toBe(true);
    });

    it('should accept prompts with format specification', () => {
      const result = validator.validate('Write a function in JSON format');
      expect(result.issues.some(issue => issue.rule === 'missing-format')).toBe(false);
    });
  });

  describe('Ambiguous terms validation', () => {
    it('should detect ambiguous terms', () => {
      const result = validator.validate('Write good code');
      expect(result.issues.some(issue => issue.rule === 'ambiguous-terms')).toBe(true);
    });

    it('should accept prompts without ambiguous terms', () => {
      const result = validator.validate('Write efficient code with proper error handling');
      expect(result.issues.some(issue => issue.rule === 'ambiguous-terms')).toBe(false);
    });
  });

  describe('Metrics calculation', () => {
    it('should calculate correct length', () => {
      const prompt = 'Write a function to calculate fibonacci numbers';
      const result = validator.validate(prompt);
      expect(result.metrics.length).toBe(prompt.length);
      expect(result.metrics.wordCount).toBe(7);
    });

    it('should calculate clarity score', () => {
      const clearPrompt = 'Write a function to calculate fibonacci numbers using iteration';
      const vaguePrompt = 'Write something good about programming';
      
      const clearResult = validator.validate(clearPrompt);
      const vagueResult = validator.validate(vaguePrompt);
      
      expect(clearResult.metrics.clarityScore).toBeGreaterThan(vagueResult.metrics.clarityScore);
    });

    it('should calculate specificity score', () => {
      const specificPrompt = 'Implement a quicksort algorithm in Python with comments';
      const genericPrompt = 'Write some code about sorting';
      
      const specificResult = validator.validate(specificPrompt);
      const genericResult = validator.validate(genericPrompt);
      
      expect(specificResult.metrics.specificityScore).toBeGreaterThan(genericResult.metrics.specificityScore);
    });
  });

  describe('Rule management', () => {
    it('should get all rules', () => {
      const rules = validator.getRules();
      expect(rules.length).toBeGreaterThan(0);
      expect(rules.every(rule => rule.id && rule.name && rule.description)).toBe(true);
    });

    it('should get specific rule', () => {
      const rule = validator.getRule('empty-prompt');
      expect(rule).toBeDefined();
      expect(rule?.id).toBe('empty-prompt');
    });

    it('should add custom rule', () => {
      const customRule: PromptRule = {
        id: 'test-rule',
        name: 'Test Rule',
        description: 'A test rule',
        severity: 'error',
        validate: (prompt) => prompt.includes('test'),
        message: 'Prompt must contain test',
        suggestion: 'Add test to your prompt'
      };
      
      validator.addCustomRule(customRule);
      expect(validator.getRule('test-rule')).toBeDefined();
    });

    it('should remove rule', () => {
      validator.removeRule('empty-prompt');
      expect(validator.getRule('empty-prompt')).toBeUndefined();
    });
  });

  describe('Enabled rules filtering', () => {
    it('should validate with specific rules enabled', () => {
      const result = validator.validate('short', ['empty-prompt']);
      expect(result.issues.some(issue => issue.rule === 'empty-prompt')).toBe(false);
      expect(result.issues.some(issue => issue.rule === 'too-short')).toBe(true);
    });

    it('should validate with custom rule set', () => {
      const result = validator.validate('Hello world', ['too-short']);
      expect(result.issues.some(issue => issue.rule === 'empty-prompt')).toBe(false);
    });
  });
});