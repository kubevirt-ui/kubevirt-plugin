import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import path from 'node:path';
import { describe, it } from 'node:test';

const require = createRequire(__filename);
const { COMMENT_MARKER, NEEDS_REBASE_LABEL, syncNeedsRebaseLabel } = require(
  path.join(__dirname, '../../../../../ci-scripts/hot-cluster/js/sync-needs-rebase-label.cjs'),
) as {
  COMMENT_MARKER: string;
  NEEDS_REBASE_LABEL: string;
  syncNeedsRebaseLabel: (args: {
    context: { repo: { owner: string; repo: string } };
    core: { info: (msg: string) => void };
    github: unknown;
    prNumber: number;
  }) => Promise<void>;
};

type Call = { args: unknown; method: string };

const fakeGithub = (opts: {
  createLabelStatus?: number;
  existingComments?: string[];
  getLabelStatus?: number;
  labels?: string[];
  mergeable: boolean | null;
}) => {
  const calls: Call[] = [];
  const labels = opts.labels ?? [];
  const comments = (opts.existingComments ?? []).map((body, i) => ({ body, id: i + 1 }));

  const github = {
    paginate: async (fn: unknown, args: unknown) => {
      calls.push({ args, method: 'paginate' });
      if (fn === github.rest.issues.listComments) return comments;
      return [];
    },
    rest: {
      issues: {
        addLabels: async (args: unknown) => {
          calls.push({ args, method: 'addLabels' });
        },
        createComment: async (args: unknown) => {
          calls.push({ args, method: 'createComment' });
        },
        createLabel: async (args: unknown) => {
          calls.push({ args, method: 'createLabel' });
          if (opts.createLabelStatus === 422) {
            const err = new Error('already_exists') as Error & { status: number };
            err.status = 422;
            throw err;
          }
        },
        deleteComment: async (args: unknown) => {
          calls.push({ args, method: 'deleteComment' });
        },
        getLabel: async (args: unknown) => {
          calls.push({ args, method: 'getLabel' });
          if (opts.getLabelStatus === 404) {
            const err = new Error('Not Found') as Error & { status: number };
            err.status = 404;
            throw err;
          }
          return { data: {} };
        },
        listComments: async () => ({ data: comments }),
        removeLabel: async (args: unknown) => {
          calls.push({ args, method: 'removeLabel' });
        },
      },
      pulls: {
        get: async (args: unknown) => {
          calls.push({ args, method: 'pulls.get' });
          return {
            data: {
              base: { ref: 'main' },
              labels: labels.map((name) => ({ name })),
              mergeable: opts.mergeable,
              user: { login: 'pr-author' },
            },
          };
        },
      },
    },
  };

  return { calls, github };
};

const core = { info: () => {} };
const context = { repo: { owner: 'kubevirt-ui', repo: 'kubevirt-plugin' } };

describe('syncNeedsRebaseLabel', () => {
  it('skips when mergeable is still null', async () => {
    const { calls, github } = fakeGithub({ mergeable: null });
    await syncNeedsRebaseLabel({ context, core, github, prNumber: 42 });
    assert.equal(
      calls.some((c) => c.method === 'addLabels'),
      false,
    );
    assert.equal(
      calls.some((c) => c.method === 'createComment'),
      false,
    );
  });

  it('applies label + comment on first conflict', async () => {
    const { calls, github } = fakeGithub({ getLabelStatus: 404, mergeable: false });
    await syncNeedsRebaseLabel({ context, core, github, prNumber: 42 });

    assert.equal(
      calls.some((c) => c.method === 'createLabel'),
      true,
    );
    assert.deepEqual(
      (calls.find((c) => c.method === 'addLabels')?.args as { labels: string[] }).labels,
      [NEEDS_REBASE_LABEL],
    );
    const comment = calls.find((c) => c.method === 'createComment');
    assert.ok(((comment?.args as { body: string }).body || '').includes(COMMENT_MARKER));
  });

  it('tolerates 422 already_exists when creating the label', async () => {
    const { calls, github } = fakeGithub({
      createLabelStatus: 422,
      getLabelStatus: 404,
      mergeable: false,
    });
    await syncNeedsRebaseLabel({ context, core, github, prNumber: 42 });
    assert.equal(
      calls.some((c) => c.method === 'addLabels'),
      true,
    );
  });

  it('does not re-comment when the marker is already present', async () => {
    const { calls, github } = fakeGithub({
      existingComments: [`${COMMENT_MARKER}\n\nalready told you`],
      labels: [NEEDS_REBASE_LABEL],
      mergeable: false,
    });
    await syncNeedsRebaseLabel({ context, core, github, prNumber: 42 });
    assert.equal(
      calls.some((c) => c.method === 'createComment'),
      false,
    );
    assert.equal(
      calls.some((c) => c.method === 'addLabels'),
      false,
    );
  });

  it('removes the label and marker comments when mergeable becomes true', async () => {
    const { calls, github } = fakeGithub({
      existingComments: [`${COMMENT_MARKER}\n\nalready told you`],
      labels: [NEEDS_REBASE_LABEL],
      mergeable: true,
    });
    await syncNeedsRebaseLabel({ context, core, github, prNumber: 42 });
    assert.equal(
      (calls.find((c) => c.method === 'removeLabel')?.args as { name: string }).name,
      NEEDS_REBASE_LABEL,
    );
    assert.equal(
      calls.some((c) => c.method === 'deleteComment'),
      true,
    );
  });
});
