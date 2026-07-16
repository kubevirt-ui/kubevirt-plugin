import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { processCommands, reportCommandFailure, shouldReportGenericFailure } from './process';
import type { CommandHandlers } from './process';
import { HandledValidationError } from '../pr-path-validation/errors';
import type { GitHubConfig } from '../../types/index';

// CommandHandlers is an exhaustive Record -- unused here, but every fixture needs a stub.
const NOOP_NEW_HANDLERS: Pick<
  CommandHandlers,
  'lgtm' | 'lgtm-cancel' | 'approve' | 'approve-cancel' | 'hold' | 'hold-cancel'
> = {
  lgtm: async () => {},
  'lgtm-cancel': async () => {},
  approve: async () => {},
  'approve-cancel': async () => {},
  hold: async () => {},
  'hold-cancel': async () => {},
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

describe('shouldReportGenericFailure', () => {
  it('is false for a HandledValidationError -- executeJiraValidation already reported a specific status', () => {
    assert.equal(
      shouldReportGenericFailure(new HandledValidationError('No CNV ticket ID found in PR title')),
      false,
    );
  });

  it('is true for a genuinely unexpected error -- nothing specific was reported yet', () => {
    assert.equal(shouldReportGenericFailure(new Error('Jira API unreachable')), true);
  });

  it('is true for a non-Error thrown value', () => {
    assert.equal(shouldReportGenericFailure('some string'), true);
  });
});

describe('reportCommandFailure', () => {
  const CONFIG: GitHubConfig = { owner: 'kubevirt-ui', repo: 'kubevirt-plugin', token: 'x' };

  it('returns without attempting a network call for a HandledValidationError', async () => {
    await assert.doesNotReject(
      reportCommandFailure(
        { command: 'recheck-jira', error: new HandledValidationError('No CNV ticket ID found') },
        CONFIG,
        'abc123',
      ),
    );
  });

  it('returns without attempting a network call for recheck-jira without a headSha', async () => {
    await assert.doesNotReject(
      reportCommandFailure(
        { command: 'recheck-jira', error: new Error('Jira API unreachable') },
        CONFIG,
        undefined,
      ),
    );
  });

  it('skips reporting for an ai-approved auth-rejection error', async () => {
    await assert.doesNotReject(
      reportCommandFailure(
        {
          command: 'ai-approved',
          error: new Error('random-user is not authorized to use /ai-approved'),
        },
        CONFIG,
        'abc123',
      ),
    );
  });

  it('skips reporting for a ci-approved auth-rejection error', async () => {
    await assert.doesNotReject(
      reportCommandFailure(
        {
          command: 'ci-approved',
          error: new Error('random-user is not authorized to use /ci-approved'),
        },
        CONFIG,
        'abc123',
      ),
    );
  });

  it('swallows a rejection from reportAiConfigError -- does not escape to the caller', async () => {
    await assert.doesNotReject(
      reportCommandFailure(
        { command: 'ai-approved', error: new Error('network timeout') },
        CONFIG,
        'abc123',
        {
          reportAiConfigError: async () => {
            throw new Error('failed to post ai-config-validation status');
          },
          reportCiScriptsError: async () => {},
        },
      ),
    );
  });

  it('swallows a rejection from reportCiScriptsError -- does not escape to the caller', async () => {
    await assert.doesNotReject(
      reportCommandFailure(
        { command: 'ci-approved', error: new Error('network timeout') },
        CONFIG,
        'abc123',
        {
          reportAiConfigError: async () => {},
          reportCiScriptsError: async () => {
            throw new Error('failed to post ci-scripts-validation status');
          },
        },
      ),
    );
  });

  it('still calls the injected reporter for the branch that matches the failing command', async () => {
    const calledWith: string[] = [];
    await reportCommandFailure(
      { command: 'ai-approved', error: new Error('network timeout') },
      CONFIG,
      'abc123',
      {
        reportAiConfigError: async () => {
          calledWith.push('ai-approved');
        },
        reportCiScriptsError: async () => {
          calledWith.push('ci-approved');
        },
      },
    );

    assert.deepEqual(calledWith, ['ai-approved']);
  });
});
