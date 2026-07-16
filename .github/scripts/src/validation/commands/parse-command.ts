export type ValidationCommand = 'recheck-jira' | 'ai-approved' | 'ci-approved';

const COMMANDS_IN_ORDER: readonly ValidationCommand[] = [
  'recheck-jira',
  'ai-approved',
  'ci-approved',
];

/** Exact standalone `/command` tokens only -- rejects suffixes, prefixes, paths, and URLs. */
const COMMAND_TOKEN = /(?:^|[\s])\/(recheck-jira|ai-approved|ci-approved)(?=[\s]|$)/gm;

/** Returns every matched command, in a fixed order -- a comment can contain more than one, e.g. "/ai-approved /ci-approved". */
export const parseCommand = (commentBody: string): ValidationCommand[] => {
  const found = new Set<ValidationCommand>();
  for (const match of commentBody.matchAll(COMMAND_TOKEN)) {
    found.add(match[1] as ValidationCommand);
  }
  return COMMANDS_IN_ORDER.filter((command) => found.has(command));
};
