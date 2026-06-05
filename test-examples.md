# AI Prompt Validator - Test Examples

Here are some examples demonstrating the AI Prompt Validator tool:

## Example 1: Basic Validation

```bash
node simple-cli.js validate "Write a function to calculate fibonacci numbers"
```

Output:
```
🎯 Prompt Validation Results
--------------------------------------------------
Status: ✅ VALID
Score: 85/100

🚨 Issues Found:
  ⚠️ missing-context: Prompt lacks context
     💡 Add context about what you're trying to achieve
  ℹ️ missing-format: Prompt doesn't specify output format
     💡 Add output format preference (e.g., "in JSON format", "as a markdown table")

💡 General Suggestions:
  • Add context about what you're trying to achieve
  • Add output format preference (e.g., "in JSON format", "as a markdown table")
```

## Example 2: Invalid Prompt

```bash
node simple-cli.js validate ""
```

Output:
```
🎯 Prompt Validation Results
--------------------------------------------------
Status: ❌ INVALID
Score: 50/100

🚨 Issues Found:
  ❌ empty-prompt: Prompt is empty
     💡 Add some content to your prompt
```

## Example 3: Optimization Suggestions

```bash
node simple-cli.js optimize "Write good code"
```

Output:
```
🎯 Optimization Suggestions:
--------------------------------------------------

1. Specify output format (medium priority)
   Type: format
   💡 Be explicit about the desired output format
   📝 Before:
   Write good code
   ✨ After:
   Write good code in JSON format
```

## Example 4: Apply Optimizations

```bash
node simple-cli.js optimize "Write good code" --apply
```

Output:
```
🚀 Applied optimizations:
Write good code in JSON format

📊 Optimized Prompt Validation:
--------------------------------------------------
Status: ✅ VALID
Score: 90/100

💡 General Suggestions:
  • Add context about what you're trying to achieve
```

## Example 5: JSON Output

```bash
node simple-cli.js validate "Write a function to calculate fibonacci numbers" --json
```

Output:
```json
{
  "isValid": true,
  "score": 85,
  "issues": [
    {
      "rule": "missing-context",
      "severity": "warning",
      "message": "Prompt lacks context",
      "suggestion": "Add context about what you're trying to achieve"
    },
    {
      "rule": "missing-format",
      "severity": "info",
      "message": "Prompt doesn't specify output format",
      "suggestion": "Add output format preference (e.g., \"in JSON format\", \"as a markdown table\")"
    }
  ],
  "suggestions": [
    "Add context about what you're trying to achieve",
    "Add output format preference (e.g., \"in JSON format\", \"as a markdown table\")"
  ],
  "metrics": {
    "length": 42,
    "wordCount": 7,
    "clarityScore": 75,
    "specificityScore": 75,
    "structureScore": 70,
    "creativityScore": 85,
    "totalScore": 85
  }
}
```

## Example 6: Detailed Analysis

```bash
node simple-cli.js validate "Write a function to calculate fibonacci numbers" --verbose
```

Output:
```
🎯 Prompt Validation Results
--------------------------------------------------
Status: ✅ VALID
Score: 85/100

📊 Detailed Metrics:
  Length: 42 characters
  Words: 7
  Clarity: 75/100
  Specificity: 75/100
  Structure: 70/100
  Creativity: 85/100

🚨 Issues Found:
  ⚠️ missing-context: Prompt lacks context
     💡 Add context about what you're trying to achieve
  ℹ️ missing-format: Prompt doesn't specify output format
     💡 Add output format preference (e.g., "in JSON format", "as a markdown table")

💡 General Suggestions:
  • Add context about what you're trying to achieve
  • Add output format preference (e.g., "in JSON format", "as a markdown table")
```

## Example 7: Optimization with Multiple Suggestions

```bash
node simple-cli.js optimize "I need to create something nice for my website"
```

Output:
```
🎯 Optimization Suggestions:
--------------------------------------------------

1. Specify output format (medium priority)
   Type: format
   💡 Be explicit about the desired output format
   📝 Before:
   I need to create something nice for my website
   ✨ After:
   I need to create something nice for my website in JSON format

2. Improve clarity with specific requirements (high priority)
   Type: clarity
   💡 Replace vague terms with specific requirements
   📝 Before:
   I need to create something nice for my website
   ✨ After:
   I need to create effective components for my website
```

## Example 8: Advanced Prompt

```bash
node simple-cli.js validate "Given a list of numbers, write a function to calculate the sum using an iterative approach in JavaScript with proper error handling and JSDoc comments"
```

Output:
```
🎯 Prompt Validation Results
--------------------------------------------------
Status: ✅ VALID
Score: 95/100

💡 General Suggestions:
  • Add output format preference (e.g., "in JSON format", "as a markdown table")
```

## Key Features Demonstrated:

1. **Quality Scoring**: Each prompt gets a score out of 100
2. **Issue Detection**: Identifies specific problems like missing context, ambiguous terms, etc.
3. **Detailed Analysis**: Provides metrics for clarity, specificity, structure, and creativity
4. **Optimization Suggestions**: Offers concrete improvements to prompts
5. **Multiple Output Formats**: Supports both human-readable and JSON output
6. **Interactive Optimization**: Apply suggestions automatically or manually