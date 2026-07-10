import { PromptRule, ValidationResult, PromptIssue, PromptMetrics } from './types';

export class PromptValidator {
  private rules: PromptRule[] = [];

  constructor(customRules: PromptRule[] = []) {
    this.initializeDefaultRules();
    this.addCustomRules(customRules);
  }

  private initializeDefaultRules(): void {
    this.rules = [
      {
        id: 'empty-prompt',
        name: 'Empty Prompt',
        description: 'Prompt cannot be empty',
        severity: 'error',
        validate: (prompt) => prompt.trim().length > 0,
        message: 'Prompt is empty',
        suggestion: 'Add some content to your prompt'
      },
      {
        id: 'too-short',
        name: 'Prompt Length',
        description: 'Prompt should be at least 10 characters',
        severity: 'warning',
        validate: (prompt) => prompt.length >= 10,
        message: 'Prompt is too short (minimum 10 characters)',
        suggestion: 'Add more detail to your prompt'
      },
      {
        id: 'too-long',
        name: 'Prompt Length',
        description: 'Prompt should not exceed 2000 characters',
        severity: 'warning',
        validate: (prompt) => prompt.length <= 2000,
        message: 'Prompt is too long (maximum 2000 characters)',
        suggestion: 'Break down your prompt into smaller, more focused questions'
      },
      {
        id: 'missing-context',
        name: 'Context',
        description: 'Prompt should include relevant context',
        severity: 'warning',
        validate: (prompt) => {
          const contextKeywords = ['context', 'background', 'scenario', 'assume', 'given'];
          return contextKeywords.some(keyword => prompt.toLowerCase().includes(keyword));
        },
        message: 'Prompt lacks context',
        suggestion: 'Add context about what you\'re trying to achieve'
      },
      {
        id: 'missing-instruction',
        name: 'Clear Instruction',
        description: 'Prompt should have clear instructions',
        severity: 'warning',
        validate: (prompt) => {
          const instructionKeywords = ['write', 'create', 'build', 'generate', 'design', 'analyze', 'explain', 'summarize', 'implement'];
          return instructionKeywords.some(keyword => prompt.toLowerCase().includes(keyword));
        },
        message: 'Prompt lacks clear instructions',
        suggestion: 'Be specific about what you want the AI to do'
      },
      {
        id: 'missing-format',
        name: 'Output Format',
        description: 'Prompt should specify output format',
        severity: 'info',
        validate: (prompt) => {
          const formatKeywords = ['format', 'json', 'yaml', 'markdown', 'table', 'code', 'list', 'paragraph'];
          return formatKeywords.some(keyword => prompt.toLowerCase().includes(keyword));
        },
        message: 'Prompt doesn\'t specify output format',
        suggestion: 'Add output format preference (e.g., "in JSON format", "as a markdown table")'
      },
      {
        id: 'ambiguous-terms',
        name: 'Ambiguous Terms',
        description: 'Prompt should avoid ambiguous language',
        severity: 'warning',
        validate: (prompt) => {
          const ambiguousTerms = ['good', 'bad', 'nice', 'best', 'worst', 'maybe', 'sort of', 'kind of'];
          return ambiguousTerms.every(term => !prompt.toLowerCase().includes(term));
        },
        message: 'Prompt contains ambiguous terms',
        suggestion: 'Be more specific with your requirements'
      },
      {
        id: 'leading-question',
        name: 'Leading Question',
        description: 'Prompt should not be a yes/no question for complex tasks',
        severity: 'warning',
        validate: (prompt) => {
          const questionWords = ['is', 'are', 'do', 'does', 'can', 'could', 'should', 'would', 'will', 'is it'];
          const firstSentence = prompt.split('.')[0].trim();
          return !questionWords.some(word => firstSentence.toLowerCase().startsWith(word));
        },
        message: 'Prompt starts with a yes/no question',
        suggestion: 'Ask for more detailed information or examples'
      },
      {
        id: 'uppercase-heavy',
        name: 'Casing',
        description: 'Prompt should not be all uppercase',
        severity: 'warning',
        validate: (prompt) => {
          const uppercaseRatio = (prompt.match(/[A-Z]/g) || []).length / prompt.length;
          return uppercaseRatio < 0.5;
        },
        message: 'Prompt is heavily uppercase',
        suggestion: 'Use proper sentence case for better clarity'
      }
    ];
  }

  private addCustomRules(customRules: PromptRule[]): void {
    this.rules.push(...customRules);
  }

  validate(prompt: string, enabledRules?: string[]): ValidationResult {
    const issues: PromptIssue[] = [];
    const suggestions: string[] = [];
    const enabledRulesList = enabledRules || this.rules.map(rule => rule.id);
    
    const enabledRuleObjects = this.rules.filter(rule => 
      enabledRulesList.includes(rule.id)
    );

    enabledRuleObjects.forEach(rule => {
      if (!rule.validate(prompt)) {
        issues.push({
          rule: rule.id,
          severity: rule.severity,
          message: rule.message,
          suggestion: rule.suggestion,
          location: {
            start: 0,
            end: prompt.length
          }
        });
        if (rule.suggestion) {
          suggestions.push(rule.suggestion);
        }
      }
    });

    const metrics = this.analyzeMetrics(prompt);
    const score = this.calculateScore(metrics, issues);

    return {
      isValid: issues.filter(issue => issue.severity === 'error').length === 0,
      score,
      issues,
      suggestions: [...new Set(suggestions)],
      metrics
    };
  }

  private analyzeMetrics(prompt: string): PromptMetrics {
    const words = prompt.trim().split(/\s+/);
    const sentences = prompt.split(/[.!?]+/).filter(s => s.trim().length > 0);

    const clarityScore = this.calculateClarityScore(prompt, sentences);
    const specificityScore = this.calculateSpecificityScore(prompt);
    const structureScore = this.calculateStructureScore(sentences);
    const creativityScore = this.calculateCreativityScore(prompt, words);

    return {
      length: prompt.length,
      wordCount: words.length,
      clarityScore,
      specificityScore,
      structureScore,
      creativityScore,
      totalScore: Math.round((clarityScore + specificityScore + structureScore + creativityScore) / 4)
    };
  }

  private calculateClarityScore(prompt: string, sentences: string[]): number {
    const avgSentenceLength = sentences.reduce((sum, s) => sum + s.trim().split(/\s+/).length, 0) / sentences.length;
    const lengthVariance = sentences.reduce((sum, s) => {
      const length = s.trim().split(/\s+/).length;
      return sum + Math.abs(length - avgSentenceLength);
    }, 0) / sentences.length;

    let score = 100 - Math.min(lengthVariance * 5, 30);
    const longSentences = sentences.filter(s => s.trim().split(/\s+/).length > 25);
    score -= longSentences.length * 10;
    
    return Math.max(0, Math.min(100, Math.round(score)));
  }

  private calculateSpecificityScore(prompt: string): number {
    const genericTerms = ['good', 'bad', 'nice', 'best', 'thing', 'stuff', 'thingy', 'whatchamacallit'];
    const specificTerms = ['implement', 'algorithm', 'function', 'class', 'component', 'api', 'database', 'server'];
    
    const words = prompt.toLowerCase().split(/\s+/);
    const genericCount = words.filter(word => genericTerms.includes(word)).length;
    const specificCount = words.filter(word => specificTerms.includes(word)).length;
    
    let score = 50 + (specificCount * 10) - (genericCount * 5);
    
    const technicalTerms = ['javascript', 'python', 'typescript', 'react', 'node', 'express', 'mongodb', 'sql', 'api'];
    const technicalCount = words.filter(word => technicalTerms.includes(word)).length;
    score += technicalCount * 5;
    
    return Math.max(0, Math.min(100, Math.round(score)));
  }

  private calculateStructureScore(sentences: string[]): number {
    let score = 50;
    
    if (sentences.length >= 3) score += 20;
    if (sentences.length >= 5) score += 10;
    
    const questions = sentences.filter(s => s.trim().endsWith('?'));
    if (questions.length > 0 && questions.length < sentences.length) {
      score += 10;
    }
    
    const verbs = ['create', 'build', 'implement', 'design', 'write', 'develop', 'add', 'fix', 'update'];
    const imperativeSentences = sentences.filter(s => {
      const firstWord = s.trim().split(/\s+/)[0].toLowerCase();
      return verbs.includes(firstWord);
    });
    score += imperativeSentences.length * 5;
    
    return Math.max(0, Math.min(100, Math.round(score)));
  }

  private calculateCreativityScore(prompt: string, words: string[]): number {
    const uniqueWords = new Set(words.map(word => word.toLowerCase()));
    const diversityRatio = uniqueWords.size / words.length;
    
    let score = diversityRatio * 100;
    
    if (uniqueWords.size > 30) score += 20;
    if (uniqueWords.size > 50) score += 10;
    
    return Math.max(0, Math.min(100, Math.round(score)));
  }

  private calculateScore(metrics: PromptMetrics, issues: PromptIssue[]): number {
    let score = metrics.totalScore;
    
    const errorPenalty = issues.filter(issue => issue.severity === 'error').length * 20;
    const warningPenalty = issues.filter(issue => issue.severity === 'warning').length * 5;
    const infoPenalty = issues.filter(issue => issue.severity === 'info').length * 2;
    
    score -= errorPenalty + warningPenalty + infoPenalty;
    
    return Math.max(0, Math.min(100, Math.round(score)));
  }

  getRules(): PromptRule[] {
    return this.rules;
  }

  getRule(id: string): PromptRule | undefined {
    return this.rules.find(rule => rule.id === id);
  }

  enableRule(id: string): void {
    const rule = this.getRule(id);
    if (rule) {
      rule.validate = () => true;
    }
  }

  disableRule(id: string): void {
    const rule = this.getRule(id);
    if (rule) {
      rule.validate = () => false;
    }
  }

  addCustomRule(rule: PromptRule): void {
    this.rules.push(rule);
  }

  removeRule(id: string): void {
    this.rules = this.rules.filter(rule => rule.id !== id);
  }
}