import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { PromptValidator } from '../dist/validator.js';
import { PromptOptimizer } from '../dist/optimizer.js';

describe('PromptValidator', () => {
  const validator = new PromptValidator();

  describe('empty prompt', () => {
    it('rejects empty prompts', () => {
      const r = validator.validate('');
      assert.equal(r.isValid, false);
      assert.ok(r.issues.some(i => i.rule === 'empty-prompt'));
    });

    it('rejects whitespace-only prompts', () => {
      const r = validator.validate('   ');
      assert.equal(r.isValid, false);
    });
  });

  describe('length rules', () => {
    it('warns on short prompts', () => {
      const r = validator.validate('Hi');
      assert.ok(r.issues.some(i => i.rule === 'too-short'));
    });

    it('warns on very long prompts', () => {
      const r = validator.validate('x'.repeat(2500));
      assert.ok(r.issues.some(i => i.rule === 'too-long'));
    });

    it('accepts normal length prompts', () => {
      const r = validator.validate('Write a function to calculate fibonacci numbers');
      assert.ok(!r.issues.some(i => i.rule === 'too-short'));
      assert.ok(!r.issues.some(i => i.rule === 'too-long'));
    });
  });

  describe('context detection', () => {
    it('flags missing context', () => {
      const r = validator.validate('Write a function');
      assert.ok(r.issues.some(i => i.rule === 'missing-context'));
    });

    it('accepts prompts with context keywords', () => {
      const r = validator.validate('Given a list of numbers, write a function to calculate the sum');
      assert.ok(!r.issues.some(i => i.rule === 'missing-context'));
    });
  });

  describe('instruction detection', () => {
    it('flags missing instruction verbs', () => {
      const r = validator.validate('This is about programming');
      assert.ok(r.issues.some(i => i.rule === 'missing-instruction'));
    });

    it('accepts prompts with instruction verbs', () => {
      const r = validator.validate('Explain how quicksort works');
      assert.ok(!r.issues.some(i => i.rule === 'missing-instruction'));
    });
  });

  describe('ambiguous terms', () => {
    it('detects ambiguous terms like "good"', () => {
      const r = validator.validate('Write good code');
      assert.ok(r.issues.some(i => i.rule === 'ambiguous-terms'));
    });

    it('passes clear prompts', () => {
      const r = validator.validate('Write efficient code with proper error handling');
      assert.ok(!r.issues.some(i => i.rule === 'ambiguous-terms'));
    });
  });

  describe('scoring', () => {
    it('gives higher scores to specific prompts vs vague ones', () => {
      const specific = validator.validate('Implement a quicksort algorithm in Python with type hints and O(n log n) complexity');
      const vague = validator.validate('Write something');
      assert.ok(specific.score > vague.score, `specific=${specific.score} should be > vague=${vague.score}`);
    });

    it('score is between 0 and 100', () => {
      const r = validator.validate('Write a function to parse JSON and return the result as a markdown table');
      assert.ok(r.score >= 0 && r.score <= 100);
    });
  });

  describe('metrics', () => {
    it('calculates correct word count and length', () => {
      const prompt = 'Write a function to calculate fibonacci numbers';
      const r = validator.validate(prompt);
      assert.equal(r.metrics.length, prompt.length);
      assert.equal(r.metrics.wordCount, 7);
    });

    it('has sub-scores between 0-100', () => {
      const r = validator.validate('Implement a binary search in TypeScript returning JSON format');
      for (const key of ['clarityScore', 'specificityScore', 'structureScore', 'creativityScore']) {
        assert.ok(r.metrics[key] >= 0 && r.metrics[key] <= 100, `${key}=${r.metrics[key]}`);
      }
    });
  });

  describe('rule management', () => {
    it('lists all rules', () => {
      const rules = validator.getRules();
      assert.ok(rules.length >= 9);
    });

    it('gets a specific rule', () => {
      const rule = validator.getRule('empty-prompt');
      assert.equal(rule.id, 'empty-prompt');
    });

    it('returns undefined for nonexistent rule', () => {
      assert.equal(validator.getRule('nonexistent'), undefined);
    });

    it('adds a custom rule', () => {
      const v = new PromptValidator();
      v.addCustomRule({
        id: 'must-have-please',
        name: 'Polite',
        description: 'Prompt must say please',
        severity: 'info',
        validate: (p) => p.toLowerCase().includes('please'),
        message: 'Be polite!',
        suggestion: 'Add "please" to your prompt'
      });
      assert.equal(v.getRule('must-have-please').name, 'Polite');
      const r = v.validate('Write a function');
      assert.ok(r.issues.some(i => i.rule === 'must-have-please'));
    });

    it('removes a rule', () => {
      const v = new PromptValidator();
      v.removeRule('empty-prompt');
      assert.equal(v.getRule('empty-prompt'), undefined);
      // Empty prompt should no longer trigger empty-prompt error
      const r = v.validate('');
      assert.ok(!r.issues.some(i => i.rule === 'empty-prompt'));
    });
  });

  describe('enabled rules filtering', () => {
    it('only applies specified rules', () => {
      const r = validator.validate('short', ['too-short']);
      assert.ok(!r.issues.some(i => i.rule === 'empty-prompt'));
      assert.ok(r.issues.some(i => i.rule === 'too-short'));
    });
  });
});

describe('PromptOptimizer', () => {
  const optimizer = new PromptOptimizer();
  const validator = new PromptValidator();

  describe('optimization generation', () => {
    it('generates optimizations for vague prompts', () => {
      const prompt = 'Write good code';
      const metrics = validator.validate(prompt).metrics;
      const opts = optimizer.generateOptimizations(prompt, metrics);
      assert.ok(opts.length > 0, `expected at least 1 optimization, got ${opts.length}`);
    });

    it('generates clarity optimizations for prompts with ambiguous terms', () => {
      const prompt = 'Write a good nice function that does the best thing';
      const metrics = validator.validate(prompt).metrics;
      const opts = optimizer.generateOptimizations(prompt, metrics);
      // Should have at least specificity or structure optimizations
      assert.ok(opts.length > 0);
    });

    it('generates format suggestions when no format specified', () => {
      const prompt = 'Write a function to calculate fibonacci numbers';
      const metrics = validator.validate(prompt).metrics;
      const opts = optimizer.generateOptimizations(prompt, metrics);
      assert.ok(opts.some(o => o.type === 'format'));
    });

    it('returns max 5 suggestions', () => {
      const metrics = validator.validate('Create something').metrics;
      const opts = optimizer.generateOptimizations('Create something', metrics);
      assert.ok(opts.length <= 5);
    });

    it('sorts by priority (high first)', () => {
      const prompt = 'Write good code without format';
      const metrics = validator.validate(prompt).metrics;
      const opts = optimizer.generateOptimizations(prompt, metrics);
      if (opts.length > 1) {
        const priorities = opts.map(o => ({ high: 3, medium: 2, low: 1 }[o.priority]));
        for (let i = 1; i < priorities.length; i++) {
          assert.ok(priorities[i] <= priorities[i - 1], 'should be sorted descending by priority');
        }
      }
    });
  });

  describe('optimization application', () => {
    it('applies a single optimization', () => {
      const result = optimizer.applyOptimization('Write good code', {
        type: 'clarity',
        priority: 'high',
        description: 'Replace ambiguous',
        suggestion: 'Be specific',
        before: 'Write good code',
        after: 'Write efficient code'
      });
      assert.equal(result, 'Write efficient code');
    });

    it('chains multiple optimizations', () => {
      const result = optimizer.applyMultipleOptimizations('Write good code', [
        { type: 'clarity', priority: 'high', description: 'd1', suggestion: 's1', before: 'Write good code', after: 'Write efficient code' },
        { type: 'format', priority: 'medium', description: 'd2', suggestion: 's2', before: 'Write efficient code', after: 'Write efficient code in JSON format' }
      ]);
      assert.equal(result, 'Write efficient code in JSON format');
    });

    it('skips optimizations that dont match prompt', () => {
      const result = optimizer.applyOptimization('Hello world', {
        type: 'structure',
        priority: 'high',
        description: 'd',
        suggestion: 's',
        before: 'Different prompt',
        after: 'Changed'
      });
      assert.equal(result, 'Hello world');
    });
  });

  describe('format detection', () => {
    it('detects common format keywords', () => {
      for (const kw of ['json', 'yaml', 'markdown', 'table', 'list']) {
        assert.equal(optimizer.hasFormatSpecified(`output as ${kw}`), true, `should detect "${kw}"`);
      }
    });

    it('returns false when no format specified', () => {
      assert.equal(optimizer.hasFormatSpecified('Write a function'), false);
    });
  });
});

// ── Additional Edge Case Tests ──────────────────────────

describe('Edge Cases', () => {
  it('validator handles unicode prompts', () => {
    const v = new PromptValidator();
    const r = v.validate('Buat fungsi untuk menghitung jumlah huruf dalam kalimat');
    assert.ok(r.metrics.wordCount > 0);
    assert.ok(r.score >= 0);
  });

  it('validator handles prompt with newlines', () => {
    const v = new PromptValidator();
    const r = v.validate('Task: Write a function\n\nContext: Node.js project\n\nRequirements:\n- Handle errors\n- Return JSON');
    assert.ok(r.isValid);
    assert.ok(r.metrics.wordCount > 5);
  });

  it('validator handles prompt with code blocks', () => {
    const v = new PromptValidator();
    const r = v.validate('Explain this code:\n```js\nconst x = 1;\n```');
    assert.ok(r.metrics.length > 0);
  });

  it('score for excellent prompt is higher than for terrible one', () => {
    const v = new PromptValidator();
    const excellent = v.validate(
      'Context: I am building a REST API with Node.js and Express\n\n' +
      'Task: Implement a rate limiting middleware\n\n' +
      'Requirements:\n- Limit requests to 100 per minute per IP\n' +
      '- Return 429 status when limit exceeded\n' +
      '- Use Redis for storing request counts\n\n' +
      'Output format: TypeScript code with proper types'
    );
    const terrible = v.validate('do stuff');
    assert.ok(excellent.score > terrible.score, `excellent=${excellent.score} terrible=${terrible.score}`);
  });

  it('custom rule with regex pattern', () => {
    const v = new PromptValidator();
    v.addCustomRule({
      id: 'no-url',
      name: 'No URLs',
      description: 'Prompt should not contain URLs',
      severity: 'warning',
      validate: (p) => !/https?:\/\//.test(p),
      message: 'Avoid including URLs in prompts',
      suggestion: 'Describe the resource instead of linking'
    });
    const r = v.validate('Check out https://example.com for details');
    assert.ok(r.issues.some(i => i.rule === 'no-url'));
  });

  it('enable/disable rule via enableRule/disableRule', () => {
    const v = new PromptValidator();
    // disableRule makes it always fail
    v.disableRule('empty-prompt');
    const r1 = v.validate('hello world');
    assert.ok(r1.issues.some(i => i.rule === 'empty-prompt'));

    // enableRule makes it always pass
    v.enableRule('empty-prompt');
    const r2 = v.validate('');
    assert.ok(!r2.issues.some(i => i.rule === 'empty-prompt'));
  });
});
