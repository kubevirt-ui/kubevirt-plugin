import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { CommandHandlers } from './process';
import { processCommands, reportCommandFailure } from './process';

// CommandHandlers is an exhaustive Record -- unused here, but every fixture needs a stub.
const NOOP_NEW_HANDLERS: Pick<
  CommandHandlers,
  'approve-cancel' | 'approve' | 'hold-cancel' | 'hold' | 'i18n-approved' | 'lgtm-cancel' | 'lgtm'
> = {
  approve: async () => {},
  'approve-cancel': async () => {},
  hold: async () => {},
  'hold-cancel': async () => {},
  'i18n-approved': async () => {},
  lgtm: async () => {},
  'lgtm-cancel': async () => {},
};

describe('processCommands', () => {
  it('isolates a failing recheck-jira -- both approval commands still run and report success', async () => {
    const ran: string[] = [];
    const handlers: CommandHandlers = {
      ...NOOP_NEW_HANDLERS,
      'ai-approved': async () => {
        ran.push('ai-approved');
      },
      'ci-approved': async () => {
        ran.push('ci-approved');
      },
      'recheck-jira': async () => {
        ran.push('recheck-jira');
        throw new Error('Jira API unreachable');
      },
    };

    const outcomes = await processCommands(
      ['recheck-jira', 'ai-approved', 'ci-approved'],
      handlers,
    );

    assert.deepEqual(ran, ['recheck-jira', 'ai-approved', 'ci-approved']);
    assert.deepEqual(
      outcomes.map((o) => ({ command: o.command, failed: o.error !== undefined })),
      [
        { command: 'recheck-jira', failed: true },
        { command: 'ai-approved', failed: false },
        { command: 'ci-approved', failed: false },
      ],
    );
  });

  it('runs every command even when more than one fails', async () => {
    const handlers: CommandHandlers = {
      ...NOOP_NEW_HANDLERS,
      'ai-approved': async () => {
        throw new Error('not authorized to use /ai-approved');
      },
      'ci-approved': async () => {},
      'recheck-jira': async () => {
        throw new Error('Jira API unreachable');
      },
    };

    const outcomes = await processCommands(
      ['ai-approved', 'ci-approved', 'recheck-jira'],
      handlers,
    );

    assert.equal(outcomes.filter((o) => o.error !== undefined).length, 2);
    assert.equal(outcomes.find((o) => o.command === 'ci-approved')?.error, undefined);
  });

  it('returns no failures when every command succeeds', async () => {
    const handlers: CommandHandlers = {
      ...NOOP_NEW_HANDLERS,
      'ai-approved': async () => {},
      'ci-approved': async () => {},
      'recheck-jira': async () => {},
    };

    const outcomes = await processCommands(['recheck-jira'], handlers);

    assert.equal(outcomes.length, 1);
    assert.equal(outcomes[0].command, 'recheck-jira');
    assert.equal(outcomes[0].error, undefined);
  });
});

describe('reportCommandFailure', () => {
  it('logs without throwing', () => {
    assert.doesNotThrow(() =>
      reportCommandFailure({ command: 'ai-approved', error: new Error('network timeout') }),
    );
  });
});
