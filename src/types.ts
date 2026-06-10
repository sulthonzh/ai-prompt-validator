export interface PromptRule {
  id: string;
  name: string;
  description: string;
  severity: 'error' | 'warning' | 'info';
  validate: (prompt: string) => boolean;
  message: string;
  suggestion?: string;
}

export interface ValidationResult {
  isValid: boolean;
  score: number;
  issues: PromptIssue[];
  suggestions: string[];
  metrics: PromptMetrics;
}

export interface PromptIssue {
  rule: string;
  severity: 'error' | 'warning' | 'info';
  message: string;
  suggestion?: string;
  location?: {
    start: number;
    end: number;
  };
}

export interface PromptMetrics {
  length: number;
  wordCount: number;
  clarityScore: number;
  specificityScore: number;
  structureScore: number;
  creativityScore: number;
  totalScore: number;
}

export interface OptimizationSuggestion {
  type: 'structure' | 'clarity' | 'specificity' | 'length' | 'format';
  priority: 'high' | 'medium' | 'low';
  description: string;
  suggestion: string;
  before: string;
  after: string;
}

export interface TestSuite {
  id: string;
  name: string;
  description: string;
  prompts: TestPrompt[];
  expectedOutputs?: ExpectedOutput[];
}

export interface TestPrompt {
  prompt: string;
  expectedAnswer?: string;
  expectedFormat?: string;
  constraints?: {
    maxLength?: number;
    minLength?: number;
    requiredWords?: string[];
    bannedWords?: string[];
  };
}

export interface ExpectedOutput {
  id: string;
  promptId: string;
  expected: string | RegExp;
  description: string;
  tolerance?: number;
}

export interface Config {
  rules: string[];
  excludedRules?: string[];
  model?: string;
  apiKey?: string;
  outputFormat?: 'json' | 'yaml' | 'table';
  strictMode?: boolean;
  customRules?: CustomRule[];
}

export interface CustomRule {
  id: string;
  name: string;
  description: string;
  pattern: string;
  severity: 'error' | 'warning' | 'info';
  message: string;
  suggestion?: string;
}

export interface BenchmarkResult {
  prompt: string;
  model: string;
  responseTime: number;
  score: number;
  tokenCount: number;
  quality: 'excellent' | 'good' | 'fair' | 'poor';
}
export interface MetricDiff {
  metric: string;
  valueA: number;
  valueB: number;
  delta: number;
}

export interface CompareResult {
  promptA: { text: string; result: ValidationResult };
  promptB: { text: string; result: ValidationResult };
  metricDiffs: MetricDiff[];
  issueDiff: { added: string[]; removed: string[]; kept: string[] };
  winner: 'A' | 'B' | 'tie';
}
