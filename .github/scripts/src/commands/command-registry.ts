import type { Octokit } from '@octokit/rest';

import { executeCancelE2E } from './cancel-e2e';
import { executeCleanupConsole } from './cleanup-manual-console-dispatch';
import { executeClone } from './clone-handler';
import { executeDeployConsole } from './deploy-manual-console-dispatch';
import { executeHelp } from './help';
import { executeHoldE2E } from './hold-e2e';
import { executeRetestE2E } from './retest-e2e';
import { executeRetestFailed } from './retest-failed';
import { executeTestE2E } from './test-e2e';
import { executeValidationCommand } from './validation-handler';

export type CommandContext = {
  author: string;
  commentBody: string;
  commentId: number;
  octokit: Octokit;
  owner: string;
  prNumber: number;
  repo: string;
};

export type CommandConfig = {
  execute: (ctx: CommandContext) => Promise<unknown>;
  name: string;
  pattern: RegExp;
  requiresTrust: boolean;
};

export const COMMANDS: CommandConfig[] = [
  {
    execute: executeHelp,
    name: 'help',
    pattern: /(^|\s)\/help(\s|$)/,
    requiresTrust: false,
  },
  {
    execute: executeRetestE2E,
    name: 'retest-e2e',
    pattern: /(^|\s)\/retest-e2e(\s|$)/,
    requiresTrust: true,
  },
  {
    execute: executeTestE2E,
    name: 'test-e2e',
    pattern: /(^|\s)\/test-e2e(\s|$)/,
    requiresTrust: true,
  },
  {
    execute: executeRetestFailed,
    name: 'retest-failed',
    pattern: /(^|\s)\/retest-failed(\s|$)/,
    requiresTrust: true,
  },
  {
    execute: executeCancelE2E,
    name: 'cancel-e2e',
    pattern: /(^|\s)\/cancel-e2e(\s|$)/,
    requiresTrust: true,
  },
  {
    execute: (ctx) => executeHoldE2E(ctx).then(() => undefined),
    name: 'hold-e2e',
    pattern: /(^|\s)\/hold-e2e(\s|$)/,
    requiresTrust: true,
  },
  {
    execute: executeDeployConsole,
    name: 'deploy-manual-console',
    pattern: /(^|\s)\/deploy-manual-console(\s|$)/,
    requiresTrust: true,
  },
  {
    execute: executeCleanupConsole,
    name: 'cleanup-manual-console',
    pattern: /(^|\s)\/cleanup-manual-console(\s|$)/,
    requiresTrust: true,
  },
  {
    execute: executeClone,
    name: 'clone',
    pattern: /^\/clone\s+/m,
    requiresTrust: false,
  },
  {
    execute: executeValidationCommand,
    name: 'validation',
    pattern: /(^|\s)\/(lgtm|approve|hold|recheck-jira|ai-approved|ci-approved|i18n-approved)(\s|$)/,
    requiresTrust: false,
  },
];
