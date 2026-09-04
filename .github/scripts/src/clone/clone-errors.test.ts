import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { formatCloneFailureMessage } from './clone-errors';
import { GitCommandError } from './git-helpers';

describe('formatCloneFailureMessage', () => {
  it('includes git stderr for GitCommandError', () => {
    const message = formatCloneFailureMessage(
      'Cherry-pick failed',
      new GitCommandError('push origin branch', 'remote: Permission denied'),
      'Cloned tickets: CNV-123',
    );

    assert.match(message, /Cherry-pick failed/);
    assert.match(message, /git push origin branch/);
    assert.match(message, /Permission denied/);
    assert.match(message, /Cloned tickets: CNV-123/);
  });

  it('includes Error message for generic errors', () => {
    const message = formatCloneFailureMessage('Cherry-pick failed', new Error('network timeout'));
    assert.match(message, /network timeout/);
  });
});
