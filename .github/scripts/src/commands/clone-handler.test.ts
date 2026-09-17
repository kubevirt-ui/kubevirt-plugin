import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it } from 'node:test';

describe('executeClone', () => {
  it('does not configure git remotes before runClone validates the command', () => {
    const source = readFileSync(join(__dirname, 'clone-handler.ts'), 'utf8');

    assert.doesNotMatch(source, /setupRepositoryForCherryPick/);
    assert.match(source, /await runClone\(\)/);
  });
});
