# AI Prompt Validator

A comprehensive CLI tool for validating, optimizing, and testing AI prompts to ensure they're effective, clear, and well-structured.

## Features

### 🔍 **Prompt Validation**
- **Quality Scoring**: Get a score out of 100 based on multiple metrics
- **Rule-Based Validation**: Built-in rules covering common prompt issues
- **Detailed Analysis**: Identify specific problems and get suggestions
- **Metrics Tracking**: Track clarity, specificity, structure, and creativity scores

### 🎯 **Prompt Optimization**
- **Intelligent Suggestions**: Get specific recommendations to improve your prompts
- **Multiple Optimization Types**: Structure, clarity, specificity, format, and length optimizations
- **Interactive Optimization**: Choose which optimizations to apply
- **Automatic Application**: Apply all suggestions with one command

### 🧪 **Testing & Benchmarking**
- **Test Suites**: Create and run test suites with expected outputs
- **Batch Testing**: Validate multiple prompts at once
- **Performance Benchmarking**: Test prompt performance against AI models
- **Regression Testing**: Ensure prompt quality doesn't degrade over time

### 🛠️ **Flexible Configuration**
- **Custom Rules**: Add your own validation rules
- **Rule Management**: Enable/disable specific rules
- **Multiple Output Formats**: JSON, YAML, or human-readable
- **Config Profiles**: Different configurations for different use cases

## Installation

```bash
npm install -g ai-prompt-validator
```

Or use it without installation:

```bash
npx ai-prompt-validator
```

## Quick Start

### Basic Validation

```bash
# Validate a simple prompt
aiv validate "Write a function to calculate fibonacci numbers"

# Get detailed analysis
aiv validate "Write a function to calculate fibonacci numbers" --verbose

# Get JSON output
aiv validate "Write a function to calculate fibonacci numbers" --json
```

### Prompt Optimization

```bash
# Get optimization suggestions
aiv optimize "Write good code"

# Apply optimizations automatically
aiv optimize "Write good code" --apply

# Interactive optimization
aiv optimize "Write good code" --interactive
```

### Prompt Comparison

```bash
# Compare two prompt versions
aiv compare "Write a function" "Write a TypeScript function that handles edge cases"

# Get comparison as JSON
aiv compare "good code" "Write secure Node.js auth" --json

# Markdown output for PRs
aiv compare "v1 prompt" "v2 prompt" --markdown
```

## Usage Examples

### Validation Examples

```bash
# Basic validation
$ aiv validate "Write a function to calculate fibonacci numbers"

🎯 Prompt Validation Results
==================================================
Status: ✅ VALID
Score: 85/100

✅ No issues found!

# Validation with issues
$ aiv validate "Write good code"

🎯 Prompt Validation Results
==================================================
Status: ❌ INVALID
Score: 45/100

🚨 Issues Found:
❌ ambiguous-terms: Prompt contains ambiguous terms
     💡 Replace "good" with specific criteria
⚠️ missing-format: Prompt doesn't specify output format
     💡 Add output format preference
```

### Optimization Examples

```bash
# Get suggestions
$ aiv optimize "Write good code"

🎯 Optimization Suggestions:
==================================================
1. Replace ambiguous terms (high priority)
   Type: clarity
   💡 Replace "good" with specific criteria
   📝 Before: Write good code
   ✨ After: Write efficient code with proper error handling

2. Specify output format (medium priority)
   Type: format
   💡 Add output format preference
   📝 Before: Write good code
   ✨ After: Write efficient code in JSON format
```

### Advanced Features

```bash
# Custom rule validation
aiv validate "Write a function" --rules empty-prompt,too-short

# Create configuration
aiv config --init

# Manage rules
aiv rules --list
aiv rules --enable specific-rule
aiv rules --disable specific-rule
```

## Configuration

Create a configuration file (`aiv-config.json`) to customize the behavior:

```json
{
  "rules": ["empty-prompt", "too-short", "missing-context"],
  "excludedRules": ["uppercase-heavy"],
  "outputFormat": "json",
  "strictMode": true,
  "customRules": [
    {
      "id": "custom-rule",
      "name": "Custom Rule",
      "description": "A custom validation rule",
      "pattern": "test",
      "severity": "warning",
      "message": "Prompt must contain test",
      "suggestion": "Add test to your prompt"
    }
  ]
}
```

## Built-in Rules

The tool comes with several built-in validation rules:

### **Critical Rules**
- `empty-prompt`: Prompt cannot be empty
- `too-short`: Prompt should be at least 10 characters
- `too-long`: Prompt should not exceed 2000 characters

### **Quality Rules**
- `missing-context`: Prompt should include relevant context
- `missing-instruction`: Prompt should have clear instructions
- `missing-format`: Prompt should specify output format
- `ambiguous-terms`: Prompt should avoid ambiguous language
- `leading-question`: Prompt should not be a yes/no question
- `uppercase-heavy`: Prompt should not be all uppercase

### **Custom Rules**
You can add your own rules using:
```bash
# Add custom rules from file
aiv rules --add custom-rules.json

# Format for custom rules:
[
  {
    "id": "my-rule",
    "name": "My Custom Rule",
    "description": "Description of the rule",
    "pattern": "regex-pattern",
    "severity": "error|warning|info",
    "message": "Error message",
    "suggestion": "Suggestion text"
  }
]
```

## Metrics Explained

### **Clarity Score (0-100)**
Based on sentence structure, word complexity, and readability
- Higher score = Better clarity
- Penalizes very long sentences
- Rewards balanced sentence lengths

### **Specificity Score (0-100)**
Based on specific technical terms vs generic language
- Higher score = More specific requirements
- Rewards technical terms
- Penalizes generic terms like "good", "bad", "nice"

### **Structure Score (0-100)**
Based on organization and flow
- Higher score = Better structure
- Rewards multiple sentences
- Rewards imperative language
- Good question/statement balance

### **Creativity Score (0-100)**
Based on vocabulary diversity
- Higher score = More diverse vocabulary
- Rewards unique word usage
- Penalizes repetitive language

## Test Suite Format

Create test suites for batch testing:

```json
{
  "id": "example-suite",
  "name": "Example Test Suite",
  "description": "Test suite for example prompts",
  "prompts": [
    {
      "prompt": "Write a function to calculate fibonacci numbers",
      "expectedAnswer": "function fibonacci(n) { }",
      "expectedFormat": "code",
      "constraints": {
        "maxLength": 100,
        "minLength": 50,
        "requiredWords": ["function", "fibonacci"],
        "bannedWords": ["console"]
      }
    }
  ],
  "expectedOutputs": [
    {
      "id": "output-1",
      "promptId": "0",
      "expected": "fibonacci function",
      "description": "Should contain fibonacci function",
      "tolerance": 0.8
    }
  ]
}
```

## API Integration

The tool can integrate with various AI models for benchmarking:

```bash
# Benchmark prompts with OpenAI
aiv benchmark "Write a function" --model gpt-3.5-turbo --api-key your-key

# Benchmark multiple prompts
aiv benchmark "Write a function" "Create a class" --model gpt-4 --iterations 5

# Save benchmark results
aiv benchmark "Write a function" --output benchmark-results.json
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
- GitHub Issues: [Create an issue](https://github.com/sulthonzh/ai-prompt-validator/issues)
- Documentation: [Full documentation](https://github.com/sulthonzh/ai-prompt-validator/wiki)

## Roadmap

- [ ] Support for more AI models
- [ ] Prompt template generation
- [ ] Collaborative prompt sharing
- [ ] Performance analytics dashboard
- [ ] Integration with popular AI platforms
- [ ] Advanced rule engine with machine learning
- [ ] Real-time prompt optimization