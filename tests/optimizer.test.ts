import { describe, it, expect } from 'vitest';
import { PromptOptimizer } from '../src/optimizer';
import { PromptValidator } from '../src/validator';

describe('PromptOptimizer', () => {
  let optimizer: PromptOptimizer;
  let validator: PromptValidator;

  beforeEach(() => {
    optimizer = new PromptOptimizer();
    validator = new PromptValidator();
  });

  describe('Optimization generation', () => {
    it('should generate optimizations for vague prompts', () => {
      const vaguePrompt = 'Write good code';
      const metrics = validator.validate(vaguePrompt).metrics;
      const optimizations = optimizer.generateOptimizations(vaguePrompt, metrics);
      
      expect(optimizations.length).toBeGreaterThan(0);
      expect(optimizations.some(opt => opt.type === 'clarity')).toBe(true);
    });

    it('should generate optimizations for unstructured prompts', () => {
      const unstructuredPrompt = 'I need a website for my store it should have products and shopping cart and user login';
      const metrics = validator.validate(unstructuredPrompt).metrics;
      const optimizations = optimizer.generateOptimizations(unstructuredPrompt, metrics);
      
      expect(optimizations.length).toBeGreaterThan(0);
      expect(optimizations.some(opt => opt.type === 'structure')).toBe(true);
    });

    it('should generate optimizations for generic prompts', () => {
      const genericPrompt = 'Create something';
      const metrics = validator.validate(genericPrompt).metrics;
      const optimizations = optimizer.generateOptimizations(genericPrompt, metrics);
      
      expect(optimizations.length).toBeGreaterThan(0);
      expect(optimizations.some(opt => opt.type === 'specificity')).toBe(true);
    });

    it('should detect missing format specification', () => {
      const promptWithoutFormat = 'Write a function to calculate fibonacci numbers';
      const metrics = validator.validate(promptWithoutFormat).metrics;
      const optimizations = optimizer.generateOptimizations(promptWithoutFormat, metrics);
      
      expect(optimizations.some(opt => opt.type === 'format')).toBe(true);
    });
  });

  describe('Optimization application', () => {
    it('should apply single optimization', () => {
      const original = 'Write good code';
      const optimization = {
        type: 'clarity' as const,
        priority: 'high' as const,
        description: 'Replace ambiguous terms',
        suggestion: 'Replace "good" with specific criteria',
        before: original,
        after: 'Write efficient code with proper error handling'
      };
      
      const optimized = optimizer.applyOptimization(original, optimization);
      expect(optimized).toBe('Write efficient code with proper error handling');
    });

    it('should apply multiple optimizations', () => {
      const original = 'Write good code';
      const optimizations = [
        {
          type: 'clarity' as const,
          priority: 'high' as const,
          description: 'Replace ambiguous terms',
          suggestion: 'Replace "good" with specific criteria',
          before: original,
          after: 'Write efficient code'
        },
        {
          type: 'format' as const,
          priority: 'medium' as const,
          description: 'Specify output format',
          suggestion: 'Add output format',
          before: 'Write efficient code',
          after: 'Write efficient code in JSON format'
        }
      ];
      
      const optimized = optimizer.applyMultipleOptimizations(original, optimizations);
      expect(optimized).toBe('Write efficient code in JSON format');
    });

    it('should skip optimizations that don\'t match', () => {
      const original = 'Write good code';
      const optimization = {
        type: 'structure' as const,
        priority: 'high' as const,
        description: 'Add structure',
        suggestion: 'Add structure',
        before: 'Different prompt',
        after: 'Structured prompt'
      };
      
      const optimized = optimizer.applyOptimization(original, optimization);
      expect(optimized).toBe(original); // Should remain unchanged
    });
  });

  describe('Optimization priority', () => {
    it('should prioritize high-priority optimizations', () => {
      const prompt = 'Write good code without any specific requirements or format';
      const metrics = validator.validate(prompt).metrics;
      const optimizations = optimizer.generateOptimizations(prompt, metrics);
      
      // Should have high priority optimizations first
      const highPriorityCount = optimizations.filter(opt => opt.priority === 'high').length;
      expect(highPriorityCount).toBeGreaterThan(0);
      
      // Check that the first optimization is high priority
      expect(optimizations[0].priority).toBe('high');
    });
  });

  describe('Optimization suggestions', () => {
    it('should generate structure optimization for long prompts without breaks', () => {
      const longPrompt = 'Write a function that calculates fibonacci numbers using an iterative approach. The function should take an integer n as input and return an array of the first n fibonacci numbers. It should handle edge cases like n = 0 and n = 1 properly. The implementation should be efficient with O(n) time complexity and O(n) space complexity. Please include proper error handling and type annotations.';
      const metrics = validator.validate(longPrompt).metrics;
      const optimizations = optimizer.generateOptimizations(longPrompt, metrics);
      
      expect(optimizations.some(opt => opt.type === 'structure')).toBe(true);
    });

    it('should generate clarity optimization for prompts with ambiguous terms', () => {
      const ambiguousPrompt = 'Write a good function that does something nice';
      const metrics = validator.validate(ambiguousPrompt).metrics;
      const optimizations = optimizer.generateOptimizations(ambiguousPrompt, metrics);
      
      expect(optimizations.some(opt => opt.type === 'clarity')).toBe(true);
    });

    it('should generate specificity optimization for generic prompts', () => {
      const genericPrompt = 'Create something';
      const metrics = validator.validate(genericPrompt).metrics;
      const optimizations = optimizer.generateOptimizations(genericPrompt, metrics);
      
      expect(optimizations.some(opt => opt.type === 'specificity')).toBe(true);
    });
  });

  describe('Format detection', () => {
    it('should detect when format is specified', () => {
      const formattedPrompt = 'Write a function in JSON format';
      expect(optimizer.hasFormatSpecified(formattedPrompt)).toBe(true);
    });

    it('should detect when format is not specified', () => {
      const unformattedPrompt = 'Write a function';
      expect(optimizer.hasFormatSpecified(unformattedPrompt)).toBe(false);
    });

    it('should detect various format keywords', () => {
      const formats = [
        'in json format',
        'as yaml',
        'markdown table',
        'code format',
        'list format',
        'paragraph format'
      ];
      
      formats.forEach(format => {
        expect(optimizer.hasFormatSpecified(format)).toBe(true);
      });
    });
  });
});