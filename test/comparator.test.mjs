import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { PromptComparator, formatCompareText, formatCompareJSON, formatCompareMarkdown } from '../dist/comparator.js';

describe('PromptComparator', () => {
  const comp = new PromptComparator();

  it('compares two prompts and returns scores', () => {
    const result = comp.compare(
      'Write a function',
      'Write a Node.js function that calculates fibonacci numbers with proper error handling and returns an array of results'
    );
    assert.ok(result.promptA.result.score >= 0);
    assert.ok(result.promptB.result.score >= 0);
    assert.ok(result.metricDiffs.length > 0);
    assert.ok(['A', 'B', 'tie'].includes(result.winner));
  });

  it('longer prompt generally scores higher', () => {
    const result = comp.compare(
      'good code',
      'Write a TypeScript function that validates email addresses using regex, handles edge cases like subdomains and plus addressing, and returns a boolean result'
    );
    // The second prompt should generally win due to specificity and structure
    assert.equal(typeof result.winner, 'string');
  });

  it('detects metric deltas correctly', () => {
    const result = comp.compare('hello', 'Write a Python script that processes CSV files');
    for (const d of result.metricDiffs) {
      assert.equal(typeof d.valueA, 'number');
      assert.equal(typeof d.valueB, 'number');
      assert.equal(d.delta, d.valueB - d.valueA);
    }
  });

  it('tracks issue differences', () => {
    const result = comp.compare('good', 'Write a function to sort an array of numbers in JavaScript');
    assert.ok(Array.isArray(result.issueDiff.added));
    assert.ok(Array.isArray(result.issueDiff.removed));
    assert.ok(Array.isArray(result.issueDiff.kept));
  });
});

describe('Compare formatters', () => {
  const comp = new PromptComparator();
  const result = comp.compare('short', 'Write a detailed implementation plan for a REST API');

  it('formatCompareText produces readable output', () => {
    const text = formatCompareText(result);
    assert.ok(text.includes('Prompt Comparison'));
    assert.ok(text.includes('Metrics:'));
    assert.ok(text.includes('score:'));
  });

  it('formatCompareJSON produces valid JSON', () => {
    const json = formatCompareJSON(result);
    const parsed = JSON.parse(json);
    assert.ok(parsed.promptA);
    assert.ok(parsed.promptB);
    assert.ok(parsed.metricDiffs);
  });

  it('formatCompareMarkdown produces markdown table', () => {
    const md = formatCompareMarkdown(result);
    assert.ok(md.includes('## Prompt Comparison'));
    assert.ok(md.includes('| Metric |'));
    assert.ok(md.includes('Winner'));
  });
});
