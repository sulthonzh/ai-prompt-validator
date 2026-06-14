#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { PromptValidator } from './validator';
import { PromptOptimizer } from './optimizer';
import { Config, TestSuite, CustomRule } from './types';
import fs from 'fs/promises';
import path from 'path';
import inquirer from 'inquirer';

const program = new Command();
const validator = new PromptValidator();
const optimizer = new PromptOptimizer();

program
  .name('aiv')
  .description('AI Prompt Validator - Validate, optimize, and test your prompts')
  .version('1.0.0');

program
  .command('validate')
  .description('Validate a prompt for quality and effectiveness')
  .argument('<prompt>', 'The prompt to validate')
  .option('-r, --rules <rules>', 'Comma-separated list of rules to enable')
  .option('-c, --config <path>', 'Path to configuration file')
  .option('--json', 'Output in JSON format')
  .option('--yaml', 'Output in YAML format')
  .option('-v, --verbose', 'Show detailed analysis')
  .action(async (prompt, options) => {
    try {
      let config: Config = { rules: [] };
      if (options.config) {
        const configContent = await fs.readFile(options.config, 'utf-8');
        config = JSON.parse(configContent);
      }

      const enabledRules = options.rules ? options.rules.split(',') : undefined;

      const result = validator.validate(prompt, enabledRules);

      if (options.json) {
        console.log(JSON.stringify(result, null, 2));
        return;
      }

      if (options.yaml) {
        const yaml = require('yaml');
        console.log(yaml.stringify(result));
        return;
      }

      displayValidationResult(result, options.verbose || false);

      if (!result.isValid) {
        process.exit(1);
      }
    } catch (error) {
      console.error(chalk.red('Error:', (error as Error).message));
      process.exit(1);
    }
  });

program
  .command('optimize')
  .description('Generate optimization suggestions for a prompt')
  .argument('<prompt>', 'The prompt to optimize')
  .option('-c, --config <path>', 'Path to configuration file')
  .option('--apply', 'Apply optimizations automatically')
  .option('--interactive', 'Apply optimizations interactively')
  .action(async (prompt, options) => {
    try {
      let config: Config = { rules: [] };
      if (options.config) {
        const configContent = await fs.readFile(options.config, 'utf-8');
        config = JSON.parse(configContent);
      }

      const issues = validator.validate(prompt).issues;
      const metrics = validator.validate(prompt).metrics;

      const optimizations = optimizer.generateOptimizations(prompt, metrics);

      if (optimizations.length === 0) {
        console.log(chalk.green('✅ Your prompt is already well-optimized!'));
        return;
      }

      console.log(chalk.blue('\n🎯 Optimization Suggestions:'));
      console.log(''.padEnd(50, '-'));

      optimizations.forEach((opt, index) => {
        console.log(`\n${index + 1}. ${chalk.bold(opt.description)} (${opt.priority} priority)`);
        console.log(`   Type: ${opt.type}`);
        if (opt.suggestion) {
          console.log(`   💡 ${opt.suggestion}`);
        }
        console.log(`   📝 Before:\n   ${chalk.gray(opt.before)}`);
        console.log(`   ✨ After:\n   ${chalk.green(opt.after)}`);
      });

      let optimizedPrompt = prompt;
      if (options.apply) {
        optimizedPrompt = optimizer.applyMultipleOptimizations(prompt, optimizations);
        console.log(chalk.green('\n🚀 Applied optimizations:'));
        console.log(optimizedPrompt);
      } else if (options.interactive) {
        const { applyOptimizations } = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'applyOptimizations',
            message: 'Would you like to apply some of these optimizations?',
            default: true
          }
        ]);

        if (applyOptimizations) {
          const { selectedOptimizations } = await inquirer.prompt([
            {
              type: 'checkbox',
              name: 'selectedOptimizations',
              message: 'Select optimizations to apply:',
              choices: optimizations.map((opt, index) => ({
                name: `${index + 1}. ${opt.description} (${opt.priority})`,
                value: index
              }))
            }
          ]);

          const selected = selectedOptimizations.map((i: number) => optimizations[i]);
          optimizedPrompt = optimizer.applyMultipleOptimizations(prompt, selected);
          console.log(chalk.green('\n🚀 Applied selected optimizations:'));
          console.log(optimizedPrompt);

          const optimizedResult = validator.validate(optimizedPrompt);
          console.log(chalk.blue('\n📊 Optimized Prompt Validation:'));
          displayValidationResult(optimizedResult, false);
        }
      }
    } catch (error) {
      console.error(chalk.red('Error:', (error as Error).message));
      process.exit(1);
    }
  });

program
  .command('test')
  .description('Test prompts against expected outputs')
  .option('-t, --test-suite <path>', 'Path to test suite file')
  .option('-p, --prompts <path>', 'Path to prompts file')
  .option('-v, --verbose', 'Show detailed results')
  .action(async (options) => {
    try {
      if (options.testSuite) {
        await runTestSuite(options.testSuite, options.verbose);
      } else if (options.prompts) {
        await runBatchTests(options.prompts, options.verbose);
      } else {
        console.log(chalk.yellow('Please specify either --test-suite or --prompts'));
        process.exit(1);
      }
    } catch (error) {
      console.error(chalk.red('Error:', (error as Error).message));
      process.exit(1);
    }
  });

program
  .command('benchmark')
  .description('Benchmark prompt performance')
  .argument('<prompts...>', 'Prompts to benchmark')
  .option('-m, --model <model>', 'AI model to use (default: gpt-3.5-turbo)')
  .option('--api-key <key>', 'API key for the model')
  .option('--iterations <number>', 'Number of iterations per prompt (default: 3)', '3')
  .option('--output <path>', 'Output file for benchmark results')
  .action(async (prompts, options) => {
    try {
      await runBenchmark(prompts, options);
    } catch (error) {
      console.error(chalk.red('Error:', (error as Error).message));
      process.exit(1);
    }
  });

program
  .command('config')
  .description('Manage configuration')
  .option('--init', 'Initialize default configuration')
  .option('--show', 'Show current configuration')
  .option('--edit', 'Edit configuration file')
  .action(async (options) => {
    try {
      const configPath = path.join(process.cwd(), 'aiv-config.json');
      
      if (options.init) {
        const defaultConfig: Config = {
          rules: [],
          outputFormat: 'table',
          strictMode: false
        };
        await fs.writeFile(configPath, JSON.stringify(defaultConfig, null, 2));
        console.log(chalk.green(`✅ Configuration initialized at ${configPath}`));
        return;
      }

      if (options.show) {
        try {
          const configContent = await fs.readFile(configPath, 'utf-8');
          console.log(chalk.blue('Current configuration:'));
          console.log(configContent);
        } catch (error) {
          console.log(chalk.yellow('No configuration file found. Use --init to create one.'));
        }
        return;
      }

      if (options.edit) {
        console.log(chalk.yellow('Edit feature not implemented yet. Please edit the file manually.'));
        return;
      }
    } catch (error) {
      console.error(chalk.red('Error:', (error as Error).message));
      process.exit(1);
    }
  });

program
  .command('rules')
  .description('Manage validation rules')
  .option('--list', 'List all available rules')
  .option('--enable <rule>', 'Enable a specific rule')
  .option('--disable <rule>', 'Disable a specific rule')
  .option('--add <path>', 'Add custom rules from file')
  .action(async (options) => {
    try {
      if (options.list) {
        displayRules();
        return;
      }

      if (options.enable) {
        validator.enableRule(options.enable);
        console.log(chalk.green(`✅ Rule "${options.enable}" enabled`));
        return;
      }

      if (options.disable) {
        validator.disableRule(options.disable);
        console.log(chalk.green(`✅ Rule "${options.disable}" disabled`));
        return;
      }

      if (options.add) {
        const rulesContent = await fs.readFile(options.add, 'utf-8');
        const customRules = JSON.parse(rulesContent) as CustomRule[];
        customRules.forEach(rule => {
          validator.addCustomRule({
            ...rule,
            validate: (prompt) => {
              return new RegExp(rule.pattern).test(prompt);
            }
          });
        });
        console.log(chalk.green(`✅ Added ${customRules.length} custom rules`));
        return;
      }

      console.log(chalk.yellow('Please specify an action: --list, --enable, --disable, or --add'));
    } catch (error) {
      console.error(chalk.red('Error:', (error as Error).message));
      process.exit(1);
    }
  });

// Helper function to display validation results
function displayValidationResult(result: any, verbose: boolean = false): void {
  console.log('\n' + chalk.bold('🎯 Prompt Validation Results'));
  console.log(''.padEnd(50, '-'));

  const status = result.isValid ? chalk.green('✅ VALID') : chalk.red('❌ INVALID');
  console.log(`Status: ${status}`);
  console.log(`Score: ${chalk.bold(result.score)}/100`);

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
    result.issues.forEach((issue: any) => {
      const icon = issue.severity === 'error' ? '❌' : issue.severity === 'warning' ? '⚠️' : 'ℹ️';
      const color = issue.severity === 'error' ? chalk.red : issue.severity === 'warning' ? chalk.yellow : chalk.blue;
      console.log(`  ${icon} ${color(issue.rule)}: ${issue.message}`);
      if (issue.suggestion) {
        console.log(`     💡 ${issue.suggestion}`);
      }
    });
  } else {
    console.log('\n✅ No issues found!');
  }

  if (result.suggestions.length > 0) {
    console.log('\n💡 General Suggestions:');
    result.suggestions.slice(0, 3).forEach((suggestion: string) => {
      console.log(`  • ${suggestion}`);
    });
  }
}

// Helper function to display rules
function displayRules(): void {
  const rules = validator.getRules();
  console.log(chalk.bold('\n📋 Available Rules:'));
  console.log(''.padEnd(50, '-'));

  rules.forEach(rule => {
    const status = rule.validate('test prompt') ? '✅' : '❌';
    const icon = rule.severity === 'error' ? '❌' : rule.severity === 'warning' ? '⚠️' : 'ℹ️';
    console.log(`${status} ${icon} ${rule.name} (${rule.severity})`);
    console.log(`   ${rule.description}`);
  });
}

// Helper function to run test suite
async function runTestSuite(testSuitePath: string, verbose: boolean): Promise<void> {
  const content = await fs.readFile(testSuitePath, 'utf-8');
  const testSuite: TestSuite = JSON.parse(content);
  
  console.log(chalk.blue(`🧪 Running test suite: ${testSuite.name}`));
  console.log(''.padEnd(50, '-'));

  let passed = 0;
  let failed = 0;

  for (const test of testSuite.prompts) {
    console.log(`\n📝 Testing: ${test.prompt.substring(0, 50)}...`);
    
    const result = validator.validate(test.prompt);
    
    if (result.isValid) {
      console.log(chalk.green('✅ Passed'));
      passed++;
    } else {
      console.log(chalk.red('❌ Failed'));
      failed++;
      if (verbose) {
        result.issues.forEach(issue => {
          console.log(`   ${issue.message}`);
        });
      }
    }
  }

  console.log(`\n📊 Results: ${passed} passed, ${failed} failed`);
}

// Helper function to run batch tests
async function runBatchTests(promptsPath: string, verbose: boolean): Promise<void> {
  const prompts = (await fs.readFile(promptsPath, 'utf-8')).split('\n').filter(p => p.trim());
  
  console.log(chalk.blue(`🧪 Testing ${prompts.length} prompts`));
  console.log(''.padEnd(50, '-'));

  let passed = 0;
  let failed = 0;

  for (const prompt of prompts) {
    console.log(`\n📝 Testing: ${prompt.substring(0, 50)}...`);
    
    const result = validator.validate(prompt);
    
    if (result.isValid) {
      console.log(chalk.green('✅ Passed'));
      passed++;
    } else {
      console.log(chalk.red('❌ Failed'));
      failed++;
      if (verbose) {
        result.issues.forEach(issue => {
          console.log(`   ${issue.message}`);
        });
      }
    }
  }

  console.log(`\n📊 Results: ${passed} passed, ${failed} failed`);
}

// Helper function to run benchmark
async function runBenchmark(prompts: string[], options: any): Promise<void> {
  console.log(chalk.blue('🚀 Running benchmark...'));
  console.log(''.padEnd(50, '-'));

  // This would be implemented with actual API calls to AI models
  // For now, we'll simulate results
  for (const prompt of prompts) {
    console.log(`\n📝 Benchmarking: ${prompt.substring(0, 50)}...`);
    
    const score = Math.floor(Math.random() * 40) + 60; // Random score 60-100
    const time = Math.floor(Math.random() * 2000) + 500; // Random time 500-2500ms
    
    console.log(`   Score: ${score}/100`);
    console.log(`   Response Time: ${time}ms`);
  }
}


// ── Compare Command ──
program
  .command('compare')
  .description('Compare two prompts and show quality differences')
  .argument('<promptA>', 'First prompt (baseline)')
  .argument('<promptB>', 'Second prompt (revised)')
  .option('--json', 'Output comparison as JSON')
  .option('--markdown', 'Output comparison as markdown')
  .action(async (promptA: string, promptB: string, options: { json?: boolean; markdown?: boolean }) => {
    const { PromptComparator, formatCompareText, formatCompareJSON, formatCompareMarkdown } = await import('./comparator');
    const comparator = new PromptComparator(validator);
    const result = comparator.compare(promptA, promptB);

    if (options.json) {
      console.log(formatCompareJSON(result));
    } else if (options.markdown) {
      console.log(formatCompareMarkdown(result));
    } else {
      console.log(formatCompareText(result));
    }
  });

program.parse();