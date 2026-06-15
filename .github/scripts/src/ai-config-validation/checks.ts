import { getSensitivePaths } from './paths';

export type SuspiciousPatternMatch = {
  file: string;
  pattern: string;
  line: string;
};

const SUSPICIOUS_PATTERNS: Array<{ label: string; regex: RegExp }> = [
  { label: 'folder-open autorun', regex: /runOn["']?\s*:\s*["']folderOpen/i },
  { label: 'prompt injection', regex: /ignore\s+(all\s+)?(previous|prior)\s+instructions/i },
  { label: 'session hook', regex: /SessionStart|sessionStart/i },
  { label: 'always-apply rule', regex: /alwaysApply\s*:\s*true/i },
  { label: 'review bypass', regex: /(skip|bypass|disable|ignore).{0,40}(security|review|check)/i },
  { label: 'auto-approval', regex: /auto[\s-]?(approve|merge)/i },
  { label: 'remote execution', regex: /(curl|wget|bash|sh)\s+.{0,60}(http|https|\|)/i },
  { label: 'secret exfiltration', regex: /(exfiltrat|send|post|upload).{0,40}(secret|token|credential|password)/i },
  { label: 'credential reference', regex: /(GITHUB_TOKEN|JIRA_TOKEN|process\.env\.[A-Z_]+)/ },
  { label: 'suspicious dropper', regex: /\.github\/setup\.js|binding\.gyp/i },
];

const getAddedLines = (patch?: string): string[] => {
  if (!patch) return [];

  return patch
    .split('\n')
    .filter((line) => line.startsWith('+') && !line.startsWith('+++'))
    .map((line) => line.slice(1));
};

/** Scan added lines in PR patches for known AI supply-chain attack patterns. */
export const scanForSuspiciousPatterns = (
  files: Array<{ filename: string; patch?: string }>,
): SuspiciousPatternMatch[] => {
  const sensitiveFiles = new Set(getSensitivePaths(files.map((file) => file.filename)));
  const matches: SuspiciousPatternMatch[] = [];

  for (const file of files) {
    if (!sensitiveFiles.has(file.filename)) continue;

    for (const line of getAddedLines(file.patch)) {
      for (const { label, regex } of SUSPICIOUS_PATTERNS) {
        if (regex.test(line)) {
          matches.push({
            file: file.filename,
            pattern: label,
            line: line.trim().slice(0, 160),
          });
        }
      }
    }
  }

  return matches;
};
