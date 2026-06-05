import { OptimizationSuggestion, PromptMetrics } from './types';
export declare class PromptOptimizer {
    private suggestions;
    constructor();
    private initializeSuggestions;
    generateOptimizations(prompt: string, metrics: PromptMetrics): OptimizationSuggestion[];
    private getStructureOptimizations;
    private getClarityOptimizations;
    private getSpecificityOptimizations;
    private getLengthOptimizations;
    private hasFormatSpecified;
    applyOptimization(prompt: string, optimization: OptimizationSuggestion): string;
    applyMultipleOptimizations(prompt: string, optimizations: OptimizationSuggestion[]): string;
}
//# sourceMappingURL=optimizer.d.ts.map