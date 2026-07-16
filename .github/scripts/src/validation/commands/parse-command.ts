export type ValidationCommand =
  | 'recheck-jira'
  | 'ai-approved'
  | 'ci-approved'
  | 'lgtm'
  | 'lgtm-cancel'
  | 'approve'
  | 'approve-cancel'
  | 'hold'
  | 'hold-cancel';

const COMMANDS_IN_ORDER: readonly ValidationCommand[] = [
  'recheck-jira',
  'ai-approved',
  'ci-approved',
  'lgtm',
  'lgtm-cancel',
  'approve',
  'approve-cancel',
  'hold',
  'hold-cancel',
];

// lgtm/approve/hold additionally accept an optional trailing "cancel"
// argument (e.g. "/lgtm cancel"), mapped to "<word>-cancel" below.
// Word-boundary lookaheads reject suffixes/prefixes/paths/URLs the same
// way the single-word commands do -- e.g. "/hold-e2e" never matches "hold".
const COMMAND_TOKEN =
  /(?:^|[\s])\/(recheck-jira|ai-approved|ci-approved|lgtm|approve|hold)(?:[\s]+(cancel)(?=[\s]|$))?(?=[\s]|$)/gm;

/** Returns every matched command, in a fixed order -- a comment can contain more than one, e.g. "/ai-approved /ci-approved". */
export const parseCommand = (commentBody: string): ValidationCommand[] => {
  const found = new Set<ValidationCommand>();
  for (const match of commentBody.matchAll(COMMAND_TOKEN)) {
    const command = match[2] ? `${match[1]}-cancel` : match[1];
    found.add(command as ValidationCommand);
  }
  return COMMANDS_IN_ORDER.filter((command) => found.has(command));
};
