import { ValidationResult, PromptMetrics, CompareResult, MetricDiff } from './types';
import { PromptValidator } from './validator';

export class PromptComparator {
  private validator: PromptValidator;

  constructor(validator?: PromptValidator) {
    this.validator = validator || new PromptValidator();
  }

  compare(promptA: string, promptB: string): CompareResult {
    const resultA = this.validator.validate(promptA);
    const resultB = this.validator.validate(promptB);

    const metricDiffs = this.diffMetrics(resultA.metrics, resultB.metrics);
    const issueDiff = this.diffIssues(resultA, resultB);
    const winner = this.pickWinner(resultA, resultB);

    return {
      promptA: { text: promptA, result: resultA },
      promptB: { text: promptB, result: resultB },
      metricDiffs,
      issueDiff,
      winner,
    };
  }

  private diffMetrics(a: PromptMetrics, b: PromptMetrics): MetricDiff[] {
    const fields: (keyof PromptMetrics)[] = [
      'clarityScore', 'specificityScore', 'structureScore', 'creativityScore', 'totalScore',
    ];

    return fields.map(field => {
      const valA = a[field] as number;
      const valB = b[field] as number;
      return {
        metric: field,
        valueA: valA,
        valueB: valB,
        delta: valB - valA,
      };
    });
  }

  private diffIssues(a: ValidationResult, b: ValidationResult): { added: string[]; removed: string[]; kept: string[] } {
    const rulesA = new Set(a.issues.map(i => i.rule));
    const rulesB = new Set(b.issues.map(i => i.rule));

    const added = [...rulesB].filter(r => !rulesA.has(r));
    const removed = [...rulesA].filter(r => !rulesB.has(r));
    const kept = [...rulesA].filter(r => rulesB.has(r));

    return { added, removed, kept };
  }

  private pickWinner(a: ValidationResult, b: ValidationResult): 'A' | 'B' | 'tie' {
    if (a.score > b.score) return 'A';
    if (b.score > a.score) return 'B';
    return 'tie';
  }
}

export function formatCompareText(result: CompareResult): string {
  const lines: string[] = [];
  const { promptA, promptB, metricDiffs, issueDiff, winner } = result;

  lines.push('─── Prompt Comparison ───');
  lines.push('');
  lines.push(`A: "${promptA.text.slice(0, 60)}${promptA.text.length > 60 ? '…' : ''}" (score: ${promptA.result.score})`);
  lines.push(`B: "${promptB.text.slice(0, 60)}${promptB.text.length > 60 ? '…' : ''}" (score: ${promptB.result.score})`);
  lines.push('');

  lines.push('Metrics:');
  for (const d of metricDiffs) {
    const arrow = d.delta > 0 ? '↑' : d.delta < 0 ? '↓' : '→';
    lines.push(`  ${d.metric}: ${d.valueA} → ${d.valueB} (${arrow}${d.delta > 0 ? '+' : ''}${d.delta})`);
  }
  lines.push('');

  if (issueDiff.removed.length > 0) {
    lines.push(`Issues fixed: ${issueDiff.removed.join(', ')}`);
  }
  if (issueDiff.added.length > 0) {
    lines.push(`New issues: ${issueDiff.added.join(', ')}`);
  }

  lines.push('');
  if (winner === 'tie') {
    lines.push('Result: Both prompts score equally');
  } else {
    lines.push(`Result: Prompt ${winner} scores higher (${winner === 'A' ? promptA.result.score : promptB.result.score} vs ${winner === 'A' ? promptB.result.score : promptA.result.score})`);
  }

  return lines.join('\n');
}

export function formatCompareJSON(result: CompareResult): string {
  return JSON.stringify(result, null, 2);
}

export function formatCompareMarkdown(result: CompareResult): string {
  const { promptA, promptB, metricDiffs, issueDiff, winner } = result;
  const lines: string[] = [];

  lines.push('## Prompt Comparison');
  lines.push('');
  lines.push(`| | Prompt A | Prompt B |`);
  lines.push(`|---|---|---|`);
  lines.push(`| Score | ${promptA.result.score} | ${promptB.result.score} |`);
  lines.push(`| Text | ${promptA.text.slice(0, 50)}… | ${promptB.text.slice(0, 50)}… |`);
  lines.push('');

  lines.push('### Metric Deltas');
  lines.push('');
  lines.push('| Metric | A | B | Delta |');
  lines.push('|---|---|---|---|');
  for (const d of metricDiffs) {
    const sign = d.delta > 0 ? '+' : '';
    lines.push(`| ${d.metric} | ${d.valueA} | ${d.valueB} | ${sign}${d.delta} |`);
  }
  lines.push('');

  if (issueDiff.removed.length > 0) {
    lines.push(`**Fixed:** ${issueDiff.removed.join(', ')}`);
  }
  if (issueDiff.added.length > 0) {
    lines.push(`**New issues:** ${issueDiff.added.join(', ')}`);
  }

  lines.push('');
  lines.push(`**Winner:** Prompt ${winner === 'tie' ? 'Tie' : winner}`);

  return lines.join('\n');
}
