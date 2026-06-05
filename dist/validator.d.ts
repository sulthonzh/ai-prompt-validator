import { PromptRule, ValidationResult } from './types';
export declare class PromptValidator {
    private rules;
    constructor(customRules?: PromptRule[]);
    private initializeDefaultRules;
    private addCustomRules;
    validate(prompt: string, enabledRules?: string[]): ValidationResult;
    private analyzeMetrics;
    private calculateClarityScore;
    private calculateSpecificityScore;
    private calculateStructureScore;
    private calculateCreativityScore;
    private calculateScore;
    getRules(): PromptRule[];
    getRule(id: string): PromptRule | undefined;
    enableRule(id: string): void;
    disableRule(id: string): void;
    addCustomRule(rule: PromptRule): void;
    removeRule(id: string): void;
}
//# sourceMappingURL=validator.d.ts.map