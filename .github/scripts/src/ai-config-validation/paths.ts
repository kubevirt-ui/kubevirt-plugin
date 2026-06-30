/** Dot-folder prefixes that configure AI assistants and editors (high-risk for supply-chain attacks). */
export const AI_CONFIG_PATH_PREFIXES = [
  '.cursor/',
  '.claude/',
  '.codex/',
  '.windsurf/',
  '.gemini/',
  '.vscode/',
] as const;

/** Individual files that influence AI agent or editor behavior. */
export const AI_CONFIG_EXACT_PATHS = [
  '.coderabbit.yaml',
  '.github/copilot-instructions.md',
  'AGENTS.md',
  '.cursorrules',
] as const;

/** PR review automation — changes here can weaken or bypass merge gates. */
export const AI_RELATED_AUTOMATION_PREFIXES = ['.github/scripts/'] as const;

export const AI_RELATED_AUTOMATION_PATHS = [
  '.github/workflows/jira_pr_check.yml',
  '.github/workflows/ai_config_pr_check.yml',
] as const;

const normalizePath = (filePath: string): string => filePath.replace(/^\//, '');

/** Return true when a changed file path is sensitive AI/editor configuration or PR automation. */
export const isSensitiveAiConfigPath = (filePath: string): boolean => {
  const normalized = normalizePath(filePath);

  if ((AI_CONFIG_EXACT_PATHS as readonly string[]).includes(normalized)) {
    return true;
  }

  if ((AI_RELATED_AUTOMATION_PATHS as readonly string[]).includes(normalized)) {
    return true;
  }

  if (AI_RELATED_AUTOMATION_PREFIXES.some((prefix) => normalized.startsWith(prefix))) {
    return true;
  }

  return AI_CONFIG_PATH_PREFIXES.some((prefix) => normalized.startsWith(prefix));
};

/** Filter a list of changed file paths to only sensitive paths. */
export const getSensitivePaths = (filePaths: string[]): string[] =>
  filePaths.filter(isSensitiveAiConfigPath);
