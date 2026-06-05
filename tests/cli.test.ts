import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { exec } from 'child_process';
import path from 'path';
import fs from 'fs/promises';

describe('CLI Tests', () => {
  let testDir: string;
  let cliPath: string;

  beforeEach(async () => {
    testDir = await fs.mkdtemp(path.join(__dirname, 'test-'));
    cliPath = path.join(__dirname, '..', 'src', 'cli.ts');
  });

  afterEach(async () => {
    await fs.rm(testDir, { recursive: true, force: true });
  });

  describe('validate command', () => {
    it('should validate a simple prompt', async () => {
      const prompt = 'Write a function to calculate fibonacci numbers';
      
      const result = await execCommand(`node ${cliPath} validate "${prompt}"`);
      
      expect(result.stdout).toContain('Status: ✅ VALID');
      expect(result.stdout).toContain('Score:');
    });

    it('should show invalid status for bad prompts', async () => {
      const badPrompt = '';
      
      const result = await execCommand(`node ${cliPath} validate "${badPrompt}"`);
      
      expect(result.stdout).toContain('Status: ❌ INVALID');
      expect(result.stdout).toContain('Issues Found:');
    });

    it('should support JSON output', async () => {
      const prompt = 'Write a function';
      
      const result = await execCommand(`node ${cliPath} validate "${prompt}" --json`);
      
      expect(result.stdout).toContain('"isValid":');
      expect(result.stdout).toContain('"score":');
    });

    it('should support YAML output', async () => {
      const prompt = 'Write a function';
      
      const result = await execCommand(`node ${cliPath} validate "${prompt}" --yaml`);
      
      expect(result.stdout).toContain('isValid:');
      expect(result.stdout).toContain('score:');
    });

    it('should support rule filtering', async () => {
      const prompt = 'short';
      
      const result = await execCommand(`node ${cliPath} validate "${prompt}" --rules empty-prompt`);
      
      expect(result.stdout).toContain('empty-prompt: ❌');
    });

    it('should support verbose mode', async () => {
      const prompt = 'Write a function to calculate fibonacci numbers';
      
      const result = await execCommand(`node ${cliPath} validate "${prompt}" --verbose`);
      
      expect(result.stdout).toContain('Detailed Metrics:');
      expect(result.stdout).toContain('Length:');
    });
  });

  describe('optimize command', () => {
    it('should generate optimization suggestions', async () => {
      const prompt = 'Write good code';
      
      const result = await execCommand(`node ${cliPath} optimize "${prompt}"`);
      
      expect(result.stdout).toContain('Optimization Suggestions:');
      expect(result.stdout).toContain('Priority:');
    });

    it('should support interactive optimization', async () => {
      const prompt = 'Write good code';
      
      const result = await execCommand(`node ${cliPath} optimize "${prompt}" --interactive`);
      
      expect(result.stdout).toContain('Would you like to apply some of these optimizations?');
    });

    it('should apply optimizations automatically', async () => {
      const prompt = 'Write good code';
      
      const result = await execCommand(`node ${cliPath} optimize "${prompt}" --apply`);
      
      expect(result.stdout).toContain('Applied optimizations:');
      expect(result.stdout).toContain('Write');
    });
  });

  describe('rules command', () => {
    it('should list all rules', async () => {
      const result = await execCommand(`node ${cliPath} rules --list`);
      
      expect(result.stdout).toContain('Available Rules:');
      expect(result.stdout).toContain('empty-prompt');
    });

    it('should enable a rule', async () => {
      const result = await execCommand(`node ${cliPath} rules --enable empty-prompt`);
      
      expect(result.stdout).toContain('Rule "empty-prompt" enabled');
    });

    it('should disable a rule', async () => {
      const result = await execCommand(`node ${cliPath} rules --disable empty-prompt`);
      
      expect(result.stdout).toContain('Rule "empty-prompt" disabled');
    });
  });

  describe('config command', () => {
    it('should initialize configuration', async () => {
      const configPath = path.join(testDir, 'aiv-config.json');
      
      const result = await execCommand(`node ${cliPath} config --init`);
      
      expect(result.stdout).toContain('Configuration initialized');
      
      const configExists = await fs.access(configPath).then(() => true).catch(() => false);
      expect(configExists).toBe(true);
    });

    it('should show configuration', async () => {
      const result = await execCommand(`node ${cliPath} config --show`);
      
      expect(result.stdout).toContain('Current configuration:');
    });
  });

  async function execCommand(command: string): Promise<{ stdout: string; stderr: string; exitCode: number }> {
    return new Promise((resolve) => {
      exec(command, (error, stdout, stderr) => {
        resolve({
          stdout: stdout || '',
          stderr: stderr || '',
          exitCode: error?.code || 0
        });
      });
    });
  }
});