/** Labels, status context, and sensitive path rules for AI/editor configuration validation. */
export const AI_CONFIG = {
  EXACT_PATHS: [
    '.coderabbit.yaml',
    '.github/copilot-instructions.md',
    'AGENTS.md',
    '.cursorrules',
  ] as const,
  LABELS: {
    ALERT: 'ai-config-changed',
    BLOCK: 'do-not-merge/ai-config-review',
    REVIEWED: 'ai-config-reviewed',
    SKIP: 'skip-ai-config-check',
  },
  PATH_PREFIXES: ['.cursor/', '.claude/', '.codex/', '.windsurf/', '.gemini/', '.vscode/'] as const,
  RELATED_AUTOMATION_PATHS: [
    '.github/workflows/jira_pr_check.yml',
    '.github/workflows/ai_config_pr_check.yml',
  ] as const,
  RELATED_AUTOMATION_PREFIXES: ['.github/scripts/'] as const,
  STATUS_CONTEXT: 'ai-config-validation',
} as const;
