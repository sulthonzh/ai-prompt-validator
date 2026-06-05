"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PromptOptimizer = void 0;
class PromptOptimizer {
    constructor() {
        this.suggestions = [];
        this.initializeSuggestions();
    }
    initializeSuggestions() {
        this.suggestions = [
            {
                type: 'structure',
                priority: 'high',
                description: 'Add clear structure with sections',
                suggestion: 'Structure your prompt with clear sections like: Context, Task, Requirements, Examples',
                before: 'Write a function to calculate fibonacci numbers',
                after: 'Task: Create a function to calculate Fibonacci numbers\n\nContext:\n- Input: Integer n\n- Output: Array of first n Fibonacci numbers\n- Constraints: Use iterative approach, handle edge cases\n\nRequirements:\n- Function should be named fibonacci()\n- Handle n = 0, n = 1 cases\n- Return array of numbers\n\nExample:\nfibonacci(5) should return [0, 1, 1, 2, 3]'
            },
            {
                type: 'clarity',
                priority: 'high',
                description: 'Remove ambiguous terms',
                suggestion: 'Replace vague terms with specific requirements',
                before: 'Write good code that handles the user login properly',
                after: 'Write a secure Node.js function that handles user login with email/password authentication, password hashing with bcrypt, and proper error handling for invalid credentials'
            },
            {
                type: 'specificity',
                priority: 'high',
                description: 'Add specific requirements and constraints',
                suggestion: 'Include technical specifications, input/output formats, and edge cases',
                before: 'Create a shopping cart',
                after: 'Create a React shopping cart component with the following requirements:\n- Display product list with name, price, and quantity\n- Allow adding/removing items from cart\n- Calculate total price including tax (10%)\n- Update cart total in real-time\n- Handle inventory limits (max 10 per item)\n- Include "Clear Cart" and "Checkout" buttons'
            },
            {
                type: 'format',
                priority: 'medium',
                description: 'Specify output format',
                suggestion: 'Be explicit about the desired output format',
                before: 'Summarize the main points of this article',
                after: 'Summarize the main points of this article in a JSON format with the following structure:\n{\n  "title": "Article Title",\n  "main_points": ["Point 1", "Point 2", "Point 3"],\n  "key_takeaways": ["Takeaway 1", "Takeaway 2"],\n  "word_count": 200\n}'
            },
            {
                type: 'length',
                priority: 'medium',
                description: 'Optimize prompt length',
                suggestion: 'Balance between being concise and providing enough detail',
                before: 'Write a very very very long detailed explanation about machine learning algorithms covering all aspects including history, mathematical foundations, implementation details, best practices, common pitfalls, advanced techniques, future trends, real-world applications, and code examples in Python and JavaScript with full explanations of each algorithm\'s strengths and weaknesses and when to use them and when not to use them and why',
                after: 'Explain machine learning algorithms including: 1) Key types (supervised, unsupervised, reinforcement learning), 2) Mathematical foundations of common algorithms, 3) Implementation considerations and best practices, 4) Common pitfalls and how to avoid them'
            },
            {
                type: 'structure',
                priority: 'medium',
                description: 'Use bullet points for complex requirements',
                suggestion: 'Break down complex prompts into bullet points',
                before: 'I need you to help me create a website for my online store that sells handmade jewelry. The website should have a product catalog with filtering by category and price range, a shopping cart system, user authentication, payment processing with Stripe, inventory management, order tracking, customer reviews, and admin dashboard with sales analytics.',
                after: 'Create an e-commerce website for handmade jewelry with the following features:\n\nProduct Catalog:\n- Display products with images, descriptions, prices\n- Filter by category (rings, necklaces, earrings, bracelets)\n- Filter by price range\n- Search functionality\n\nShopping Cart:\n- Add/remove items\n- Calculate totals including tax\n- Update quantities\n- Apply discount codes\n\nUser System:\n- Registration/login\n- Profile management\n- Order history\n- Wishlist\n\nPayment & Orders:\n- Stripe integration\n- Order confirmation\n- Order tracking\n- Customer reviews\n\nAdmin Dashboard:\n- Sales analytics\n- Inventory management\n- Order management\n- Customer analytics'
            }
        ];
    }
    generateOptimizations(prompt, metrics) {
        const optimizations = [];
        if (metrics.structureScore < 70) {
            optimizations.push(...this.getStructureOptimizations(prompt));
        }
        if (metrics.clarityScore < 70) {
            optimizations.push(...this.getClarityOptimizations(prompt));
        }
        if (metrics.specificityScore < 70) {
            optimizations.push(...this.getSpecificityOptimizations(prompt));
        }
        if (!this.hasFormatSpecified(prompt)) {
            optimizations.push(this.suggestions.find(s => s.type === 'format'));
        }
        if (metrics.length > 1500) {
            optimizations.push(...this.getLengthOptimizations(prompt));
        }
        if (metrics.totalScore < 70) {
            optimizations.push({
                type: 'clarity',
                priority: 'high',
                description: 'Overall prompt improvement',
                suggestion: 'Consider adding more context and being more specific about your requirements',
                before: prompt,
                after: 'Task: [specific action]\n\nContext: [relevant background]\n\nRequirements:\n- Requirement 1\n- Requirement 2\n- Requirement 3\n\nOutput Format: [desired format]'
            });
        }
        return optimizations
            .sort((a, b) => {
            const priorityOrder = { high: 3, medium: 2, low: 1 };
            return priorityOrder[b.priority] - priorityOrder[a.priority];
        })
            .filter((suggestion, index, self) => index === self.findIndex(s => s.type === suggestion.type && s.description === suggestion.description))
            .slice(0, 5);
    }
    getStructureOptimizations(prompt) {
        const optimizations = [];
        if (!prompt.includes('\n') && prompt.length > 200) {
            optimizations.push({
                type: 'structure',
                priority: 'high',
                description: 'Add line breaks for readability',
                suggestion: 'Break down long prompts with line breaks for better readability',
                before: prompt,
                after: prompt.split('. ').join('.\n')
            });
        }
        if (!prompt.toLowerCase().includes('task') && prompt.toLowerCase().includes('write')) {
            optimizations.push({
                type: 'structure',
                priority: 'medium',
                description: 'Add task section header',
                suggestion: 'Add a clear "Task:" section to specify what you want',
                before: prompt,
                after: `Task: ${prompt.substring(prompt.indexOf('write') + 5)}\n\nAdditional context and requirements: [add context here]`
            });
        }
        return optimizations;
    }
    getClarityOptimizations(prompt) {
        const optimizations = [];
        const ambiguousTerms = ['good', 'bad', 'nice', 'best', 'better', 'worse'];
        const foundAmbiguous = ambiguousTerms.filter(term => prompt.toLowerCase().includes(term));
        if (foundAmbiguous.length > 0) {
            optimizations.push({
                type: 'clarity',
                priority: 'high',
                description: 'Replace ambiguous terms',
                suggestion: `Replace "${foundAmbiguous[0]}" with specific criteria`,
                before: prompt,
                after: prompt.replace(new RegExp(foundAmbiguous[0], 'gi'), 'effective')
            });
        }
        return optimizations;
    }
    getSpecificityOptimizations(prompt) {
        const optimizations = [];
        if (prompt.toLowerCase().includes('create') && !prompt.toLowerCase().includes('function') && !prompt.toLowerCase().includes('component')) {
            optimizations.push({
                type: 'specificity',
                priority: 'high',
                description: 'Specify technology stack',
                suggestion: 'Specify the technology stack (language, framework, tools)',
                before: prompt,
                after: `${prompt} using React and TypeScript with proper TypeScript types and error handling`
            });
        }
        return optimizations;
    }
    getLengthOptimizations(prompt) {
        const optimizations = [];
        if (prompt.length > 2000) {
            optimizations.push({
                type: 'length',
                priority: 'high',
                description: 'Split into multiple focused prompts',
                suggestion: 'Break down large prompts into smaller, focused ones',
                before: prompt,
                after: `This prompt is too long. Consider splitting it into:\n1. [First part of the task]\n2. [Second part of the task]\n3. [Third part of the task]`
            });
        }
        return optimizations;
    }
    hasFormatSpecified(prompt) {
        const formatKeywords = ['format', 'json', 'yaml', 'markdown', 'table', 'code', 'list', 'paragraph', 'xml'];
        return formatKeywords.some(keyword => prompt.toLowerCase().includes(keyword));
    }
    applyOptimization(prompt, optimization) {
        return optimization.before === prompt ? optimization.after : prompt;
    }
    applyMultipleOptimizations(prompt, optimizations) {
        let optimizedPrompt = prompt;
        optimizations.forEach(optimization => {
            if (optimizedPrompt === optimization.before) {
                optimizedPrompt = optimization.after;
            }
        });
        return optimizedPrompt;
    }
}
exports.PromptOptimizer = PromptOptimizer;
//# sourceMappingURL=optimizer.js.map