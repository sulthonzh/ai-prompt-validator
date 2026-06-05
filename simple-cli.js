#!/usr/bin/env node

// Simple CLI for AI Prompt Validator
class SimplePromptValidator {
  validate(prompt) {
    const issues = [];
    let score = 100;
    
    // Check for empty prompt
    if (!prompt || prompt.trim().length === 0) {
      issues.push({
        rule: 'empty-prompt',
        severity: 'error',
        message: 'Prompt is empty',
        suggestion: 'Add some content to your prompt'
      });
      score -= 50;
    }
    
    // Check length
    if (prompt && prompt.length < 10) {
      issues.push({
        rule: 'too-short',
        severity: 'warning',
        message: 'Prompt is too short (minimum 10 characters)',
        suggestion: 'Add more detail to your prompt'
      });
      score -= 20;
    }
    
    if (prompt && prompt.length > 2000) {
      issues.push({
        rule: 'too-long',
        severity: 'warning',
        message: 'Prompt is too long (maximum 2000 characters)',
        suggestion: 'Break down your prompt into smaller, more focused questions'
      });
      score -= 15;
    }
    
    // Check for context
    if (prompt && prompt.length > 20) {
      const contextKeywords = ['context', 'background', 'scenario', 'assume', 'given'];
      const hasContext = contextKeywords.some(keyword => 
        prompt.toLowerCase().includes(keyword)
      );
      
      if (!hasContext) {
        issues.push({
          rule: 'missing-context',
          severity: 'warning',
          message: 'Prompt lacks context',
          suggestion: 'Add context about what you\'re trying to achieve'
        });
        score -= 10;
      }
    }
    
    // Check for instructions
    if (prompt && prompt.length > 20) {
      const instructionKeywords = ['write', 'create', 'build', 'generate', 'design', 'analyze', 'explain', 'summarize', 'implement'];
      const hasInstruction = instructionKeywords.some(keyword => 
        prompt.toLowerCase().includes(keyword)
      );
      
      if (!hasInstruction) {
        issues.push({
          rule: 'missing-instruction',
          severity: 'warning',
          message: 'Prompt lacks clear instructions',
          suggestion: 'Be specific about what you want the AI to do'
        });
        score -= 15;
      }
    }
    
    // Check for format
    if (prompt && prompt.length > 20) {
      const formatKeywords = ['format', 'json', 'yaml', 'markdown', 'table', 'code', 'list', 'paragraph'];
      const hasFormat = formatKeywords.some(keyword => 
        prompt.toLowerCase().includes(keyword)
      );
      
      if (!hasFormat) {
        issues.push({
          rule: 'missing-format',
          severity: 'info',
          message: 'Prompt doesn\'t specify output format',
          suggestion: 'Add output format preference (e.g., "in JSON format", "as a markdown table")'
        });
        score -= 5;
      }
    }
    
    // Check for ambiguous terms
    if (prompt && prompt.length > 20) {
      const ambiguousTerms = ['good', 'bad', 'nice', 'best', 'worst', 'maybe', 'sort of', 'kind of'];
      const hasAmbiguous = ambiguousTerms.some(term => 
        prompt.toLowerCase().includes(term)
      );
      
      if (hasAmbiguous) {
        issues.push({
          rule: 'ambiguous-terms',
          severity: 'warning',
          message: 'Prompt contains ambiguous terms',
          suggestion: 'Be more specific with your requirements'
        });
        score -= 10;
      }
    }
    
    // Calculate metrics
    const words = prompt ? prompt.trim().split(/\s+/) : [];
    const metrics = {
      length: prompt ? prompt.length : 0,
      wordCount: words.length,
      clarityScore: Math.max(0, score - (issues.filter(i => i.severity === 'error').length * 20)),
      specificityScore: Math.max(0, score - 10),
      structureScore: Math.max(0, score - 15),
      creativityScore: Math.max(0, score - 5),
      totalScore: Math.max(0, Math.min(100, score))
    };
    
    return {
      isValid: issues.filter(issue => issue.severity === 'error').length === 0,
      score: metrics.totalScore,
      issues,
      suggestions: [...new Set(issues.map(i => i.suggestion).filter(Boolean))],
      metrics
    };
  }
}

// Simple prompt optimization
class SimplePromptOptimizer {
  generateOptimizations(prompt, metrics) {
    const optimizations = [];
    
    // Structure optimization
    if (prompt && !prompt.includes('\n') && prompt.length > 200) {
      optimizations.push({
        type: 'structure',
        priority: 'high',
        description: 'Add line breaks for readability',
        suggestion: 'Break down long prompts with line breaks for better readability',
        before: prompt,
        after: prompt.split('. ').join('.\n')
      });
    }
    
    // Clarity optimization
    if (metrics.clarityScore < 70 && prompt) {
      const after = prompt.replace(/good|bad|nice|best/gi, 'effective');
      if (after !== prompt) {
        optimizations.push({
          type: 'clarity',
          priority: 'high',
          description: 'Improve clarity with specific requirements',
          suggestion: 'Replace vague terms with specific requirements',
          before: prompt,
          after: after
        });
      }
    }
    
    // Specificity optimization
    if (metrics.specificityScore < 70 && prompt) {
      optimizations.push({
        type: 'specificity',
        priority: 'high',
        description: 'Add specific requirements',
        suggestion: 'Include technical specifications and requirements',
        before: prompt,
        after: `${prompt} using React and TypeScript with proper error handling`
      });
    }
    
    // Format optimization
    if (prompt && !prompt.toLowerCase().includes('format')) {
      optimizations.push({
        type: 'format',
        priority: 'medium',
        description: 'Specify output format',
        suggestion: 'Be explicit about the desired output format',
        before: prompt,
        after: `${prompt} in JSON format`
      });
    }
    
    return optimizations;
  }
}

// CLI functionality
const validator = new SimplePromptValidator();
const optimizer = new SimplePromptOptimizer();

function displayValidationResult(result, verbose = false) {
  console.log('\n' + '🎯 Prompt Validation Results');
  console.log(''.padEnd(50, '-'));

  const status = result.isValid ? '✅ VALID' : '❌ INVALID';
  console.log(`Status: ${status}`);
  console.log(`Score: ${result.score}/100`);

  if (verbose) {
    console.log('\n📊 Detailed Metrics:');
    console.log(`  Length: ${result.metrics.length} characters`);
    console.log(`  Words: ${result.metrics.wordCount}`);
    console.log(`  Clarity: ${result.metrics.clarityScore}/100`);
    console.log(`  Specificity: ${result.metrics.specificityScore}/100`);
    console.log(`  Structure: ${result.metrics.structureScore}/100`);
    console.log(`  Creativity: ${result.metrics.creativityScore}/100`);
  }

  if (result.issues.length > 0) {
    console.log('\n🚨 Issues Found:');
    result.issues.forEach(issue => {
      const icon = issue.severity === 'error' ? '❌' : issue.severity === 'warning' ? '⚠️' : 'ℹ️';
      const color = issue.severity === 'error' ? 'red' : issue.severity === 'warning' ? 'yellow' : 'blue';
      console.log(`  ${icon} ${issue.rule}: ${issue.message}`);
      if (issue.suggestion) {
        console.log(`     💡 ${issue.suggestion}`);
      }
    });
  } else {
    console.log('\n✅ No issues found!');
  }

  if (result.suggestions.length > 0) {
    console.log('\n💡 General Suggestions:');
    result.suggestions.slice(0, 3).forEach(suggestion => {
      console.log(`  • ${suggestion}`);
    });
  }
}

function displayOptimizations(prompt, optimizations) {
  console.log('\n🎯 Optimization Suggestions:');
  console.log(''.padEnd(50, '-'));

  if (!prompt) {
    console.log('❌ No prompt provided for optimization');
    return;
  }

  if (optimizations.length === 0) {
    console.log('✅ Your prompt is already well-optimized!');
    return;
  }

  optimizations.forEach((opt, index) => {
    console.log(`\n${index + 1}. ${opt.description} (${opt.priority} priority)`);
    console.log(`   Type: ${opt.type}`);
    if (opt.suggestion) {
      console.log(`   💡 ${opt.suggestion}`);
    }
    console.log(`   📝 Before:\n   ${opt.before || prompt}`);
    console.log(`   ✨ After:\n   ${opt.after || prompt}`);
  });
}

// Command line argument parsing
const args = process.argv.slice(2);
const command = args[0];

if (command === 'validate') {
  const prompt = args[1];
  const options = args.slice(2);
  
  if (!prompt) {
    console.log('Usage: node simple-cli.js validate "<prompt>" [--json] [--verbose]');
    process.exit(1);
  }
  
  const result = validator.validate(prompt);
  
  if (options.includes('--json')) {
    console.log(JSON.stringify(result, null, 2));
    process.exit(result.isValid ? 0 : 1);
  }
  
  if (options.includes('--verbose')) {
    displayValidationResult(result, true);
  } else {
    displayValidationResult(result, false);
  }
  
  process.exit(result.isValid ? 0 : 1);
} else if (command === 'optimize') {
  const prompt = args[1];
  const options = args.slice(2);
  
  if (!prompt) {
    console.log('Usage: node simple-cli.js optimize "<prompt>" [--apply]');
    process.exit(1);
  }
  
  const result = validator.validate(prompt);
  const optimizations = optimizer.generateOptimizations(prompt, result.metrics);
  
  if (options.includes('--apply')) {
    let optimizedPrompt = prompt;
    optimizations.forEach(opt => {
      if (opt.before === optimizedPrompt) {
        optimizedPrompt = opt.after;
      }
    });
    console.log('\n🚀 Applied optimizations:');
    console.log(optimizedPrompt);
    
    // Show validation of optimized prompt
    const optimizedResult = validator.validate(optimizedPrompt);
    console.log('\n📊 Optimized Prompt Validation:');
    displayValidationResult(optimizedResult, false);
  } else {
    displayOptimizations(prompt, optimizations);
  }
} else if (command === 'help' || !command) {
  console.log(`
AI Prompt Validator - Simple CLI tool for validating and optimizing prompts

Usage:
  node simple-cli.js validate "<prompt>"        Validate a prompt
  node simple-cli.js optimize "<prompt>"        Get optimization suggestions
  node simple-cli.js help                       Show this help message

Options for validate:
  --json    Output in JSON format
  --verbose Show detailed analysis

Options for optimize:
  --apply   Apply optimizations automatically

Examples:
  node simple-cli.js validate "Write a function to calculate fibonacci numbers"
  node simple-cli.js validate "Write good code" --verbose
  node simple-cli.js optimize "Write good code"
  node simple-cli.js optimize "Write good code" --apply
`);
} else {
  console.log(`Unknown command: ${command}`);
  console.log('Use "node simple-cli.js help" for usage information');
  process.exit(1);
}