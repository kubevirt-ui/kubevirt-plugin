import type { PathValidationConfig } from '../pr-path-validation/types';

/** Labels, status context, and sensitive path rules for AI/editor configuration validation. */
export const AI_CONFIG = {
  exactPaths: ['.coderabbit.yaml', '.github/copilot-instructions.md', 'AGENTS.md', '.cursorrules'],
  pathPrefixes: ['.cursor/', '.claude/', '.codex/', '.windsurf/', '.gemini/', '.vscode/'],
  relatedAutomationPaths: [
    '.github/workflows/pr_validation.yml',
    '.github/workflows/pr_validation_commands.yml',
    '.github/actions/setup-gh-scripts/action.yml',
  ],
  relatedAutomationPrefixes: ['.github/scripts/'],
  labels: {
    alert: 'ai-config-changed',
    block: 'do-not-merge/ai-config-review',
    reviewed: 'ai-config-reviewed',
    skip: 'skip-ai-config-check',
  },
  labelMeta: {
    alert: {
      color: 'f59e0b',
      description: 'PR modifies AI/editor config or PR automation scripts',
    },
    block: { color: 'b60205', description: 'Blocked until ai-config-reviewed label is added' },
  },
  statusContext: 'ai-config-validation',
  displayName: 'AI configuration validation',
  commandName: '/ai-approved',
} as const satisfies PathValidationConfig;

export const AI_CONFIG_EVENT_ACTIONS = {
  AI_APPROVED: 'ai-approved',
} as const;
